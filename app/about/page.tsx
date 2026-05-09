import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brief | About",
};

const DATA_SOURCES = [
  {
    name: "SEC EDGAR",
    description: "US public company financial filings (10-K, 10-Q). Revenue, net income, debt, cash position.",
    icon: "account_balance",
    geography: "United States",
  },
  {
    name: "Companies House",
    description: "UK company registration, directors, and annual accounts.",
    icon: "business",
    geography: "United Kingdom",
  },
  {
    name: "OpenCorporates",
    description: "Global company registry data across 140+ jurisdictions.",
    icon: "public",
    geography: "Global",
  },
  {
    name: "Wikipedia",
    description: "Company history, description, founding dates, and key facts.",
    icon: "menu_book",
    geography: "Global",
  },
  {
    name: "Google Search (Serper)",
    description: "Latest news, leadership changes, deals, and market intelligence from live web search.",
    icon: "search",
    geography: "Global",
  },
  {
    name: "Financial Press RSS",
    description: "Real-time deal and transaction announcements from Reuters, BusinessWire, and PRNewswire.",
    icon: "newspaper",
    geography: "Global",
  },
];

export default function AboutPage() {
  return (
    <>
      <TopNav showSearch />

      <main className="pt-16 min-h-screen">
        <div className="max-w-3xl mx-auto px-margin-desktop py-16">
          {/* Hero */}
          <div className="border-b border-outline-variant pb-12 mb-12">
            <h1 className="font-display-lg text-display-lg text-primary mb-6 tracking-tight">
              Brief
            </h1>
            <p className="font-headline-md text-headline-md text-on-surface-variant leading-relaxed mb-4">
              Brief generates professional company and institution intelligence briefs for finance professionals.
            </p>
            <p className="font-body-lg text-body-lg text-on-surface/70">
              Every brief is grounded in real public sources — SEC filings, Companies House, Wikipedia, and the financial press. No hallucination. No paywalls. No fluff.
            </p>
          </div>

          {/* How it works */}
          <section className="mb-12">
            <h2 className="font-label-caps text-label-caps text-primary mb-6 border-b border-outline-variant pb-2 inline-block">
              How It Works
            </h2>
            <div className="space-y-6">
              {[
                {
                  step: "01",
                  title: "You search any company or institution",
                  desc: "Enter a name — public or private, global or local. Peloton, Mizuho, KKR, Stripe, DEWA.",
                },
                {
                  step: "02",
                  title: "We pull real data from verified sources",
                  desc: "SEC EDGAR, Companies House, Wikipedia, Google News, and financial press — all in parallel.",
                },
                {
                  step: "03",
                  title: "Gemini synthesises a banker-grade brief",
                  desc: "Using only the real data we found — never hallucinated — Gemini writes what a senior banker would say.",
                },
                {
                  step: "04",
                  title: "Every fact is sourced",
                  desc: "Every section shows where the data came from. If we couldn't find something, we say so.",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-6">
                  <span className="font-display-lg text-3xl text-primary/30 leading-none flex-shrink-0 w-8">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-1">
                      {item.title}
                    </h3>
                    <p className="font-body-md text-on-surface-variant">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Data Sources */}
          <section className="mb-12">
            <h2 className="font-label-caps text-label-caps text-primary mb-6 border-b border-outline-variant pb-2 inline-block">
              Data Sources
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              {DATA_SOURCES.map((source) => (
                <div
                  key={source.name}
                  className="p-5 border border-outline-variant bg-surface-container-low"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      {source.icon}
                    </span>
                    <h3 className="font-headline-md text-headline-md text-on-surface">
                      {source.name}
                    </h3>
                  </div>
                  <p className="text-sm text-on-surface-variant mb-2">{source.description}</p>
                  <span className="font-label-caps text-label-caps text-on-tertiary-fixed-variant">
                    {source.geography}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Principles */}
          <section className="mb-12">
            <h2 className="font-label-caps text-label-caps text-primary mb-6 border-b border-outline-variant pb-2 inline-block">
              Principles
            </h2>
            <div className="space-y-4">
              {[
                {
                  title: "No Hallucination",
                  desc: "Gemini only synthesises data that was actually scraped. Every fact comes from a real source.",
                },
                {
                  title: "Source Everything",
                  desc: "Every section shows its source URL. If no data was found, we say so explicitly.",
                },
                {
                  title: "Financials from Filings Only",
                  desc: "Financial figures only from SEC EDGAR or Companies House. Never estimated or approximated.",
                },
                {
                  title: "Graceful Degradation",
                  desc: "If any source fails, we continue with what's available and note what failed.",
                },
              ].map((p) => (
                <div key={p.title} className="border-l border-primary pl-4 py-1">
                  <h3 className="font-body-md font-semibold text-on-surface">{p.title}</h3>
                  <p className="text-sm text-on-surface-variant">{p.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Built by */}
          <section className="border-t border-outline-variant pt-8">
            <p className="font-body-md text-on-surface-variant">
              Built by{" "}
              <span className="text-primary font-semibold">Ali Chaudhry</span>.
            </p>
            <p className="text-sm text-on-tertiary-fixed-variant mt-1">
              Brief Financial Intelligence — Proprietary &amp; Confidential.
            </p>
          </section>
        </div>

        <Footer />
      </main>
    </>
  );
}
