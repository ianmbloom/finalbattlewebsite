#!/usr/bin/env node
/**
 * Sync confirmed platform_posts from local D1 to production D1.
 * 
 * Usage:
 *   node scripts/sync-posts-to-prod.mjs
 * 
 * This reads from your local D1 (in .wrangler/state) and writes to production.
 */

import { execSync } from "child_process";

const DB_NAME = "finalbattle-emails";

console.log("📖 Reading confirmed posts from local D1...\n");

// Read all posted entries from local D1
const localResult = execSync(
  `npx wrangler d1 execute ${DB_NAME} --local --persist-to .wrangler/state --json --command "SELECT video_slug, platform, language, external_url, external_id, posted_at, status FROM platform_posts WHERE status = 'posted'"`,
  { encoding: "utf-8" }
);

const localData = JSON.parse(localResult);
const posts = localData[0]?.results || [];

if (posts.length === 0) {
  console.log("No confirmed posts found in local database.");
  process.exit(0);
}

console.log(`Found ${posts.length} confirmed post(s):\n`);
posts.forEach((p) => {
  console.log(`  - ${p.video_slug} / ${p.platform} / ${p.language}`);
  console.log(`    ${p.external_url}\n`);
});

console.log("⬆️  Syncing to production D1...\n");

// Upsert each post to production
for (const post of posts) {
  const sql = `
    INSERT INTO platform_posts (video_slug, platform, language, external_url, external_id, posted_at, status, created_at)
    VALUES ('${post.video_slug}', '${post.platform}', '${post.language}', '${post.external_url}', ${post.external_id ? `'${post.external_id}'` : "NULL"}, '${post.posted_at}', 'posted', '${post.posted_at}')
    ON CONFLICT(video_slug, platform, language) DO UPDATE SET
      external_url = excluded.external_url,
      external_id = COALESCE(excluded.external_id, platform_posts.external_id),
      posted_at = excluded.posted_at,
      status = 'posted'
  `.trim().replace(/\n\s+/g, " ");

  try {
    execSync(
      `npx wrangler d1 execute ${DB_NAME} --remote --command "${sql}"`,
      { encoding: "utf-8", stdio: "pipe" }
    );
    console.log(`  ✓ ${post.video_slug} / ${post.platform} / ${post.language}`);
  } catch (err) {
    console.error(`  ✗ Failed: ${post.video_slug} / ${post.platform} / ${post.language}`);
    console.error(`    ${err.message}`);
  }
}

console.log("\n✅ Sync complete! Production website will now show these links.");
