# Final Battle Films

Bilingual (English + Persian) hub for the Prosperity Project. Built with Astro 6 + Tailwind CSS v4, deployed as a static site on Cloudflare Pages with Pages Functions for email + checkout.

It serves three purposes:

1. **Sharing hub** — shows the full video library and explicitly calls on visitors to share/promote each video on the platform where it lives (compact share bar on every card + a "Be the arrow" promote band on the home and library pages).
2. **Financial support** — a self-hosted Stripe + Printify merch shop, plus a "Buy us a kotlet" Stripe tip checkout on the `/fund` page.
3. **Email collection** — a newsletter form on every page that writes to a Cloudflare D1 database (buyers are captured too, via the Stripe webhook).

- **Live domain:** finalbattle.video
- **Languages:** English at `/` (default), Persian at `/fa/` (RTL). Add more by extending `LOCALES` in `src/consts.ts`, adding a strings block in `src/i18n/ui.ts`, and mirroring pages under `src/pages/<locale>/`.

## Develop

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static output in dist/
npm run preview
```

## Project structure

```
src/
  consts.ts                 # site URL, locales, video URL helper, donate links
  content.config.ts         # videos + products collections (Content Layer glob loaders)
  content/videos/*.json     # one file per video, per-language variants
  content/products/*.json   # one file per merch design (tee + poster formats)
  i18n/ui.ts                # all UI copy, keyed by locale
  i18n/utils.ts             # locale helpers (translate, dir, localized paths)
  lib/videos.ts             # video collection queries + duration formatting
  lib/products.ts           # product collection queries + bilingual helpers
  styles/global.css         # Tailwind import, @theme design tokens, fonts
  components/               # UI atoms (cards, share bar, newsletter, cart, ...)
  components/views/         # shared page bodies rendered by EN + FA routes
  pages/                    # EN routes (videos, shop, products, support, checkout)
  pages/fa/                 # FA mirror routes (thin wrappers, lang="fa")
functions/
  api/_lib.ts               # shared helpers: D1 upsert, Stripe REST, sig verify
  api/_products.json        # build-time TRUSTED catalog (generated; do not hand-edit)
  api/subscribe.ts          # POST /api/subscribe   -> D1 subscribers
  api/checkout.ts           # POST /api/checkout     -> Stripe Checkout session
  api/stripe-webhook.ts     # POST /api/stripe-webhook -> Printify + buyer email
public/
  patterns/                 # tiling Persian SVGs (recolored via CSS mask)
  products/                 # product images (model shots / mockups)
  videos/                   # self-hosted MP4 files (one per video slug)
  videos/thumbs/            # generated 9:16 WebP thumbnails
  _headers                  # Cloudflare Pages caching + security headers
scripts/
  gen-video-thumbs.js       # source still -> WebP thumbnail
  gen-product-map.mjs       # products/*.json -> functions/api/_products.json
  sync-printify.mjs         # pull Printify product/variant ids into products/*.json
  printify-map.json         # SKU -> Printify product id map (input to sync)
schema.sql                  # D1 `subscribers` table
```

## Content: adding a video

Each video is one JSON file in `src/content/videos/<slug>.json`. The `slug` is
the filename. Each language has its own self-hosted MP4, so every language
variant carries its own `videoSrc`, title, script, and platform links:

```json
{
  "series": "prosperity-project",
  "category": "myth",            // truth | myth | project
  "publishedAt": "2026-07-01",
  "featured": true,
  "tags": ["sanctions", "economy"],
  "languages": {
    "en": {
      "title": "Economic Sanctions, Explained",
      "videoSrc": "/videos/economic-sanctions-explained.mp4",
      "durationSeconds": 47,
      "thumbnailUrl": "/videos/thumbs/economic-sanctions-explained.webp",
      "script": "Voiceover script / transcript...",
      "platforms": {
        "x": "https://x.com/.../status/...",
        "instagram": "https://www.instagram.com/reel/.../",
        "youtube": "https://youtube.com/shorts/..."
      }
    },
    "fa": { "title": "...", "videoSrc": "/videos/...-fa.mp4", "script": "..." }
  }
}
```

A video only appears in a language's library if that language's variant exists,
so Persian (or any future language) can lag behind English without breaking the
build.

## Thumbnails

Drop a source still at `scripts/video-stills/<slug>.jpg` (or `.png`/`.webp`),
then:

```bash
npm run gen:video-thumbs
```

It writes a 9:16 540x960 WebP to `public/videos/thumbs/<slug>.webp`, skipping any
that already exist.

## Videos (self-hosted on Cloudflare R2)

Each variant's `videoSrc` points at an MP4 the browser plays via a native
`<video>` element (`src/components/VideoPlayer.astro`). `thumbnailUrl` is used
as the `<video>` poster and the social share image.

**The video files are never committed to git** (`.gitignore` blocks `*.mp4` /
`*.mov` and the `/videos/` masters folder). They are hosted on a Cloudflare R2
bucket and resolved at runtime via `PUBLIC_VIDEO_BASE_URL`:

- `videoSrc` is a root-relative path, e.g. `"/videos/<slug>.mp4"`.
- In production, `PUBLIC_VIDEO_BASE_URL` (set in the Pages dashboard) is the R2
  public origin, so the file loads from `https://<r2-domain>/videos/<slug>.mp4`.
- Locally, the variable is unset and `npm run dev` serves the same files from
  `public/videos/` — so playback works without R2.
- A `videoSrc` that is already an absolute URL is used as-is.

### Encoding masters

Source `.mov`/high-bitrate masters are transcoded to web-friendly MP4
(H.264, capped bitrate, `faststart`) before hosting:

```bash
ffmpeg -i master.mov -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -preset slow -crf 23 -maxrate 3500k -bufsize 7000k \
  -c:a aac -b:a 128k -movflags +faststart public/videos/<slug>.mp4
```

### Uploading to R2

```bash
# one-time: create the bucket + a public custom domain in the CF dashboard
npx wrangler r2 object put <bucket>/videos/<slug>.mp4 \
  --file public/videos/<slug>.mp4 --content-type video/mp4
```

Then point `PUBLIC_VIDEO_BASE_URL` at the bucket's public domain.

## Deploy (Cloudflare Pages)

This is a static site, so no Cloudflare adapter is needed — Pages serves
`dist/` directly. Connect the GitHub repo in the Cloudflare Pages dashboard with
these build settings:

| Setting                | Value           |
| ---------------------- | --------------- |
| Root directory         | `web`           |
| Build command          | `npm run build` |
| Build output directory | `dist`          |

Add an environment variable `PUBLIC_VIDEO_BASE_URL` pointing at the R2 public
domain so videos load in production (see "Videos" above).

The Node version is pinned in `web/.node-version` (22) and caching/security
headers live in `public/_headers`. `web/wrangler.jsonc` mirrors these settings
and also enables manual deploys via `npx wrangler pages deploy dist`.

Pushes to `main` then build and deploy automatically.

## Persian pattern accents

`public/patterns/PatternMatte.svg` is line art tiled as a low-contrast
background via `PatternBackground.astro`. Because it's applied with CSS
`mask-image`, the SVG's own color is irrelevant — the accent color comes from a
palette token (default `sand`; `gold` on hero/footer). Drop additional tiling
SVGs into `public/patterns/` and pass `src` to recolor/reuse them.

## Launch flags

`FEATURES` in `src/consts.ts` gates the three backend-dependent features. Each
starts `false`, so the site ships today with those pieces **grayed out and
disabled** ("Soon") instead of pretending to work — nothing 404s or errors for a
visitor. Flip a flag to `true` once it's wired up and rebuild:

| Flag                  | Turn on when…                                                  | What it ungrays                                  |
| --------------------- | -------------------------------------------------------------- | ------------------------------------------------ |
| `FEATURES.newsletter` | the D1 `subscribers` DB is created + bound (`DB`)              | the newsletter form                              |
| `FEATURES.shop`       | Stripe + Printify keys are set and real products exist         | Shop nav/links, cart, add-to-cart                |
| `FEATURES.donations`  | `STRIPE_SECRET_KEY` is set (reused from the shop)              | the "Buy us a kotlet" tip button on `/fund`      |

Video share buttons light up per-video automatically: any platform link still
set to a `PLACEHOLDER` post URL is hidden until you paste the real post URL into
the video's JSON.

## Email collection (Cloudflare D1)

The newsletter form (`src/components/Newsletter.astro`, rendered in the global
band in `BaseLayout.astro`) POSTs `{ email, locale }` to the
`POST /api/subscribe` Pages Function, which upserts the address into a D1
`subscribers` table. Buyers are captured too: the Stripe webhook records their
email with `source=purchase`. No third-party email SaaS — export the list when a
campaign goes out.

One-time setup:

```bash
# 1. Create the database, then paste the returned id into wrangler.jsonc (database_id).
npx wrangler d1 create finalbattle-emails

# 2. Apply the schema (locally and/or remotely).
npm run db:schema:local      # local dev DB
npm run db:schema            # production DB

# 3. In the Pages dashboard, bind the database to the `DB` binding.
```

Export the collected list anytime:

```bash
npm run db:export            # SELECT email, source, locale, marketing, created_at ...
```

## Donations ("Buy us a kotlet" tip)

`/fund` (`SupportView` + `SupportCTA.astro`) offers a "Buy us a kotlet" tip that
runs through Stripe Checkout — the same integration as the shop and the Launch
mechanic. The button POSTs `{ locale }` to `POST /api/tip/create-checkout`, which
creates a fixed-unit-price session (quantity adjustable at Checkout) and redirects
to the hosted page. The unit amount lives in `src/config/tip.ts`; the webhook
tags the session `type: "tip"` and only records the buyer's email.

## Merch shop (Stripe + Printify)

Designs are sold as a **T-shirt** or a **Poster**. The flow:

1. Each design is one JSON file in `src/content/products/<slug>.json` (schema in
   `content.config.ts`). The `sku` is the stable id; `name`/`description`/`slogan`
   are bilingual; `image` is a model shot under `public/products/`.
2. `npm run gen:products` compiles every product into
   `functions/api/_products.json` — the **trusted** server catalog. Prices are
   **never** trusted from the client; checkout always recomputes them here. This
   runs automatically on `prebuild`.
3. The cart (`Cart.astro`, localStorage key `fb-cart`) POSTs to
   `POST /api/checkout`, which creates a Stripe Checkout session and returns its
   hosted URL.
4. On `checkout.session.completed`, `POST /api/stripe-webhook` verifies the
   Stripe signature, records the buyer email in D1, and submits a Printify order
   using the product/variant ids in the catalog. Orders are created as **drafts**
   by default — set `PRINTIFY_SEND_TO_PRODUCTION=true` to fulfill automatically.

Wiring Printify ids into the catalog:

```bash
npm run printify:list        # list your Printify products + variant ids
# paste product ids into scripts/printify-map.json, then:
npm run printify:sync        # writes print blocks into products/*.json + regenerates the catalog
```

Adding a product (`src/content/products/<slug>.json`):

```json
{
  "sku": "fb-free-nation",
  "image": "/products/free-nation.png",
  "featured": true,
  "order": 1,
  "name": { "en": "Free Nation — Lion & Sun", "fa": "..." },
  "slogan": { "en": "Now it's your turn to take aim." },
  "description": { "en": "...", "fa": "..." },
  "currency": "USD",
  "formats": {
    "tee": { "price": 28, "sizes": ["S", "M", "L", "XL", "2XL"], "print": {} },
    "poster": { "price": 22, "size": "18x24", "print": {} }
  }
}
```

`print` stays `{}` until the Printify products exist; those lines are then
fulfilled manually until `npm run printify:sync` fills in the ids.

## Cloudflare Pages: bindings & secrets

Pages serves `dist/` and runs `functions/` automatically. Set these in the Pages
project (Settings > Variables and Functions). They mirror `.env.example`:

| Name                          | Type     | Purpose                                          |
| ----------------------------- | -------- | ------------------------------------------------ |
| `DB`                          | D1 bind  | `finalbattle-emails` database (email signups)    |
| `PUBLIC_VIDEO_BASE_URL`       | var      | R2 public origin for video files                 |
| `STRIPE_SECRET_KEY`           | secret   | Stripe API key (`sk_live_...`)                   |
| `STRIPE_WEBHOOK_SECRET`       | secret   | Signing secret for `/api/stripe-webhook`         |
| `SHIPPING_FLAT_CENTS`         | var      | Flat per-cart shipping in cents (default `800`)  |
| `STRIPE_AUTOMATIC_TAX`        | var      | `true` to enable Stripe Tax                      |
| `PRINTIFY_API_TOKEN`          | secret   | Printify personal access token                   |
| `PRINTIFY_SHOP_ID`            | secret   | Printify shop id                                 |
| `PRINTIFY_SEND_TO_PRODUCTION` | var      | `true` to auto-fulfill (default: draft for review) |

Register the Stripe webhook endpoint at
`https://finalbattle.video/api/stripe-webhook` for the
`checkout.session.completed` event, and put its signing secret in
`STRIPE_WEBHOOK_SECRET`.

For local Functions dev, put the same secrets in `web/.dev.vars` and run
`npx wrangler pages dev dist` after a build.
