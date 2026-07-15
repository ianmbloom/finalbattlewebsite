/**
 * Attribution tracking for ad campaigns.
 *
 * Captures twclid (X Click ID) and UTM parameters from the landing URL and
 * persists them in sessionStorage so they survive navigation across pages.
 * The checkout flow reads these values and passes them to the server for
 * storage in D1, enabling ROI measurement for X.com ad campaigns.
 */

const STORAGE_KEY = "fb_attribution";

export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  twclid?: string;
}

/**
 * Capture attribution parameters from the current URL and merge them into
 * sessionStorage. Call this on every page load (via BaseLayout) so that
 * landing page params are preserved as the user navigates.
 *
 * Only overwrites existing values if new ones are present in the URL —
 * this way the original landing attribution is retained even if the user
 * visits a page with different/no params later in the session.
 */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const incoming: Attribution = {};

  const twclid = params.get("twclid");
  const utmSource = params.get("utm_source");
  const utmMedium = params.get("utm_medium");
  const utmCampaign = params.get("utm_campaign");

  if (twclid) incoming.twclid = twclid;
  if (utmSource) incoming.utm_source = utmSource;
  if (utmMedium) incoming.utm_medium = utmMedium;
  if (utmCampaign) incoming.utm_campaign = utmCampaign;

  if (Object.keys(incoming).length === 0) return;

  const existing = getAttribution();
  const merged = { ...existing, ...incoming };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // sessionStorage may be unavailable (private browsing, etc.)
  }
}

/**
 * Retrieve stored attribution data. Returns an empty object if nothing is
 * stored or sessionStorage is unavailable.
 */
export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Attribution;
  } catch {
    return {};
  }
}
