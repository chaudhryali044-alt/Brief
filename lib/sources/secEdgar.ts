import { SecEdgarFinancials } from "../types";
import { padCik, formatFinancialValue } from "../utils";

const EDGAR_BASE = "https://data.sec.gov";
const EDGAR_SEARCH = "https://efts.sec.gov/LATEST/search-index";

export async function fetchSecEdgar(
  name: string,
  isPublic: boolean,
  exchange: string
): Promise<SecEdgarFinancials | null> {
  const isUS = isPublic && /nyse|nasdaq/i.test(exchange);
  if (!isUS) return null;

  try {
    const cik = await findCik(name);
    if (!cik) return null;

    const paddedCik = padCik(cik);
    const [facts, filingInfo] = await Promise.allSettled([
      fetchCompanyFacts(paddedCik),
      findLatestFiling(name),
    ]);

    if (facts.status === "rejected" || !facts.value) return null;

    return parseCompanyFacts(
      facts.value,
      cik,
      filingInfo.status === "fulfilled" ? filingInfo.value : null
    );
  } catch (err) {
    console.error("[SEC EDGAR] failed:", err);
    return null;
  }
}

async function findCik(name: string): Promise<string | null> {
  try {
    const url = `${EDGAR_SEARCH}?q=${encodeURIComponent(`"${name}"`)}&forms=10-K&dateRange=custom&startdt=2022-01-01`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Brief-Intelligence contact@getbrief.io" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const hits: Record<string, unknown>[] = data?.hits?.hits ?? [];
    if (!hits.length) return null;
    const src = hits[0]._source as Record<string, unknown>;
    const entityId = src?.entity_id as string;
    if (!entityId) return null;
    // entity_id looks like "CIK0000886982"
    return entityId.replace(/^CIK0*/, "");
  } catch {
    return null;
  }
}

async function fetchCompanyFacts(paddedCik: string): Promise<Record<string, unknown> | null> {
  const url = `${EDGAR_BASE}/api/xbrl/companyfacts/CIK${paddedCik}.json`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Brief-Intelligence contact@getbrief.io" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function findLatestFiling(name: string): Promise<{ url: string; date: string } | null> {
  try {
    const url = `${EDGAR_SEARCH}?q=${encodeURIComponent(`"${name}"`)}&forms=10-K&dateRange=custom&startdt=2023-01-01`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Brief-Intelligence contact@getbrief.io" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const hits: Record<string, unknown>[] = data?.hits?.hits ?? [];
    if (!hits.length) return null;
    const src = hits[0]._source as Record<string, unknown>;
    return {
      url: `https://www.sec.gov${src?.file_date ? `/cgi-bin/browse-edgar?action=getcompany&CIK=${src.entity_id}&type=10-K` : ""}`,
      date: (src?.file_date as string) || "",
    };
  } catch {
    return null;
  }
}

function extractMetric(
  usGaap: Record<string, unknown>,
  keys: string[]
): { year: number; value: number }[] {
  for (const key of keys) {
    const metric = usGaap[key] as Record<string, unknown> | undefined;
    if (!metric) continue;
    const units = metric.units as Record<string, unknown> | undefined;
    const usdArray = (units?.USD ?? units?.["USD/shares"] ?? []) as Record<string, unknown>[];
    if (!usdArray.length) continue;

    // Filter to annual (10-K) filings only
    const annual = usdArray.filter(
      (item) => item.form === "10-K" || item.form === "10-K/A"
    );
    if (!annual.length) continue;

    // Group by fiscal year end, take latest value per year
    const byYear = new Map<number, number>();
    for (const item of annual) {
      const end = item.end as string;
      if (!end) continue;
      const year = new Date(end).getFullYear();
      byYear.set(year, item.val as number);
    }

    return Array.from(byYear.entries())
      .sort((a, b) => b[0] - a[0])
      .slice(0, 3)
      .map(([year, value]) => ({ year, value }));
  }
  return [];
}

function parseCompanyFacts(
  data: Record<string, unknown>,
  cik: string,
  filing: { url: string; date: string } | null
): SecEdgarFinancials {
  const usGaap = (data.facts as Record<string, unknown>)?.["us-gaap"] as Record<string, unknown> ?? {};

  return {
    cik,
    companyName: (data.entityName as string) || "",
    revenue: extractMetric(usGaap, [
      "Revenues",
      "RevenueFromContractWithCustomerExcludingAssessedTax",
      "RevenueFromContractWithCustomerIncludingAssessedTax",
      "SalesRevenueNet",
      "RevenuesNetOfInterestExpense",
    ]),
    operatingIncome: extractMetric(usGaap, ["OperatingIncomeLoss"]),
    netIncome: extractMetric(usGaap, [
      "NetIncomeLoss",
      "NetIncomeLossAvailableToCommonStockholdersBasic",
    ]),
    debt: extractMetric(usGaap, [
      "LongTermDebt",
      "LongTermDebtNoncurrent",
      "LongTermDebtAndCapitalLeaseObligations",
    ]),
    cash: extractMetric(usGaap, [
      "CashAndCashEquivalentsAtCarryingValue",
      "CashCashEquivalentsAndShortTermInvestments",
    ]),
    filingDate: filing?.date || "",
    filingUrl: filing?.url || `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${cik}&type=10-K`,
  };
}

/** Format SEC EDGAR data into human-readable strings for Gemini. */
export function formatSecForPrompt(data: SecEdgarFinancials): string {
  const fmt = (arr: { year: number; value: number }[]) =>
    arr.map((v) => `${v.year}: ${formatFinancialValue(v.value)}`).join(", ") || "N/A";

  return `SEC EDGAR Data (CIK: ${data.cik}, Company: ${data.companyName})
Revenue: ${fmt(data.revenue)}
Operating Income: ${fmt(data.operatingIncome)}
Net Income: ${fmt(data.netIncome)}
Long-Term Debt: ${fmt(data.debt)}
Cash: ${fmt(data.cash)}
Filing Date: ${data.filingDate}
Filing URL: ${data.filingUrl}`;
}
