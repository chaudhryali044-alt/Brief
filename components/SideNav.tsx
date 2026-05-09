"use client";

import { useState } from "react";

const COMPANY_NAV = [
  { icon: "article", label: "The Take", href: "#overview" },
  { icon: "corporate_fare", label: "Snapshot", href: "#snapshot" },
  { icon: "trending_up", label: "Business Model", href: "#business-model" },
  { icon: "show_chart", label: "Financials", href: "#financials" },
  { icon: "newspaper", label: "Developments", href: "#developments" },
  { icon: "badge", label: "Key People", href: "#people" },
  { icon: "compare_arrows", label: "Competitive", href: "#competitive" },
  { icon: "account_balance", label: "Banking Context", href: "#banking-context" },
  { icon: "quiz", label: "Interview Prep", href: "#prep" },
];

const INSTITUTION_NAV = [
  { icon: "article", label: "The Take", href: "#overview" },
  { icon: "corporate_fare", label: "Snapshot", href: "#snapshot" },
  { icon: "business_center", label: "What They Do", href: "#what-they-do" },
  { icon: "handshake", label: "Recent Deals", href: "#deals" },
  { icon: "leaderboard", label: "League Tables", href: "#league-tables" },
  { icon: "badge", label: "Key People", href: "#people" },
  { icon: "diversity_3", label: "Culture", href: "#culture" },
  { icon: "quiz", label: "Interview Prep", href: "#prep" },
];

interface Props {
  type?: "company" | "institution";
  companyName?: string;
}

export default function SideNav({ type = "company", companyName }: Props) {
  const [active, setActive] = useState(0);
  const navItems = type === "institution" ? INSTITUTION_NAV : COMPANY_NAV;

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-surface-dim border-r border-outline-variant flex flex-col py-6 z-40">
      <div className="px-6 mb-8">
        <h2 className="font-headline-md text-headline-md text-primary">Brief Report</h2>
        <p className="font-label-caps text-label-caps text-on-tertiary-fixed-variant uppercase">
          {type === "institution" ? "Institutional Grade" : "Company Intelligence"}
        </p>
        {companyName && (
          <p className="mt-2 text-xs text-on-surface-variant truncate">{companyName}</p>
        )}
      </div>

      <nav className="flex flex-col overflow-y-auto">
        {navItems.map((item, i) => (
          <a
            key={item.label}
            href={item.href}
            onClick={() => setActive(i)}
            className={`flex items-center gap-3 px-4 py-3 font-label-caps text-label-caps transition-all duration-200 ${
              i === active
                ? "text-primary bg-surface-container-high border-r-2 border-primary"
                : "text-on-surface-variant hover:bg-surface-container-highest opacity-80 hover:opacity-100"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}
