// One-off: generate obsidian 9:16 placeholder thumbnails with the gold sun mark
// so the grid renders before real stills exist. Safe to delete later.
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const THUMBS_DIR = path.resolve(__dirname, "../public/videos/thumbs");

const slugs = [
  "the-nation-has-a-future",
  "transitional-leader",
  "returning-to-democracy",
  "captive-nation",
  "by-the-people",
  "far-from-home",
];

const W = 540;
const H = 960;

function svg() {
  const cx = W / 2;
  const cy = H / 2;
  const rays = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2;
    const inner = 70;
    const outer = i % 2 === 0 ? 150 : 118;
    return `<line x1="${cx + Math.cos(a) * inner}" y1="${cy + Math.sin(a) * inner}" x2="${cx + Math.cos(a) * outer}" y2="${cy + Math.sin(a) * outer}" stroke="#B8963E" stroke-width="3" stroke-linecap="round" opacity="0.5"/>`;
  }).join("");
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <rect width="${W}" height="${H}" fill="#0A0A0A"/>
      <circle cx="${cx}" cy="${cy}" r="55" fill="none" stroke="#B8963E" stroke-width="3" opacity="0.5"/>
      ${rays}
    </svg>`,
  );
}

await mkdir(THUMBS_DIR, { recursive: true });
for (const slug of slugs) {
  const out = path.join(THUMBS_DIR, `${slug}.webp`);
  await sharp(svg()).webp({ quality: 80 }).toFile(out);
  console.log(`✓ ${slug}.webp`);
}
