import { NextRequest } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return Response.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("briefs")
    .select("*")
    .eq("slug", params.slug)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error || !data) {
    return Response.json({ error: "Brief not found or expired" }, { status: 404 });
  }

  return Response.json(data);
}
