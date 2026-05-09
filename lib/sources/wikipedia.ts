import { WikipediaData } from "../types";

export async function fetchWikipedia(name: string): Promise<WikipediaData | null> {
  const slug = encodeURIComponent(name.replace(/ /g, "_"));
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Brief-Intelligence/1.0" },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      // Try with the exact name as-is (some orgs have special Wikipedia titles)
      const altSlug = encodeURIComponent(name);
      const altRes = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${altSlug}`,
        { headers: { "User-Agent": "Brief-Intelligence/1.0" }, signal: AbortSignal.timeout(8000) }
      );
      if (!altRes.ok) return null;
      return parseWikiResponse(await altRes.json());
    }

    return parseWikiResponse(await res.json());
  } catch (err) {
    console.error("[Wikipedia] fetch failed:", err);
    return null;
  }
}

function parseWikiResponse(data: Record<string, unknown>): WikipediaData {
  const extract = (data.extract as string) || "";

  // Best-effort extraction of founding date and HQ from extract text
  const foundedMatch = extract.match(
    /(?:founded|established|incorporated)\s+in\s+(\d{4})/i
  );
  const hqMatch = extract.match(
    /headquartered\s+in\s+([\w\s,]+?)(?:\.|,|\s+and)/i
  );

  return {
    description: (data.description as string) || "",
    extract: extract.slice(0, 2000),
    founded: foundedMatch ? foundedMatch[1] : null,
    headquarters: hqMatch ? hqMatch[1].trim() : null,
    url: (data.content_urls as { desktop?: { page?: string } })?.desktop?.page || "",
  };
}
