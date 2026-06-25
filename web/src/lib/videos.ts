import { getCollection, type CollectionEntry } from "astro:content";
import type { Locale } from "@/consts";

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
    youtube: ok(platforms?.youtube),
  };
}

/** Whether a video has at least one real (non-placeholder) platform link. */
export function hasShareLinks(platforms?: Platforms): boolean {
  const p = shareablePlatforms(platforms);
  return Boolean(p.x || p.instagram || p.youtube);
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
    .filter((entry) => Boolean(getVariant(entry, lang)))
    .sort(compareSeriesOrder);
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
