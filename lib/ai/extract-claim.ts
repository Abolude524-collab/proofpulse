import { getGenAIClient, getConfiguredGemmaModel } from "./client";

export class MultimodalNotSupportedError extends Error {
  constructor(model: string) {
    super(
      `The configured Gemma model (${model}) does not support direct image inputs on the Gemini API. Please paste the visible claim text directly into the text input.`
    );
    this.name = "MultimodalNotSupportedError";
  }
}

export async function extractClaimFromText(rawText: string): Promise<string> {
  const trimmed = rawText.trim();
  if (!trimmed) {
    throw new Error("No text provided to extract a claim from.");
  }

  // If the input is already a short single-sentence claim (e.g. < 120 chars), we can use it directly or clean it
  if (trimmed.length < 120 && !trimmed.includes("\n")) {
    return trimmed;
  }

  const ai = getGenAIClient();
  const model = getConfiguredGemmaModel();

  const systemPrompt = `You are a factual claim extraction specialist.
Analyze the user's input message, post, or query and extract the single core factual assertion to be investigated.

Rules:
1. Extract only the factual assertion that can be verified as true, false, or unproven.
2. Preserve crucial qualifiers, dates, locations, named entities, numbers, and units.
3. Remove emotional commentary, rhetorical questions, greetings, or speculation.
4. Output ONLY the extracted claim as plain text in 1-2 sentences. Do not include introductory phrases, quotes, or markdown formatting.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `${systemPrompt}\n\nUser input:\n"""${trimmed}"""\n\nExtracted Claim:`,
      config: {
        temperature: 0.1,
        maxOutputTokens: 250,
      },
    });

    const output = response.text?.trim();
    if (!output) {
      return trimmed.slice(0, 300);
    }
    // Clean any accidental wrapper quotes
    return output.replace(/^["']|["']$/g, "").trim();
  } catch (err) {
    // If extraction fails, fall back to truncated user input rather than crashing
    console.error("Claim extraction error:", err);
    return trimmed.slice(0, 300);
  }
}

export async function extractClaimFromImage(
  base64Data: string,
  mimeType: string
): Promise<string> {
  const model = getConfiguredGemmaModel();

  // Gemma models hosted on the Gemini API are text-only models
  const isGemma = model.toLowerCase().startsWith("gemma");
  if (isGemma) {
    throw new MultimodalNotSupportedError(model);
  }

  // For multimodal-capable models
  const ai = getGenAIClient();
  const prompt = `Inspect this screenshot carefully. Identify the main text and extract the single checkable factual claim being made.
Output ONLY the clean factual claim in 1-2 sentences. Do not include markdown or explanations.`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inlineData: {
              data: base64Data,
              mimeType,
            },
          },
        ],
      },
    ],
    config: {
      temperature: 0.1,
      maxOutputTokens: 250,
    },
  });

  const output = response.text?.trim();
  if (!output) {
    throw new Error("Could not extract a readable claim from the screenshot.");
  }
  return output.replace(/^["']|["']$/g, "").trim();
}
