-- Cloudflare D1 migration for the "Launch this video" boost mechanic.
-- Backs /api/boost/count and the boost branch of /api/stripe-webhook.
--
-- Apply locally:  wrangler d1 execute finalbattle-emails --local  --file=./migrations/0002_video_boosts.sql
-- Apply remote:   wrangler d1 execute finalbattle-emails --remote --file=./migrations/0002_video_boosts.sql

-- Pooled per-video support counter. `boost_count` is the public momentum number;
-- `total_cents` is pooled for internal reporting only and is NEVER exposed.
CREATE TABLE IF NOT EXISTS video_boosts (
  video_slug   TEXT PRIMARY KEY,
  boost_count  INTEGER NOT NULL DEFAULT 0,
  total_cents  INTEGER NOT NULL DEFAULT 0,
  updated_at   TEXT    NOT NULL
);

-- Idempotency guard so Stripe webhook retries never double-count a payment.
CREATE TABLE IF NOT EXISTS stripe_events (
  event_id     TEXT PRIMARY KEY,
  processed_at TEXT NOT NULL
);
