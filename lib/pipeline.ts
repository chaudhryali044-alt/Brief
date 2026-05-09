import { fetchWikipedia } from "./sources/wikipedia";
import { runSerperSearches, runQuickSerperSearches } from "./sources/serper";
import { fetchSecEdgar, formatSecForPrompt } from "./sources/secEdgar";
import { fetchCompaniesHouse, formatCHForPrompt } from "./sources/companiesHouse";
import { fetchOpenCorporates } from "./sources/openCorporates";
import { fetchRssFeeds } from "./sources/rss";
import { callGemini, parseGeminiJson } from "./gemini";
import {
  DetectionResult,
  RawPipelineData,
  CompanyBriefResult,
  InstitutionBriefResult,
  QuickBriefResult,
  SerperResult,
  RssFeedItem,
} from "./types";
import { formatFinancialValue, calcGrowth } from "./utils";

// ── Data pipeline ──────────────────────────────────────────────────────────

/** Run Phase 1: Wikipedia + Serper (fast public sources). */
export async function runPhase1(
  name: string,
  detection: DetectionResult
): Promise<Pick<RawPipelineData, "wikipedia" | "news">> {
  const [wikiResult, newsResult] = await Promise.allSettled([
    fetchWikipedia(name),
    runSerperSearches(name, detection.type),
  ]);

  return {
    wikipedia: wikiResult.status === "fulfilled" ? wikiResult.value : null,
    news: newsResult.status === "fulfilled" ? newsResult.value : [],
  };
}

/** Run Phase 2: SEC EDGAR + Companies House + OpenCorporates. */
export async function runPhase2(
  name: string,
  detection: DetectionResult
): Promise<Pick<RawPipelineData, "secEdgar" | "companiesHouse" | "openCorporates" | "errors">> {
  const errors: string[] = [];

  const [secResult, chResult, ocResult] = await Promise.allSettled([
    fetchSecEdgar(name, detection.isPublic, detection.exchange),
    fetchCompaniesHouse(name, detection.geography),
    fetchOpenCorporates(name),
  ]);

  if (secResult.status === "rejected") {
    errors.push("US financial filing data temporarily unavailable. Financial section omitted.");
    console.error("[Pipeline] SEC EDGAR:", secResult.reason);
  }
  if (chResult.status === "rejected") {
    errors.push("UK company data temporarily unavailable. Financial section omitted.");
    console.error("[Pipeline] Companies House:", chResult.reason);
  }

  return {
    secEdgar: secResult.status === "fulfilled" ? secResult.value : null,
    companiesHouse: chResult.status === "fulfilled" ? chResult.value : null,
    openCorporates: ocResult.status === "fulfilled" ? ocResult.value : null,
    errors,
  };
}

/** Run Phase 3: RSS feeds. */
export async function runPhase3(name: string): Promise<Pick<RawPipelineData, "rssFeeds">> {
  try {
    const feeds = await fetchRssFeeds(name);
    return { rssFeeds: feeds };
  } catch {
    return { rssFeeds: [] };
  }
}

// ── Context builder ────────────────────────────────────────────────────────

function buildContextString(name: string, data: RawPipelineData): string {
  const parts: string[] = [`=== BRIEF INTELLIGENCE DATA FOR: ${name} ===\n`];

  if (data.wikipedia) {
    parts.push(`--- WIKIPEDIA ---
Description: ${data.wikipedia.description}
Extract: ${data.wikipedia.extract}
URL: ${data.wikipedia.url}`);
  } else {
    parts.push("--- WIKIPEDIA ---\nNot found.");
  }

  const allNews = data.news.flat();
  if (allNews.length) {
    parts.push("--- NEWS & WEB SEARCH RESULTS ---");
    allNews.forEach((r, i) => {
      parts.push(`[${i + 1}] ${r.title}\nURL: ${r.url}\nSnippet: ${r.snippet}\nDate: ${r.date || "unknown"}`);
    });
  } else {
    parts.push("--- NEWS & WEB SEARCH RESULTS ---\nNo results found.");
  }

  if (data.secEdgar) {
    parts.push(`--- SEC EDGAR FINANCIALS ---\n${formatSecForPrompt(data.secEdgar)}`);
  } else {
    parts.push("--- SEC EDGAR FINANCIALS ---\nNot applicable or not found.");
  }

  if (data.companiesHouse) {
    parts.push(`--- COMPANIES HOUSE ---\n${formatCHForPrompt(data.companiesHouse)}`);
  } else {
    parts.push("--- COMPANIES HOUSE ---\nNot applicable or not found.");
  }

  if (data.openCorporates) {
    const oc = data.openCorporates;
    parts.push(`--- OPENCORPORATES ---
Jurisdiction: ${oc.jurisdictionCode}
Incorporated: ${oc.incorporationDate || "N/A"}
Address: ${oc.registeredAddress || "N/A"}
Status: ${oc.status || "N/A"}
Registry: ${oc.registryUrl}`);
  }

  if (data.rssFeeds.length) {
    parts.push("--- RSS FEED ITEMS ---");
    data.rssFeeds.forEach((item) => {
      parts.push(`[${item.source}] ${item.title}\nURL: ${item.url}\nDate: ${item.pubDate}`);
    });
  }

  return parts.join("\n\n");
}

// ── Company synthesis ──────────────────────────────────────────────────────

const COMPANY_SYSTEM_PROMPT = `You are a senior investment banking analyst at a top-tier bulge bracket bank with 15 years of experience covering corporate clients globally.

You have been given real scraped data about a company from multiple verified sources. Your task is to generate a professional company intelligence brief that a Managing Director would be comfortable reading before a client meeting.

CRITICAL RULES:
1. Only use facts from the provided data. Never add facts not in the provided context.
2. If data is missing for a section, say so explicitly. Never fill gaps with assumptions.
3. Financial figures only from filing data (SEC EDGAR or Companies House). Never estimate or approximate financials.
4. Write in the voice of a senior banker — direct, confident, insight-driven. Not academic. Not generic. Not safe.
5. The 30-Second Take must be genuinely opinionated — what a banker would actually say, not what Wikipedia would say.
6. Every section with a source field MUST include a real URL from the provided data. If no URL is available, use the Wikipedia URL or the most relevant news URL.
7. For recentDevelopments, only include items where you have a real source URL from the data.
8. For keyPeople, only include people explicitly mentioned in the scraped data.`;

const COMPANY_OUTPUT_SCHEMA = `Return ONLY valid JSON with this exact structure:
{
  "thirtySecondTake": "string (3 sentences, banker-framed, genuinely opinionated)",
  "snapshot": {
    "sector": "string",
    "founded": "string or null",
    "headquarters": "string or null",
    "ownership": "public or private or state-owned",
    "exchange": "string or null",
    "employees": "string or null",
    "revenue": "string or null (from filings only — null if no filing data)",
    "source": "string (URL)"
  },
  "businessModel": {
    "description": "string (3 sentences — how they make money)",
    "keyStreams": ["string", "string", "string"],
    "source": "string (URL)"
  },
  "financials": {
    "available": true or false,
    "source": "SEC EDGAR or Companies House or Unavailable",
    "filingDate": "string or null",
    "revenue": { "latest": "string or null", "prior": "string or null", "growth": "string or null" },
    "ebitda": "string or null",
    "netIncome": "string or null",
    "debt": "string or null",
    "cash": "string or null",
    "note": "string"
  },
  "recentDevelopments": [
    { "headline": "string", "date": "string", "source": "string (real URL from data)", "whyItMatters": "string (one sentence)" }
  ],
  "keyPeople": [
    { "name": "string", "role": "string", "note": "string (one sentence)", "source": "string (URL)" }
  ],
  "competitiveLandscape": {
    "description": "string (2 sentences)",
    "competitors": [{ "name": "string", "comparison": "string (one sentence)" }],
    "source": "string (URL)"
  },
  "bankingContext": {
    "productsUsed": ["string"],
    "mandateOpportunities": ["string", "string"],
    "cfoConcerns": "string",
    "conversationStarter": "string"
  },
  "talkingPoints": [
    { "point": "string", "context": "string" },
    { "point": "string", "context": "string" },
    { "point": "string", "context": "string" }
  ],
  "smartQuestions": [
    { "question": "string", "why": "string" },
    { "question": "string", "why": "string" },
    { "question": "string", "why": "string" }
  ]
}`;

// ── Institution synthesis ──────────────────────────────────────────────────

const INSTITUTION_SYSTEM_PROMPT = `You are a senior finance professional with deep knowledge of investment banks, PE firms, VC funds, and asset managers globally.

You have been given real scraped data about a financial institution from multiple verified sources. Generate a professional institution brief that would help someone prepare for an interview or client meeting with this institution.

CRITICAL RULES:
1. Only use facts from the provided data. Never add facts not in the provided context.
2. If data is missing for a section, say so explicitly. Never fill gaps with assumptions.
3. Write in the voice of a senior market professional — direct, specific, market-aware.
4. For recentDeals, only include deals with a real source URL from the data.
5. The 30-Second Take must be specific to what this institution is known for RIGHT NOW, not generic.`;

const INSTITUTION_OUTPUT_SCHEMA = `Return ONLY valid JSON with this exact structure:
{
  "thirtySecondTake": "string (3 sentences — what someone in finance would say about this institution right now)",
  "snapshot": {
    "institutionType": "string (Investment Bank / PE Firm / VC Fund / Hedge Fund / Asset Manager)",
    "aum": "string or null",
    "founded": "string or null",
    "headquarters": "string or null",
    "keyMarkets": ["string"],
    "parentCompany": "string or null",
    "source": "string (URL)"
  },
  "whatTheyDo": {
    "description": "string (3 sentences)",
    "businessLines": ["string"],
    "strategicPriorities": "string",
    "source": "string (URL)"
  },
  "recentDeals": [
    { "deal": "string", "role": "string", "value": "string or null", "date": "string", "source": "string (real URL)" }
  ],
  "leagueTables": {
    "description": "string",
    "source": "string or null"
  },
  "keyPeople": [
    { "name": "string", "role": "string", "note": "string", "source": "string (URL)" }
  ],
  "cultureAndDifferentiation": {
    "positioning": "string (2 sentences)",
    "knownFor": "string",
    "juniorExperience": "string",
    "source": "string or null"
  },
  "interviewTalkingPoints": [
    { "point": "string", "context": "string" },
    { "point": "string", "context": "string" },
    { "point": "string", "context": "string" }
  ],
  "smartQuestionsToAsk": [
    { "question": "string", "why": "string" },
    { "question": "string", "why": "string" },
    { "question": "string", "why": "string" }
  ]
}`;

// ── Quick Brief synthesis ──────────────────────────────────────────────────

const QUICK_SYSTEM_PROMPT = (name: string) =>
  `Generate a 60-second pre-meeting brief for "${name}". Use only the provided scraped data. Maximum 3 bullet points per section.

Return ONLY valid JSON:
{
  "thirtySecondTake": "string (2 sentences only — most important thing to know)",
  "topThreeNews": ["string", "string", "string"],
  "keyPerson": "string (most important person to know and one fact about them from the data)",
  "oneSmartQuestion": "string (best question to ask right now based on recent data)",
  "conversationOpener": "string (one sentence to open a conversation showing genuine knowledge)"
}`;

// ── Main synthesis functions ───────────────────────────────────────────────

export async function synthesizeCompanyBrief(
  detection: DetectionResult,
  data: RawPipelineData
): Promise<CompanyBriefResult> {
  const context = buildContextString(detection.name, data);
  const prompt = `${COMPANY_SYSTEM_PROMPT}\n\n${context}\n\n${COMPANY_OUTPUT_SCHEMA}`;

  const raw = await callGemini(prompt);
  const parsed = parseGeminiJson<Omit<CompanyBriefResult, "type" | "generatedAt" | "detection" | "dataSources">>(raw);

  // Build data sources list from all URLs encountered
  const dataSources = buildDataSources(data);

  return {
    type: "company",
    generatedAt: new Date().toISOString(),
    detection,
    dataSources,
    ...parsed,
  };
}

export async function synthesizeInstitutionBrief(
  detection: DetectionResult,
  data: RawPipelineData
): Promise<InstitutionBriefResult> {
  const context = buildContextString(detection.name, data);
  const prompt = `${INSTITUTION_SYSTEM_PROMPT}\n\n${context}\n\n${INSTITUTION_OUTPUT_SCHEMA}`;

  const raw = await callGemini(prompt);
  const parsed = parseGeminiJson<Omit<InstitutionBriefResult, "type" | "generatedAt" | "detection" | "dataSources">>(raw);

  const dataSources = buildDataSources(data);

  return {
    type: "institution",
    generatedAt: new Date().toISOString(),
    detection,
    dataSources,
    ...parsed,
  };
}

export async function synthesizeQuickBrief(
  name: string,
  news: SerperResult[][],
  feeds: RssFeedItem[]
): Promise<QuickBriefResult> {
  const context: string[] = [`=== QUICK BRIEF DATA FOR: ${name} ===`];

  const allNews = news.flat();
  allNews.forEach((r, i) => {
    context.push(`[${i + 1}] ${r.title}\nURL: ${r.url}\nSnippet: ${r.snippet}`);
  });
  feeds.forEach((f) => {
    context.push(`[RSS:${f.source}] ${f.title}\nURL: ${f.url}`);
  });

  const prompt = `${QUICK_SYSTEM_PROMPT(name)}\n\n${context.join("\n\n")}`;
  const raw = await callGemini(prompt, 20000);
  const parsed = parseGeminiJson<Omit<QuickBriefResult, "type" | "name" | "generatedAt" | "dataSources">>(raw);

  const dataSources = [...allNews.map((r) => r.url), ...feeds.map((f) => f.url)].filter(
    Boolean
  );

  return {
    type: "quick",
    name,
    generatedAt: new Date().toISOString(),
    dataSources,
    ...parsed,
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────

function buildDataSources(
  data: RawPipelineData
): CompanyBriefResult["dataSources"] {
  const sources: CompanyBriefResult["dataSources"] = [];

  if (data.wikipedia?.url) {
    sources.push({ url: data.wikipedia.url, section: "Overview", confidence: "High" });
  }
  if (data.secEdgar?.filingUrl) {
    sources.push({ url: data.secEdgar.filingUrl, section: "Financials", confidence: "High" });
  }
  if (data.companiesHouse?.profileUrl) {
    sources.push({ url: data.companiesHouse.profileUrl, section: "Financials", confidence: "High" });
  }
  if (data.openCorporates?.registryUrl) {
    sources.push({ url: data.openCorporates.registryUrl, section: "Company Registry", confidence: "Medium" });
  }

  const newsUrls = new Set<string>();
  data.news.flat().forEach((r) => {
    if (r.url && !newsUrls.has(r.url)) {
      newsUrls.add(r.url);
      sources.push({ url: r.url, section: "News", confidence: "Medium" });
    }
  });

  data.rssFeeds.forEach((f) => {
    sources.push({ url: f.url, section: "News", confidence: "Medium" });
  });

  return sources.slice(0, 30);
}

/** Format financial data for the brief financials section from raw SEC data. */
export function formatFinancials(
  data: RawPipelineData
): CompanyBriefResult["financials"] {
  if (data.secEdgar) {
    const sec = data.secEdgar;
    const rev = sec.revenue;
    return {
      available: rev.length > 0,
      source: `SEC EDGAR — ${sec.filingUrl}`,
      filingDate: sec.filingDate || null,
      revenue: {
        latest: rev[0] ? formatFinancialValue(rev[0].value) : null,
        prior: rev[1] ? formatFinancialValue(rev[1].value) : null,
        growth: rev[0] && rev[1] ? calcGrowth(rev[0].value, rev[1].value) : null,
      },
      ebitda: null,
      netIncome: sec.netIncome[0] ? formatFinancialValue(sec.netIncome[0].value) : null,
      debt: sec.debt[0] ? formatFinancialValue(sec.debt[0].value) : null,
      cash: sec.cash[0] ? formatFinancialValue(sec.cash[0].value) : null,
      note: `Data from SEC 10-K filing for ${sec.companyName}.`,
    };
  }

  if (data.companiesHouse) {
    return {
      available: false,
      source: `Companies House — ${data.companiesHouse.profileUrl}`,
      filingDate: null,
      revenue: { latest: null, prior: null, growth: null },
      ebitda: null,
      netIncome: null,
      debt: null,
      cash: null,
      note: "Companies House registration found but detailed financial accounts require direct filing review.",
    };
  }

  return {
    available: false,
    source: "Unavailable",
    filingDate: null,
    revenue: { latest: null, prior: null, growth: null },
    ebitda: null,
    netIncome: null,
    debt: null,
    cash: null,
    note: "No public financial filing found for this company.",
  };
}
