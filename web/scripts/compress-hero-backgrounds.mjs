#!/usr/bin/env node
/** Convert hero background PNGs to WebP (Cloudflare Pages 25 MiB/file limit). */
import { stat, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const dir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../public/backgrounds",
);

for (const name of ["hero-citadel.png", "hero-tile.png", "hero-village.png"]) {
  const png = path.join(dir, name);
  const webp = png.replace(/\.png$/, ".webp");
  const before = (await stat(png)).size;
  await sharp(png).webp({ quality: 82, effort: 6 }).toFile(webp);
  await unlink(png);
  const after = (await stat(webp)).size;
  console.log(
    `${name} -> ${path.basename(webp)}: ${(before / 1024 / 1024).toFixed(1)} MiB -> ${(after / 1024 / 1024).toFixed(2)} MiB`,
  );
}
