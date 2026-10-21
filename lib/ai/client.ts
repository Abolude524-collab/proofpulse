import { GoogleGenAI } from "@google/genai";

let genAiClient: GoogleGenAI | null = null;

export function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    throw new Error(
      "GEMINI_API_KEY is not set. Please configure GEMINI_API_KEY in your environment or use Demo Mode."
    );
  }

  if (!genAiClient) {
    genAiClient = new GoogleGenAI({ apiKey });
  }

  return genAiClient;
}

export function getConfiguredGemmaModel(): string {
  return process.env.GEMMA_MODEL || "gemma-4-26b-a4b-it";
}
