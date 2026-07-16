/**
 * POST /api/admin/metrics/manual
 * Manual entry of platform metrics (for LinkedIn without API access).
 * LOCAL-ONLY: Guarded by ADMIN_ENABLED env var.
 */

import { jsonResponse, type D1Database } from "../../_lib";

interface Env {
  DB?: D1Database;
  ADMIN_ENABLED?: string;
}

interface ManualMetricsBody {
  videoSlug: string;
  platform: string;
  language: string;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  if (env.ADMIN_ENABLED !== "true") {
    return jsonResponse({ error: "Admin not enabled" }, 403);
  }

  if (!env.DB) {
    return jsonResponse({ error: "Database not configured" }, 500);
  }

  let body: ManualMetricsBody;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const { videoSlug, platform, language, views, likes, comments, shares } = body;

  if (!videoSlug || !platform || !language) {
    return jsonResponse({ error: "Missing required fields: videoSlug, platform, language" }, 400);
  }

  const validPlatforms = ["x", "youtube", "linkedin", "instagram"];
  if (!validPlatforms.includes(platform)) {
    return jsonResponse({ error: `Invalid platform: ${platform}` }, 400);
  }

  const validLanguages = ["en", "fa"];
  if (!validLanguages.includes(language)) {
    return jsonResponse({ error: `Invalid language: ${language}` }, 400);
  }

  const today = new Date().toISOString().split("T")[0];

  try {
    await env.DB.prepare(
      `INSERT INTO video_platform_metrics 
       (video_slug, platform, language, captured_date, views, likes, comments, shares, raw_json, created_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, datetime('now'))
       ON CONFLICT(video_slug, platform, language, captured_date) DO UPDATE SET
         views = excluded.views,
         likes = excluded.likes,
         comments = excluded.comments,
         shares = excluded.shares,
         raw_json = excluded.raw_json`
    )
      .bind(
        videoSlug,
        platform,
        language,
        today,
        views ?? 0,
        likes ?? 0,
        comments ?? 0,
        shares ?? 0,
        JSON.stringify({ manual: true, enteredAt: new Date().toISOString() })
      )
      .run();

    await env.DB.prepare(
      `INSERT INTO ingestion_runs (source, status, rows_written, message, ran_at)
       VALUES ('manual', 'success', 1, ?1, datetime('now'))`
    )
      .bind(`Manual entry for ${videoSlug} on ${platform} (${language})`)
      .run();

    return jsonResponse({ success: true, videoSlug, platform, language }, 200);
  } catch (err) {
    console.error("Error saving manual metrics:", err);
    return jsonResponse({ error: "Database error" }, 500);
  }
};
