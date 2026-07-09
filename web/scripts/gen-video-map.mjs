// Generates functions/api/_videos.json from the video content collection.
// Pages Functions read this lightweight index at the edge as the TRUSTED
// source for the "Launch this video" mechanic:
//   - /api/boost/create-checkout -> slug -> { title{en,fa}, boostTier }
// It is the authoritative guard against launching an organic-only (tier 3)
// video. Transcripts and other heavy fields are deliberately NOT shipped here.
// Run after editing videos:  npm run gen:videos
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url));
const videosDir = path.join(root, "..", "src", "content", "videos");
const outFile = path.join(root, "..", "functions", "api", "_videos.json");

// Keep in sync with DEFAULT_BOOST_TIER in src/config/boost.ts.
const DEFAULT_BOOST_TIER = 3;

let files = [];
try {
  files = (await readdir(videosDir)).filter((f) => f.endsWith(".json"));
} catch {
  // No videos dir yet: emit an empty index so the functions still compile.
}

const map = {};

for (const file of files) {
  const slug = file.replace(/\.json$/, "");
  const raw = await readFile(path.join(videosDir, file), "utf8");
  const v = JSON.parse(raw);

  let boostTier = v.boostTier;
  if (boostTier == null) {
    console.warn(
      `[boost] unflagged video: ${slug} -> defaulting to tier ${DEFAULT_BOOST_TIER}`,
    );
    boostTier = DEFAULT_BOOST_TIER;
  }

  const langs = v.languages ?? {};
  map[slug] = {
    title: {
      en: langs.en?.title ?? slug,
      fa: langs.fa?.title ?? langs.en?.title ?? slug,
    },
    boostTier,
  };
}

await mkdir(path.dirname(outFile), { recursive: true });
await writeFile(outFile, JSON.stringify(map, null, 2) + "\n");
console.log(
  `Wrote ${Object.keys(map).length} videos to ${path.relative(process.cwd(), outFile)}`,
);
