import { NextRequest } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { slugify, randomSuffix } from "@/lib/utils";
import { BriefResult } from "@/lib/types";

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return Response.json({ error: "Sharing requires Supabase configuration." }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const briefData: BriefResult = body.briefData;
  const name: string = body.name || "";
  const type: string = body.type || "company";

  if (!briefData || !name) {
    return Response.json({ error: "briefData and name are required" }, { status: 400 });
  }

  const slug = `${slugify(name)}-${randomSuffix()}`;

  const { error } = await supabase.from("briefs").insert({
    slug,
    type,
    name,
    brief_data: briefData,
  });

  if (error) {
    console.error("[/api/share] Supabase insert error:", error);
    return Response.json({ error: "Failed to save brief." }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  return Response.json({ slug, url: `${appUrl}/brief/${slug}` });
}
