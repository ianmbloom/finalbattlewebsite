-- Cloudflare D1 migration for the bilingual automation tool.
-- Adds tables for publishing workflow, metrics ingestion, newsletters, and channel config.
--
-- Apply locally:  wrangler d1 execute finalbattle-emails --local  --file=./migrations/0004_bilingual_automation.sql
-- Apply remote:   wrangler d1 execute finalbattle-emails --remote --file=./migrations/0004_bilingual_automation.sql

--------------------------------------------------------------------------------
-- 1. Platform channels: stores EN/FA channel handles per platform
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS platform_channels (
  platform    TEXT NOT NULL,             -- 'x' | 'youtube' | 'tiktok' | 'linkedin' | 'telegram'
  language    TEXT NOT NULL,             -- 'en' | 'fa'
  channel_id  TEXT NOT NULL,             -- platform-specific ID (handle, channel ID, etc.)
  channel_url TEXT,                      -- full URL to the channel/page
  created_at  TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (platform, language)
);

--------------------------------------------------------------------------------
-- 2. Platform posts: tracks each video's publication status per platform/language
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS platform_posts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  video_slug   TEXT NOT NULL,
  platform     TEXT NOT NULL,            -- 'x' | 'youtube' | 'tiktok' | 'linkedin' | 'telegram'
  language     TEXT NOT NULL,            -- 'en' | 'fa'
  external_url TEXT,                     -- the live post URL after posting
  external_id  TEXT,                     -- platform post/video ID for metric lookups
  posted_at    TEXT,                     -- ISO timestamp when operator confirmed
  status       TEXT DEFAULT 'pending',   -- 'pending' | 'posted' | 'skipped'
  created_at   TEXT DEFAULT (datetime('now')),
  UNIQUE(video_slug, platform, language)
);

CREATE INDEX IF NOT EXISTS idx_platform_posts_video ON platform_posts(video_slug);
CREATE INDEX IF NOT EXISTS idx_platform_posts_status ON platform_posts(status);

--------------------------------------------------------------------------------
-- 3. Video platform metrics: time-series performance data per video/platform/language
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS video_platform_metrics (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  video_slug    TEXT NOT NULL,
  platform      TEXT NOT NULL,
  language      TEXT NOT NULL,           -- 'en' | 'fa'
  captured_date TEXT NOT NULL,           -- YYYY-MM-DD
  views         INTEGER DEFAULT 0,
  likes         INTEGER DEFAULT 0,
  comments      INTEGER DEFAULT 0,
  shares        INTEGER DEFAULT 0,
  watch_time_s  INTEGER DEFAULT 0,       -- where available (YouTube)
  raw_json      TEXT,                    -- full API payload for debugging
  created_at    TEXT DEFAULT (datetime('now')),
  UNIQUE(video_slug, platform, language, captured_date)
);

CREATE INDEX IF NOT EXISTS idx_video_metrics_slug ON video_platform_metrics(video_slug);
CREATE INDEX IF NOT EXISTS idx_video_metrics_date ON video_platform_metrics(captured_date);

--------------------------------------------------------------------------------
-- 4. Newsletter drafts: AI-generated drafts awaiting approval
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS newsletter_drafts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  language   TEXT NOT NULL DEFAULT 'en', -- 'en' | 'fa'
  subject    TEXT,
  body_html  TEXT,
  body_mjml  TEXT,                       -- source template (optional)
  status     TEXT DEFAULT 'draft',       -- 'draft' | 'approved' | 'sent'
  created_at TEXT DEFAULT (datetime('now')),
  sent_at    TEXT
);

CREATE INDEX IF NOT EXISTS idx_newsletter_drafts_status ON newsletter_drafts(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_drafts_language ON newsletter_drafts(language);

--------------------------------------------------------------------------------
-- 5. Ingestion runs: observability log for metric pulls
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ingestion_runs (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  source       TEXT NOT NULL,            -- 'youtube' | 'twitterapi' | 'manual'
  status       TEXT NOT NULL,            -- 'success' | 'partial' | 'error'
  rows_written INTEGER DEFAULT 0,
  message      TEXT,
  ran_at       TEXT DEFAULT (datetime('now'))
);

--------------------------------------------------------------------------------
-- 6. Alter subscribers: add switch_token for newsletter language preference switching
--    (locale column already exists in the original schema)
--------------------------------------------------------------------------------
ALTER TABLE subscribers ADD COLUMN switch_token TEXT;

CREATE INDEX IF NOT EXISTS idx_subscribers_locale ON subscribers(locale);
