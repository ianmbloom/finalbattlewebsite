/**
 * Cloudflare Pages Function: create a Stripe Checkout Session for a video "boost".
 *
 * A visitor buys paid reach on X for one specific video at a fixed tier. We
 * NEVER trust the client: the amount must be one of the server allowlist
 * (`BOOST.tiers`) and the slug must exist AND be launchable (tier 1 or 2) in
 * the build-time trusted video index (_videos.json). This is the authoritative
 * guard against launching an organic-only (tier 3) video.
 *
 * Returns `{ url }` (the hosted Stripe Checkout page) for the client to redirect
 * to. Reuses the SDK-free Stripe helpers in ../_lib (form-encoded fetch).
 */
import { jsonResponse, stripePost } from "../_lib";
import { BOOST } from "../../../src/config/boost";
import videoIndex from "../_videos.json";

interface Env {
  STRIPE_SECRET_KEY: string;
}

interface BoostBody {
  videoSlug?: unknown;
  amount?: unknown;
  locale?: unknown;
}

interface VideoIndexEntry {
  title: { en: string; fa: string };
  boostTier: 1 | 2 | 3;
}

const INDEX = videoIndex as Record<string, VideoIndexEntry>;

export const onRequestPost = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const { request, env } = context;

  if (!env.STRIPE_SECRET_KEY) {
    return jsonResponse({ error: "Checkout is not configured" }, 503);
  }

  let body: BoostBody;
  try {
    body = (await request.json()) as BoostBody;
  } catch {
    return jsonResponse({ error: "bad_json" }, 400);
  }

  const amount = typeof body.amount === "number" ? body.amount : Number(body.amount);
  const videoSlug = typeof body.videoSlug === "string" ? body.videoSlug : "";
  const loc = body.locale === "fa" ? "fa" : "en";

  // 1. Amount must be one of the fixed tiers (shared allowlist).
  if (!BOOST.tiers.includes(amount as (typeof BOOST.tiers)[number])) {
    return jsonResponse({ error: "bad_amount" }, 400);
  }

  // 2. Slug must exist AND be launchable (tier 1 or 2). Tier 3 / unknown -> 400.
  const video = INDEX[videoSlug];
  if (!video || video.boostTier === 3) {
    return jsonResponse({ error: "not_launchable" }, 400);
  }

  const origin = new URL(request.url).origin;
  const prefix = loc === "fa" ? "/fa" : "";
  const title = video.title[loc] || video.title.en;

  // The "what you're buying" copy from the Launch popup rides along into the
  // funnel so the purchase reads the same on-site and at the point of payment:
  // this is a service (paid reach on X) that also funds production, never a
  // donation. Kept plain and final.
  const disclosure =
    loc === "fa"
      ? "برای این ویدیو در ایکس بازدید تبلیغاتی بخر و تولید بعدی ما را تأمین کن. همه‌ی خریدها نهایی‌اند."
      : "Buy this video paid reach on X and fund our next production. All sales final.";

  const session: Record<string, unknown> = {
    mode: "payment",
    locale: loc === "en" ? "en" : "auto",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: BOOST.currency,
          unit_amount: amount * 100,
          product_data: { name: `Launch: ${title}`, description: disclosure },
        },
      },
    ],
    custom_text: {
      submit: { message: disclosure },
    },
    metadata: {
      type: "boost",
      videoSlug,
      amount: String(amount),
      locale: loc,
    },
    success_url: `${origin}${prefix}/launched?slug=${encodeURIComponent(videoSlug)}`,
    cancel_url: `${origin}${prefix}/videos/${videoSlug}`,
  };

  try {
    const res = await stripePost(env.STRIPE_SECRET_KEY, "checkout/sessions", session);
    if (!res.ok) {
      const detail = await res.text();
      return jsonResponse({ error: "Could not start checkout", detail }, 502);
    }

    const data = (await res.json()) as { url?: string };
    if (!data.url) {
      return jsonResponse({ error: "Stripe returned no checkout URL" }, 502);
    }
    return jsonResponse({ url: data.url }, 200);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return jsonResponse({ error: "Checkout failed", detail: msg }, 500);
  }
};
