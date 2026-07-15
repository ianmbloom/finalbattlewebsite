/**
 * POST /api/admin/metrics/refresh
 * Manual trigger for metrics ingestion (same logic as cron worker).
 * LOCAL-ONLY: Guarded by ADMIN_ENABLED env var.
 */

import { jsonResponse, type D1Database } from "../../_lib";

interface Env {
  DB?: D1Database;
  ADMIN_ENABLED?: string;
  YOUTUBE_API_KEY?: string;
  TWITTERAPI_IO_KEY?: string;
}

interface PlatformPost {
  video_slug: string;
  platform: string;
  language: string;
  external_id: string;
}

interface YouTubeVideoStats {
  id: string;
  statistics: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
}

interface YouTubeResponse {
  items: YouTubeVideoStats[];
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env } = context;

  if (env.ADMIN_ENABLED !== "true") {
    return jsonResponse({ error: "Admin not enabled" }, 403);
  }

  if (!env.DB) {
    return jsonResponse({ error: "Database not configured" }, 500);
  }

  let rowsWritten = 0;
  const errors: string[] = [];

  try {
    const posts = await env.DB.prepare(
      `SELECT video_slug, platform, language, external_id
       FROM platform_posts
       WHERE status = 'posted' AND external_id IS NOT NULL`
    ).all<PlatformPost>();

    if (!posts.results || posts.results.length === 0) {
      return jsonResponse({ rowsWritten: 0, message: "No posted videos found" }, 200);
    }

    const youtubePosts = posts.results.filter(p => p.platform === "youtube" && p.external_id);
    
    if (env.YOUTUBE_API_KEY && youtubePosts.length > 0) {
      try {
        const ytRows = await fetchYouTubeMetrics(env as Required<Pick<Env, "DB" | "YOUTUBE_API_KEY">>, youtubePosts);
        rowsWritten += ytRows;
      } catch (err) {
        errors.push(`YouTube: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }

    await env.DB.prepare(
      `INSERT INTO ingestion_runs (source, status, rows_written, message, ran_at)
       VALUES ('manual', ?1, ?2, ?3, datetime('now'))`
    )
      .bind(
        errors.length > 0 ? "partial" : "success",
        rowsWritten,
        errors.length > 0 ? errors.join("; ") : "Manual refresh completed"
      )
      .run();

    return jsonResponse({
      rowsWritten,
      errors: errors.length > 0 ? errors : undefined,
    }, 200);
  } catch (err) {
    console.error("Error in manual refresh:", err);
    return jsonResponse({ error: "Refresh failed" }, 500);
  }
};

async function fetchYouTubeMetrics(
  env: { DB: D1Database; YOUTUBE_API_KEY: string },
  posts: PlatformPost[]
): Promise<number> {
  const videoIds = posts.map(p => p.external_id).filter(Boolean);
  if (videoIds.length === 0) return 0;

  const ids = videoIds.join(",");
  const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${ids}&key=${env.YOUTUBE_API_KEY}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.status}`);
  }

  const data = await response.json() as YouTubeResponse;
  const today = new Date().toISOString().split("T")[0];
  let rowsWritten = 0;

  for (const item of data.items) {
    const post = posts.find(p => p.external_id === item.id);
    if (!post) continue;

    const stats = item.statistics;

    await env.DB.prepare(
      `INSERT INTO video_platform_metrics 
       (video_slug, platform, language, captured_date, views, likes, comments, shares, raw_json, created_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 0, ?8, datetime('now'))
       ON CONFLICT(video_slug, platform, language, captured_date) DO UPDATE SET
         views = excluded.views,
         likes = excluded.likes,
         comments = excluded.comments,
         raw_json = excluded.raw_json`
    )
      .bind(
        post.video_slug,
        "youtube",
        post.language,
        today,
        parseInt(stats.viewCount ?? "0"),
        parseInt(stats.likeCount ?? "0"),
        parseInt(stats.commentCount ?? "0"),
        JSON.stringify(stats)
      )
      .run();

    rowsWritten++;
  }

  return rowsWritten;
}
