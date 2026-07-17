/**
 * Platform-specific copy generation for bilingual video publishing.
 * Generates post copy for X, YouTube, LinkedIn, and Instagram in both EN and FA.
 */

import type { Locale } from "@/consts";
import type { VideoEntry, VideoVariant } from "@/lib/videos";
import { getVariant } from "@/lib/videos";

export type Platform = "x" | "youtube" | "linkedin" | "instagram";

export const PLATFORMS: Platform[] = ["x", "youtube", "linkedin", "instagram"];

export interface XCopy {
  text: string;
  url: string;
}

export interface YouTubeCopy {
  title: string;
  description: string;
}

export interface LinkedInCopy {
  text: string;
  url: string;
}

export interface InstagramCopy {
  text: string;
  url: string;
}

export interface PlatformCopy {
  x: XCopy;
  youtube: YouTubeCopy;
  linkedin: LinkedInCopy;
  instagram: InstagramCopy;
}

interface ChannelHandles {
  en: string;
  fa: string;
}

const CHANNEL_HANDLES: Record<Platform, ChannelHandles> = {
  x: { en: "seeuinfreeiran", fa: "ta_didar_azadi" },
  youtube: { en: "seeuinfreeiran", fa: "ta_didar_azadi" },
  linkedin: { en: "final-battle-for-iran-39585941a", fa: "ta_didar_azadi" },
  instagram: { en: "seeuinfreeiran", fa: "ta_didar_azadi" },
};

const HASHTAGS = {
  en: ["#FreedomMovement", "#IPP", "#LionAndSun", "#Democracy", "#Liberty"],
  fa: ["#آزادی", "#شیروخورشید", "#دموکراسی", "#میهن", "#IPP"],
};

/**
 * Sanitize text to avoid triggering platform filters.
 * Replaces sensitive words with neutral alternatives.
 */
function sanitizeText(text: string, language: Locale): string {
  if (language === "fa") {
    return text
      .replace(/ایران/g, "میهن")
      .replace(/ایرانی/g, "میهنی");
  }
  return text
    .replace(/\bIran\b/gi, "the nation")
    .replace(/\bIranian\b/gi, "our")
    .replace(/\bIranians\b/gi, "the people");
}

const SITE_URL = "https://finalbattle.video";

/**
 * Generate a URL with UTM parameters for attribution tracking.
 */
function withUtmParams(
  baseUrl: string,
  platform: Platform,
  language: Locale
): string {
  const url = new URL(baseUrl);
  url.searchParams.set("utm_source", platform);
  url.searchParams.set("utm_medium", "repost");
  url.searchParams.set("utm_campaign", "video_share");
  url.searchParams.set("utm_content", language);
  return url.href;
}

/**
 * Get the video page URL for a given slug.
 */
function getVideoUrl(slug: string, language: Locale): string {
  const path = language === "fa" ? `/fa/videos/${slug}` : `/videos/${slug}`;
  return `${SITE_URL}${path}`;
}

/**
 * Truncate text to a maximum length, preserving word boundaries.
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength).replace(/\s+\S*$/, "");
  return truncated + "…";
}

/**
 * Get the CTA line for visiting the site.
 */
function getVisitCta(language: Locale): string {
  const url = language === "fa" 
    ? "https://finalbattle.video/fa"
    : "https://finalbattle.video";
  
  return language === "fa"
    ? `برای اطلاعات بیشتر به ${url} مراجعه کنید.`
    : `Visit ${url} for more information.`;
}

/**
 * Generate X (Twitter) post copy.
 * Short and punchy - just title + hashtags.
 * No external links (X downranks them).
 */
function generateXCopy(
  variant: VideoVariant,
  slug: string,
  language: Locale
): XCopy {
  const hashtags = HASHTAGS[language].slice(0, 3).join(" ");
  const title = sanitizeText(variant.title, language);
  
  const fullText = `${title}\n\n${hashtags}`;
  
  // URL kept for reference but not included in post text
  const url = withUtmParams(getVideoUrl(slug, language), "x", language);
  
  return { text: fullText, url };
}

/**
 * Generate YouTube video metadata.
 */
function generateYouTubeCopy(
  variant: VideoVariant,
  slug: string,
  language: Locale
): YouTubeCopy {
  const url = withUtmParams(getVideoUrl(slug, language), "youtube", language);
  const hashtags = HASHTAGS[language].join(" ");
  const visitCta = getVisitCta(language);
  
  const title = sanitizeText(variant.title, language);
  
  const script = sanitizeText(variant.script ?? variant.description ?? "", language);
  const context = sanitizeText(variant.context ?? "", language);
  const desc = sanitizeText(variant.description ?? "", language);
  
  let description: string;
  if (language === "fa") {
    description = `${visitCta}\n\n${desc}\n\n${script}\n\n${context ? `📖 پیشینه:\n${context}\n\n` : ""}🔗 ${url}\n\n${hashtags}`;
  } else {
    description = `${visitCta}\n\n${desc}\n\n${script}\n\n${context ? `📖 Background:\n${context}\n\n` : ""}🔗 ${url}\n\n${hashtags}`;
  }
  
  return { title, description };
}

/**
 * Generate LinkedIn post copy.
 * LinkedIn supports longer posts; include more context.
 */
function generateLinkedInCopy(
  variant: VideoVariant,
  slug: string,
  language: Locale
): LinkedInCopy {
  const url = withUtmParams(getVideoUrl(slug, language), "linkedin", language);
  const hashtags = HASHTAGS[language].slice(0, 4).join(" ");
  const visitCta = getVisitCta(language);
  
  const title = sanitizeText(variant.title, language);
  const description = sanitizeText(variant.description ?? "", language);
  const script = sanitizeText(variant.script ?? "", language);
  
  let text: string;
  if (language === "fa") {
    text = `${visitCta}\n\n🎬 ${title}\n\n${description}\n\n${truncate(script, 500)}\n\n${hashtags}`;
  } else {
    text = `${visitCta}\n\n🎬 ${title}\n\n${description}\n\n${truncate(script, 500)}\n\n${hashtags}`;
  }
  
  return { text, url };
}

/**
 * Generate Instagram post copy.
 * Short caption with hashtags - no clickable links in Instagram posts.
 */
function generateInstagramCopy(
  variant: VideoVariant,
  slug: string,
  language: Locale
): InstagramCopy {
  const hashtags = HASHTAGS[language].slice(0, 4).join(" ");
  const title = sanitizeText(variant.title, language);
  const description = sanitizeText(variant.description ?? "", language);

  const text = language === "fa"
    ? `🎬 ${title}\n\n${truncate(description, 200)}\n\n${hashtags}`
    : `🎬 ${title}\n\n${truncate(description, 200)}\n\n${hashtags}`;

  const url = withUtmParams(getVideoUrl(slug, language), "instagram", language);

  return { text, url };
}

/**
 * Generate platform-specific copy for a video in a given language.
 * Returns undefined if the video doesn't have a variant for that language.
 */
export function generatePlatformCopy(
  entry: VideoEntry,
  language: Locale
): PlatformCopy | undefined {
  const variant = getVariant(entry, language);
  if (!variant) return undefined;
  
  const slug = entry.id;
  
  return {
    x: generateXCopy(variant, slug, language),
    youtube: generateYouTubeCopy(variant, slug, language),
    linkedin: generateLinkedInCopy(variant, slug, language),
    instagram: generateInstagramCopy(variant, slug, language),
  };
}

/**
 * Get all applicable languages for a video based on available variants.
 */
export function getVideoLanguages(entry: VideoEntry): Locale[] {
  const languages: Locale[] = ["en"];
  if (entry.data.languages.fa) {
    languages.push("fa");
  }
  return languages;
}

/**
 * Generate copy for all platforms and applicable languages.
 */
export function generateAllPlatformCopy(
  entry: VideoEntry
): Record<Locale, PlatformCopy | undefined> {
  return {
    en: generatePlatformCopy(entry, "en"),
    fa: generatePlatformCopy(entry, "fa"),
  };
}

/**
 * Get the channel handle for a platform and language.
 */
export function getChannelHandle(platform: Platform, language: Locale): string {
  return CHANNEL_HANDLES[platform][language];
}

/**
 * Get the compose/upload URL for a platform.
 * These URLs open the platform's compose interface for posting.
 */
export function getComposeUrl(platform: Platform, language: Locale): string {
  const handle = getChannelHandle(platform, language);
  
  switch (platform) {
    case "x":
      return "https://x.com/compose/tweet";
    case "youtube":
      return "https://studio.youtube.com/channel/upload";
    case "linkedin":
      return "https://www.linkedin.com/feed/?shareActive=true";
    case "instagram":
      return `https://www.instagram.com/${handle}/`;
    default:
      return "";
  }
}

/**
 * Get the channel URL for a platform and language.
 */
export function getChannelUrl(platform: Platform, language: Locale): string {
  const handle = getChannelHandle(platform, language);
  
  switch (platform) {
    case "x":
      return `https://x.com/${handle}`;
    case "youtube":
      return `https://youtube.com/@${handle}`;
    case "linkedin":
      return `https://linkedin.com/company/${handle}`;
    case "instagram":
      return `https://instagram.com/${handle}`;
    default:
      return "";
  }
}
