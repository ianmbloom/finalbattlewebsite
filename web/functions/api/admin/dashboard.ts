/**
 * GET /api/admin/dashboard
 * Returns dashboard statistics and EN vs FA comparison data.
 * LOCAL-ONLY: Guarded by ADMIN_ENABLED env var.
 */

import { jsonResponse, type D1Database } from "../_lib";

interface Env {
  DB?: D1Database;
  ADMIN_ENABLED?: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;

  if (env.ADMIN_ENABLED !== "true") {
    return jsonResponse({ error: "Admin not enabled" }, 403);
  }

  if (!env.DB) {
    return jsonResponse({ error: "Database not configured" }, 500);
  }

  try {
    const [stats, comparison, revenue, topPerformers, recentRuns, subscriberGrowth] = await Promise.all([
      getDashboardStats(env.DB),
      getLanguageComparison(env.DB),
      getRevenueByVideo(env.DB),
      getTopPerformers(env.DB),
      getRecentIngestionRuns(env.DB),
      getSubscriberGrowth(env.DB),
    ]);

    return jsonResponse({
      stats,
      comparison,
      revenue,
      topPerformers,
      recentRuns,
      subscriberGrowth,
    }, 200);
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    return jsonResponse({ error: "Database error" }, 500);
  }
};

async function getDashboardStats(db: D1Database) {
  const [videos, boosts, revenue, pending, complete, subEN, subFA] = await Promise.all([
    db.prepare(`SELECT COUNT(DISTINCT video_slug) as count FROM platform_posts`).first<{ count: number }>(),
    db.prepare(`SELECT COALESCE(SUM(boost_count), 0) as total FROM video_boosts`).first<{ total: number }>(),
    db.prepare(`SELECT COALESCE(SUM(total_cents), 0) as total FROM video_boosts`).first<{ total: number }>(),
    db.prepare(`SELECT COUNT(*) as count FROM platform_posts WHERE status = 'pending'`).first<{ count: number }>(),
    db.prepare(`SELECT COUNT(*) as count FROM platform_posts WHERE status = 'posted'`).first<{ count: number }>(),
    db.prepare(`SELECT COUNT(*) as count FROM subscribers WHERE locale = 'en'`).first<{ count: number }>(),
    db.prepare(`SELECT COUNT(*) as count FROM subscribers WHERE locale = 'fa'`).first<{ count: number }>(),
  ]);

  return {
    totalVideos: videos?.count ?? 0,
    totalBoosts: boosts?.total ?? 0,
    totalRevenueCents: revenue?.total ?? 0,
    postsPending: pending?.count ?? 0,
    postsComplete: complete?.count ?? 0,
    subscribersEN: subEN?.count ?? 0,
    subscribersFA: subFA?.count ?? 0,
  };
}

async function getLanguageComparison(db: D1Database) {
  const result = await db.prepare(`
    SELECT 
      video_slug,
      language,
      SUM(views) as total_views,
      SUM(likes) as total_likes,
      SUM(comments) as total_comments,
      SUM(shares) as total_shares
    FROM video_platform_metrics
    GROUP BY video_slug, language
    ORDER BY video_slug, language
  `).all<{
    video_slug: string;
    language: string;
    total_views: number;
    total_likes: number;
    total_comments: number;
    total_shares: number;
  }>();

  interface MetricTotals {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  }

  const byVideo = new Map<string, { videoSlug: string; en: MetricTotals | null; fa: MetricTotals | null }>();

  for (const row of result.results) {
    if (!byVideo.has(row.video_slug)) {
      byVideo.set(row.video_slug, { videoSlug: row.video_slug, en: null, fa: null });
    }
    const entry = byVideo.get(row.video_slug)!;
    const metrics: MetricTotals = {
      views: row.total_views ?? 0,
      likes: row.total_likes ?? 0,
      comments: row.total_comments ?? 0,
      shares: row.total_shares ?? 0,
    };
    if (row.language === "en") entry.en = metrics;
    if (row.language === "fa") entry.fa = metrics;
  }

  return Array.from(byVideo.values());
}

async function getRevenueByVideo(db: D1Database) {
  const result = await db.prepare(`
    SELECT video_slug, boost_count, total_cents
    FROM video_boosts
    ORDER BY total_cents DESC
    LIMIT 20
  `).all<{
    video_slug: string;
    boost_count: number;
    total_cents: number;
  }>();

  return result.results.map(row => ({
    videoSlug: row.video_slug,
    totalCents: row.total_cents,
    boostCount: row.boost_count,
  }));
}

async function getTopPerformers(db: D1Database) {
  const result = await db.prepare(`
    SELECT 
      video_slug,
      language,
      SUM(views) as total_views,
      SUM(likes) as total_likes,
      SUM(comments) as total_comments,
      SUM(shares) as total_shares
    FROM video_platform_metrics
    GROUP BY video_slug, language
    ORDER BY (SUM(views) + SUM(likes) * 10 + SUM(comments) * 20 + SUM(shares) * 30) DESC
    LIMIT 10
  `).all<{
    video_slug: string;
    language: string;
    total_views: number;
    total_likes: number;
    total_comments: number;
    total_shares: number;
  }>();

  return result.results.map(row => ({
    videoSlug: row.video_slug,
    language: row.language,
    totalViews: row.total_views ?? 0,
    totalLikes: row.total_likes ?? 0,
    totalComments: row.total_comments ?? 0,
    totalShares: row.total_shares ?? 0,
  }));
}

async function getRecentIngestionRuns(db: D1Database) {
  const result = await db.prepare(`
    SELECT id, source, status, rows_written, message, ran_at
    FROM ingestion_runs
    ORDER BY ran_at DESC
    LIMIT 10
  `).all<{
    id: number;
    source: string;
    status: string;
    rows_written: number;
    message: string;
    ran_at: string;
  }>();

  return result.results.map(row => ({
    id: row.id,
    source: row.source,
    status: row.status,
    rowsWritten: row.rows_written,
    message: row.message ?? "",
    ranAt: row.ran_at,
  }));
}

async function getSubscriberGrowth(db: D1Database) {
  const result = await db.prepare(`
    SELECT 
      DATE(created_at) as date,
      SUM(CASE WHEN locale = 'en' THEN 1 ELSE 0 END) as en_count,
      SUM(CASE WHEN locale = 'fa' THEN 1 ELSE 0 END) as fa_count
    FROM subscribers
    WHERE created_at >= DATE('now', '-30 days')
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `).all<{
    date: string;
    en_count: number;
    fa_count: number;
  }>();

  return result.results.map(row => ({
    date: row.date,
    en: row.en_count ?? 0,
    fa: row.fa_count ?? 0,
  }));
}
