"use client";

import { useState } from "react";
import { CompanyBriefResult, InstitutionBriefResult, FullBriefResult } from "@/lib/types";
import { formatDate } from "@/lib/utils";

// ── Shared sub-components ──────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-label-caps text-label-caps text-primary border-b border-outline-variant pb-2 mb-6 inline-block">
      {children}
    </h3>
  );
}

function SourceLink({ url, label = "Source →" }: { url: string; label?: string }) {
  if (!url || url === "Unavailable" || url === "string (URL)") return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="font-label-caps text-label-caps text-on-tertiary-fixed-variant hover:text-primary transition-colors"
    >
      {label}
    </a>
  );
}

function ThirtySecondTake({ text }: { text: string }) {
  return (
    <div className="border-l-2 border-primary pl-6 py-2 bg-surface-container-low mb-10">
      <p className="font-label-caps text-label-caps text-primary uppercase mb-3">
        The 30-Second Take
      </p>
      <p className="font-headline-md text-headline-md text-on-surface leading-relaxed">
        {text}
      </p>
    </div>
  );
}

function DataSourcesSection({
  sources,
}: {
  sources: { url: string; section: string; confidence: string }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-outline-variant mt-12">
      <button
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-surface-container-low transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="font-label-caps text-label-caps text-on-surface">
          Data Sources ({sources.length})
        </span>
        <span className="material-symbols-outlined text-on-surface-variant">
          {open ? "expand_less" : "expand_more"}
        </span>
      </button>
      {open && (
        <div className="px-6 pb-6 border-t border-outline-variant">
          <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
            {sources.map((s, i) => (
              <div key={i} className="flex items-start justify-between gap-4 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`font-label-caps text-label-caps flex-shrink-0 px-1.5 py-0.5 border text-[10px] ${
                      s.confidence === "High"
                        ? "border-primary text-primary"
                        : s.confidence === "Medium"
                        ? "border-outline text-on-surface-variant"
                        : "border-outline-variant text-on-tertiary-fixed-variant"
                    }`}
                  >
                    {s.confidence}
                  </span>
                  <span className="text-on-tertiary-fixed-variant font-label-caps text-label-caps">
                    {s.section}
                  </span>
                </div>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-on-surface-variant hover:text-primary font-data-mono text-[11px] truncate max-w-xs transition-colors"
                >
                  {s.url}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Company Brief ──────────────────────────────────────────────────────────

function CompanyBrief({ brief, onShare, onSave }: {
  brief: CompanyBriefResult;
  onShare: () => void;
  onSave: () => void;
}) {
  const d = brief.detection;
  const snap = brief.snapshot;
  const fin = brief.financials;

  return (
    <div className="space-y-16">
      <ThirtySecondTake text={brief.thirtySecondTake} />

      {/* Snapshot */}
      <section id="snapshot">
        <SectionLabel>Company Snapshot</SectionLabel>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Sector", value: snap.sector },
            { label: "Founded", value: snap.founded || "—" },
            { label: "Headquarters", value: snap.headquarters || "—" },
            { label: "Ownership", value: snap.ownership },
            { label: "Exchange", value: snap.exchange || "Private" },
            { label: "Employees", value: snap.employees || "—" },
            { label: "Revenue", value: snap.revenue || (fin.available ? fin.revenue.latest : "—") || "—" },
            { label: "Source", value: null, url: snap.source },
          ].map((item) => (
            <div key={item.label} className="border-l border-outline-variant pl-4">
              <p className="font-label-caps text-label-caps text-on-tertiary-fixed-variant mb-1">
                {item.label}
              </p>
              {item.url ? (
                <SourceLink url={item.url} label="View source →" />
              ) : (
                <p className="font-data-mono text-data-mono text-on-surface">{item.value}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Business Model */}
      <section id="business-model">
        <SectionLabel>Business Model</SectionLabel>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-4">
          {brief.businessModel.description}
        </p>
        <ul className="space-y-2 mb-4">
          {brief.businessModel.keyStreams.map((s, i) => (
            <li key={i} className="flex items-start gap-2 font-body-md text-body-md text-on-surface">
              <span className="text-primary mt-1">›</span>
              {s}
            </li>
          ))}
        </ul>
        <SourceLink url={brief.businessModel.source} />
      </section>

      {/* Financials */}
      <section id="financials">
        <SectionLabel>Financials</SectionLabel>
        {fin.available ? (
          <>
            <div className="border border-outline-variant overflow-hidden mb-3">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-container border-b border-outline-variant">
                    <th className="text-left px-4 py-3 font-label-caps text-label-caps text-on-tertiary-fixed-variant">
                      Metric
                    </th>
                    <th className="text-right px-4 py-3 font-label-caps text-label-caps text-on-tertiary-fixed-variant">
                      Latest
                    </th>
                    <th className="text-right px-4 py-3 font-label-caps text-label-caps text-on-tertiary-fixed-variant">
                      Prior
                    </th>
                    <th className="text-right px-4 py-3 font-label-caps text-label-caps text-on-tertiary-fixed-variant">
                      Growth
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Revenue", ...fin.revenue },
                    { label: "Net Income", latest: fin.netIncome, prior: null, growth: null },
                    { label: "EBITDA", latest: fin.ebitda, prior: null, growth: null },
                    { label: "Total Debt", latest: fin.debt, prior: null, growth: null },
                    { label: "Cash", latest: fin.cash, prior: null, growth: null },
                  ]
                    .filter((r) => r.latest)
                    .map((row) => (
                      <tr key={row.label} className="border-b border-outline-variant/30 last:border-0">
                        <td className="px-4 py-3 font-body-md text-on-surface-variant">{row.label}</td>
                        <td className="px-4 py-3 text-right font-data-mono text-on-surface">
                          {row.latest || "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-data-mono text-on-tertiary-fixed-variant">
                          {row.prior || "—"}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-data-mono ${
                            row.growth?.startsWith("+")
                              ? "text-primary"
                              : row.growth?.startsWith("-")
                              ? "text-error"
                              : "text-on-surface"
                          }`}
                        >
                          {row.growth || "—"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-on-tertiary-fixed-variant font-data-mono">
              Source: {fin.source} {fin.filingDate && `· Filed ${fin.filingDate}`}
            </p>
            {fin.note && (
              <p className="text-xs text-on-tertiary-fixed-variant mt-1">{fin.note}</p>
            )}
          </>
        ) : (
          <div className="border border-outline-variant p-6 bg-surface-container-low">
            <p className="font-body-md text-on-surface-variant">
              Financial data unavailable — {d.name} has not filed public accounts accessible via
              SEC EDGAR or Companies House.
            </p>
            {fin.note && (
              <p className="text-sm text-on-tertiary-fixed-variant mt-2">{fin.note}</p>
            )}
          </div>
        )}
      </section>

      {/* Recent Developments */}
      <section id="developments">
        <SectionLabel>Recent Developments</SectionLabel>
        {brief.recentDevelopments.length > 0 ? (
          <div className="space-y-4">
            {brief.recentDevelopments.slice(0, 5).map((item, i) => (
              <div
                key={i}
                className={`p-4 border-l bg-surface-container-lowest transition-colors ${
                  i === 0 ? "border-primary" : "border-outline-variant hover:border-primary"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-data-mono text-on-tertiary-fixed-variant mb-1">
                  <span>{item.date}</span>
                  <SourceLink url={item.source} label="Read →" />
                </div>
                <h4 className="font-body-lg text-on-surface font-semibold leading-tight mb-1">
                  {item.headline}
                </h4>
                <p className="text-sm text-on-surface-variant italic">{item.whyItMatters}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-on-surface-variant font-body-md">
            No significant developments found in public sources in the last 90 days.
          </p>
        )}
      </section>

      {/* Key People */}
      <section id="people">
        <SectionLabel>Key People</SectionLabel>
        {brief.keyPeople.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {brief.keyPeople.slice(0, 5).map((person) => (
              <div
                key={person.name}
                className="p-5 border border-outline-variant bg-surface-container-lowest"
              >
                <h4 className="font-headline-md text-headline-md text-on-surface">
                  {person.name}
                </h4>
                <p className="font-label-caps text-label-caps text-primary mb-2">{person.role}</p>
                <p className="text-sm text-on-surface-variant mb-3">{person.note}</p>
                <SourceLink url={person.source} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-on-surface-variant font-body-md">
            Key personnel data not found in public sources.
          </p>
        )}
      </section>

      {/* Competitive Landscape */}
      <section id="competitive">
        <SectionLabel>Competitive Landscape</SectionLabel>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-4">
          {brief.competitiveLandscape.description}
        </p>
        {brief.competitiveLandscape.competitors.length > 0 && (
          <div className="space-y-2 mb-4">
            {brief.competitiveLandscape.competitors.map((c) => (
              <div key={c.name} className="flex items-start gap-3 py-2 border-b border-outline-variant/30">
                <span className="font-data-mono text-primary flex-shrink-0">{c.name}</span>
                <span className="text-on-surface-variant text-sm">{c.comparison}</span>
              </div>
            ))}
          </div>
        )}
        <SourceLink url={brief.competitiveLandscape.source} />
      </section>

      {/* Banking Context */}
      <section id="banking-context">
        <div className="border border-primary/30 bg-surface-container-low p-8">
          <SectionLabel>Banking Context</SectionLabel>
          <p className="font-label-caps text-label-caps text-on-tertiary-fixed-variant uppercase mb-2">
            Products This Company Uses
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            {brief.bankingContext.productsUsed.map((p) => (
              <span
                key={p}
                className="px-3 py-1 border border-outline-variant text-on-surface-variant font-label-caps text-label-caps"
              >
                {p}
              </span>
            ))}
          </div>

          <p className="font-label-caps text-label-caps text-on-tertiary-fixed-variant uppercase mb-2">
            Mandate Opportunities Right Now
          </p>
          <ol className="space-y-2 mb-6">
            {brief.bankingContext.mandateOpportunities.map((m, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="font-data-mono text-primary flex-shrink-0">{i + 1}.</span>
                <span className="font-body-md text-on-surface">{m}</span>
              </li>
            ))}
          </ol>

          <p className="font-label-caps text-label-caps text-on-tertiary-fixed-variant uppercase mb-2">
            What The CFO Is Focused On
          </p>
          <p className="font-body-md text-on-surface mb-6">{brief.bankingContext.cfoConcerns}</p>

          <div className="border-l-2 border-primary pl-4 py-2">
            <p className="font-label-caps text-label-caps text-primary uppercase mb-2">
              Conversation Starter
            </p>
            <p className="font-headline-md text-headline-md text-on-surface">
              {brief.bankingContext.conversationStarter}
            </p>
          </div>
        </div>
      </section>

      {/* Interview & Meeting Prep */}
      <section id="prep">
        <SectionLabel>Interview &amp; Meeting Prep</SectionLabel>

        <div className="mb-8">
          <p className="font-label-caps text-label-caps text-on-tertiary-fixed-variant uppercase mb-4">
            Three Talking Points
          </p>
          <div className="space-y-4">
            {brief.talkingPoints.map((tp, i) => (
              <div key={i} className="flex gap-4 p-4 border border-outline-variant">
                <span className="font-display-lg text-3xl text-primary/30 leading-none flex-shrink-0">
                  {i + 1}
                </span>
                <div>
                  <p className="font-body-md font-semibold text-on-surface mb-1">{tp.point}</p>
                  <p className="text-sm text-on-surface-variant italic">{tp.context}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="font-label-caps text-label-caps text-on-tertiary-fixed-variant uppercase mb-4">
            Three Smart Questions
          </p>
          <div className="space-y-4">
            {brief.smartQuestions.map((sq, i) => (
              <div key={i} className="flex gap-4 p-4 border border-outline-variant bg-surface-container-lowest">
                <span className="font-display-lg text-3xl text-primary/30 leading-none flex-shrink-0">
                  {i + 1}
                </span>
                <div>
                  <p className="font-body-md font-semibold text-on-surface mb-1">
                    &ldquo;{sq.question}&rdquo;
                  </p>
                  <p className="text-sm text-on-surface-variant italic">{sq.why}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <DataSourcesSection sources={brief.dataSources} />
    </div>
  );
}

// ── Institution Brief ──────────────────────────────────────────────────────

function InstitutionBrief({ brief }: { brief: InstitutionBriefResult }) {
  const snap = brief.snapshot;

  return (
    <div className="space-y-16">
      <ThirtySecondTake text={brief.thirtySecondTake} />

      {/* Snapshot */}
      <section id="snapshot">
        <SectionLabel>Institution Snapshot</SectionLabel>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { label: "Type", value: snap.institutionType },
            { label: "AUM", value: snap.aum || "—" },
            { label: "Founded", value: snap.founded || "—" },
            { label: "Headquarters", value: snap.headquarters || "—" },
            { label: "Key Markets", value: snap.keyMarkets.join(", ") || "—" },
            { label: "Parent Company", value: snap.parentCompany || "Independent" },
          ].map((item) => (
            <div key={item.label} className="border-l border-outline-variant pl-4">
              <p className="font-label-caps text-label-caps text-on-tertiary-fixed-variant mb-1">
                {item.label}
              </p>
              <p className="font-data-mono text-data-mono text-on-surface">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <SourceLink url={snap.source} label="View source →" />
        </div>
      </section>

      {/* What They Do */}
      <section id="what-they-do">
        <SectionLabel>What They Do</SectionLabel>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-4">
          {brief.whatTheyDo.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {brief.whatTheyDo.businessLines.map((line) => (
            <span
              key={line}
              className="px-3 py-1 border border-outline-variant text-on-surface-variant font-label-caps text-label-caps"
            >
              {line}
            </span>
          ))}
        </div>
        <div className="border-l border-primary pl-4 mt-4">
          <p className="font-label-caps text-label-caps text-primary uppercase mb-1">
            Strategic Priority Right Now
          </p>
          <p className="font-body-md text-on-surface">{brief.whatTheyDo.strategicPriorities}</p>
        </div>
        <div className="mt-3">
          <SourceLink url={brief.whatTheyDo.source} />
        </div>
      </section>

      {/* Recent Deals */}
      <section id="deals">
        <SectionLabel>Recent Deals &amp; Mandates</SectionLabel>
        {brief.recentDeals.length > 0 ? (
          <div className="space-y-4">
            {brief.recentDeals.slice(0, 6).map((deal, i) => (
              <div
                key={i}
                className={`p-4 border-l bg-surface-container-lowest ${
                  i === 0 ? "border-primary" : "border-outline-variant"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-surface-container-highest font-label-caps text-label-caps text-primary border border-outline-variant text-[10px]">
                      {deal.role}
                    </span>
                    {deal.value && (
                      <span className="font-data-mono text-primary text-sm">{deal.value}</span>
                    )}
                  </div>
                  <span className="font-data-mono text-on-tertiary-fixed-variant text-xs">
                    {deal.date}
                  </span>
                </div>
                <p className="font-body-md text-on-surface font-semibold mb-1">{deal.deal}</p>
                <SourceLink url={deal.source} label="Source →" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-on-surface-variant font-body-md">
            No confirmed deal announcements found in public sources for the last 6 months.
          </p>
        )}
      </section>

      {/* League Tables */}
      <section id="league-tables">
        <SectionLabel>League Table Position</SectionLabel>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-3">
          {brief.leagueTables.description ||
            "No league table data found in public sources."}
        </p>
        {brief.leagueTables.source && (
          <SourceLink url={brief.leagueTables.source} />
        )}
      </section>

      {/* Key People */}
      <section id="people">
        <SectionLabel>Key People</SectionLabel>
        {brief.keyPeople.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {brief.keyPeople.slice(0, 5).map((person) => (
              <div
                key={person.name}
                className="p-5 border border-outline-variant bg-surface-container-lowest"
              >
                <h4 className="font-headline-md text-headline-md text-on-surface">
                  {person.name}
                </h4>
                <p className="font-label-caps text-label-caps text-primary mb-2">{person.role}</p>
                <p className="text-sm text-on-surface-variant mb-3">{person.note}</p>
                <SourceLink url={person.source} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-on-surface-variant font-body-md">
            Key personnel data not found in public sources.
          </p>
        )}
      </section>

      {/* Culture & Differentiation */}
      <section id="culture">
        <SectionLabel>Culture &amp; Differentiation</SectionLabel>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-4">
          {brief.cultureAndDifferentiation.positioning}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div className="border-l border-primary pl-4">
            <p className="font-label-caps text-label-caps text-primary uppercase mb-1">
              Known For
            </p>
            <p className="font-body-md text-on-surface">
              {brief.cultureAndDifferentiation.knownFor}
            </p>
          </div>
          <div className="border-l border-outline-variant pl-4">
            <p className="font-label-caps text-label-caps text-on-tertiary-fixed-variant uppercase mb-1">
              Junior Experience
            </p>
            <p className="font-body-md text-on-surface">
              {brief.cultureAndDifferentiation.juniorExperience}
            </p>
          </div>
        </div>
        {brief.cultureAndDifferentiation.source && (
          <SourceLink url={brief.cultureAndDifferentiation.source} />
        )}
      </section>

      {/* Interview Prep */}
      <section id="prep">
        <div className="border border-primary/30 bg-surface-container-low p-8">
          <SectionLabel>Interview Prep</SectionLabel>

          <div className="mb-8">
            <p className="font-label-caps text-label-caps text-on-tertiary-fixed-variant uppercase mb-4">
              Three Talking Points For Your Interview
            </p>
            <div className="space-y-4">
              {brief.interviewTalkingPoints.map((tp, i) => (
                <div key={i} className="flex gap-4 p-4 border border-outline-variant">
                  <span className="font-display-lg text-3xl text-primary/30 leading-none flex-shrink-0">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-body-md font-semibold text-on-surface mb-1">{tp.point}</p>
                    <p className="text-sm text-on-surface-variant italic">{tp.context}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="font-label-caps text-label-caps text-on-tertiary-fixed-variant uppercase mb-4">
              Three Questions To Ask Your Interviewer
            </p>
            <div className="space-y-4">
              {brief.smartQuestionsToAsk.map((sq, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-4 border border-outline-variant bg-surface-container-lowest"
                >
                  <span className="font-display-lg text-3xl text-primary/30 leading-none flex-shrink-0">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-body-md font-semibold text-on-surface mb-1">
                      &ldquo;{sq.question}&rdquo;
                    </p>
                    <p className="text-sm text-on-surface-variant italic">{sq.why}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <DataSourcesSection sources={brief.dataSources} />
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────

interface Props {
  brief: FullBriefResult;
  onShare: () => void;
  onSave: () => void;
}

export default function BriefDisplay({ brief, onShare, onSave }: Props) {
  const d = brief.detection;
  const generatedAt = new Date(brief.generatedAt);

  return (
    <div className="ml-64 pt-16 min-h-screen">
      <div className="max-w-container-max mx-auto px-margin-desktop py-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b border-outline-variant pb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="font-headline-lg text-headline-lg text-on-surface">{d.name}</h1>
              <span className="font-data-mono text-data-mono px-2 py-1 bg-surface-container-highest text-primary border border-outline-variant">
                {d.sector}
              </span>
              <span className="font-data-mono text-data-mono px-2 py-1 border border-outline-variant text-on-surface-variant text-[11px]">
                {d.geography}
              </span>
            </div>
            <p className="font-label-caps text-label-caps text-on-tertiary-fixed-variant">
              Generated {formatDate(generatedAt)}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onSave}
              className="flex items-center gap-2 px-4 py-2 border border-outline-variant text-on-surface-variant font-label-caps text-label-caps hover:border-primary hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">bookmark</span>
              Save
            </button>
            <button
              onClick={onShare}
              className="flex items-center gap-2 px-4 py-2 border border-outline-variant text-on-surface-variant font-label-caps text-label-caps hover:border-primary hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">share</span>
              Share
            </button>
            <DownloadPdfButton brief={brief} />
          </div>
        </header>

        {/* Content */}
        {brief.type === "company" ? (
          <CompanyBrief brief={brief} onShare={onShare} onSave={onSave} />
        ) : (
          <InstitutionBrief brief={brief} />
        )}
      </div>
    </div>
  );
}

function DownloadPdfButton({ brief }: { brief: FullBriefResult }) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const { generatePdf } = await import("@/lib/pdf");
      await generatePdf(brief);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary font-label-caps text-label-caps hover:bg-primary-container transition-colors disabled:opacity-50"
    >
      <span className="material-symbols-outlined text-[16px]">download</span>
      {loading ? "Generating…" : "Download PDF"}
    </button>
  );
}
