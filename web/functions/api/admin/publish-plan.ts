/**
 * GET /api/admin/publish-plan?slug=<video-slug>
 * Returns generated copy for all platforms and applicable languages.
 * LOCAL-ONLY: Guarded by ADMIN_ENABLED env var.
 */

import { jsonResponse, type D1Database } from "../_lib";
import videoMap from "../_videos.json";

interface Env {
  DB?: D1Database;
  ADMIN_ENABLED?: string;
}

interface VideoMapEntry {
  slug: string;
  languages: string[];
  title: { en: string; fa?: string };
  description: { en?: string; fa?: string };
}

type VideoMap = Record<string, VideoMapEntry>;

const VIDEOS = videoMap as VideoMap;

const SITE_URL = "https://finalbattle.video";

const HASHTAGS = {
  en: ["#Iran", "#IPP", "#LionAndSun", "#FreeIran", "#Democracy"],
  fa: ["#ایران", "#شیروخورشید", "#آزادی", "#دموکراسی", "#IPP"],
};

function withUtmParams(
  baseUrl: string,
  platform: string,
  language: string
): string {
  const url = new URL(baseUrl);
  url.searchParams.set("utm_source", platform);
  url.searchParams.set("utm_medium", "repost");
  url.searchParams.set("utm_campaign", "video_share");
  url.searchParams.set("utm_content", language);
  return url.href;
}

function getVideoUrl(slug: string, language: string): string {
  const path = language === "fa" ? `/fa/videos/${slug}` : `/videos/${slug}`;
  return `${SITE_URL}${path}`;
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength).replace(/\s+\S*$/, "");
  return truncated + "…";
}

function generateCopy(video: VideoMapEntry, language: "en" | "fa") {
  const title = language === "fa" ? (video.title.fa ?? video.title.en) : video.title.en;
  const description = language === "fa" 
    ? (video.description.fa ?? video.description.en ?? "")
    : (video.description.en ?? "");
  const hashtags = HASHTAGS[language];

  const platforms = ["x", "youtube", "linkedin"] as const;
  const copy: Record<string, unknown> = {};

  for (const platform of platforms) {
    const url = withUtmParams(getVideoUrl(video.slug, language), platform, language);

    if (platform === "x") {
      const hashtagStr = hashtags.slice(0, 3).join(" ");
      const maxTextLength = 280 - 23 - hashtagStr.length - 4;
      const text = `${title}\n\n${truncate(description, maxTextLength - title.length - 2)}\n\n${hashtagStr}\n${url}`;
      copy.x = { text, url };
    } else if (platform === "youtube") {
      copy.youtube = {
        title,
        description: `${description}\n\n🔗 ${url}\n\n${hashtags.join(" ")}`,
      };
    } else if (platform === "linkedin") {
      copy.linkedin = {
        text: `🎬 ${title}\n\n${description}\n\n${hashtags.slice(0, 4).join(" ")}\n\n🔗 ${url}`,
        url,
      };
    }
  }

  return copy;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  if (env.ADMIN_ENABLED !== "true") {
    return jsonResponse({ error: "Admin not enabled" }, 403);
  }

  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");

  if (!slug) {
    return jsonResponse({ error: "Missing slug parameter" }, 400);
  }

  const video = VIDEOS[slug];
  if (!video) {
    return jsonResponse({ error: `Video not found: ${slug}` }, 404);
  }

  const result: Record<string, unknown> = {
    slug: video.slug,
    languages: video.languages,
    copy: {},
  };

  for (const lang of video.languages) {
    if (lang === "en" || lang === "fa") {
      (result.copy as Record<string, unknown>)[lang] = generateCopy(video, lang);
    }
  }

  // Also fetch post status from D1 if available
  if (env.DB) {
    try {
      const posts = await env.DB.prepare(
        `SELECT platform, language, status, external_url, posted_at
         FROM platform_posts
         WHERE video_slug = ?`
      )
        .bind(slug)
        .all<{
          platform: string;
          language: string;
          status: string;
          external_url: string;
          posted_at: string;
        }>();

      result.posts = posts.results;
    } catch {
      result.posts = [];
    }
  }

  return jsonResponse(result, 200);
};
