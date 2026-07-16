-- Seed platform_channels with EN (seeuinfreeiran) and FA (ta_didar_azadi) accounts.
-- Telegram excluded: we share links but don't maintain an account.
--
-- Apply locally:  wrangler d1 execute finalbattle-emails --local  --file=./migrations/0005_seed_platform_channels.sql
-- Apply remote:   wrangler d1 execute finalbattle-emails --remote --file=./migrations/0005_seed_platform_channels.sql

-- X (Twitter)
INSERT OR REPLACE INTO platform_channels (platform, language, channel_id, channel_url)
VALUES ('x', 'en', 'seeuinfreeiran', 'https://x.com/seeuinfreeiran');

INSERT OR REPLACE INTO platform_channels (platform, language, channel_id, channel_url)
VALUES ('x', 'fa', 'ta_didar_azadi', 'https://x.com/ta_didar_azadi');

-- YouTube
INSERT OR REPLACE INTO platform_channels (platform, language, channel_id, channel_url)
VALUES ('youtube', 'en', 'seeuinfreeiran', 'https://youtube.com/@seeuinfreeiran');

INSERT OR REPLACE INTO platform_channels (platform, language, channel_id, channel_url)
VALUES ('youtube', 'fa', 'ta_didar_azadi', 'https://youtube.com/@ta_didar_azadi');

-- LinkedIn (company pages, not handle-based URLs)
-- Update channel_url once company pages are created
INSERT OR REPLACE INTO platform_channels (platform, language, channel_id, channel_url)
VALUES ('linkedin', 'en', 'seeuinfreeiran', 'https://linkedin.com/company/seeuinfreeiran');

INSERT OR REPLACE INTO platform_channels (platform, language, channel_id, channel_url)
VALUES ('linkedin', 'fa', 'ta_didar_azadi', 'https://linkedin.com/company/ta-didar-azadi');

-- Instagram
INSERT OR REPLACE INTO platform_channels (platform, language, channel_id, channel_url)
VALUES ('instagram', 'en', 'seeuinfreeiran', 'https://instagram.com/seeuinfreeiran');

INSERT OR REPLACE INTO platform_channels (platform, language, channel_id, channel_url)
VALUES ('instagram', 'fa', 'seeuinfreeiran', 'https://instagram.com/seeuinfreeiran');
