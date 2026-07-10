import { DEFAULT_LOCALE, LOCALES, RTL_LOCALES, type Locale } from "@/consts";
import { ui, type UIKey } from "./ui";

/** Narrow an arbitrary string to a supported Locale, falling back to default. */
export function asLocale(value: string | undefined): Locale {
  return LOCALES.includes(value as Locale) ? (value as Locale) : DEFAULT_LOCALE;
}

/** Derive the active locale from a request/page URL pathname. */
export function getLangFromUrl(url: URL): Locale {
  const [, maybeLocale] = url.pathname.split("/");
  return asLocale(maybeLocale);
}

/** Returns a translator function bound to a locale, with EN fallback per key. */
export function useTranslations(lang: Locale) {
  return function t(key: UIKey): string {
    return ui[lang][key] ?? ui[DEFAULT_LOCALE][key];
  };
}

/** Text direction for a locale. */
export function dir(lang: Locale): "rtl" | "ltr" {
  return RTL_LOCALES.includes(lang) ? "rtl" : "ltr";
}

export type LinkMarker = "fund" | "launch" | "shop";

/** Replace `{fund}`, `{launch}`, and `{shop}` markers with localized anchor tags. */
export function linkify(
  text: string,
  links: Partial<Record<LinkMarker, { href: string; label: string }>>,
  className = "prose-link",
): string {
  return (Object.entries(links) as [LinkMarker, { href: string; label: string }][])
    .reduce((acc, [key, { href, label }]) => {
      const safeHref = href.replace(/"/g, "&quot;");
      const safeLabel = label
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return acc.replaceAll(
        `{${key}}`,
        `<a href="${safeHref}" class="${className}">${safeLabel}</a>`,
      );
    }, text);
}

/**
 * Build a localized path. The default locale lives at the root (no prefix);
 * all other locales are prefixed with `/<locale>`.
 *
 *   localizedPath("/videos", "en") -> "/videos"
 *   localizedPath("/videos", "fa") -> "/fa/videos"
 */
export function localizedPath(path: string, lang: Locale): string {
  const clean = "/" + path.replace(/^\/+/, "");
  if (lang === DEFAULT_LOCALE) return clean === "/" ? "/" : clean;
  return clean === "/" ? `/${lang}/` : `/${lang}${clean}`;
}

/**
 * Given the current page URL, return the equivalent path in another locale by
 * swapping the locale prefix. Used by the language switcher.
 */
export function switchLocalePath(url: URL, target: Locale): string {
  const segments = url.pathname.split("/").filter(Boolean);
  // Drop a leading locale prefix if present.
  if (LOCALES.includes(segments[0] as Locale) && segments[0] !== DEFAULT_LOCALE) {
    segments.shift();
  }
  const basePath = "/" + segments.join("/");
  return localizedPath(basePath, target);
}
