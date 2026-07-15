# Final Battle Films — Technology Stack

This document describes the architecture and deployment of [finalbattle.video](https://finalbattle.video).

---

## Overview

| Layer | Technology |
|-------|------------|
| Framework | Astro 6 (static output) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Hosting | Cloudflare Pages |
| API | Cloudflare Pages Functions |
| Database | Cloudflare D1 |
| Media | Cloudflare R2 |
| Payments | Stripe Checkout (REST API) |
| Fulfillment | Printify API |

---

## Cloudflare Deployment

The site is a **static Astro build** deployed to **Cloudflare Pages** with **Pages Functions** for API routes.

### Configuration

- `web/wrangler.jsonc` — Pages project config with D1 binding
- `web/public/_headers` — Cache rules and security headers
- `web/public/_redirects` — Legacy URL migrations

### Services Used

| Service | Purpose |
|---------|---------|
| **Pages** | Static hosting + serverless functions |
| **D1** | Email subscribers, boost counters, transaction logs |
| **R2** | Video hosting (`videos.finalbattle.video`) |
| **Web Analytics** | Optional beacon |

### Deployment Flow

1. Push to `main` triggers Cloudflare Pages build
2. Build command: `npm run build` (from `web/`)
3. Output: `dist/` served statically
4. `functions/` deployed as Pages Functions

Local dev: `npx wrangler pages dev dist` with secrets in `web/.dev.vars`

---

## Ecommerce Wiring

Three Stripe Checkout flows share a single webhook endpoint. **No Stripe SDK** — all calls use `fetch` with Web Crypto HMAC verification.

### 1. Merch Shop (gated off)

```
Cart → POST /api/checkout → Stripe Checkout → Webhook → Printify
```

- Client sends SKU + quantity only; **prices validated server-side** against `_products.json`
- Printify orders created in draft mode by default
- Products defined in `web/src/content/products/*.json`

### 2. Tips ("Buy us a kotlet")

```
/fund → POST /api/tip/create-checkout → Stripe Checkout → Webhook → D1 email
```

- Fixed $5 increments (3 or 5 kotlets)
- No fulfillment; email capture only

### 3. Video Boost ("Launch This Video")

```
Video page → POST /api/boost/create-checkout → Stripe Checkout → Webhook → D1 counter
```

- Fixed tiers: $10 / $20 / $50
- Validates video slug against `_videos.json`
- Public counter at `GET /api/boost/count?slug=`

### Webhook Flow

Endpoint: `/api/stripe-webhook`  
Event: `checkout.session.completed`

Routes by `metadata.type`:
- `"boost"` → D1 boost tracking
- `"tip"` → email only
- default → Printify fulfillment

### D1 Tables

- `subscribers` — newsletter and purchase emails
- `video_boosts` — per-video launch counters
- `boost_transactions` — payment records
- `stripe_events` — webhook idempotency

---

## Website Internals

### Build Architecture

- **Static pre-rendered HTML** — no SSR, no Astro adapter
- **Prebuild scripts** generate trusted server-side indexes (`_products.json`, `_videos.json`)
- Node 22 (`web/.node-version`)

### Routing

English at root, Persian mirrored under `/fa/`:

| Route | Purpose |
|-------|---------|
| `/` | Home |
| `/videos/[slug]` | Video detail |
| `/shop`, `/products/[slug]` | Merch |
| `/fund` | Support page |
| `/launched` | Post-boost success |

Pages are thin wrappers delegating to shared views in `web/src/components/views/`.

### Content Sources

| Content | Source |
|---------|--------|
| Videos | `web/src/content/videos/*.json` |
| Products | `web/src/content/products/*.json` |
| UI strings | `web/src/i18n/ui.ts` |
| Media files | R2 bucket (not in git) |

### Styling

- Tailwind v4 with `@theme` custom properties
- Editorial palette: emerald/crimson/gold (Lion & Sun motif)
- RTL support via `dir="rtl"` + Vazirmatn font for Persian

### Feature Flags

`FEATURES` in `web/src/consts.ts`:

| Flag | Status |
|------|--------|
| `newsletter` | ✓ enabled |
| `shop` | ✗ disabled |
| `donations` | ✓ enabled |
| `boost` | ✓ enabled |

### Client Interactivity

No React/Vue/Svelte. Vanilla JS in Astro `<script>` blocks using custom events:
- `fb-cart:add`, `fb-cart:open` — cart management
- Direct `fetch("/api/...")` for checkout, subscribe, boost

---

## Key Files

| Path | Purpose |
|------|---------|
| `web/wrangler.jsonc` | Cloudflare config |
| `web/astro.config.mjs` | Astro build config |
| `web/functions/api/` | All API endpoints |
| `web/src/content/` | Video + product data |
| `web/src/consts.ts` | Feature flags |
| `web/.env.example` | Environment variables |
| `web/README.md` | Operational runbook |
