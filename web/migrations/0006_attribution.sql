-- Cloudflare D1 migration for ad campaign attribution tracking.
-- Adds columns to track X.com ad click IDs and UTM parameters for ROI measurement.
--
-- Apply locally:  wrangler d1 execute finalbattle-emails --local  --file=./migrations/0006_attribution.sql
-- Apply remote:   wrangler d1 execute finalbattle-emails --remote --file=./migrations/0006_attribution.sql

-- Attribution columns for tracking ad campaign performance.
-- twclid: X Click ID appended by X ads when user clicks an ad
-- utm_*: Standard UTM parameters for campaign attribution
ALTER TABLE boost_transactions ADD COLUMN utm_source TEXT;
ALTER TABLE boost_transactions ADD COLUMN utm_medium TEXT;
ALTER TABLE boost_transactions ADD COLUMN utm_campaign TEXT;
ALTER TABLE boost_transactions ADD COLUMN twclid TEXT;

CREATE INDEX IF NOT EXISTS idx_boost_transactions_utm_source ON boost_transactions(utm_source);
