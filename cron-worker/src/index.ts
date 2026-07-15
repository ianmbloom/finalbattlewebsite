/**
 * Cloudflare Worker for scheduled metrics ingestion.
 * 
 * Runs daily via Cron Trigger to pull metrics from:
 * - YouTube Data API v3 (free tier, 10k units/day)
 * - TwitterAPI.io (for X metrics)
 * 
 * TikTok and LinkedIn require manual entry (no free automated API).
 */

interface Env {
  DB: D1Database;
  YOUTUBE_API_KEY?: string;
  TWITTERAPI_IO_KEY?: string;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<D1Result>;
  all<T = unknown>(): Promise<{ results: T[] }>;
  first<T = unknown>(): Promise<T | null>;
}

interface D1Result {
  meta: { changes?: number };
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

interface XMetrics {
  data?: {
    public_metrics?: {
      retweet_count?: number;
      reply_count?: number;
      like_count?: number;
      quote_count?: number;
      impression_count?: number;
    };
  };
}

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log(`[Cron] Running metrics ingestion at ${new Date().toISOString()}`);
    
    let rowsWritten = 0;
    let status: "success" | "partial" | "error" = "success";
    let message = "";
    
    try {
      const posts = await getPostedVideos(env.DB);
      console.log(`[Cron] Found ${posts.length} posted videos to fetch metrics for`);
      
      if (posts.length === 0) {
        message = "No posted videos found";
        await logIngestionRun(env.DB, "manual", status, rowsWritten, message);
        return;
      }
      
      const youtubePosts = posts.filter(p => p.platform === "youtube" && p.external_id);
      const xPosts = posts.filter(p => p.platform === "x" && p.external_id);
      
      if (env.YOUTUBE_API_KEY && youtubePosts.length > 0) {
        try {
          const ytRows = await fetchYouTubeMetrics(env, youtubePosts);
          rowsWritten += ytRows;
          console.log(`[Cron] YouTube: wrote ${ytRows} rows`);
        } catch (err) {
          console.error("[Cron] YouTube fetch failed:", err);
          status = "partial";
          message += "YouTube fetch failed. ";
        }
      }
      
      if (env.TWITTERAPI_IO_KEY && xPosts.length > 0) {
        try {
          const xRows = await fetchXMetrics(env, xPosts);
          rowsWritten += xRows;
          console.log(`[Cron] X: wrote ${xRows} rows`);
        } catch (err) {
          console.error("[Cron] X fetch failed:", err);
          status = "partial";
          message += "X fetch failed. ";
        }
      }
      
      message = message || `Fetched metrics for ${rowsWritten} video/platform combinations`;
      
    } catch (err) {
      console.error("[Cron] Ingestion failed:", err);
      status = "error";
      message = err instanceof Error ? err.message : "Unknown error";
    }
    
    await logIngestionRun(env.DB, "youtube", status, rowsWritten, message);
  },
  
  async fetch(request: Request, env: Env): Promise<Response> {
    return new Response("This worker only responds to scheduled events.", { status: 200 });
  },
};

async function getPostedVideos(db: D1Database): Promise<PlatformPost[]> {
  const result = await db.prepare(
    `SELECT video_slug, platform, language, external_id
     FROM platform_posts
     WHERE status = 'posted' AND external_id IS NOT NULL`
  ).all<PlatformPost>();
  
  return result.results;
}

async function fetchYouTubeMetrics(env: Env, posts: PlatformPost[]): Promise<number> {
  const videoIds = posts.map(p => p.external_id).filter(Boolean);
  if (videoIds.length === 0) return 0;
  
  const batchSize = 50;
  let rowsWritten = 0;
  const today = new Date().toISOString().split("T")[0];
  
  for (let i = 0; i < videoIds.length; i += batchSize) {
    const batch = videoIds.slice(i, i + batchSize);
    const ids = batch.join(",");
    
    const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${ids}&key=${env.YOUTUBE_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }
    
    const data = await response.json() as YouTubeResponse;
    
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
  }
  
  return rowsWritten;
}

async function fetchXMetrics(env: Env, posts: PlatformPost[]): Promise<number> {
  let rowsWritten = 0;
  const today = new Date().toISOString().split("T")[0];
  
  for (const post of posts) {
    if (!post.external_id) continue;
    
    try {
      const url = `https://api.twitterapi.io/twitter/tweets?ids=${post.external_id}`;
      const response = await fetch(url, {
        headers: {
          "X-API-Key": env.TWITTERAPI_IO_KEY!,
        },
      });
      
      if (!response.ok) {
        console.error(`[X] Failed to fetch metrics for ${post.external_id}: ${response.status}`);
        continue;
      }
      
      const data = await response.json() as XMetrics;
      const metrics = data.data?.public_metrics;
      
      if (!metrics) continue;
      
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
          post.video_slug,
          "x",
          post.language,
          today,
          metrics.impression_count ?? 0,
          metrics.like_count ?? 0,
          metrics.reply_count ?? 0,
          (metrics.retweet_count ?? 0) + (metrics.quote_count ?? 0),
          JSON.stringify(metrics)
        )
        .run();
      
      rowsWritten++;
    } catch (err) {
      console.error(`[X] Error fetching metrics for ${post.external_id}:`, err);
    }
  }
  
  return rowsWritten;
}

async function logIngestionRun(
  db: D1Database,
  source: string,
  status: string,
  rowsWritten: number,
  message: string
): Promise<void> {
  try {
    await db.prepare(
      `INSERT INTO ingestion_runs (source, status, rows_written, message, ran_at)
       VALUES (?1, ?2, ?3, ?4, datetime('now'))`
    )
      .bind(source, status, rowsWritten, message)
      .run();
  } catch (err) {
    console.error("[Cron] Failed to log ingestion run:", err);
  }
}
