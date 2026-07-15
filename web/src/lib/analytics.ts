/**
 * Business intelligence computations for the admin dashboard.
 * Reads from D1 and computes revenue, engagement, and comparative metrics.
 */

import type { D1Database } from "@/lib/platforms/copy-templates";

export interface VideoMetricsSummary {
  videoSlug: string;
  language: string;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  platforms: string[];
}

export interface LanguageComparison {
  videoSlug: string;
  en: MetricTotals | null;
  fa: MetricTotals | null;
}

export interface MetricTotals {
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface RevenueByVideo {
  videoSlug: string;
  totalCents: number;
  boostCount: number;
}

export interface DashboardStats {
  totalVideos: number;
  totalBoosts: number;
  totalRevenueCents: number;
  postsPending: number;
  postsComplete: number;
  subscribersEN: number;
  subscribersFA: number;
}

export interface IngestionRun {
  id: number;
  source: string;
  status: string;
  rowsWritten: number;
  message: string;
  ranAt: string;
}

/**
 * Get overall dashboard statistics.
 */
export async function getDashboardStats(db: D1Database): Promise<DashboardStats> {
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

/**
 * Get EN vs FA performance comparison for all videos.
 */
export async function getLanguageComparison(db: D1Database): Promise<LanguageComparison[]> {
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

  const byVideo = new Map<string, LanguageComparison>();

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

/**
 * Get revenue attribution by video.
 */
export async function getRevenueByVideo(db: D1Database): Promise<RevenueByVideo[]> {
  const result = await db.prepare(`
    SELECT video_slug, boost_count, total_cents
    FROM video_boosts
    ORDER BY total_cents DESC
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

/**
 * Get top performing videos by engagement (views + likes + comments + shares).
 */
export async function getTopPerformers(db: D1Database, limit = 10): Promise<VideoMetricsSummary[]> {
  const result = await db.prepare(`
    SELECT 
      video_slug,
      language,
      SUM(views) as total_views,
      SUM(likes) as total_likes,
      SUM(comments) as total_comments,
      SUM(shares) as total_shares,
      GROUP_CONCAT(DISTINCT platform) as platforms
    FROM video_platform_metrics
    GROUP BY video_slug, language
    ORDER BY (SUM(views) + SUM(likes) * 10 + SUM(comments) * 20 + SUM(shares) * 30) DESC
    LIMIT ?
  `).bind(limit).all<{
    video_slug: string;
    language: string;
    total_views: number;
    total_likes: number;
    total_comments: number;
    total_shares: number;
    platforms: string;
  }>();

  return result.results.map(row => ({
    videoSlug: row.video_slug,
    language: row.language,
    totalViews: row.total_views ?? 0,
    totalLikes: row.total_likes ?? 0,
    totalComments: row.total_comments ?? 0,
    totalShares: row.total_shares ?? 0,
    platforms: (row.platforms ?? "").split(",").filter(Boolean),
  }));
}

/**
 * Get recent ingestion runs for monitoring.
 */
export async function getRecentIngestionRuns(db: D1Database, limit = 10): Promise<IngestionRun[]> {
  const result = await db.prepare(`
    SELECT id, source, status, rows_written, message, ran_at
    FROM ingestion_runs
    ORDER BY ran_at DESC
    LIMIT ?
  `).bind(limit).all<{
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

/**
 * Calculate Marketing Efficiency Ratio (MER).
 * MER = Total Revenue / Total Marketing Spend
 */
export async function calculateMER(db: D1Database): Promise<number | null> {
  const [revenue, spend] = await Promise.all([
    db.prepare(`SELECT COALESCE(SUM(total_cents), 0) as total FROM video_boosts`).first<{ total: number }>(),
    db.prepare(`SELECT COALESCE(SUM(amount_cents), 0) as total FROM boost_transactions WHERE allocated = 1`).first<{ total: number }>(),
  ]);

  const totalRevenue = revenue?.total ?? 0;
  const totalSpend = spend?.total ?? 0;

  if (totalSpend === 0) return null;
  return totalRevenue / totalSpend;
}

/**
 * Get subscriber growth over time.
 */
export async function getSubscriberGrowth(db: D1Database, days = 30): Promise<{ date: string; en: number; fa: number }[]> {
  const result = await db.prepare(`
    SELECT 
      DATE(created_at) as date,
      SUM(CASE WHEN locale = 'en' THEN 1 ELSE 0 END) as en_count,
      SUM(CASE WHEN locale = 'fa' THEN 1 ELSE 0 END) as fa_count
    FROM subscribers
    WHERE created_at >= DATE('now', '-' || ? || ' days')
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `).bind(days).all<{
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
