export const SITE_URL = "https://finalbattleiran.org";

export const SITE_NAME = "Final Battle Iran";

/**
 * External "impulse donation" destination. This is a plain outbound link —
 * the project takes no payment details itself for donations.
 */
export const DONATE_LINKS = {
  buyMeACoffee: "https://buymeacoffee.com/seeuinfreeiran",
} as const;

/**
 * Feature switches for the launch. Each starts OFF so the site can ship while
 * its backend/content is still placeholder: anything not ready renders grayed
 * out and disabled ("Soon") instead of pretending to work. Flip a flag to true
 * once it is wired up:
 *   - newsletter: the D1 `subscribers` database is created + bound (`DB`).
 *   - shop:       Stripe + Printify keys are set and real products exist.
 *   - donations:  the real Buy Me a Coffee URL above is filled in.
 */
export const FEATURES = {
  newsletter: false,
  shop: false,
  donations: true,
} as const;

/**
 * Supported locales. `en` is the default and served at the root; every other
 * locale is served under its own `/<locale>/` prefix. Add a locale here, add a
 * strings block in `src/i18n/ui.ts`, and mirror the pages under `src/pages/<locale>/`.
 */
export const LOCALES = ["en", "fa"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Locales that render right-to-left. */
export const RTL_LOCALES: readonly Locale[] = ["fa"];

/**
 * Optional origin for self-hosted video files — typically a Cloudflare R2 public
 * bucket (e.g. `https://videos.finalbattleiran.org`). When set, root-relative
 * `videoSrc` paths are served from here so the large media files never live in
 * the git repo or the Pages deploy. Empty in local dev, where the files in
 * `public/videos/` are served directly by the dev server.
 */
export const VIDEO_BASE_URL =
  import.meta.env.PUBLIC_VIDEO_BASE_URL ??
  (import.meta.env.PROD ? "https://videos.finalbattleiran.org" : "");

/**
 * Resolve a `videoSrc` to the URL the browser should load. Absolute URLs pass
 * through unchanged; root-relative paths get prefixed with `VIDEO_BASE_URL`
 * when it is configured.
 */
export function resolveVideoSrc(src: string): string {
  if (/^https?:\/\//.test(src)) return src;
  return VIDEO_BASE_URL ? `${VIDEO_BASE_URL.replace(/\/$/, "")}${src}` : src;
}

/** Absolute URL form of a `videoSrc`, for social/OpenGraph metadata. */
export function absoluteVideoUrl(src: string): string {
  return new URL(resolveVideoSrc(src), SITE_URL).href;
}
