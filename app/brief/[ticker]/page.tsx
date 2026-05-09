"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import TopNav from "@/components/TopNav";
import SideNav from "@/components/SideNav";
import LoadingSteps from "@/components/LoadingSteps";
import BriefDisplay from "@/components/BriefDisplay";
import QuickBriefDisplay from "@/components/QuickBriefDisplay";
import { BriefResult, FullBriefResult, QuickBriefResult, WatchlistItem } from "@/lib/types";

// Detect if a slug looks like a Supabase share slug (ends in -xxxxxx, 6 alphanum chars)
function isShareSlug(slug: string): boolean {
  return /^.+-[a-z0-9]{6}$/.test(slug);
}

function getWatchlist(): WatchlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("brief_watchlist") || "[]");
  } catch {
    return [];
  }
}

function saveToWatchlist(item: WatchlistItem) {
  const list = getWatchlist();
  const updated = [item, ...list.filter((i) => i.id !== item.id)];
  localStorage.setItem("brief_watchlist", JSON.stringify(updated));
}

interface Props {
  params: { ticker: string };
}

export default function BriefPage({ params }: Props) {
  const slug = decodeURIComponent(params.ticker);
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "full";

  const [stepStatuses, setStepStatuses] = useState<("idle" | "loading" | "done")[]>([
    "idle", "idle", "idle", "idle",
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [brief, setBrief] = useState<BriefResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isShared, setIsShared] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareToast, setShareToast] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadBrief();
  }, [slug]);

  async function loadBrief() {
    // If this looks like a Supabase share slug, try fetching it first
    if (isShareSlug(slug)) {
      try {
        const res = await fetch(`/api/shared/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setBrief(data.brief_data as BriefResult);
          setIsShared(true);
          setCurrentStep(4);
          setStepStatuses(["done", "done", "done", "done"]);
          return;
        }
      } catch {
        // Not a shared slug, fall through to generate
      }
    }

    // Generate fresh brief via streaming SSE
    setStepStatuses(["loading", "idle", "idle", "idle"]);
    setCurrentStep(1);

    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: slug, mode }),
      });

      if (!res.ok || !res.body) {
        setError("Failed to connect to Brief service. Please try again.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            handleStreamEvent(event);
          } catch {
            // Malformed event, skip
          }
        }
      }
    } catch (err) {
      console.error("Stream error:", err);
      setError("Brief generation failed. Please try again.");
    }
  }

  function handleStreamEvent(event: Record<string, unknown>) {
    if (event.event === "step") {
      const step = event.step as number;
      const status = event.status as "loading" | "done";
      setCurrentStep(step);
      setStepStatuses((prev) => {
        const updated = [...prev] as ("idle" | "loading" | "done")[];
        updated[step - 1] = status;
        return updated;
      });
    } else if (event.event === "result") {
      setBrief(event.data as BriefResult);
      setStepStatuses(["done", "done", "done", "done"]);
      setCurrentStep(4);
    } else if (event.event === "error") {
      setError(event.message as string);
    }
  }

  async function handleShare() {
    if (!brief) return;
    const name =
      brief.type === "quick"
        ? brief.name
        : brief.detection.name;
    const type = brief.type === "quick" ? "quick" : brief.type;

    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ briefData: brief, name, type }),
      });
      if (res.ok) {
        const data = await res.json();
        setShareUrl(data.url);
        await navigator.clipboard.writeText(data.url).catch(() => {});
        setShareToast(true);
        setTimeout(() => setShareToast(false), 3000);
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  }

  function handleSave() {
    if (!brief) return;
    const name =
      brief.type === "quick"
        ? brief.name
        : brief.detection.name;
    const type = brief.type === "quick" ? "quick" : brief.type;

    const item: WatchlistItem = {
      id: `${Date.now()}`,
      name,
      type,
      savedAt: new Date().toISOString(),
      slug,
      briefData: brief,
    };
    saveToWatchlist(item);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  }

  const briefType =
    brief && brief.type !== "quick"
      ? (brief as FullBriefResult).detection.type
      : "company";

  const companyName =
    brief
      ? brief.type === "quick"
        ? (brief as QuickBriefResult).name
        : (brief as FullBriefResult).detection.name
      : slug;

  return (
    <>
      <TopNav showSearch />

      {brief ? (
        <>
          <SideNav
            type={briefType as "company" | "institution"}
            companyName={companyName}
          />
          {brief.type === "quick" ? (
            <QuickBriefDisplay
              brief={brief as QuickBriefResult}
              onSave={handleSave}
            />
          ) : (
            <BriefDisplay
              brief={brief as FullBriefResult}
              onShare={handleShare}
              onSave={handleSave}
            />
          )}
        </>
      ) : error ? (
        <div className="ml-64 pt-16 min-h-screen flex items-center justify-center">
          <div className="max-w-md text-center px-8">
            <span className="material-symbols-outlined text-5xl text-error mb-4 block">
              error_outline
            </span>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-3">
              Brief Generation Failed
            </h2>
            <p className="font-body-md text-on-surface-variant mb-6">{error}</p>
            <button
              onClick={() => {
                setError(null);
                hasFetched.current = false;
                setBrief(null);
                setStepStatuses(["idle", "idle", "idle", "idle"]);
                setCurrentStep(0);
                loadBrief();
              }}
              className="px-6 py-3 bg-primary text-on-primary font-label-caps text-label-caps hover:bg-primary-container transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <>
          <SideNav companyName={slug} />
          <LoadingSteps
            currentStep={currentStep}
            stepStatuses={stepStatuses}
            companyName={slug}
          />
        </>
      )}

      {/* Shared brief notice */}
      {isShared && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="px-4 py-2 bg-surface-container-highest border border-outline-variant font-label-caps text-label-caps text-on-surface-variant">
            Shared brief — expires in 30 days · Generated by Brief
          </div>
        </div>
      )}

      {/* Toast notifications */}
      {shareToast && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 bg-primary text-on-primary font-label-caps text-label-caps shadow-lg">
          Share link copied to clipboard
        </div>
      )}
      {saveToast && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 bg-primary text-on-primary font-label-caps text-label-caps shadow-lg">
          Saved to Watchlist
        </div>
      )}
    </>
  );
}
