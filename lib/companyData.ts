export interface NewsItem {
  source: string;
  timeAgo: string;
  headline: string;
}

export interface LeaderItem {
  name: string;
  title: string;
  description: string;
  imgSrc: string;
}

export interface MetricItem {
  label: string;
  value: string;
}

export interface BankingRow {
  label: string;
  value: string;
  highlight?: boolean;
  bar?: boolean;
}

export interface CompanyBrief {
  name: string;
  ticker: string;
  price: string;
  change: string;
  changePct: string;
  positive: boolean;
  summary: string[];
  metrics: MetricItem[];
  leaders: LeaderItem[];
  bankingRows: BankingRow[];
  news: NewsItem[];
}

const GS: CompanyBrief = {
  name: "Goldman Sachs Group, Inc.",
  ticker: "GS",
  price: "$482.14",
  change: "+11.53",
  changePct: "+2.45%",
  positive: true,
  summary: [
    "The Goldman Sachs Group, Inc. stands as a premier global investment banking, securities, and investment management firm that provides a wide range of financial services to a substantial and diversified client base. Founded in 1869, the firm is headquartered in New York and maintains offices in all major financial centers around the world.",
    "The firm operates through four functional segments: Investment Banking, Global Markets, Asset Management, and Consumer & Wealth Management. Goldman Sachs remains at the vanguard of institutional finance, consistently ranking among the top advisors for global mergers and acquisitions and equity underwritings. Its strategic pivot towards more durable, fee-based revenues reflects a modern evolution of the traditional investment banking model.",
  ],
  metrics: [
    { label: "Market Cap", value: "$162.4B" },
    { label: "P/E Ratio", value: "14.22" },
    { label: "Revenue (TTM)", value: "$46.25B" },
    { label: "EBITDA", value: "$12.8B" },
    { label: "Dividend Yield", value: "2.28%" },
    { label: "ROE", value: "11.4%" },
  ],
  leaders: [
    {
      name: "David Solomon",
      title: "Chairman & Chief Executive Officer",
      description:
        "Leading the firm's strategic transition toward sustainable, diversified revenue streams since 2018.",
      imgSrc:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuATRWtMmEeUts0Hb74iJ-b1SNTKO7pRG2N-VG4ARjTLAxBCz2cmW1pOK4zHcjtMmIZ-7C6vqVxiRBhuo1AGq0BmKNg1oHEcHnqFVsQfNdwmTAOsgpT0lmdjfzQ0tTzc97x2H-8t8zlVnywuDLEh7uLU4lxYuJE7frb7Met1hGTWNjy0f60ALg6_3J-DhyXZl43Dcu5H6NfPEQEXvDl-hbj-sx8kzno2Wh8SAg9W1W4chue_1N2tJLSxMKx2cvbk7e5iFKiHwcvU8wY",
    },
    {
      name: "John Waldron",
      title: "President & Chief Operating Officer",
      description:
        "Overseeing global operations and managing the firm's primary business units with a focus on capital efficiency.",
      imgSrc:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDIqq_rW1djyctAdCZfreWBQW-3PUk8K-WEjgFGd8W7EeJprfMrUdCQND-iJLIhMKvN74hTksIZmSjVRYNZE02Aq9SaUzwxuZpvRqmMk_oH3mnRfMxPVfdQo9WPZZ26bjzxpZ_L5_VG-cswRoNF6eJXJaLq2nJBGa_g3tUCWLZs4PSB8OMrWY9KgfXCJ5EsncQERmMNFbfkxBTQqXe-vlCYZVSxzN2BNsu5OW-Nk4NFoJ51aRcfwaVBPyVUfFjPbXJ5bR8AovoA",
    },
  ],
  bankingRows: [
    { label: "Global M&A Rank", value: "#1 (2023)", highlight: true },
    { label: "Institutional Ownership", value: "84.6%" },
    { label: "Analyst Sentiment", value: "Strong Buy", bar: true },
  ],
  news: [
    {
      source: "BLOOMBERG",
      timeAgo: "2 HOURS AGO",
      headline: "Goldman Sachs Plans Further Asset Management Expansion in Asia Markets",
    },
    {
      source: "FINANCIAL TIMES",
      timeAgo: "6 HOURS AGO",
      headline: "Solomon Signals Resilience in Institutional Fee Growth Despite Volatility",
    },
    {
      source: "REUTERS",
      timeAgo: "1 DAY AGO",
      headline: "Goldman Underwrites Major Tech IPO, Signalling M&A Market Thaw",
    },
    {
      source: "CNBC",
      timeAgo: "2 DAYS AGO",
      headline: "Analysts Revise GS Price Target Upwards to $510 Following Q3 Results",
    },
  ],
};

const NVIDIA: CompanyBrief = {
  name: "NVIDIA Corporation",
  ticker: "NVIDIA",
  price: "$875.39",
  change: "+18.72",
  changePct: "+2.19%",
  positive: true,
  summary: [
    "NVIDIA Corporation is a global technology leader specializing in accelerated computing, designing graphics processing units (GPUs), system-on-chip units, and related software. Founded in 1993 and headquartered in Santa Clara, California, the company has evolved from a gaming GPU maker into the backbone of the AI and data center revolution.",
    "NVIDIA's products power the majority of the world's generative AI infrastructure. The firm operates through two segments: Compute & Networking and Graphics. Its CUDA software ecosystem and dominant GPU architecture give it a significant competitive moat. The company's data center revenue has surpassed its traditional gaming segment, driven by insatiable demand for AI training workloads.",
  ],
  metrics: [
    { label: "Market Cap", value: "$2.16T" },
    { label: "P/E Ratio", value: "72.4" },
    { label: "Revenue (TTM)", value: "$79.8B" },
    { label: "EBITDA", value: "$48.3B" },
    { label: "Dividend Yield", value: "0.03%" },
    { label: "ROE", value: "91.2%" },
  ],
  leaders: [
    {
      name: "Jensen Huang",
      title: "President & Chief Executive Officer",
      description:
        "Co-founder of NVIDIA and architect of the company's pivot to accelerated computing and AI infrastructure.",
      imgSrc:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuATRWtMmEeUts0Hb74iJ-b1SNTKO7pRG2N-VG4ARjTLAxBCz2cmW1pOK4zHcjtMmIZ-7C6vqVxiRBhuo1AGq0BmKNg1oHEcHnqFVsQfNdwmTAOsgpT0lmdjfzQ0tTzc97x2H-8t8zlVnywuDLEh7uLU4lxYuJE7frb7Met1hGTWNjy0f60ALg6_3J-DhyXZl43Dcu5H6NfPEQEXvDl-hbj-sx8kzno2Wh8SAg9W1W4chue_1N2tJLSxMKx2cvbk7e5iFKiHwcvU8wY",
    },
    {
      name: "Colette Kress",
      title: "Executive VP & Chief Financial Officer",
      description:
        "Overseeing financial strategy and investor relations as NVIDIA scales its data center and AI hardware business.",
      imgSrc:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDIqq_rW1djyctAdCZfreWBQW-3PUk8K-WEjgFGd8W7EeJprfMrUdCQND-iJLIhMKvN74hTksIZmSjVRYNZE02Aq9SaUzwxuZpvRqmMk_oH3mnRfMxPVfdQo9WPZZ26bjzxpZ_L5_VG-cswRoNF6eJXJaLq2nJBGa_g3tUCWLZs4PSB8OMrWY9KgfXCJ5EsncQERmMNFbfkxBTQqXe-vlCYZVSxzN2BNsu5OW-Nk4NFoJ51aRcfwaVBPyVUfFjPbXJ5bR8AovoA",
    },
  ],
  bankingRows: [
    { label: "AI Chip Market Share", value: "~80%", highlight: true },
    { label: "Institutional Ownership", value: "65.3%" },
    { label: "Analyst Sentiment", value: "Strong Buy", bar: true },
  ],
  news: [
    {
      source: "BLOOMBERG",
      timeAgo: "1 HOUR AGO",
      headline: "NVIDIA's Blackwell GPU Demand Surges as Hyperscalers Lock In AI Compute Orders",
    },
    {
      source: "WALL STREET JOURNAL",
      timeAgo: "4 HOURS AGO",
      headline: "NVIDIA Posts Record Data Center Revenue, Raises Full-Year Guidance",
    },
    {
      source: "REUTERS",
      timeAgo: "1 DAY AGO",
      headline: "Jensen Huang Outlines Next-Generation AI Infrastructure Roadmap at GTC",
    },
    {
      source: "CNBC",
      timeAgo: "2 DAYS AGO",
      headline: "NVIDIA Stock Hits New ATH as Earnings Season Accelerates AI Spending",
    },
  ],
};

const JPM: CompanyBrief = {
  name: "JPMorgan Chase & Co.",
  ticker: "JPM",
  price: "$198.47",
  change: "+1.82",
  changePct: "+0.93%",
  positive: true,
  summary: [
    "JPMorgan Chase & Co. is the largest bank in the United States and one of the most prominent financial institutions globally. The firm offers a comprehensive range of financial services across investment banking, commercial banking, financial transaction processing, asset management, and private banking. Headquartered in New York City, JPMorgan Chase operates in over 100 markets worldwide.",
    "The company operates through four major segments: Consumer & Community Banking, Corporate & Investment Bank, Commercial Banking, and Asset & Wealth Management. Under the leadership of CEO Jamie Dimon, JPMorgan Chase has navigated multiple economic cycles with resilience, maintaining its position as the most systemically important financial institution in the United States.",
  ],
  metrics: [
    { label: "Market Cap", value: "$572.1B" },
    { label: "P/E Ratio", value: "11.8" },
    { label: "Revenue (TTM)", value: "$158.1B" },
    { label: "EBITDA", value: "$52.4B" },
    { label: "Dividend Yield", value: "2.41%" },
    { label: "ROE", value: "15.7%" },
  ],
  leaders: [
    {
      name: "Jamie Dimon",
      title: "Chairman & Chief Executive Officer",
      description:
        "Regarded as the most influential banker of his generation, steering JPMorgan through the 2008 financial crisis and post-pandemic expansion.",
      imgSrc:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuATRWtMmEeUts0Hb74iJ-b1SNTKO7pRG2N-VG4ARjTLAxBCz2cmW1pOK4zHcjtMmIZ-7C6vqVxiRBhuo1AGq0BmKNg1oHEcHnqFVsQfNdwmTAOsgpT0lmdjfzQ0tTzc97x2H-8t8zlVnywuDLEh7uLU4lxYuJE7frb7Met1hGTWNjy0f60ALg6_3J-DhyXZl43Dcu5H6NfPEQEXvDl-hbj-sx8kzno2Wh8SAg9W1W4chue_1N2tJLSxMKx2cvbk7e5iFKiHwcvU8wY",
    },
    {
      name: "Jeremy Barnum",
      title: "Chief Financial Officer",
      description:
        "Managing the bank's capital allocation, investor communications, and financial strategy across all business lines.",
      imgSrc:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDIqq_rW1djyctAdCZfreWBQW-3PUk8K-WEjgFGd8W7EeJprfMrUdCQND-iJLIhMKvN74hTksIZmSjVRYNZE02Aq9SaUzwxuZpvRqmMk_oH3mnRfMxPVfdQo9WPZZ26bjzxpZ_L5_VG-cswRoNF6eJXJaLq2nJBGa_g3tUCWLZs4PSB8OMrWY9KgfXCJ5EsncQERmMNFbfkxBTQqXe-vlCYZVSxzN2BNsu5OW-Nk4NFoJ51aRcfwaVBPyVUfFjPbXJ5bR8AovoA",
    },
  ],
  bankingRows: [
    { label: "Global IB Rank", value: "#2 (2023)", highlight: true },
    { label: "Institutional Ownership", value: "71.2%" },
    { label: "Analyst Sentiment", value: "Buy", bar: true },
  ],
  news: [
    {
      source: "BLOOMBERG",
      timeAgo: "3 HOURS AGO",
      headline: "JPMorgan Expands Private Credit Arm with $15B Commitment to Middle Market Lending",
    },
    {
      source: "FINANCIAL TIMES",
      timeAgo: "8 HOURS AGO",
      headline: "Dimon Warns of Persistent Inflation Risk, Advocates Defensive Portfolio Positioning",
    },
    {
      source: "REUTERS",
      timeAgo: "1 DAY AGO",
      headline: "JPMorgan's Investment Bank Posts Strongest Quarter Since 2021 on Dealmaking Rebound",
    },
    {
      source: "WALL STREET JOURNAL",
      timeAgo: "3 DAYS AGO",
      headline: "JPMorgan Acquires AI-Powered Risk Analytics Startup to Bolster Trading Platform",
    },
  ],
};

const DB: Record<string, CompanyBrief> = { GS, NVIDIA, JPM };

export function getCompanyBrief(ticker: string): CompanyBrief | null {
  return DB[ticker.toUpperCase()] ?? null;
}
