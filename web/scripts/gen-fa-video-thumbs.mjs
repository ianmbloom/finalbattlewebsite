#!/usr/bin/env node
/**
 * Generate 9:16 WebP thumbnails for Persian video variants.
 *
 * Extracts a frame from each FA MP4 on the R2 public origin and writes
 * public/videos/thumbs/<slug>-fa.webp. Requires ffmpeg on PATH.
 *
 * Usage: npm run gen:fa-thumbs
 */
import { mkdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const THUMBS_DIR = path.join(root, "public/videos/thumbs");
const VIDEO_BASE = "https://videos.finalbattle.video/videos";

const FA_VIDEOS = [
  { slug: "captive-nation", file: "captive-nation-fa-jun27.mp4", ss: "1.5" },
  { slug: "the-nation-has-a-future", file: "the-nation-has-a-future-fa-jun27.mp4", ss: "1.5" },
  {
    slug: "returning-to-democracy",
    file: "returning-to-democracy-fa-jun27.mp4",
    ss: "1.5",
  },
  { slug: "transitional-leader", file: "transitional-leader-fa-jun27.mp4", ss: "1.5" },
];

await mkdir(THUMBS_DIR, { recursive: true });

for (const { slug, file, ss } of FA_VIDEOS) {
  const out = path.join(THUMBS_DIR, `${slug}-fa.webp`);
  const url = `${VIDEO_BASE}/${file}`;
  const result = spawnSync(
    "ffmpeg",
    [
      "-hide_banner",
      "-loglevel",
      "error",
      "-ss",
      ss,
      "-i",
      url,
      "-frames:v",
      "1",
      "-vf",
      "scale=540:960:force_original_aspect_ratio=increase,crop=540:960",
      "-c:v",
      "libwebp",
      "-quality",
      "82",
      "-y",
      out,
    ],
    { stdio: "inherit" },
  );
  if (result.status !== 0) {
    console.error(`ffmpeg failed for ${slug}`);
    process.exit(result.status ?? 1);
  }
  console.log(`✓ ${slug}-fa.webp`);
}
