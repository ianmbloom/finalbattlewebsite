import { getCollection, type CollectionEntry } from "astro:content";
import type { Locale } from "@/consts";

export type VideoEntry = CollectionEntry<"videos">;
export type VideoVariant = VideoEntry["data"]["languages"]["en"];

/** The language variant for a locale, or undefined if not yet translated. */
export function getVariant(
  entry: VideoEntry,
  lang: Locale,
): VideoVariant | undefined {
  return entry.data.languages[lang];
}

/**
 * All videos that have a variant for the given locale, sorted newest first.
 * Videos without a translation for `lang` are omitted so a locale can lag
 * behind without producing broken pages.
 */
export async function getVideosForLocale(lang: Locale): Promise<VideoEntry[]> {
  const all = await getCollection("videos");
  return all
    .filter((entry) => Boolean(getVariant(entry, lang)))
    .sort(
      (a, b) =>
        b.data.publishedAt.getTime() - a.data.publishedAt.getTime(),
    );
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

/** Format a duration in seconds as M:SS. */
export function formatDuration(seconds: number | undefined): string {
  if (!seconds || seconds <= 0) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
