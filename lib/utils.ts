/** Slugify a company name for use in URLs. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Generate a random 6-character alphanumeric suffix. */
export function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 8);
}

/** Format a large number as a readable financial string (e.g. 1234567890 → "$1.23B"). */
export function formatFinancialValue(value: number | null | undefined, prefix = "$"): string | null {
  if (value == null || isNaN(value)) return null;
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1e12) return `${sign}${prefix}${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${sign}${prefix}${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}${prefix}${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${sign}${prefix}${(abs / 1e3).toFixed(2)}K`;
  return `${sign}${prefix}${abs.toFixed(0)}`;
}

/** Calculate YoY growth percentage between two values. */
export function calcGrowth(latest: number, prior: number): string | null {
  if (!prior || isNaN(prior) || isNaN(latest)) return null;
  const pct = ((latest - prior) / Math.abs(prior)) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
}

/** Truncate a string to maxLen characters. */
export function truncate(str: string, maxLen = 200): string {
  if (!str) return "";
  return str.length > maxLen ? str.slice(0, maxLen).trim() + "…" : str;
}

/** Parse a date string best-effort, returning null if unparseable. */
export function parseDate(raw: string | null | undefined): Date | null {
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

/** Return true if a date is within the last `months` months. */
export function isWithinMonths(raw: string | null | undefined, months: number): boolean {
  const d = parseDate(raw);
  if (!d) return true; // include if we can't parse
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  return d >= cutoff;
}

/** Zero-pad a CIK to 10 digits for SEC EDGAR. */
export function padCik(cik: string | number): string {
  return String(cik).padStart(10, "0");
}

/** Base64 encode a string (Node.js compatible). */
export function b64(str: string): string {
  return Buffer.from(str).toString("base64");
}

/** Collect all unique source URLs from Serper results. */
export function extractUrls(results: { url: string }[][]): string[] {
  const urls = results.flat().map((r) => r.url).filter(Boolean);
  return Array.from(new Set(urls));
}

/** Format a date as a human-readable string. */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
