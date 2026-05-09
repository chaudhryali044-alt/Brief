"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";
import { WatchlistItem } from "@/lib/types";
import { formatDate } from "@/lib/utils";

function getWatchlist(): WatchlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("brief_watchlist") || "[]");
  } catch {
    return [];
  }
}

function removeFromWatchlist(id: string) {
  const list = getWatchlist();
  localStorage.setItem("brief_watchlist", JSON.stringify(list.filter((i) => i.id !== id)));
}

export default function WatchlistPage() {
  const router = useRouter();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    setItems(getWatchlist());
  }, []);

  function handleRemove(id: string) {
    removeFromWatchlist(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function handleRefresh(item: WatchlistItem) {
    router.push(`/brief/${encodeURIComponent(item.name)}?mode=full`);
  }

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(filter.toLowerCase())
  );

  const typeBadge = (type: string) => {
    if (type === "institution") return "Institution";
    if (type === "quick") return "Quick";
    return "Company";
  };

  return (
    <>
      <TopNav showSearch />

      <main className="pt-16 min-h-screen">
        <div className="max-w-container-max mx-auto px-margin-desktop py-12">
          {/* Header */}
          <header className="border-b border-outline-variant pb-8 mb-10">
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">
              Watchlist
            </h1>
            <p className="font-body-md text-on-surface-variant">
              Saved briefs for quick access. Stored locally on your device.
            </p>
          </header>

          {items.length > 0 && (
            <div className="mb-8">
              <div className="relative max-w-xs">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
                  search
                </span>
                <input
                  className="bg-surface-container-low border border-outline-variant text-on-surface py-2 pl-10 pr-4 text-sm w-full focus:outline-none focus:border-primary"
                  placeholder="Filter saved briefs..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <span className="material-symbols-outlined text-6xl text-on-tertiary-fixed-variant mb-6 block">
                bookmark_border
              </span>
              <h2 className="font-headline-md text-headline-md text-on-surface mb-3">
                {items.length === 0 ? "No saved briefs yet" : "No results match your filter"}
              </h2>
              <p className="font-body-md text-on-surface-variant max-w-sm mx-auto mb-6">
                {items.length === 0
                  ? "Search for a company or institution to generate your first brief. Save it here for quick access."
                  : "Try adjusting your filter."}
              </p>
              {items.length === 0 && (
                <button
                  onClick={() => router.push("/")}
                  className="px-6 py-3 bg-primary text-on-primary font-label-caps text-label-caps hover:bg-primary-container transition-colors"
                >
                  Search Now
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="border border-outline-variant bg-surface-container-low flex flex-col"
                >
                  <div className="p-6 flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 border border-outline-variant font-label-caps text-label-caps text-on-tertiary-fixed-variant text-[10px]">
                        {typeBadge(item.type)}
                      </span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-1">
                      {item.name}
                    </h3>
                    <p className="font-label-caps text-label-caps text-on-tertiary-fixed-variant">
                      Saved {formatDate(item.savedAt)}
                    </p>
                  </div>

                  <div className="border-t border-outline-variant flex">
                    <button
                      onClick={() => router.push(`/brief/${encodeURIComponent(item.slug)}`)}
                      className="flex-1 py-3 font-label-caps text-label-caps text-on-surface-variant hover:text-primary hover:bg-surface-container-highest transition-colors text-center"
                    >
                      View Brief
                    </button>
                    <div className="w-px bg-outline-variant" />
                    <button
                      onClick={() => handleRefresh(item)}
                      className="px-4 py-3 text-on-surface-variant hover:text-primary hover:bg-surface-container-highest transition-colors"
                      title="Refresh brief"
                    >
                      <span className="material-symbols-outlined text-[18px]">refresh</span>
                    </button>
                    <div className="w-px bg-outline-variant" />
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="px-4 py-3 text-on-surface-variant hover:text-error hover:bg-surface-container-highest transition-colors"
                      title="Remove"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <Footer />
      </main>
    </>
  );
}
