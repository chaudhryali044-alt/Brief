import { SerperResult } from "../types";
import { truncate, isWithinMonths } from "../utils";

const SERPER_URL = "https://google.serper.dev/search";

async function serperSearch(query: string): Promise<SerperResult[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    console.warn("[Serper] SERPER_API_KEY not set");
    return [];
  }

  try {
    const res = await fetch(SERPER_URL, {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query, num: 5 }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      console.error("[Serper] HTTP error:", res.status);
      return [];
    }

    const data = await res.json();
    const organic: Record<string, unknown>[] = data.organic ?? [];

    return organic
      .map((item) => ({
        title: (item.title as string) || "",
        url: (item.link as string) || "",
        snippet: truncate((item.snippet as string) || "", 200),
        date: (item.date as string) || null,
        source: extractDomain((item.link as string) || ""),
      }))
      .filter((r) => r.url && isWithinMonths(r.date, 18));
  } catch (err) {
    console.error("[Serper] search failed:", err);
    return [];
  }
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "";
  }
}

export async function runSerperSearches(
  name: string,
  type: "company" | "institution"
): Promise<SerperResult[][]> {
  const baseQueries = [
    `"${name}" news 2026`,
    `"${name}" latest developments 2025 2026`,
    `"${name}" CEO CFO leadership team 2026`,
    `"${name}" revenue profit results 2025 2026`,
    `"${name}" acquisition merger deal 2025 2026`,
    `"${name}" competitors market position`,
    `"${name}" banking products loans bonds capital markets advisory`,
  ];

  const institutionQueries = [
    `"${name}" deals mandates advised arranged 2025 2026`,
    `"${name}" league table ranking 2025 2026`,
    `"${name}" culture employees graduate programme 2026`,
  ];

  const queries =
    type === "institution"
      ? [...baseQueries, ...institutionQueries]
      : baseQueries;

  const results = await Promise.allSettled(queries.map((q) => serperSearch(q)));

  return results.map((r) => (r.status === "fulfilled" ? r.value : []));
}

/** Compact search used for Quick Brief (4 searches only). */
export async function runQuickSerperSearches(name: string): Promise<SerperResult[][]> {
  const queries = [
    `"${name}" news 2025 2026`,
    `"${name}" CEO leadership key people`,
    `"${name}" recent deals transactions`,
    `"${name}" competitors market position`,
  ];

  const results = await Promise.allSettled(queries.map((q) => serperSearch(q)));
  return results.map((r) => (r.status === "fulfilled" ? r.value : []));
}
