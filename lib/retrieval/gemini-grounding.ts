import { GoogleGenAI } from "@google/genai";
import { RetrievedSource, SearchProvider } from "./types";
import { isValidHttpUrl, extractHostname } from "./url-sanitizer";

export class GeminiGroundingProvider implements SearchProvider {
  readonly name = "gemini-grounding";

  async search(query: string): Promise<RetrievedSource[]> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured on the server.");
    }

    const model = process.env.GEMMA_MODEL || "gemma-4-26b-a4b-it";
    const ai = new GoogleGenAI({ apiKey });

    try {
      // In the current Google Gen AI API, Google Search grounding is passed via tools
      const interaction = await ai.interactions.create({
        model,
        input: `Find factual information about this claim: "${query}". Return the main facts found.`,
        tools: [{ type: "google_search" }],
      });

      const sources: RetrievedSource[] = [];
      const seenUrls = new Set<string>();

      // Extract citations from interaction steps
      if (interaction.steps && Array.isArray(interaction.steps)) {
        for (const step of interaction.steps) {
          if (step.type === "model_output" && Array.isArray(step.content)) {
            for (const contentBlock of step.content) {
              if (contentBlock.type === "text" && Array.isArray(contentBlock.annotations)) {
                for (const annotation of contentBlock.annotations) {
                  if (annotation.type === "url_citation" && annotation.url) {
                    const rawUrl = annotation.url;
                    if (isValidHttpUrl(rawUrl) && !seenUrls.has(rawUrl)) {
                      seenUrls.add(rawUrl);
                      sources.push({
                        id: `src_${sources.length + 1}`,
                        title: annotation.title || extractHostname(rawUrl),
                        url: rawUrl,
                        publisher: extractHostname(rawUrl),
                        date: null,
                        snippet: contentBlock.text || undefined,
                      });
                    }
                  }
                }
              }
            }
          }
        }
      }

      return sources;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // Official check: Gemma models do not support tools/grounding on Gemini API
      if (
        msg.includes("Tool use is not supported") ||
        msg.includes("tools") ||
        msg.includes("grounding") ||
        msg.includes("400") ||
        msg.includes("INVALID_ARGUMENT")
      ) {
        throw new Error(
          `Google Search grounding is not supported by the configured model (${model}) on the Gemini API. Use an external search provider (e.g. SEARCH_PROVIDER=duckduckgo or tavily) or a compatible model.`
        );
      }
      throw err;
    }
  }
}
