/**
 * GET /api/video-platforms?slug=<video-slug>&lang=<en|fa>
 * Returns confirmed platform post URLs for a video.
 * Public endpoint - no auth required.
 */

import { jsonResponse, type D1Database } from "./_lib";

interface Env {
  DB?: D1Database;
}

interface PlatformPost {
  platform: string;
  language: string;
  external_url: string;
  status: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  const lang = url.searchParams.get("lang") ?? "en";

  if (!slug) {
    return jsonResponse({ error: "Missing slug parameter" }, 400);
  }

  if (!env.DB) {
    return jsonResponse({ platforms: {} }, 200);
  }

  try {
    // Exclude TikTok - no longer supported
    const posts = await env.DB.prepare(
      `SELECT platform, external_url
       FROM platform_posts
       WHERE video_slug = ? AND language = ? AND status = 'posted' AND external_url IS NOT NULL
         AND platform != 'tiktok'`
    )
      .bind(slug, lang)
      .all<{ platform: string; external_url: string }>();

    const platforms: Record<string, string> = {};
    for (const post of posts.results ?? []) {
      platforms[post.platform] = post.external_url;
    }

    return jsonResponse({ slug, lang, platforms }, 200);
  } catch (err) {
    console.error("Error fetching video platforms:", err);
    return jsonResponse({ platforms: {} }, 200);
  }
};
