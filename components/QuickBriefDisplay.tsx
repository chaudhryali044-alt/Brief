"use client";

import { QuickBriefResult } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface Props {
  brief: QuickBriefResult;
  onSave: () => void;
}

export default function QuickBriefDisplay({ brief, onSave }: Props) {
  return (
    <div className="ml-64 pt-16 min-h-screen">
      <div className="max-w-2xl mx-auto px-margin-desktop py-12">
        {/* Header */}
        <header className="border-b border-outline-variant pb-6 mb-8">
          <div className="flex items-center gap-3 mb-1">
            <span className="px-2 py-0.5 bg-surface-container-highest border border-primary font-label-caps text-label-caps text-primary text-[10px]">
              QUICK BRIEF
            </span>
            <span className="font-label-caps text-label-caps text-on-tertiary-fixed-variant">
              60-Second Pre-Meeting Brief
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">{brief.name}</h1>
          <p className="font-label-caps text-label-caps text-on-tertiary-fixed-variant mt-1">
            Generated {formatDate(new Date(brief.generatedAt))}
          </p>
        </header>

        {/* 30-Second Take */}
        <div className="border-l-2 border-primary pl-6 py-2 mb-8">
          <p className="font-label-caps text-label-caps text-primary uppercase mb-2">
            The Take
          </p>
          <p className="font-headline-md text-headline-md text-on-surface leading-relaxed">
            {brief.thirtySecondTake}
          </p>
        </div>

        {/* Top 3 News */}
        <div className="mb-8">
          <p className="font-label-caps text-label-caps text-on-tertiary-fixed-variant uppercase mb-4">
            Top 3 Developments
          </p>
          <div className="space-y-3">
            {brief.topThreeNews.map((item, i) => (
              <div key={i} className="flex gap-3 p-4 border border-outline-variant bg-surface-container-lowest">
                <span className="font-data-mono text-primary font-bold flex-shrink-0">{i + 1}</span>
                <p className="font-body-md text-on-surface">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Key Person */}
        <div className="mb-8 p-5 border border-outline-variant bg-surface-container-low">
          <p className="font-label-caps text-label-caps text-on-tertiary-fixed-variant uppercase mb-2">
            Key Person to Know
          </p>
          <p className="font-body-md text-on-surface">{brief.keyPerson}</p>
        </div>

        {/* One Smart Question */}
        <div className="mb-8 p-5 border border-primary/30 bg-surface-container-low">
          <p className="font-label-caps text-label-caps text-primary uppercase mb-2">
            One Smart Question
          </p>
          <p className="font-headline-md text-headline-md text-on-surface">
            &ldquo;{brief.oneSmartQuestion}&rdquo;
          </p>
        </div>

        {/* Conversation Opener */}
        <div className="mb-10 border-l-2 border-primary pl-4 py-2">
          <p className="font-label-caps text-label-caps text-primary uppercase mb-1">
            Open With This
          </p>
          <p className="font-body-lg text-on-surface">{brief.conversationOpener}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onSave}
            className="flex items-center gap-2 px-4 py-2 border border-outline-variant text-on-surface-variant font-label-caps text-label-caps hover:border-primary hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">bookmark</span>
            Save to Watchlist
          </button>
        </div>

        {brief.dataSources.length > 0 && (
          <div className="mt-8 border-t border-outline-variant pt-4">
            <p className="font-label-caps text-label-caps text-on-tertiary-fixed-variant mb-2">
              Sources
            </p>
            <div className="space-y-1">
              {brief.dataSources.slice(0, 5).map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs font-data-mono text-on-tertiary-fixed-variant hover:text-primary transition-colors truncate"
                >
                  {url}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
