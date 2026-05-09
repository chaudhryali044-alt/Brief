"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Footer from "@/components/Footer";
import TopNav from "@/components/TopNav";

const TRENDING = ["NVIDIA Earnings", "Goldman Sachs M&A", "JP Morgan Strategy"];

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim().toUpperCase();
    if (trimmed) router.push(`/brief/${trimmed}`);
  }

  function handleTrending(label: string) {
    const ticker = label.split(" ")[0].toUpperCase();
    router.push(`/brief/${ticker}`);
  }

  return (
    <>
      <TopNav showSearch={false} />

      <main className="min-h-screen flex flex-col items-center justify-center pt-16 px-margin-mobile md:px-margin-desktop pb-24">
        <div className="w-full max-w-4xl text-center space-y-12">
          {/* Hero */}
          <div className="space-y-4">
            <h1 className="font-display-lg text-[84px] text-primary tracking-tighter leading-none">
              Brief
            </h1>
            <p className="font-body-lg text-on-surface-variant opacity-80 max-w-xl mx-auto">
              Institutional-grade intelligence for high-stakes decision making.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full max-w-2xl mx-auto">
            <form onSubmit={handleSearch}>
              <div className="glass-search border border-primary-container/40 flex items-center px-6 py-5 rounded-lg focus-within:border-primary transition-all duration-300 group shadow-2xl">
                <span className="material-symbols-outlined text-primary/60 group-focus-within:text-primary mr-4 transition-colors">
                  search
                </span>
                <input
                  className="bg-transparent border-none focus:ring-0 w-full font-data-mono text-body-lg text-on-surface placeholder:text-on-surface-variant/40 outline-none"
                  placeholder="Search for companies, tickers, or executives..."
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <div className="hidden md:flex items-center gap-2 px-2 py-1 bg-surface-container-highest rounded border border-outline-variant">
                  <span className="text-[10px] font-label-caps text-on-surface-variant">⌘ K</span>
                </div>
              </div>
            </form>

            {/* Trending chips */}
            <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-4">
              <span className="font-label-caps text-on-surface-variant uppercase tracking-widest text-[10px]">
                Trending Intelligence
              </span>
              <div className="flex flex-wrap justify-center gap-3">
                {TRENDING.map((label) => (
                  <button
                    key={label}
                    onClick={() => handleTrending(label)}
                    className="px-4 py-1.5 rounded-full border border-outline-variant text-on-surface-variant font-label-caps text-[11px] hover:border-primary hover:text-primary transition-all duration-200 hover:bg-primary/5"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Background glow */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-surface-container-high/20 rounded-full blur-[80px]" />
        </div>
      </main>

      <Footer fixed />
    </>
  );
}
