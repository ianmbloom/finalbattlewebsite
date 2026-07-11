-- Cloudflare D1 migration for individual boost transaction logging.
-- Enables periodic spend reports and allocation tracking for ad spend.
--
-- Apply locally:  wrangler d1 execute finalbattle-emails --local  --file=./migrations/0003_boost_transactions.sql
-- Apply remote:   wrangler d1 execute finalbattle-emails --remote --file=./migrations/0003_boost_transactions.sql

-- Individual transaction log for spend reporting. Each completed Launch payment
-- gets one row; the `allocated` flag marks funds that have been spent on ads.
CREATE TABLE IF NOT EXISTS boost_transactions (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  video_slug        TEXT    NOT NULL,
  amount_cents      INTEGER NOT NULL,
  stripe_session_id TEXT    NOT NULL UNIQUE,
  buyer_email       TEXT,
  locale            TEXT,
  allocated         INTEGER NOT NULL DEFAULT 0,
  created_at        TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_boost_transactions_allocated ON boost_transactions(allocated);
CREATE INDEX IF NOT EXISTS idx_boost_transactions_video ON boost_transactions(video_slug);
CREATE INDEX IF NOT EXISTS idx_boost_transactions_created ON boost_transactions(created_at);
