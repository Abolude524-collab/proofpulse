import { z } from "zod";
import { getGenAIClient, getConfiguredGemmaModel } from "./client";
import { RetrievedSource } from "../retrieval/types";
import {
  Assessment,
  EvidenceItem,
  EvidenceRelationship,
  EvidenceReport,
  EvidenceReportSchema,
} from "../types";
import { isValidHttpUrl, decodeHtmlEntities } from "../retrieval/url-sanitizer";

// Raw assessment schema returned by the model before server mapping
const RawModelEvidenceItem = z.object({
  sourceId: z.string(),
  relationship: z.enum(["supports", "contradicts", "context"]),
  relevance: z.string().max(600),
});

const RawModelAssessmentSchema = z.object({
  assessment: z.enum([
    "Supported",
    "Contradicted",
    "Mixed evidence",
    "Insufficient evidence",
  ]),
  summary: z.string().max(1500),
  evidence: z.array(RawModelEvidenceItem),
  unknowns: z.array(z.string().max(400)),
  limitations: z.array(z.string().max(400)),
});

type RawModelAssessment = z.infer<typeof RawModelAssessmentSchema>;

export async function assessEvidenceWithGemma(
  claim: string,
  sources: RetrievedSource[]
): Promise<EvidenceReport> {
  // Edge case: No sources retrieved
  if (!sources || sources.length === 0) {
    return {
      claim,
      assessment: "Insufficient evidence",
      summary:
        "No relevant sources were retrieved for this claim. The absence of search results does not prove the claim is false, but means there is currently insufficient evidence to verify it.",
      supportingEvidence: [],
      contradictingOrContextEvidence: [],
      unknowns: [
        "No independent reporting or official documentation was found in the search results.",
        "Check whether names, dates, or terms were misspelled or if the event is very recent.",
      ],
      limitations: [
        "Live web retrieval returned zero results matching the query.",
      ],
      mode: "live",
      analyzedAt: new Date().toISOString(),
    };
  }

  const ai = getGenAIClient();
  const model = getConfiguredGemmaModel();

  // Limit sources to top 4 and bound snippet length to keep prompt within Gemma's optimal context
  const boundedSources = sources.slice(0, 4);

  // Build clean sources context for Gemma
  const sourcesText = boundedSources
    .map(
      (s) =>
        `[${s.id}] Title: ${decodeHtmlEntities(s.title)}\nPublisher: ${decodeHtmlEntities(s.publisher || "Unknown")}\nSnippet: ${
          s.snippet ? decodeHtmlEntities(s.snippet).slice(0, 200) : "Title only."
        }`
    )
    .join("\n\n---\n\n");

  const prompt = `You are an impartial, meticulous evidence analyst for ProofPulse.
Analyze the claim below strictly against the provided retrieved sources.

CLAIM: "${claim}"

RETRIEVED SOURCES:
${sourcesText}

ASSESSMENT GUIDELINES:
- "Supported": Retrieved evidence directly supports the specific claim as phrased.
- "Contradicted": Retrieved evidence directly conflicts with the specific claim as phrased.
- "Mixed evidence": Credible retrieved sources conflict, or the claim is partly accurate but materially missing context.
- "Insufficient evidence": The available retrieved evidence does not establish a defensible conclusion.
- If evidence is weak, indirect, unverified, or only mentions the topic tangentially, select "Insufficient evidence".
- Do NOT assume a claim is false merely because evidence is lacking.
- NEVER invent sources, quotes, or URLs. Reference ONLY the sources listed above using their exact ID (e.g. "src_1").

OUTPUT FORMAT:
Respond with ONLY a valid JSON object matching this schema (no surrounding conversational text, no preambles):
{
  "assessment": "Supported" | "Contradicted" | "Mixed evidence" | "Insufficient evidence",
  "summary": "Concise plain-language explanation of what the evidence establishes and why.",
  "evidence": [
    {
      "sourceId": "src_1",
      "relationship": "supports" | "contradicts" | "context",
      "relevance": "Brief explanation of how this specific source relates to the claim."
    }
  ],
  "unknowns": [
    "Unresolved questions, missing primary evidence, or recommended next checks."
  ],
  "limitations": [
    "Scope limitations, time sensitivity, or gaps in available data."
  ]
}`;

  let parsedRaw: RawModelAssessment | null = null;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: 0.1,
        maxOutputTokens: 2500,
      },
    });

    const rawText = response.text || "";
    parsedRaw = parseModelJson(rawText);
  } catch (err) {
    console.warn("First model assessment attempt failed, attempting bounded retry with pause...", err);
    // Bounded retry with 1.5s delay and strict instruction
    await new Promise((r) => setTimeout(r, 1500));
    try {
      const retryResponse = await ai.models.generateContent({
        model,
        contents: `${prompt}\n\nIMPORTANT: Return ONLY the raw valid JSON object starting with { and ending with }. No markdown, no preambles.`,
        config: {
          temperature: 0.0,
          maxOutputTokens: 2500,
        },
      });
      parsedRaw = parseModelJson(retryResponse.text || "");
    } catch (retryErr) {
      throw new Error(`Evidence assessment failed: ${retryErr instanceof Error ? retryErr.message : String(retryErr)}`);
    }
  }

  if (!parsedRaw) {
    throw new Error("Unable to parse model assessment into structured format.");
  }

  // Server-side provenance mapping: map sourceId back to the server-owned RetrievedSource
  const sourceMap = new Map<string, RetrievedSource>();
  for (const s of sources) {
    sourceMap.set(s.id, s);
  }

  const supportingEvidence: EvidenceItem[] = [];
  const contradictingOrContextEvidence: EvidenceItem[] = [];

  for (const item of parsedRaw.evidence) {
    const matchedSource = sourceMap.get(item.sourceId);
    if (!matchedSource) {
      // Discard evidence items not present in retrieval origin
      continue;
    }

    if (!isValidHttpUrl(matchedSource.url)) {
      continue;
    }

    const evidenceItem: EvidenceItem = {
      title: matchedSource.title,
      publisher: matchedSource.publisher,
      url: matchedSource.url,
      date: matchedSource.date || null,
      relevance: item.relevance,
      relationship: item.relationship as EvidenceRelationship,
      sourceExcerpt: matchedSource.snippet,
    };

    if (item.relationship === "supports") {
      supportingEvidence.push(evidenceItem);
    } else {
      contradictingOrContextEvidence.push(evidenceItem);
    }
  }

  const report: EvidenceReport = {
    claim,
    assessment: parsedRaw.assessment as Assessment,
    summary: parsedRaw.summary,
    supportingEvidence,
    contradictingOrContextEvidence,
    unknowns: parsedRaw.unknowns.slice(0, 5),
    limitations: parsedRaw.limitations.slice(0, 5),
    mode: "live",
    analyzedAt: new Date().toISOString(),
  };

  // Validate the final report against the Zod schema
  return EvidenceReportSchema.parse(report);
}

function parseModelJson(rawText: string): RawModelAssessment {
  if (!rawText || !rawText.trim()) {
    throw new Error("Model returned empty text.");
  }

  let cleaned = rawText.trim();

  // Locate the outer JSON object boundaries
  const jsonStart = cleaned.indexOf("{");
  const jsonEnd = cleaned.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
    throw new Error("No JSON object detected in model response.");
  }

  cleaned = cleaned.slice(jsonStart, jsonEnd + 1);

  try {
    const parsed = JSON.parse(cleaned);
    return RawModelAssessmentSchema.parse(parsed);
  } catch {
    // Attempt standard JSON repair for trailing commas or stray control characters
    const repaired = cleaned
      .replace(/,\s*([}\]])/g, "$1")
      .replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, " ");

    const parsed = JSON.parse(repaired);
    return RawModelAssessmentSchema.parse(parsed);
  }
}
