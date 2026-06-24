#!/usr/bin/env node
/**
 * Generate 9:16 WebP thumbnails for videos.
 *
 * For each video JSON in src/content/videos, if a source still exists at
 * scripts/video-stills/<slug>.(jpg|jpeg|png) and a thumbnail does not already
 * exist at public/videos/thumbs/<slug>.webp, convert and write it.
 *
 * Usage: npm run gen:video-thumbs
 */
import { readdir, mkdir, access } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const VIDEOS_DIR = path.join(root, "src/content/videos");
const STILLS_DIR = path.join(root, "scripts/video-stills");
const THUMBS_DIR = path.join(root, "public/videos/thumbs");

const TARGET_WIDTH = 540; // 540x960 = 9:16 at 2x card size
const TARGET_HEIGHT = 960;

const SOURCE_EXTS = [".jpg", ".jpeg", ".png", ".webp"];

async function findStill(slug) {
  for (const ext of SOURCE_EXTS) {
    const candidate = path.join(STILLS_DIR, `${slug}${ext}`);
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

async function main() {
  await mkdir(THUMBS_DIR, { recursive: true });

  let videoFiles = [];
  try {
    videoFiles = (await readdir(VIDEOS_DIR)).filter((f) => f.endsWith(".json"));
  } catch {
    console.error(`No videos directory at ${VIDEOS_DIR}`);
    process.exit(1);
  }

  let generated = 0;
  let skipped = 0;
  let missing = 0;

  for (const file of videoFiles) {
    const slug = file.replace(/\.json$/, "");
    const out = path.join(THUMBS_DIR, `${slug}.webp`);

    if (existsSync(out)) {
      skipped++;
      continue;
    }

    const still = await findStill(slug);
    if (!still) {
      console.warn(
        `· no still for "${slug}" (add scripts/video-stills/${slug}.jpg)`,
      );
      missing++;
      continue;
    }

    await sharp(still)
      .resize(TARGET_WIDTH, TARGET_HEIGHT, { fit: "cover", position: "centre" })
      .webp({ quality: 82 })
      .toFile(out);

    console.log(`✓ ${slug}.webp`);
    generated++;
  }

  console.log(
    `\nDone. ${generated} generated, ${skipped} already existed, ${missing} missing a still.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
