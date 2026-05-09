import { getCompanyBrief } from "@/lib/companyData";
import TopNav from "@/components/TopNav";
import SideNav from "@/components/SideNav";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

interface Props {
  params: { ticker: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const company = getCompanyBrief(params.ticker);
  return {
    title: company
      ? `Brief | ${company.name} (${company.ticker})`
      : `Brief | ${params.ticker.toUpperCase()}`,
  };
}

export default function BriefPage({ params }: Props) {
  const ticker = params.ticker.toUpperCase();
  const company = getCompanyBrief(ticker);

  if (!company) {
    return (
      <>
        <TopNav showSearch />
        <SideNav />
        <main className="ml-64 pt-16 min-h-screen">
          <div className="max-w-container-max mx-auto px-margin-desktop py-12 flex flex-col items-center justify-center h-[80vh]">
            <span className="material-symbols-outlined text-6xl text-on-tertiary-fixed-variant mb-6">
              search_off
            </span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">
              No Brief Found
            </h1>
            <p className="font-body-md text-on-surface-variant">
              We don&apos;t have intelligence data for{" "}
              <span className="text-primary font-data-mono">{ticker}</span> yet.
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <TopNav showSearch />
      <SideNav />

      <main className="ml-64 pt-16 min-h-screen">
        <div className="max-w-container-max mx-auto px-margin-desktop py-12">

          {/* Header */}
          <header
            id="overview"
            className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-outline-variant pb-8 gap-6"
          >
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="font-headline-lg text-headline-lg text-on-surface">
                  {company.name}
                </h1>
                <span className="font-data-mono text-data-mono px-2 py-1 bg-surface-container-highest text-primary border border-outline-variant">
                  TICKER: {company.ticker}
                </span>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="font-display-lg text-display-lg">{company.price}</span>
                <span
                  className={`font-data-mono ${company.positive ? "text-primary" : "text-error"}`}
                >
                  {company.changePct} ({company.change}) TODAY
                </span>
              </div>
            </div>

            {/* Sparkline */}
            <div className="w-full md:w-64 h-24 relative overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="goldGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#e9c176" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 35 Q 20 10, 40 25 T 80 5 T 100 15"
                  fill="none"
                  stroke="#e9c176"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  d="M0 35 Q 20 10, 40 25 T 80 5 T 100 15 V 40 H 0 Z"
                  fill="url(#goldGradient)"
                  opacity="0.1"
                />
              </svg>
            </div>
          </header>

          {/* Grid */}
          <div className="grid grid-cols-12 gap-gutter">

            {/* Executive Summary */}
            <section className="col-span-12 lg:col-span-8 space-y-6">
              <h3 className="font-label-caps text-label-caps text-primary border-b border-outline-variant pb-2 inline-block">
                Executive Summary
              </h3>
              <p className="font-headline-md text-headline-md leading-relaxed text-on-surface-variant">
                {company.summary[0]}
              </p>
              {company.summary[1] && (
                <p className="font-body-lg text-body-lg text-on-surface/80">
                  {company.summary[1]}
                </p>
              )}
            </section>

            {/* Key Metrics */}
            <section
              id="metrics"
              className="col-span-12 lg:col-span-4 bg-surface-container-low border border-outline-variant p-gutter h-fit"
            >
              <h3 className="font-label-caps text-label-caps text-primary mb-6">Key Metrics</h3>
              <div className="grid grid-cols-2 gap-y-8 gap-x-4">
                {company.metrics.map((m) => (
                  <div key={m.label} className="border-l border-outline-variant pl-4">
                    <p className="font-label-caps text-label-caps text-on-tertiary-fixed-variant mb-1">
                      {m.label}
                    </p>
                    <p className="font-data-mono text-xl text-on-surface">{m.value}</p>
                  </div>
                ))}
              </div>
              <button className="w-full mt-8 bg-primary text-on-primary py-3 font-label-caps text-label-caps hover:bg-primary-container transition-colors duration-200">
                Download Full Statement
              </button>
            </section>

            {/* Leadership */}
            <section id="leadership" className="col-span-12 py-12 border-y border-outline-variant mt-12">
              <h3 className="font-label-caps text-label-caps text-primary mb-8">Leadership</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                {company.leaders.map((leader) => (
                  <div
                    key={leader.name}
                    className="flex items-center gap-6 p-6 border border-outline-variant bg-surface-container-lowest"
                  >
                    <div className="w-24 h-24 flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-500 overflow-hidden">
                      <img
                        alt={leader.name}
                        className="w-full h-full object-cover"
                        src={leader.imgSrc}
                      />
                    </div>
                    <div>
                      <h4 className="font-headline-md text-headline-md text-on-surface">
                        {leader.name}
                      </h4>
                      <p className="font-label-caps text-label-caps text-primary mb-2">
                        {leader.title}
                      </p>
                      <p className="text-sm text-on-surface-variant max-w-sm">
                        {leader.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Banking Context */}
            <section id="banking" className="col-span-12 lg:col-span-7 mt-8">
              <h3 className="font-label-caps text-label-caps text-primary mb-6">Banking Context</h3>
              <div className="space-y-6">
                <div className="p-6 border border-outline-variant">
                  <h4 className="font-headline-md text-headline-md text-on-surface mb-4">
                    Advisory &amp; Institutional Footprint
                  </h4>
                  <div className="space-y-4">
                    {company.bankingRows.map((row) => (
                      <div
                        key={row.label}
                        className="flex justify-between items-center border-b border-outline-variant/30 pb-2"
                      >
                        <span className="text-on-surface-variant font-body-md">{row.label}</span>
                        {row.bar ? (
                          <div className="flex gap-1 items-center">
                            <div className="h-2 w-12 bg-primary" />
                            <div className="h-2 w-8 bg-surface-container-highest" />
                            <span className="ml-2 font-data-mono text-primary">{row.value}</span>
                          </div>
                        ) : (
                          <span
                            className={`font-data-mono ${row.highlight ? "text-primary" : "text-on-surface"}`}
                          >
                            {row.value}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 border border-outline-variant bg-surface-container-high">
                  <h4 className="font-label-caps text-label-caps text-on-surface mb-2">
                    Recent Institutional Holdings
                  </h4>
                  <p className="text-sm text-on-surface-variant mb-4">
                    Major positions maintained by Vanguard Group, BlackRock, and State Street Corp.
                  </p>
                  <div className="w-full h-32 bg-surface-container-lowest border border-outline-variant flex items-center justify-center">
                    <span className="font-data-mono text-on-tertiary-fixed-variant text-xs">
                      [Institutional Distribution Visualization]
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Market Intelligence / News */}
            <section id="news" className="col-span-12 lg:col-span-5 mt-8">
              <h3 className="font-label-caps text-label-caps text-primary mb-6">
                Market Intelligence
              </h3>
              <div className="space-y-4">
                {company.news.map((item, i) => (
                  <div
                    key={i}
                    className={`p-4 bg-surface-container-lowest border-l transition-colors cursor-pointer
                      ${i === 0 ? "border-primary" : "border-outline-variant hover:border-primary"}`}
                  >
                    <div className="flex justify-between text-xs font-data-mono text-on-tertiary-fixed-variant mb-1">
                      <span>{item.source}</span>
                      <span>{item.timeAgo}</span>
                    </div>
                    <h4 className="font-body-lg text-on-surface font-semibold leading-tight hover:text-primary transition-colors">
                      {item.headline}
                    </h4>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <Footer />
      </main>
    </>
  );
}
