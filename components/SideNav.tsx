"use client";

import { useState } from "react";

const NAV_ITEMS = [
  { icon: "article", label: "Executive Overview", href: "#overview" },
  { icon: "show_chart", label: "Financial Performance", href: "#metrics" },
  { icon: "newspaper", label: "Market Intelligence", href: "#news" },
  { icon: "badge", label: "Leadership", href: "#leadership" },
  { icon: "account_balance", label: "Banking Context", href: "#banking" },
];

export default function SideNav() {
  const [active, setActive] = useState(0);

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-surface-dim border-r border-outline-variant flex flex-col py-6 z-40">
      <div className="px-6 mb-8">
        <h2 className="font-headline-md text-headline-md text-primary">Brief Report</h2>
        <p className="font-label-caps text-label-caps text-on-tertiary-fixed-variant uppercase">
          Institutional Grade
        </p>
      </div>
      <nav className="flex flex-col">
        {NAV_ITEMS.map((item, i) => (
          <a
            key={item.label}
            href={item.href}
            onClick={() => setActive(i)}
            className={`flex items-center gap-3 px-4 py-3 font-label-caps text-label-caps transition-all duration-200
              ${i === active
                ? "text-primary bg-surface-container-high border-r-2 border-primary opacity-100"
                : "text-on-surface-variant hover:bg-surface-container-highest opacity-80 hover:opacity-100"
              }`}
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}
