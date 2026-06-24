export const SITE_URL = "https://finalbattleiran.org";

export const SITE_NAME = "Final Battle Iran";

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
 * Cloudflare Stream customer subdomain (e.g. `customer-xxxxxxxx`). Pulled from a
 * public env var so it can be swapped without code changes. Falls back to a
 * placeholder during local development.
 */
export const STREAM_CUSTOMER_SUBDOMAIN =
  import.meta.env.PUBLIC_STREAM_CUSTOMER_SUBDOMAIN ?? "customer-XXXX";

/** Build the Cloudflare Stream iframe embed URL for a given Stream UID. */
export function streamIframeUrl(
  streamId: string,
  opts: { autoplay?: boolean; muted?: boolean; controls?: boolean } = {},
): string {
  const { autoplay = false, muted = false, controls = true } = opts;
  const params = new URLSearchParams({
    autoplay: String(autoplay),
    muted: String(muted),
    controls: String(controls),
  });
  return `https://${STREAM_CUSTOMER_SUBDOMAIN}.cloudflarestream.com/${streamId}/iframe?${params.toString()}`;
}
