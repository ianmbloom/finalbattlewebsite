#!/usr/bin/env node

/**
 * Check if a social media handle is available across platforms.
 * Usage: node web/scripts/check-handle.mjs [handle]
 * Default handle: ta_didar_azadi
 */

const HANDLE = process.argv[2] || "ta_didar_azadi";

const checks = [
  { platform: "X", url: `https://x.com/${HANDLE}` },
  { platform: "YouTube", url: `https://youtube.com/@${HANDLE}` },
  { platform: "LinkedIn", url: `https://linkedin.com/company/${HANDLE}` },
  { platform: "Telegram", url: `https://t.me/${HANDLE}` },
];

console.log(`\nChecking handle availability: @${HANDLE}\n`);
console.log("─".repeat(70));

for (const { platform, url } of checks) {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "manual",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });

    const status = res.status;
    let result;

    if (status === 200 || status === 301 || status === 302) {
      result = "❌ TAKEN";
    } else if (status === 404) {
      result = "✅ Available";
    } else if (status === 403 || status === 429) {
      result = `⚠️  Blocked (${status}) - check manually`;
    } else {
      result = `❓ Unknown (${status}) - check manually`;
    }

    console.log(
      `${platform.padEnd(10)} ${url.padEnd(45)} ${result}`
    );
  } catch (err) {
    console.log(
      `${platform.padEnd(10)} ${url.padEnd(45)} ⚠️  Error: ${err.message}`
    );
  }
}

console.log("─".repeat(70));
console.log("\nNote: Some platforms block automated checks. Verify manually if needed.\n");
