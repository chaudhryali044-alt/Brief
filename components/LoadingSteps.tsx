"use client";

const STEPS = [
  "Searching public sources...",
  "Pulling financial filings...",
  "Analysing recent developments...",
  "Generating banker brief...",
];

interface Props {
  currentStep: number; // 1-4, 0 = not started
  stepStatuses: ("idle" | "loading" | "done")[];
  companyName: string;
}

export default function LoadingSteps({ currentStep, stepStatuses, companyName }: Props) {
  return (
    <div className="ml-64 pt-16 min-h-screen flex items-center justify-center">
      <div className="max-w-lg w-full px-8">
        {/* Gold progress bar */}
        <div className="w-full h-0.5 bg-outline-variant mb-12 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-700 ease-out"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>

        <p className="font-label-caps text-label-caps text-on-tertiary-fixed-variant uppercase mb-2">
          Generating Brief
        </p>
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-10">
          {companyName}
        </h2>

        <div className="space-y-6">
          {STEPS.map((label, i) => {
            const status = stepStatuses[i] ?? "idle";
            return (
              <div key={label} className="flex items-center gap-4">
                {/* Status indicator */}
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                  {status === "done" ? (
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      check_circle
                    </span>
                  ) : status === "loading" ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-outline-variant" />
                  )}
                </div>

                <span
                  className={`font-body-md text-body-md transition-colors duration-300 ${
                    status === "done"
                      ? "text-on-tertiary-fixed-variant line-through"
                      : status === "loading"
                      ? "text-on-surface"
                      : "text-on-tertiary-fixed-variant"
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        <p className="mt-10 font-label-caps text-label-caps text-on-tertiary-fixed-variant">
          Full briefs take 15–25 seconds. Pulling from SEC EDGAR, Companies House, and live news.
        </p>
      </div>
    </div>
  );
}
