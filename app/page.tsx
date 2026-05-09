"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import TopNav from "@/components/TopNav";
import { WatchlistItem } from "@/lib/types";

type BriefMode = "full" | "quick";

const RECENT_KEY = "brief_recent_searches";

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveSearch(name: string) {
  const existing = getRecentSearches();
  const updated = [name, ...existing.filter((s) => s !== name)].slice(0, 8);
  localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
}

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<BriefMode>("full");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  function handleSearch(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    saveSearch(trimmed);
    router.push(`/brief/${encodeURIComponent(trimmed)}?mode=${mode}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleSearch(query);
  }

  return (
    <>
      <TopNav showSearch={false} />

      <main className="min-h-screen flex flex-col items-center justify-center pt-16 px-margin-mobile md:px-margin-desktop pb-32">
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
            <form onSubmit={handleSubmit}>
              <div className="glass-search border border-primary-container/40 flex items-center px-6 py-5 rounded-lg focus-within:border-primary transition-all duration-300 group shadow-2xl">
                <span className="material-symbols-outlined text-primary/60 group-focus-within:text-primary mr-4 transition-colors">
                  search
                </span>
                <input
                  className="bg-transparent border-none focus:ring-0 w-full font-data-mono text-body-lg text-on-surface placeholder:text-on-surface-variant/40 outline-none"
                  placeholder="Search any company or institution... e.g. Deliveroo, Mizuho, KKR, Stripe, DEWA"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                />
                <div className="hidden md:flex items-center gap-2 px-2 py-1 bg-surface-container-highest rounded border border-outline-variant">
                  <span className="text-[10px] font-label-caps text-on-surface-variant">⌘ K</span>
                </div>
              </div>
            </form>

            {/* Mode toggles */}
            <div className="mt-4 flex justify-center">
              <div className="flex border border-outline-variant overflow-hidden">
                <button
                  onClick={() => setMode("full")}
                  className={`px-6 py-2 font-label-caps text-label-caps transition-colors duration-200 ${
                    mode === "full"
                      ? "bg-primary text-on-primary"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Full Brief
                </button>
                <button
                  onClick={() => setMode("quick")}
                  className={`px-6 py-2 font-label-caps text-label-caps border-l border-outline-variant transition-colors duration-200 ${
                    mode === "quick"
                      ? "bg-primary text-on-primary"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Quick Brief
                </button>
              </div>
            </div>

            <p className="mt-2 font-label-caps text-label-caps text-on-tertiary-fixed-variant">
              {mode === "full"
                ? "Comprehensive intelligence — 20–30 seconds"
                : "60-second pre-meeting snapshot"}
            </p>

            {/* Recent searches */}
            {recentSearches.length > 0 && (
              <div className="mt-8 flex flex-col items-center gap-3">
                <span className="font-label-caps text-on-surface-variant uppercase tracking-widest text-[10px]">
                  Recent Searches
                </span>
                <div className="flex flex-wrap justify-center gap-2">
                  {recentSearches.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSearch(s)}
                      className="px-4 py-1.5 rounded-full border border-outline-variant text-on-surface-variant font-label-caps text-[11px] hover:border-primary hover:text-primary transition-all duration-200 hover:bg-primary/5"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
