export type CompanyType = "company" | "institution";
export type BriefMode = "full" | "quick";

export interface DetectionResult {
  type: CompanyType;
  name: string;
  sector: string;
  geography: string;
  isPublic: boolean;
  exchange: string;
  confidence: "high" | "low";
}

export interface WikipediaData {
  description: string;
  extract: string;
  founded: string | null;
  headquarters: string | null;
  url: string;
}

export interface SerperResult {
  title: string;
  url: string;
  snippet: string;
  date: string | null;
  source?: string;
}

export interface SecEdgarFinancials {
  cik: string;
  companyName: string;
  revenue: { year: number; value: number }[];
  operatingIncome: { year: number; value: number }[];
  netIncome: { year: number; value: number }[];
  debt: { year: number; value: number }[];
  cash: { year: number; value: number }[];
  filingDate: string;
  filingUrl: string;
}

export interface CompaniesHouseData {
  companyNumber: string;
  name: string;
  type: string;
  dateOfCreation: string;
  registeredOffice: string;
  sicCodes: string[];
  status: string;
  officers: { name: string; role: string; appointedOn: string }[];
  profileUrl: string;
}

export interface OpenCorporatesData {
  jurisdictionCode: string;
  incorporationDate: string | null;
  registeredAddress: string | null;
  status: string | null;
  registryUrl: string;
}

export interface RssFeedItem {
  title: string;
  url: string;
  pubDate: string;
  source: string;
  description: string;
}

export interface RawPipelineData {
  wikipedia: WikipediaData | null;
  news: SerperResult[][];
  secEdgar: SecEdgarFinancials | null;
  companiesHouse: CompaniesHouseData | null;
  openCorporates: OpenCorporatesData | null;
  rssFeeds: RssFeedItem[];
  errors: string[];
}

// ── Company Brief ──────────────────────────────────────────────────────────

export interface CompanyBriefResult {
  type: "company";
  generatedAt: string;
  detection: DetectionResult;
  thirtySecondTake: string;
  snapshot: {
    sector: string;
    founded: string | null;
    headquarters: string | null;
    ownership: string;
    exchange: string | null;
    employees: string | null;
    revenue: string | null;
    source: string;
  };
  businessModel: {
    description: string;
    keyStreams: string[];
    source: string;
  };
  financials: {
    available: boolean;
    source: string;
    filingDate: string | null;
    revenue: { latest: string | null; prior: string | null; growth: string | null };
    ebitda: string | null;
    netIncome: string | null;
    debt: string | null;
    cash: string | null;
    note: string;
  };
  recentDevelopments: {
    headline: string;
    date: string;
    source: string;
    whyItMatters: string;
  }[];
  keyPeople: {
    name: string;
    role: string;
    note: string;
    source: string;
  }[];
  competitiveLandscape: {
    description: string;
    competitors: { name: string; comparison: string }[];
    source: string;
  };
  bankingContext: {
    productsUsed: string[];
    mandateOpportunities: string[];
    cfoConcerns: string;
    conversationStarter: string;
  };
  talkingPoints: { point: string; context: string }[];
  smartQuestions: { question: string; why: string }[];
  dataSources: { url: string; section: string; confidence: "High" | "Medium" | "Low" }[];
}

// ── Institution Brief ──────────────────────────────────────────────────────

export interface InstitutionBriefResult {
  type: "institution";
  generatedAt: string;
  detection: DetectionResult;
  thirtySecondTake: string;
  snapshot: {
    institutionType: string;
    aum: string | null;
    founded: string | null;
    headquarters: string | null;
    keyMarkets: string[];
    parentCompany: string | null;
    source: string;
  };
  whatTheyDo: {
    description: string;
    businessLines: string[];
    strategicPriorities: string;
    source: string;
  };
  recentDeals: {
    deal: string;
    role: string;
    value: string | null;
    date: string;
    source: string;
  }[];
  leagueTables: {
    description: string;
    source: string | null;
  };
  keyPeople: {
    name: string;
    role: string;
    note: string;
    source: string;
  }[];
  cultureAndDifferentiation: {
    positioning: string;
    knownFor: string;
    juniorExperience: string;
    source: string | null;
  };
  interviewTalkingPoints: { point: string; context: string }[];
  smartQuestionsToAsk: { question: string; why: string }[];
  dataSources: { url: string; section: string; confidence: "High" | "Medium" | "Low" }[];
}

// ── Quick Brief ────────────────────────────────────────────────────────────

export interface QuickBriefResult {
  type: "quick";
  name: string;
  generatedAt: string;
  thirtySecondTake: string;
  topThreeNews: string[];
  keyPerson: string;
  oneSmartQuestion: string;
  conversationOpener: string;
  dataSources: string[];
}

export type FullBriefResult = CompanyBriefResult | InstitutionBriefResult;
export type BriefResult = FullBriefResult | QuickBriefResult;

// ── SSE stream events ──────────────────────────────────────────────────────

export type StreamEvent =
  | { event: "step"; step: number; status: "loading" | "done"; label: string }
  | { event: "result"; data: BriefResult }
  | { event: "error"; message: string };

// ── Supabase stored brief ──────────────────────────────────────────────────

export interface StoredBrief {
  id: string;
  slug: string;
  type: CompanyType | "quick";
  name: string;
  brief_data: BriefResult;
  created_at: string;
  expires_at: string;
}

// ── Watchlist ──────────────────────────────────────────────────────────────

export interface WatchlistItem {
  id: string;
  name: string;
  type: CompanyType | "quick";
  savedAt: string;
  slug: string;
  briefData: BriefResult;
}
