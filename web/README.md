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
  consts.ts                 # site URL, locales, video URL helper
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
  videos/                   # self-hosted MP4 files (one per video slug)
  videos/thumbs/            # generated 9:16 WebP thumbnails
  _headers                  # Cloudflare Pages caching + security headers
scripts/
  gen-video-thumbs.js       # source still -> WebP thumbnail
```

## Content: adding a video

Each video is one JSON file in `src/content/videos/<slug>.json`. The `slug` is
the filename. Each language has its own self-hosted MP4, so every language
variant carries its own `videoSrc`, title, script, and platform links:

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

## Deferred

Merch/shop (Stripe + Printify) is intentionally out of scope for this build.
