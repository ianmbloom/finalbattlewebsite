-- Cloudflare D1 schema for the unified email list.
-- Captures both newsletter signups and buyers (Stripe webhook), so a single
-- list can be exported to an email sender for campaigns later.
--
-- Apply locally:  wrangler d1 execute finalbattle-emails --local  --file=./schema.sql
-- Apply remote:   wrangler d1 execute finalbattle-emails --remote --file=./schema.sql

CREATE TABLE IF NOT EXISTS subscribers (
  email      TEXT PRIMARY KEY,
  source     TEXT NOT NULL,          -- 'newsletter' | 'purchase'
  locale     TEXT,                   -- 'en' | 'fa'
  marketing  INTEGER NOT NULL DEFAULT 0,  -- 1 = explicit marketing opt-in
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subscribers_source ON subscribers (source);
CREATE INDEX IF NOT EXISTS idx_subscribers_created_at ON subscribers (created_at);
