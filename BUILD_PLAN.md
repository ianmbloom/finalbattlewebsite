# Iran Prosperity Project — Site Build Plan
> For use in Cursor. This document is the canonical build reference for the video education platform.

---

## Project Mission

**The Problem:** Most of the world knows very little about Iran or the Lion and Sun Revolution. That gap leaves room for misconceptions to spread unchallenged.

**The Goal:** Educate a global audience about a Free Iran — one that will soon benefit the entire world.

**The Method:** Short-form video content where every piece is an arrow for the quiver. Each arrow does one of three things:
- Illuminates a hidden truth
- Dispels a common myth
- Unpacks a detail of the Iran Prosperity Project

**Tagline:** *Now it's your turn to take aim.* 🦁☀️

---

## Design System

### Aesthetic: High-End Luxury

The site must feel like a flagship editorial brand — think *Bottega Veneta*, *The Row*, or *Celine*. Austere, confident, and beautiful. No gradients, no glow effects, no SaaS-product aesthetics. Every pixel earns its place.

**Guiding adjectives:** Editorial. Monumental. Still. Precise. Timeless.

### Color Palette

| Token | Hex | Use |
|-------|-----|-----|
| `obsidian` | `#0A0A0A` | Primary background (near-black, not pure black) |
| `parchment` | `#F2EDE4` | Primary text / light surface |
| `sand` | `#C8B89A` | Secondary text / dividers / muted UI |
| `gold` | `#B8963E` | Accent — sparingly on hover states, active indicators, Lion & Sun icon |
| `crimson` | `#9B1C1C` | Tertiary accent — used only for the most critical CTAs |
| `carbon` | `#1A1A1A` | Card backgrounds / elevated surfaces |

**Rule:** The site is dark-primary. `parchment` text on `obsidian` backgrounds. Light surfaces (`parchment`) are only used for product/merch sections.

### Typography

| Role | Font | Weight | Notes |
|------|------|--------|-------|
| Display / Hero | **Cormorant Garamond** | 300 Light or 600 SemiBold | High-contrast serif — the voice of the brand |
| Body / UI | **Inter** | 400 Regular, 500 Medium | Clinical and precise |
| Label / Caption | **Inter** | 400, tracked +0.12em, uppercase | Category labels, timestamps, metadata |
| Persian (FA) | **Vazirmatn** | 400, 700 | RTL — same role as Inter in EN |

Load via `@fontsource` packages or Google Fonts. Set `font-display: swap`.

### Spacing & Layout

- 12-column grid with 24px gutters on desktop, 16px on mobile
- Base spacing unit: `8px` — all spacing values are multiples of 8
- Max content width: `1280px`, centered
- Generous whitespace — luxury brands breathe
- Video grid: 3-column on desktop, 2-column on tablet, 1-column on mobile (full-bleed)

### Motion

- Transitions: `300ms ease-out` only
- No parallax, no scroll-jacking
- Video thumbnails: subtle scale `1.02` on hover (`transform: scale(1.02); transition: transform 300ms ease-out`)
- No entrance animations on load — content appears fully formed
- The Lion & Sun icon may use a single slow fade-in on the hero (800ms)

---

## Tech Stack

Extends the existing GhalibafRepublic stack. No new frameworks introduced.

| Layer | Technology |
|-------|------------|
| Framework | **Astro 6** (`output: "static"`) |
| Styling | **Tailwind CSS v4** via `@tailwindcss/vite` |
| Video Hosting | **Cloudflare Stream** (same Cloudflare account) |
| Video Archive | **Cloudflare R2** (private bucket — source MP4s) |
| Merch / Signs | **Stripe Checkout** + **Printify** POD (existing) |
| Database | **Cloudflare D1** (existing `subscribers` table) |
| DNS / CDN / WAF | **Cloudflare** (existing) |
| Deploy | **GitHub → Cloudflare Pages** (existing) |
| Analytics | **Cloudflare Web Analytics** (existing) |

### New Environment Variables to Add

```
CLOUDFLARE_STREAM_TOKEN=        # Cloudflare Stream API token
CLOUDFLARE_ACCOUNT_ID=          # Your CF account ID
CLOUDFLARE_R2_BUCKET_NAME=      # e.g. "iran-prosperity-videos"
```

Add to `web/.env.example` and Cloudflare Pages environment settings.

---

## Content Architecture

### Video Content Schema

Create `web/src/content/videos/` with one JSON file per video:

```json
{
  "slug": "economic-sanctions-explained",
  "title": "Economic Sanctions Explained",
  "title_fa": "تحریم‌های اقتصادی توضیح داده شد",
  "series": "iran-prosperity-project",
  "category": "myth",
  "publishedAt": "2026-07-01",
  "streamId": "CLOUDFLARE_STREAM_UID",
  "thumbnailUrl": "/videos/thumbs/economic-sanctions-explained.webp",
  "durationSeconds": 45,
  "script": "Short voiceover script text here (70–90 words).",
  "platforms": {
    "x": "https://x.com/IranProsperity/status/POST_ID",
    "instagram": "https://www.instagram.com/reel/REEL_ID/",
    "youtube": "https://youtube.com/shorts/VIDEO_ID"
  },
  "tags": ["sanctions", "economy", "iran"]
}
```

**Category values:**
- `"truth"` — Illuminates a hidden truth
- `"myth"` — Dispels a common myth
- `"project"` — Unpacks the Iran Prosperity Project

### Content Collections Config

Define in `web/src/content/config.ts`:

```typescript
import { defineCollection, z } from 'astro:content';

const videos = defineCollection({
  type: 'data',
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    title_fa: z.string().optional(),
    series: z.string(),
    category: z.enum(['truth', 'myth', 'project']),
    publishedAt: z.string(),
    streamId: z.string(),
    thumbnailUrl: z.string(),
    durationSeconds: z.number(),
    script: z.string().optional(),
    platforms: z.object({
      x: z.string().url().optional(),
      instagram: z.string().url().optional(),
      youtube: z.string().url().optional(),
    }),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = { videos };
```

---

## Page Structure

### Routes

| Route | File | Description |
|-------|------|-------------|
| `/` | `src/pages/index.astro` | Hero + featured videos |
| `/videos` | `src/pages/videos/index.astro` | Full filterable video library |
| `/videos/[slug]` | `src/pages/videos/[slug].astro` | Single video page |
| `/about` | `src/pages/about.astro` | Mission + Iran Prosperity Project explainer |
| `/shop` | `src/pages/shop/index.astro` | Merch + protest signs |
| `/shop/[slug]` | `src/pages/shop/[slug].astro` | Product detail (existing pattern) |
| `/fa/` | i18n mirror | Persian language versions of all above |

---

## Component Specs

### `VideoCard.astro`

The primary content atom. Used in grids and featured layouts.

```
[ 9:16 Thumbnail / Video Preview ]
  — plays on hover (muted, loop) if on desktop
  — tap to navigate on mobile

  CATEGORY LABEL            00:45
  ─────────────────────────────
  Title of the Video in
  Cormorant Garamond
  ─────────────────────────────
  [ Share ]  [ X ]  [ IG ]  [ YT ]
```

- Thumbnail: WebP, generated at build time via `sharp`
- Category label: uppercase Inter, `sand` color, letter-spaced
- Share icons: minimal SVG, `sand` color → `gold` on hover
- Card background: `carbon` (`#1A1A1A`)
- Border: 1px `sand` at 20% opacity — no border-radius (luxury brands are sharp-edged)

### `VideoPlayer.astro`

Full-bleed Cloudflare Stream embed for the `/videos/[slug]` page.

```astro
---
const { streamId } = Astro.props;
---
<div class="relative w-full" style="padding-top: 177.78%">
  <iframe
    src={`https://customer-XXXX.cloudflarestream.com/${streamId}/iframe?autoplay=true&muted=false&controls=true`}
    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
    allowfullscreen
    class="absolute inset-0 w-full h-full border-0"
  />
</div>
```

Replace `customer-XXXX` with your Cloudflare Stream customer subdomain from the Stream dashboard.

### `ShareBar.astro`

The sharing module. Renders platform-specific intent links that drive **native shares** on each platform.

```astro
---
const { title, platforms } = Astro.props;
const xIntent = platforms.x
  ? `https://twitter.com/intent/tweet?url=${encodeURIComponent(platforms.x)}&text=${encodeURIComponent('🦁☀️ ' + title + ' #IranProsperity #FreeIran')}`
  : null;
---

<div class="share-bar">
  <!-- Web Share API (mobile OS sheet) -->
  <button data-share-url={platforms.x || ''} data-share-title={title}>
    Share
  </button>

  <!-- X/Twitter: quote-tweet the native X post -->
  {xIntent && <a href={xIntent} target="_blank" rel="noopener">Post on X</a>}

  <!-- Instagram: deep link to the native Reel -->
  {platforms.instagram && <a href={platforms.instagram} target="_blank" rel="noopener">View Reel</a>}

  <!-- YouTube: link to the Short -->
  {platforms.youtube && <a href={platforms.youtube} target="_blank" rel="noopener">Watch Short</a>}
</div>

<script>
  document.querySelectorAll('[data-share-url]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const url = btn.dataset.shareUrl;
      const title = btn.dataset.shareTitle;
      if (navigator.share && url) {
        await navigator.share({ title, url });
      } else if (url) {
        navigator.clipboard.writeText(url);
      }
    });
  });
</script>
```

**Key principle:** The X intent URL points to the *existing X post URL* (the native video tweet), not to your website URL. This causes viewers to retweet or quote-tweet the native video — staying in X's ecosystem and triggering the algorithm.

### `FilterBar.astro`

Used on `/videos` to filter by category. Three pill buttons:

```
[ All ]  [ Hidden Truths ]  [ Common Myths ]  [ The Project ]
```

Implemented as client-side JS filtering on `data-category` attributes — no server round-trip on a static site.

Styling: outlined pills, `parchment` text, active state fills with `gold` text and `carbon` background. No fill on inactive. Sharp corners (no border-radius).

### `Hero.astro` (Homepage)

Full-viewport dark section:

```
                    🦁☀️

        IRAN PROSPERITY PROJECT

    Every video is an arrow.
    Every share takes aim.

         [ Watch the Series ]
              [ About ]

— — — — — — — — — — — — — — — — — —
[Vid 1]     [Vid 2]     [Vid 3]
```

- Background: `obsidian`
- Lion & Sun: large, centered, `gold`, SVG — single slow fade-in (800ms)
- Headline: Cormorant Garamond Display 300, `parchment`, ~80px desktop / 40px mobile
- Subhead: Inter 400, `sand`, tracked +0.08em
- CTAs: outlined buttons, `parchment` border and text — `gold` border and text on hover. No fill. No border-radius.

---

## Video Upload Workflow

For each new video produced:

### Step 1 — Prepare the Master File
- Format: MP4, H.264, 1080×1920 (9:16), AAC audio
- Duration: ≤ 60 seconds (target 45s)
- No platform watermarks in the center safe zone

### Step 2 — Upload to Each Platform Natively
Upload the same master file to each platform before or at launch:
1. **X/Twitter** — via X Media Studio (`studio.twitter.com`) or the post composer. Copy the resulting tweet URL.
2. **Instagram Reels** — via the Instagram app or Meta Creator Studio. Copy the Reel URL.
3. **YouTube Shorts** — upload to YouTube Studio. Copy the Shorts URL.

### Step 3 — Upload to Cloudflare Stream
Upload via the Cloudflare Stream dashboard or API. Copy the **Stream UID** (looks like `a4f8b2c3d1e9...`).

### Step 4 — Archive Master to R2
Upload the master MP4 to the private R2 bucket. Key format: `videos/SLUG/master.mp4`.

### Step 5 — Create the Content JSON
Create `web/src/content/videos/SLUG.json` with all Stream UID and platform URLs from Steps 2–3.

### Step 6 — Generate Thumbnail
Run `npm run gen:video-thumbs` to generate the WebP thumbnail.

### Step 7 — Deploy
Commit and push. Cloudflare Pages rebuilds automatically.

---

## Build Scripts to Add

Add to `web/package.json` scripts:

```json
{
  "gen:video-thumbs": "node scripts/gen-video-thumbs.js",
  "stream:upload": "node scripts/stream-upload.js",
  "r2:archive": "node scripts/r2-archive.js"
}
```

### `scripts/gen-video-thumbs.js`
Uses `sharp` (already a dependency) to:
1. Read each video JSON in `src/content/videos/`
2. Check if a thumbnail exists at `web/public/videos/thumbs/[slug].webp`
3. If a source still image exists at `scripts/video-stills/[slug].jpg`, convert to WebP and write to public

### `scripts/stream-upload.js`
Uses the Cloudflare Stream API to upload an MP4 from a local path and return the Stream UID. Writes the UID back into the content JSON automatically.

```
Usage: node scripts/stream-upload.js --slug economic-sanctions-explained --file ~/Desktop/video.mp4
```

---

## SEO & Social Cards

Every `/videos/[slug]` page must have Open Graph tags that render a rich preview when the page URL is shared.

Extend `Seo.astro` with video-specific OG tags:

```astro
<meta property="og:type" content="video.other" />
<meta property="og:video" content={`https://customer-XXXX.cloudflarestream.com/${streamId}/iframe`} />
<meta property="og:video:type" content="text/html" />
<meta property="og:video:width" content="1080" />
<meta property="og:video:height" content="1920" />
<meta property="og:image" content={absoluteThumbnailUrl} />
<meta name="twitter:card" content="player" />
<meta name="twitter:player" content={`https://customer-XXXX.cloudflarestream.com/${streamId}/iframe`} />
<meta name="twitter:player:width" content="360" />
<meta name="twitter:player:height" content="640" />
```

---

## Merch & Protest Signs

Reuse the existing Stripe + Printify pipeline from GhalibafRepublic verbatim:
- `checkout.ts` Pages Function
- `stripe-webhook.ts` Pages Function
- `_products.json` catalog format
- Printify yard sign blueprint (18×24″)

Product designs should reflect the Lion & Sun aesthetic — stark, bold, editorial. Bilingual EN/FA copy on all items.

---

## Internationalization

Follow the existing Astro i18n routing pattern:
- **EN** — default (no prefix)
- **FA** — `/fa/` prefix, RTL, Vazirmatn font

All video titles, scripts, and UI strings must have FA equivalents in `src/i18n/strings.fa.json`.

---

## Deplatform Resilience

- **Cloudflare Stream** = display layer (website embedded player)
- **Cloudflare R2** (private bucket) = archival layer (source MP4s you own permanently)
- **Platform posts** = distribution layer (X, Instagram, YouTube)

If any platform removes a video, the master lives in R2 and can be re-uploaded. If Stream is ever an issue, the fallback is to serve HLS segments from a public R2 bucket using a `<video>` tag with `hls.js`.

---

## Launch Checklist

- [ ] Cloudflare Stream token added to Pages environment
- [ ] R2 bucket `iran-prosperity-videos` created (private)
- [ ] First 3–5 videos uploaded to all platforms and Stream
- [ ] Content JSONs created for each video
- [ ] Thumbnails generated (`npm run gen:video-thumbs`)
- [ ] `/videos` grid renders and filters correctly
- [ ] ShareBar tested on mobile (Web Share API) and desktop (intent URLs)
- [ ] Open Graph / Twitter Card previews verified via cards-dev.twitter.com/validator
- [ ] FA (Persian) translations complete for all video titles
- [ ] Shop products live (protest signs + merch)
- [ ] Cloudflare Web Analytics beacon active
- [ ] `feed.xml` updated for Meta Commerce Manager
- [ ] Stripe checkout tested end-to-end in production mode
- [ ] Sitemap includes all `/videos/[slug]` routes
