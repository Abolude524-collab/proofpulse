export function isValidHttpUrl(candidate: string): boolean {
  try {
    const url = new URL(candidate.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function extractHostname(candidate: string): string {
  try {
    const url = new URL(candidate.trim());
    return url.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function normalizeUrl(candidate: string): string {
  try {
    const url = new URL(candidate.trim());
    // Strip trailing slash and standard hash for deduplication
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return candidate.trim();
  }
}

export function decodeHtmlEntities(str: string): string {
  if (!str) return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    );
}
