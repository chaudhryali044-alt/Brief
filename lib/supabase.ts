import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Returns null when Supabase env vars are not configured. */
export function getSupabaseClient() {
  if (!url || !key) return null;
  return createClient(url, key);
}
