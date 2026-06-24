# Final Battle Iran

Bilingual (English + Persian) video education platform for the Iran Prosperity Project. Built with Astro 6 + Tailwind CSS v4, deployed as a static site.

- **Live domain:** finalbattleiran.org
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
  consts.ts                 # site URL, locales, Cloudflare Stream helpers
  content.config.ts         # videos collection (Content Layer glob loader)
  content/videos/*.json     # one file per video, per-language variants
  i18n/ui.ts                # all UI copy, keyed by locale
  i18n/utils.ts             # locale helpers (translate, dir, localized paths)
  lib/videos.ts             # collection queries + duration formatting
  styles/global.css         # Tailwind import, @theme design tokens, fonts
  components/               # UI atoms (cards, share bar, player, pattern, ...)
  components/views/         # shared page bodies rendered by EN + FA routes
  pages/                    # EN routes
  pages/fa/                 # FA mirror routes (thin wrappers, lang="fa")
public/
  patterns/                 # tiling Persian SVGs (recolored via CSS mask)
  videos/thumbs/            # generated 9:16 WebP thumbnails
scripts/
  gen-video-thumbs.js       # source still -> WebP thumbnail
```

## Content: adding a video

Each video is one JSON file in `src/content/videos/<slug>.json`. The `slug` is
the filename. Each language has its own natively uploaded video, so every
language variant carries its own Cloudflare Stream UID, title, script, and
platform links:

```json
{
  "series": "iran-prosperity-project",
  "category": "myth",            // truth | myth | project
  "publishedAt": "2026-07-01",
  "featured": true,
  "tags": ["sanctions", "economy"],
  "languages": {
    "en": {
      "title": "Economic Sanctions, Explained",
      "streamId": "CF_STREAM_UID_EN",
      "durationSeconds": 47,
      "thumbnailUrl": "/videos/thumbs/economic-sanctions-explained.webp",
      "script": "Voiceover script / transcript...",
      "platforms": {
        "x": "https://x.com/.../status/...",
        "instagram": "https://www.instagram.com/reel/.../",
        "youtube": "https://youtube.com/shorts/..."
      }
    },
    "fa": { "title": "...", "streamId": "CF_STREAM_UID_FA", "script": "..." }
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

## Cloudflare Stream

Set the Stream customer subdomain via env (see `.env.example`):

```
PUBLIC_STREAM_CUSTOMER_SUBDOMAIN=customer-xxxxxxxx
```

Embed URLs are built in `src/consts.ts` (`streamIframeUrl`). Until a real
subdomain and Stream UIDs are configured, players load placeholders.

## Persian pattern accents

`public/patterns/PatternMatte.svg` is line art tiled as a low-contrast
background via `PatternBackground.astro`. Because it's applied with CSS
`mask-image`, the SVG's own color is irrelevant — the accent color comes from a
palette token (default `sand`; `gold` on hero/footer). Drop additional tiling
SVGs into `public/patterns/` and pass `src` to recolor/reuse them.

## Deferred

Merch/shop (Stripe + Printify) and the Cloudflare Stream/R2 upload scripts are
intentionally out of scope for this build.
