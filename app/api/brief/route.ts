import { NextRequest } from "next/server";
import { detectCompanyType } from "@/lib/detection";
import { runPhase1, runPhase2, runPhase3, synthesizeCompanyBrief, synthesizeInstitutionBrief, synthesizeQuickBrief } from "@/lib/pipeline";
import { runQuickSerperSearches } from "@/lib/sources/serper";
import { fetchRssFeeds } from "@/lib/sources/rss";
import { getSupabaseClient } from "@/lib/supabase";
import { slugify } from "@/lib/utils";
import { BriefResult, RawPipelineData, StreamEvent } from "@/lib/types";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const body = await request.json().catch(() => ({}));
  const name: string = (body.name || "").trim();
  const mode: string = body.mode || "full";

  if (!name) {
    return Response.json({ error: "Company name is required" }, { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: StreamEvent) {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          // controller may already be closed
        }
      }

      try {
        // ── Check Supabase cache (6h TTL) ─────────────────────────────
        const supabase = getSupabaseClient();
        if (supabase) {
          const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
          const { data: cached } = await supabase
            .from("briefs")
            .select("*")
            .ilike("name", name)
            .eq("type", mode === "quick" ? "quick" : "pending") // will refine below
            .gte("created_at", sixHoursAgo)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (cached?.brief_data) {
            send({ event: "step", step: 1, status: "done", label: "Searching public sources..." });
            send({ event: "step", step: 2, status: "done", label: "Pulling financial filings..." });
            send({ event: "step", step: 3, status: "done", label: "Analysing recent developments..." });
            send({ event: "step", step: 4, status: "done", label: "Generating banker brief..." });
            send({ event: "result", data: cached.brief_data as BriefResult });
            controller.close();
            return;
          }
        }

        // ── Quick Brief mode ──────────────────────────────────────────
        if (mode === "quick") {
          send({ event: "step", step: 1, status: "loading", label: "Searching public sources..." });
          const [newsResult, feedsResult] = await Promise.allSettled([
            runQuickSerperSearches(name),
            fetchRssFeeds(name),
          ]);
          send({ event: "step", step: 1, status: "done", label: "Searching public sources..." });
          send({ event: "step", step: 4, status: "loading", label: "Generating banker brief..." });

          const news = newsResult.status === "fulfilled" ? newsResult.value : [];
          const feeds = feedsResult.status === "fulfilled" ? feedsResult.value : [];
          const brief = await synthesizeQuickBrief(name, news, feeds);

          await saveToSupabase(supabase, name, "quick", brief);
          send({ event: "result", data: brief });
          controller.close();
          return;
        }

        // ── Full Brief mode ───────────────────────────────────────────

        // Phase 1: Detection + Wikipedia + Serper
        send({ event: "step", step: 1, status: "loading", label: "Searching public sources..." });
        const detection = await detectCompanyType(name);
        const phase1 = await runPhase1(detection.name, detection);
        send({ event: "step", step: 1, status: "done", label: "Searching public sources..." });

        // Phase 2: Financial filings
        send({ event: "step", step: 2, status: "loading", label: "Pulling financial filings..." });
        const phase2 = await runPhase2(detection.name, detection);
        send({ event: "step", step: 2, status: "done", label: "Pulling financial filings..." });

        // Phase 3: RSS feeds
        send({ event: "step", step: 3, status: "loading", label: "Analysing recent developments..." });
        const phase3 = await runPhase3(detection.name);
        send({ event: "step", step: 3, status: "done", label: "Analysing recent developments..." });

        // Phase 4: Gemini synthesis
        send({ event: "step", step: 4, status: "loading", label: "Generating banker brief..." });

        const pipelineData: RawPipelineData = {
          wikipedia: phase1.wikipedia,
          news: phase1.news,
          secEdgar: phase2.secEdgar,
          companiesHouse: phase2.companiesHouse,
          openCorporates: phase2.openCorporates,
          rssFeeds: phase3.rssFeeds,
          errors: phase2.errors,
        };

        let brief: BriefResult;
        if (detection.type === "institution") {
          brief = await synthesizeInstitutionBrief(detection, pipelineData);
        } else {
          brief = await synthesizeCompanyBrief(detection, pipelineData);
        }

        await saveToSupabase(supabase, detection.name, detection.type, brief);
        send({ event: "result", data: brief });
      } catch (err) {
        console.error("[/api/brief] error:", err);
        const message =
          err instanceof Error && err.message.includes("GEMINI")
            ? "Brief generation failed. Please try again."
            : "Brief generation failed. Please try again.";
        send({ event: "error", message });
      } finally {
        try { controller.close(); } catch { /* already closed */ }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

async function saveToSupabase(
  supabase: ReturnType<typeof getSupabaseClient>,
  name: string,
  type: string,
  briefData: BriefResult
) {
  if (!supabase) return;
  try {
    const slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 8)}`;
    await supabase.from("briefs").insert({
      slug,
      type,
      name,
      brief_data: briefData,
    });
  } catch (err) {
    console.error("[Supabase] save failed:", err);
  }
}
