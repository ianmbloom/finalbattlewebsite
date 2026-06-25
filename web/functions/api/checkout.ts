/**
 * Cloudflare Pages Function: create a Stripe Checkout Session.
 *
 * The client cart POSTs `{ items: [{ sku, format, size, lang, quantity }], locale }`.
 * We NEVER trust client prices: every line item is looked up in the build-time
 * trusted catalog (_products.json) and the unit amount is computed server-side.
 * Each line carries `sku/format/size/lang` in product metadata so the
 * fulfillment webhook can route it to the right Printify product + variant.
 *
 * Returns `{ url }` (the hosted Stripe Checkout page) for the client to redirect to.
 */
import {
  availableLanguages,
  CATALOG,
  SHIP_COUNTRIES,
  jsonResponse,
  stripePost,
  type Format,
} from "./_lib";

interface Env {
  STRIPE_SECRET_KEY: string;
  /** Flat shipping rate in cents for the whole cart (default 800 = $8.00). */
  SHIPPING_FLAT_CENTS?: string;
  /** Set to "true" to enable Stripe Tax (requires tax registrations in Stripe). */
  STRIPE_AUTOMATIC_TAX?: string;
}

interface CartItem {
  sku?: unknown;
  format?: unknown;
  size?: unknown;
  lang?: unknown;
  quantity?: unknown;
}

interface CheckoutBody {
  items?: unknown;
  locale?: unknown;
}

interface ValidItem {
  sku: string;
  format: Format;
  size: string;
  lang: string;
  quantity: number;
  unitAmount: number;
  currency: string;
  name: string;
  image: string;
}

const MAX_QTY = 20;

/** Stripe line-item suffix per language (English is the unmarked default). */
const LANG_SUFFIX: Record<string, string> = { fa: "Farsi" };

function clampQuantity(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 1;
  return Math.min(MAX_QTY, Math.max(1, Math.floor(n)));
}

/** Validate one cart item against the trusted catalog. */
function validate(raw: CartItem): ValidItem | null {
  const sku = typeof raw.sku === "string" ? raw.sku : "";
  const format =
    raw.format === "poster" ? "poster" : raw.format === "tee" ? "tee" : null;
  const entry = CATALOG[sku];
  if (!entry || !format) return null;

  // Language is a design attribute; it must be one we actually offer. Missing
  // Printify ids don't block the sale (we fulfill those manually), so we only
  // require that the language is a known one.
  const lang = typeof raw.lang === "string" && raw.lang ? raw.lang : "en";
  if (!availableLanguages(entry).includes(lang)) return null;

  const quantity = clampQuantity(raw.quantity);
  let size = typeof raw.size === "string" ? raw.size : "";
  let price: number;

  if (format === "tee") {
    if (!entry.tee.sizes.includes(size)) return null;
    price = entry.tee.price;
  } else {
    size = entry.poster.size;
    price = entry.poster.price;
  }
  if (!price || price <= 0) return null;

  const formatLabel = format === "tee" ? "T-Shirt" : "Poster";
  const langLabel = LANG_SUFFIX[lang] ? ` [${LANG_SUFFIX[lang]}]` : "";

  return {
    sku,
    format,
    size,
    lang,
    quantity,
    unitAmount: Math.round(price * 100),
    currency: entry.currency,
    name: `${entry.name} - ${formatLabel}${size ? ` (${size})` : ""}${langLabel}`,
    image: entry.image,
  };
}

export const onRequestPost = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const { request, env } = context;

  if (!env.STRIPE_SECRET_KEY) {
    return jsonResponse({ error: "Checkout is not configured" }, 503);
  }

  let payload: CheckoutBody;
  try {
    payload = (await request.json()) as CheckoutBody;
  } catch {
    return jsonResponse({ error: "Bad payload" }, 400);
  }

  const rawItems = Array.isArray(payload.items) ? payload.items : [];
  const items = rawItems
    .map((it) => validate(it as CartItem))
    .filter((it): it is ValidItem => it !== null);

  if (items.length === 0) {
    return jsonResponse({ error: "Cart is empty or invalid" }, 400);
  }

  const locale = payload.locale === "fa" ? "fa" : "en";
  const origin = new URL(request.url).origin;
  const httpsOrigin = origin.startsWith("https://");
  const currency = items[0].currency;
  const prefix = locale === "en" ? "" : `/${locale}`;

  // Everything ships print-on-demand worldwide, so a single flat per-cart rate
  // keeps the math simple; the per-item margin absorbs shipping variance. Tune
  // via SHIPPING_FLAT_CENTS.
  const shippingAmount = Number(env.SHIPPING_FLAT_CENTS ?? "800") || 800;

  const lineItems = items.map((it) => ({
    quantity: it.quantity,
    price_data: {
      currency: it.currency,
      unit_amount: it.unitAmount,
      product_data: {
        name: it.name,
        // Stripe requires publicly reachable https URLs; skip on localhost.
        ...(httpsOrigin && it.image ? { images: [`${origin}${it.image}`] } : {}),
        metadata: { sku: it.sku, format: it.format, size: it.size, lang: it.lang },
      },
    },
  }));

  const session: Record<string, unknown> = {
    mode: "payment",
    // Stripe Checkout has no native Farsi locale; let it auto-detect for
    // non-English carts rather than forcing English.
    locale: locale === "en" ? "en" : "auto",
    success_url: `${origin}${prefix}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}${prefix}/checkout/cancel`,
    customer_creation: "always",
    billing_address_collection: "auto",
    phone_number_collection: { enabled: false },
    // Capture marketing opt-in; surfaced on the session as consent.promotions.
    consent_collection: { promotions: "auto" },
    shipping_address_collection: { allowed_countries: SHIP_COUNTRIES },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          display_name: "Standard shipping",
          fixed_amount: { amount: shippingAmount, currency },
          delivery_estimate: {
            minimum: { unit: "business_day", value: 5 },
            maximum: { unit: "business_day", value: 14 },
          },
        },
      },
    ],
    line_items: lineItems,
    metadata: { locale, source: "storefront" },
  };

  // Opt-in Stripe Tax: only collects where you've registered in the dashboard.
  if (env.STRIPE_AUTOMATIC_TAX === "true") {
    session.automatic_tax = { enabled: true };
  }

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
};
