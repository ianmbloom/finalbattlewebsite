import { getCollection, type CollectionEntry } from "astro:content";
import type { Locale } from "@/consts";
import { DEFAULT_BOOST_TIER, type VideoBoostTier } from "@/config/boost";

export type VideoEntry = CollectionEntry<"videos">;
export type VideoVariant = VideoEntry["data"]["languages"]["en"];
export type Category = VideoEntry["data"]["category"];

/** Flag-color coding for the three arrow categories (Lion & Sun palette). */
export const CATEGORY_COLOR: Record<Category, string> = {
  truth: "var(--color-emerald)",
  myth: "var(--color-crimson)",
  project: "var(--color-gold)",
};

/** The language variant for a locale, or undefined if not yet translated. */
export function getVariant(
  entry: VideoEntry,
  lang: Locale,
): VideoVariant | undefined {
  return entry.data.languages[lang];
}

type Platforms = NonNullable<VideoVariant["platforms"]>;

/**
 * Platform links that are actually shareable: anything still set to a
 * `PLACEHOLDER` post URL is dropped so we never ship a dead share link. Once a
 * real post URL is filled in, that platform's share button lights up on its own.
 */
export function shareablePlatforms(platforms?: Platforms): Platforms {
  const ok = (url?: string) =>
    url && !url.includes("PLACEHOLDER") ? url : undefined;
  return {
    x: ok(platforms?.x),
    instagram: ok(platforms?.instagram),
    tiktok: ok(platforms?.tiktok),
    youtube: ok(platforms?.youtube),
    linkedin: ok(platforms?.linkedin),
  };
}

/** Whether a video has at least one real (non-placeholder) platform link. */
export function hasShareLinks(platforms?: Platforms): boolean {
  const p = shareablePlatforms(platforms);
  return Boolean(p.x || p.instagram || p.tiktok || p.youtube || p.linkedin);
}

/**
 * Tag a *site* URL with UTM params so we can attribute traffic that comes back
 * through Telegram shares and copied links. Native-platform reposts leave our
 * domain and can't be tagged, so this is only applied to the site page URL.
 */
export function withUtm(url: string, source: string): string {
  const u = new URL(url);
  u.searchParams.set("utm_source", source);
  u.searchParams.set("utm_medium", "repost");
  u.searchParams.set("utm_campaign", "video_share");
  return u.href;
}

/**
 * Hex-encode a string so sensitive substrings (e.g. social handles that still
 * contain the nation's name) never appear literally in the served HTML.
 * Hex uses only 0-9a-f, so those substrings can't occur in the output even by
 * chance. Links are rebuilt at runtime via `decodeHex` on the client.
 */
export function encodeHex(value: string): string {
  return Array.from(new TextEncoder().encode(value))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export type VideoFormat = VideoEntry["data"]["format"];

/** Short-form series clips vs. longer standalone statements. */
export function isLongForm(entry: VideoEntry): boolean {
  return entry.data.format === "long";
}

/**
 * A teaser film: listed in the library as a "coming soon" card (which opens the
 * email-capture popup) but with no playable detail page yet.
 */
export function isComingSoon(entry: VideoEntry): boolean {
  return entry.data.comingSoon;
}

/** Videos that have a real, playable detail page (excludes coming-soon teasers). */
export async function getPlayableVideosForLocale(
  lang: Locale,
): Promise<VideoEntry[]> {
  const videos = await getVideosForLocale(lang);
  return videos.filter((entry) => !isComingSoon(entry));
}

const warnedTiers = new Set<string>();

/**
 * Ad-safety tier for a video's Launch mechanic. An unflagged video defaults to
 * organic-only (tier 3, mechanic hidden) and warns once at build time so the
 * operator notices it needs classifying. The server enforces the same guard.
 */
export function getBoostTier(entry: VideoEntry): VideoBoostTier {
  const tier = entry.data.boostTier;
  if (tier == null) {
    if (!warnedTiers.has(entry.id)) {
      warnedTiers.add(entry.id);
      console.warn(
        `[boost] unflagged video: ${entry.id} -> defaulting to tier ${DEFAULT_BOOST_TIER}`,
      );
    }
    return DEFAULT_BOOST_TIER;
  }
  return tier;
}

/** Credit line under the title on a video page. */
export function getVideoCredit(
  variant: VideoVariant,
  narratedBy: string,
): string {
  return variant.creditLine ?? narratedBy;
}

/**
 * All videos that have a variant for the given locale, in series order.
 * Entries with an explicit `order` come first (ascending); the rest fall to the
 * end sorted newest-first. Videos without a translation for `lang` are omitted
 * so a locale can lag behind without producing broken pages.
 */
export async function getVideosForLocale(lang: Locale): Promise<VideoEntry[]> {
  const all = await getCollection("videos");
  return all
    .filter((entry) => import.meta.env.DEV || !entry.data.draft)
    .filter((entry) => Boolean(getVariant(entry, lang)))
    .sort(compareSeriesOrder);
}

/** Short-form series videos for a locale. */
export async function getShortVideosForLocale(
  lang: Locale,
): Promise<VideoEntry[]> {
  const videos = await getVideosForLocale(lang);
  return videos.filter((entry) => !isLongForm(entry));
}

/** Long-form statements and features for a locale. */
export async function getLongVideosForLocale(
  lang: Locale,
): Promise<VideoEntry[]> {
  const videos = await getVideosForLocale(lang);
  return videos.filter(isLongForm);
}

/** Series ordering: explicit `order` ascending, then newest `publishedAt`. */
function compareSeriesOrder(a: VideoEntry, b: VideoEntry): number {
  const ao = a.data.order;
  const bo = b.data.order;
  if (ao != null && bo != null) return ao - bo;
  if (ao != null) return -1;
  if (bo != null) return 1;
  return b.data.publishedAt.getTime() - a.data.publishedAt.getTime();
}

/** Featured videos for a locale (falls back to most recent if none flagged). */
export async function getFeaturedForLocale(
  lang: Locale,
  limit = 3,
): Promise<VideoEntry[]> {
  const videos = await getVideosForLocale(lang);
  const flagged = videos.filter((v) => v.data.featured);
  return (flagged.length > 0 ? flagged : videos).slice(0, limit);
}

/**
 * Short blurb for a card: the authored `description`, or a trimmed first
 * sentence of the script as a fallback so a card is never description-less.
 */
export function getBlurb(variant: VideoVariant, maxChars = 150): string {
  if (variant.description) return variant.description;
  const script = variant.script?.trim();
  if (!script) return "";
  const firstSentence = script.split(/(?<=[.!?])\s/)[0] ?? script;
  if (firstSentence.length <= maxChars) return firstSentence;
  return firstSentence.slice(0, maxChars).replace(/\s+\S*$/, "") + "…";
}

/** Format a duration in seconds as M:SS. */
export function formatDuration(seconds: number | undefined): string {
  if (!seconds || seconds <= 0) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
