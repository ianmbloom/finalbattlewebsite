# Final Battle Films — Automation Tool Build Spec

**For:** Cursor agent implementation
**Project:** `finalbattle.video` operations tool
**Date:** 2026-07-13
**Author:** Prepared for Ian Bloom

---

## 0. Context & Goal

Build an internal operations tool on top of the **existing** `finalbattle.video` codebase (Astro 6 + Cloudflare). The tool has three pillars:

1. **Publishing assist** — a local admin UI that generates platform-specific copy for each video and guides a human operator through posting to X, YouTube, TikTok, LinkedIn, and Telegram ("copy & open" workflow). Also drafts the weekly newsletter.
2. **Metrics ingestion** — scheduled jobs that pull per-video metrics from each platform into D1.
3. **Business intelligence** — a Triple-Whale-style dashboard computing revenue per video, CAC, MER, and top performers from D1.

**Do NOT rebuild the public site or introduce a new framework.** Everything stays Cloudflare-native.

---

## 1. Locked Architectural Decisions

| Concern | Decision | Rationale |
|---|---|---|
| Framework | Astro 6 (existing) | No change to public site |
| Hosting (public site) | Cloudflare Pages (existing) | Unchanged |
| Database | Cloudflare D1 (existing) | Add new tables only |
| Media | Cloudflare R2 (existing) | Unchanged |
| Payments | Stripe (existing) | Source of revenue data |
| **Admin dashboard** | **Local-only** via `wrangler pages dev`, bound to production D1/R2 | Single operator; no public attack surface; no auth code needed |
| **Metric ingestion** | **Cloudflare Cron Trigger Worker** (always-on) + manual refresh fallback | Runs regardless of whether laptop is on |
| Posting | **Human-in-the-loop**, "copy & open" workflow | Avoids API cost/ToS risk for X/TikTok/LinkedIn |
| AI drafting | **OpenRouter** (existing pay-as-you-go account) | Model-flexible |
| X metrics | **TwitterAPI.io** (existing account) | Avoids X official API pay-per-use |
| YouTube metrics | **YouTube Data API v3** (free, 10k units/day) | Free tier sufficient |
| Email sender | **Cloudflare Email Service** (public beta) | Native binding, zero new vendor; migrate to Resend/Postmark later if deliverability requires |

---

## 2. Security Model

- The admin dashboard **never ships to the public Pages project**. It runs only via `npx wrangler pages dev` on the operator's laptop.
- All sensitive secrets (OpenRouter, TwitterAPI.io, YouTube API key, Cloudflare Email Service, Stripe) live in `web/.dev.vars` locally and in the **Cron Worker's** encrypted secrets — never in the public Pages deployment.
- The Cron Worker exposes **no public HTTP routes**; it only runs on schedule and writes to D1.
- Ensure the `/admin` routes and any admin-only Pages Functions are excluded from the production build (guard with an env flag, e.g. `ADMIN_ENABLED`, that is only `true` in `.dev.vars`).

---

## 3. Data Model (new D1 tables)

Add migrations under `web/migrations/` (or existing migration dir). Preserve existing tables (`subscribers`, `video_boosts`, `boost_transactions`, `stripe_events`).

```sql
-- Tracks each video's presence/status per platform (Pillar 1)
CREATE TABLE platform_posts (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  video_slug    TEXT NOT NULL,
  platform      TEXT NOT NULL,          -- 'x' | 'youtube' | 'tiktok' | 'linkedin' | 'telegram'
  external_url  TEXT,                   -- the live post URL, entered by operator
  external_id   TEXT,                   -- platform post/video id, for metric lookups
  posted_at     TEXT,                   -- ISO timestamp when operator confirmed
  status        TEXT DEFAULT 'pending', -- 'pending' | 'posted' | 'skipped'
  created_at    TEXT DEFAULT (datetime('now')),
  UNIQUE(video_slug, platform)
);

-- Time-series metrics per video per platform (Pillar 2)
CREATE TABLE video_platform_metrics (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  video_slug    TEXT NOT NULL,
  platform      TEXT NOT NULL,
  captured_date TEXT NOT NULL,          -- YYYY-MM-DD
  views         INTEGER DEFAULT 0,
  likes         INTEGER DEFAULT 0,
  comments      INTEGER DEFAULT 0,
  shares        INTEGER DEFAULT 0,
  watch_time_s  INTEGER DEFAULT 0,      -- where available (YouTube)
  raw_json      TEXT,                   -- full API payload for debugging
  created_at    TEXT DEFAULT (datetime('now')),
  UNIQUE(video_slug, platform, captured_date)
);

-- Newsletter drafts (Pillar 1) awaiting operator approval
CREATE TABLE newsletter_drafts (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  subject       TEXT,
  body_html     TEXT,
  body_mjml     TEXT,                   -- or React Email source, optional
  status        TEXT DEFAULT 'draft',   -- 'draft' | 'approved' | 'sent'
  created_at    TEXT DEFAULT (datetime('now')),
  sent_at       TEXT
);

-- Ingestion run log for observability
CREATE TABLE ingestion_runs (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  source        TEXT NOT NULL,          -- 'youtube' | 'twitterapi' | 'manual'
  status        TEXT NOT NULL,          -- 'success' | 'partial' | 'error'
  rows_written  INTEGER DEFAULT 0,
  message       TEXT,
  ran_at        TEXT DEFAULT (datetime('now'))
);
```

**Attribution note:** the existing Stripe boost/tip flow captures revenue. Ensure `boost_transactions` (or a new column) stores the `video_slug` and any `utm_source`/`utm_medium` from the checkout session metadata so revenue can be attributed to the platform that drove it.

---

## 4. Repository Layout (additions)

```
web/
  functions/
    api/
      admin/                 # LOCAL-ONLY, guarded by ADMIN_ENABLED
        publish-plan.ts      # GET: returns copy + links for a video slug
        confirm-post.ts      # POST: records platform_posts row
        newsletter/
          draft.ts           # POST: generate draft via OpenRouter -> newsletter_drafts
          send.ts            # POST: send approved draft via Cloudflare Email Service
        metrics/
          refresh.ts         # POST: manual on-demand ingestion trigger
  src/
    pages/
      admin/                 # LOCAL-ONLY Astro pages (not built for prod)
        index.astro          # dashboard home (BI - Pillar 3)
        publish.astro        # publishing checklist UI (Pillar 1)
        newsletter.astro     # draft review + send (Pillar 1)
        metrics.astro        # raw metric browser (Pillar 2)
    lib/
      platforms/
        copy-templates.ts    # per-platform copy generators (X/YT/TikTok/LI/TG)
        youtube.ts           # YouTube Data API v3 client
        twitterapi.ts        # TwitterAPI.io client
      analytics.ts           # BI computations: revenue/video, CAC, MER, ranking
      openrouter.ts          # OpenRouter chat completion helper
      email.ts               # Cloudflare Email Service send helper

cron-worker/                 # SEPARATE always-on Worker
  src/index.ts               # scheduled() handler -> pulls metrics -> D1
  wrangler.jsonc             # cron triggers + D1 binding + secrets
```

---

## 5. Pillar 1 — Publishing Assist

### 5.1 Copy generation
`lib/platforms/copy-templates.ts` reads a video record from `web/src/content/videos/*.json` and returns an object:

```ts
{
  x:        { text: string, url: string },       // keep under 280 chars incl. link
  youtube:  { title: string, description: string },
  tiktok:   { caption: string, hashtags: string[] },
  linkedin: { text: string, url: string },
  telegram: { text: string, shareUrl: string },  // t.me/share/url?... with UTM params
}
```

- Append UTM params to every link: `utm_source=<platform>&utm_medium=repost&utm_campaign=video_share` (matches existing Telegram share pattern).
- Optionally call OpenRouter to polish/vary the copy per platform; keep a deterministic template fallback so the tool works offline.

### 5.2 Publish UI (`/admin/publish.astro`)
- Operator selects a video slug.
- Page renders one card per platform with the generated copy, a **Copy to clipboard** button, and an **Open platform** button (opens compose/upload page in a new tab).
- After posting, operator pastes the live post URL into a field and clicks **Confirm** -> `POST /api/admin/confirm-post` writes a `platform_posts` row with `external_url`, `external_id`, `posted_at`, `status='posted'`.
- Show a progress indicator (e.g. "3/5 platforms posted") per video.

### 5.3 Newsletter
- `/admin/newsletter.astro` -> **Generate draft** calls `POST /api/admin/newsletter/draft`.
- The function pulls the last N videos + their D1 metrics/boost stats, sends a structured prompt to OpenRouter, stores result in `newsletter_drafts` (`status='draft'`).
- Operator reviews/edits, clicks **Approve & Send** -> `POST /api/admin/newsletter/send` renders HTML and sends via Cloudflare Email Service to `subscribers`. Update `status='sent'`, `sent_at`.
- Keep email HTML as a portable template (React Email or plain MJML/HTML string) so the sender can be swapped later with a one-line endpoint change.

---

## 6. Pillar 2 — Metrics Ingestion

### 6.1 Cron Worker (`cron-worker/`)
- Separate Cloudflare Worker with a **Cron Trigger** (e.g. daily at 06:00 UTC).
- On each run, iterate over videos that have `platform_posts` rows with `status='posted'` and an `external_id`, then:
  - **YouTube:** call Data API v3 `videos.list` (`part=statistics`) for view/like/comment counts. Free within 10k units/day.
  - **X:** call TwitterAPI.io for the tweet's public metrics using `external_id`.
  - **TikTok / LinkedIn:** leave as manual entry for now (no reliable free automated pull). Provide a form in `/admin/metrics.astro` to enter these numbers.
- Upsert into `video_platform_metrics` keyed on `(video_slug, platform, captured_date)`.
- Write an `ingestion_runs` log row each run.

### 6.2 Manual refresh fallback
- `POST /api/admin/metrics/refresh` runs the same ingestion logic on demand from the local dashboard (useful when laptop is the only place you want to trigger a pull, or to backfill).
- Factor ingestion into a shared module imported by both the Cron Worker and the local function to avoid duplication.

### 6.3 API constraints to respect
- **YouTube Data API v3:** 10,000 quota units/day free; `videos.list` is cheap (~1 unit). Cache and batch by comma-separated IDs.
- **TwitterAPI.io:** pay-as-you-go; batch requests and only pull for videos posted to X. Confirm the plan tier returns metrics for arbitrary tweet IDs.

---

## 7. Pillar 3 — Business Intelligence Dashboard

`/admin/index.astro` reads directly from D1 via the Pages Functions binding. Compute in `lib/analytics.ts`:

| Metric | Formula (D1) |
|---|---|
| Revenue per video | `SUM(amount) FROM boost_transactions WHERE video_slug = ?` |
| Total revenue | `SUM(amount) FROM boost_transactions` |
| Top videos | Rank slugs by boost revenue + engagement composite |
| Launch/Boost conversion rate | boosts initiated / video page views |
| CAC (per campaign) | Launch/boost spend applied to promotion / new subscribers acquired |
| MER | total revenue / total promotion spend |
| Platform ROI | revenue attributed (via UTM) per platform / spend per platform |
| Subscriber growth | `subscribers` count over time |

- Visualize with a lightweight chart lib compatible with Astro (e.g. a small vanilla chart script or Chart.js in a `<script>` island — no React needed, matching existing "vanilla JS in Astro" convention).
- Keep heavy aggregations in SQL; render server-side in the Astro page for speed.

---

## 8. Environment Variables

`web/.dev.vars` (local admin only):
```
ADMIN_ENABLED=true
OPENROUTER_API_KEY=...
TWITTERAPI_IO_KEY=...
YOUTUBE_API_KEY=...
CF_EMAIL_FROM=news@finalbattle.video
STRIPE_SECRET_KEY=...        # if BI needs Stripe reads beyond D1
```

Cron Worker secrets (via `wrangler secret put`):
```
TWITTERAPI_IO_KEY, YOUTUBE_API_KEY
```
Bindings for both: D1 (same database), and Cloudflare Email Service binding for the newsletter send path.

---

## 9. Build Order (recommended)

1. **Migrations** — add the four new D1 tables; verify against production D1 with `wrangler d1 execute`.
2. **Publishing assist** — `copy-templates.ts`, `/admin/publish.astro`, `publish-plan.ts`, `confirm-post.ts`. Get one video's copy generating and a post confirming to D1.
3. **Cloudflare Email Service** — `email.ts`; send one test newsletter to yourself.
4. **Newsletter drafting** — OpenRouter integration + draft/review/send flow.
5. **Cron Worker + ingestion module** — YouTube first (free), then TwitterAPI.io; log to `ingestion_runs`.
6. **Manual refresh** endpoint + TikTok/LinkedIn manual entry form.
7. **BI dashboard** — `analytics.ts` computations + `/admin/index.astro` charts.

Ship pillar 1 before pillars 2/3, since real platform data is needed to validate the metrics schema.

---

## 10. Conventions to Follow (from existing codebase)

- **No React/Vue/Svelte** — vanilla JS in Astro `<script>` blocks with custom events, matching the existing cart/checkout pattern.
- **No SDKs where avoidable** — use `fetch` directly (existing Stripe integration uses `fetch` + Web Crypto), consistent with current style.
- **Server-side validation** — validate video slugs against the generated `_videos.json` index, as the existing boost flow does.
- **Prebuild indexes** — reuse the `_videos.json` / `_products.json` prebuild approach for any server-trusted data.
- Respect existing i18n (EN root, FA under `/fa/`) only for public-facing output; the admin UI can be English-only.

---

## 11. Open Items for the Operator (Ian) to Confirm During Build

- TikTok/LinkedIn: confirm you're OK with **manual metric entry** initially (no free reliable automated pull).
- Confirm TwitterAPI.io plan tier returns **metrics for your own posts** (not just search).
- Decide newsletter cadence and the "last N videos" window for the draft prompt.
- Confirm the Cloudflare Email Service beta is enabled on your account; if deliverability is weak, plan a later migration to Resend or Postmark (email templates are portable, so this is a one-endpoint change).
