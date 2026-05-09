-- Brief Intelligence — Supabase Schema
-- Run this in the Supabase SQL editor to set up the database.

-- Shared briefs table
CREATE TABLE IF NOT EXISTS briefs (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('company', 'institution', 'quick')),
  name        TEXT NOT NULL,
  brief_data  JSONB NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days'
);

-- Fast slug lookups
CREATE INDEX IF NOT EXISTS idx_briefs_slug ON briefs(slug);

-- Fast name + created_at lookups (for 6h cache)
CREATE INDEX IF NOT EXISTS idx_briefs_name_created ON briefs(name, created_at DESC);

-- Auto-delete expired briefs (call this periodically via pg_cron or Supabase scheduled functions)
CREATE OR REPLACE FUNCTION delete_expired_briefs()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM briefs WHERE expires_at < NOW();
END;
$$;

-- Enable Row Level Security
ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;

-- Public read-only policy (anyone with the slug can read)
CREATE POLICY "Public can read briefs"
  ON briefs FOR SELECT
  USING (expires_at > NOW());

-- Allow inserts from the service role (used by server-side API routes)
CREATE POLICY "Service role can insert briefs"
  ON briefs FOR INSERT
  WITH CHECK (true);
