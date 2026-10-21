import { SearchProvider } from "./types";
import { GeminiGroundingProvider } from "./gemini-grounding";
import {
  TavilySearchProvider,
  BraveSearchProvider,
  DuckDuckGoSearchProvider,
} from "./external-search";

export * from "./types";
export * from "./url-sanitizer";

export function getSearchProvider(): SearchProvider {
  const providerName = (process.env.SEARCH_PROVIDER || "gemini-grounding").toLowerCase();

  switch (providerName) {
    case "tavily":
      return new TavilySearchProvider();
    case "brave":
      return new BraveSearchProvider();
    case "duckduckgo":
      return new DuckDuckGoSearchProvider();
    case "gemini-grounding":
    default:
      return new GeminiGroundingProvider();
  }
}
