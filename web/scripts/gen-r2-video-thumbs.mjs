#!/usr/bin/env node
/**
 * Extract 9:16 WebP thumbnails from hosted MP4s (R2 / media origin).
 *
 * Reads each video JSON and regenerates the thumbnail file named in
 * `thumbnailUrl`. Requires ffmpeg on PATH.
 *
 * Usage: npm run gen:r2-thumbs
 */
import { readdir, readFile, mkdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const VIDEOS_DIR = path.join(root, "src/content/videos");
const THUMBS_DIR = path.join(root, "public/videos/thumbs");
const R2_ORIGIN = "https://videos.finalbattle.video";

function resolveVideoUrl(videoSrc) {
  if (/^https?:\/\//.test(videoSrc)) return videoSrc;
  return `${R2_ORIGIN.replace(/\/$/, "")}${videoSrc}`;
}

function thumbPath(thumbnailUrl) {
  const name = path.basename(thumbnailUrl);
  return path.join(THUMBS_DIR, name);
}

function extractFrame(url, out, ss) {
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
    throw new Error(`ffmpeg failed for ${url}`);
  }
}

await mkdir(THUMBS_DIR, { recursive: true });

const files = (await readdir(VIDEOS_DIR)).filter((f) => f.endsWith(".json"));
let count = 0;

for (const file of files) {
  const data = JSON.parse(await readFile(path.join(VIDEOS_DIR, file), "utf8"));
  const format = data.format ?? "short";
  const ss = format === "long" ? "3" : "1.5";

  for (const [locale, variant] of Object.entries(data.languages ?? {})) {
    if (!variant?.thumbnailUrl || !variant?.videoSrc) continue;
    const out = thumbPath(variant.thumbnailUrl);
    const url = resolveVideoUrl(variant.videoSrc);
    console.log(`→ ${path.basename(out)} (${locale}, ${ss}s)`);
    extractFrame(url, out, ss);
    console.log(`✓ ${path.basename(out)}`);
    count++;
  }
}

console.log(`\nDone. ${count} thumbnails written.`);
