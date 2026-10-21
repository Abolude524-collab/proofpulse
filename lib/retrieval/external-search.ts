import { RetrievedSource, SearchProvider } from "./types";
import { isValidHttpUrl, extractHostname, normalizeUrl, decodeHtmlEntities } from "./url-sanitizer";

export class TavilySearchProvider implements SearchProvider {
  readonly name = "tavily";

  async search(query: string): Promise<RetrievedSource[]> {
    const apiKey = process.env.SEARCH_API_KEY;
    if (!apiKey) {
      throw new Error("SEARCH_API_KEY is required for Tavily search provider.");
    }

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "basic",
        include_answer: false,
        max_results: 6,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Tavily search failed (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const results: RetrievedSource[] = [];
    const seen = new Set<string>();

    if (Array.isArray(data.results)) {
      for (const item of data.results) {
        if (typeof item.url === "string" && isValidHttpUrl(item.url)) {
          const norm = normalizeUrl(item.url);
          if (!seen.has(norm)) {
            seen.add(norm);
            results.push({
              id: `src_${results.length + 1}`,
              title: item.title || extractHostname(item.url),
              url: item.url,
              publisher: extractHostname(item.url),
              date: item.published_date || null,
              snippet: typeof item.content === "string" ? item.content.slice(0, 500) : undefined,
            });
          }
        }
      }
    }

    return results;
  }
}

export class BraveSearchProvider implements SearchProvider {
  readonly name = "brave";

  async search(query: string): Promise<RetrievedSource[]> {
    const apiKey = process.env.SEARCH_API_KEY;
    if (!apiKey) {
      throw new Error("SEARCH_API_KEY is required for Brave search provider.");
    }

    const url = new URL("https://api.search.brave.com/res/v1/web/search");
    url.searchParams.set("q", query);
    url.searchParams.set("count", "6");

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "X-Subscription-Token": apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Brave search failed with status ${response.status}`);
    }

    const data = await response.json();
    const results: RetrievedSource[] = [];
    const seen = new Set<string>();

    if (data.web?.results && Array.isArray(data.web.results)) {
      for (const item of data.web.results) {
        if (typeof item.url === "string" && isValidHttpUrl(item.url)) {
          const norm = normalizeUrl(item.url);
          if (!seen.has(norm)) {
            seen.add(norm);
            results.push({
              id: `src_${results.length + 1}`,
              title: item.title || extractHostname(item.url),
              url: item.url,
              publisher: extractHostname(item.url),
              date: item.age || null,
              snippet: typeof item.description === "string" ? item.description.slice(0, 500) : undefined,
            });
          }
        }
      }
    }

    return results;
  }
}

export class DuckDuckGoSearchProvider implements SearchProvider {
  readonly name = "duckduckgo";

  async search(query: string): Promise<RetrievedSource[]> {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`DuckDuckGo request returned status ${response.status}`);
      }

      const html = await response.text();
      const results: RetrievedSource[] = [];
      const seen = new Set<string>();

      // Split by DuckDuckGo result blocks
      const chunks = html.split(/<div class="result\s+results_links/i).slice(1);

      for (const chunk of chunks) {
        if (results.length >= 6) break;

        // Extract title and URL
        const titleMatch = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i.exec(chunk);
        if (!titleMatch) continue;

        let rawHref = titleMatch[1];
        let title = titleMatch[2].replace(/<[^>]+>/g, "").trim();

        // DuckDuckGo wraps target URLs in /l/?uddg=...
        if (rawHref.includes("uddg=")) {
          try {
            const parsed = new URL("https://html.duckduckgo.com" + rawHref);
            const uddg = parsed.searchParams.get("uddg");
            if (uddg) {
              rawHref = decodeURIComponent(uddg);
            }
          } catch {
            // keep rawHref
          }
        }

        if (!isValidHttpUrl(rawHref)) continue;

        const norm = normalizeUrl(rawHref);
        if (seen.has(norm)) continue;
        seen.add(norm);

        // Extract snippet
        const snippetMatch = /<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/i.exec(chunk);
        const snippet = snippetMatch
          ? decodeHtmlEntities(snippetMatch[1].replace(/<[^>]+>/g, "").trim())
          : undefined;
        const cleanTitle = decodeHtmlEntities(title || extractHostname(rawHref));

        results.push({
          id: `src_${results.length + 1}`,
          title: cleanTitle,
          url: rawHref,
          publisher: extractHostname(rawHref),
          date: null,
          snippet: snippet?.slice(0, 500),
        });
      }

      return results;
    } finally {
      clearTimeout(timeout);
    }
  }
}
