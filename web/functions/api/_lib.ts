/**
 * Shared helpers for the Pages Functions (subscribe + checkout + webhook).
 *
 * We talk to the Stripe REST API directly with `fetch` (form-encoded bodies)
 * and verify webhooks with Web Crypto, so there is no Stripe SDK dependency and
 * no `nodejs_compat` flag required.
 */
import productMap from "./_products.json";

/** One language's Printify product + its size -> Printify variant id map. */
export interface PrintEntry {
  productId: string;
  variantIds: Record<string, number>;
}

export interface TeeEntry {
  price: number;
  sizes: string[];
  print: Record<string, PrintEntry>;
}

export interface PosterEntry {
  price: number;
  size: string;
  print: Record<string, PrintEntry>;
}

export interface ProductEntry {
  slug: string;
  name: string;
  image: string;
  currency: string;
  tee: TeeEntry;
  poster: PosterEntry;
}

export type ProductMap = Record<string, ProductEntry>;

export const CATALOG = productMap as ProductMap;

export type Format = "tee" | "poster";

/** All designs ship in English by default; other languages unlock via `print`. */
export const BASE_LANG = "en";

/**
 * Languages a design can be ordered in: the English baseline plus any language
 * that has a Printify `print` block on either format.
 */
export function availableLanguages(entry: ProductEntry): string[] {
  const langs = new Set<string>([BASE_LANG]);
  for (const code of Object.keys(entry.tee.print)) langs.add(code);
  for (const code of Object.keys(entry.poster.print)) langs.add(code);
  return [...langs];
}

/**
 * Flatten a nested object into Stripe's bracketed form-encoding, e.g.
 * `{ line_items: [{ quantity: 1 }] }` -> `line_items[0][quantity]=1`.
 * Stripe's API only accepts application/x-www-form-urlencoded bodies.
 */
export function appendForm(
  params: URLSearchParams,
  key: string,
  value: unknown,
): void {
  if (value === null || value === undefined) return;
  if (Array.isArray(value)) {
    value.forEach((item, i) => appendForm(params, `${key}[${i}]`, item));
  } else if (typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      appendForm(params, `${key}[${k}]`, v);
    }
  } else {
    params.append(key, String(value));
  }
}

export function toForm(body: Record<string, unknown>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(body)) appendForm(params, k, v);
  return params;
}

/** Pin the Stripe API version so behavior can't drift under us on upgrades. */
export const STRIPE_API_VERSION = "2026-05-27.dahlia";

/** POST a form-encoded body to the Stripe API. */
export function stripePost(
  secret: string,
  path: string,
  body: Record<string, unknown>,
): Promise<Response> {
  return fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Stripe-Version": STRIPE_API_VERSION,
    },
    body: toForm(body).toString(),
  });
}

/** GET from the Stripe API (query string already appended to `path`). */
export function stripeGet(secret: string, path: string): Promise<Response> {
  return fetch(`https://api.stripe.com/v1/${path}`, {
    headers: {
      Authorization: `Bearer ${secret}`,
      "Stripe-Version": STRIPE_API_VERSION,
    },
  });
}

/**
 * Countries we ship to. Stripe requires an explicit allow-list for shipping
 * address collection (there is no "all"); this is a broad worldwide set.
 */
export const SHIP_COUNTRIES = [
  "US", "CA", "GB", "IE", "AU", "NZ",
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI",
  "ES", "SE", "CH", "NO", "IS",
  "JP", "KR", "SG", "HK", "TW", "AE", "IL", "TR", "MX", "BR", "ZA", "IN",
];

export function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/* --- Cloudflare D1 email store ------------------------------------------- */

// Minimal D1 surface so we don't depend on @cloudflare/workers-types.
export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<unknown>;
  all<T = unknown>(): Promise<{ results: T[] }>;
  first<T = unknown>(): Promise<T | null>;
}
export interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

export type EmailSource = "newsletter" | "purchase";

/**
 * Generate a URL-safe random token for newsletter language preference switching.
 */
export function generateSwitchToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Upsert an email into the unified `subscribers` table. A `purchase` source is
 * "sticky" (it never gets downgraded back to `newsletter`), and the marketing
 * opt-in flag only ever ratchets up. Returns false if no DB is bound.
 * Also generates a switch_token if one doesn't exist for language preference changes.
 */
export async function recordEmail(
  db: D1Database | undefined,
  params: { email: string; source: EmailSource; locale: string; marketing: boolean },
): Promise<boolean> {
  if (!db) return false;
  const now = new Date().toISOString();
  const switchToken = generateSwitchToken();
  await db
    .prepare(
      `INSERT INTO subscribers (email, source, locale, marketing, switch_token, created_at, updated_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?6)
       ON CONFLICT(email) DO UPDATE SET
         source = CASE WHEN subscribers.source = 'purchase' OR excluded.source = 'purchase'
                       THEN 'purchase' ELSE excluded.source END,
         locale = COALESCE(excluded.locale, subscribers.locale),
         marketing = MAX(subscribers.marketing, excluded.marketing),
         switch_token = COALESCE(subscribers.switch_token, excluded.switch_token),
         updated_at = excluded.updated_at`,
    )
    .bind(params.email, params.source, params.locale, params.marketing ? 1 : 0, switchToken, now)
    .run();
  return true;
}

/* --- Stripe webhook signature verification ------------------------------- */

function hexFromBuffer(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

/**
 * Verify a Stripe `Stripe-Signature` header (scheme: `t=<ts>,v1=<hmac>`).
 * The signed payload is `${timestamp}.${rawBody}`, HMAC-SHA256 with the
 * endpoint's signing secret (`whsec_...`). Rejects timestamps older than the
 * tolerance to block replays.
 */
export async function verifyStripeSignature(
  rawBody: string,
  header: string | null,
  secret: string,
  toleranceSeconds = 300,
): Promise<boolean> {
  if (!header || !secret) return false;

  let timestamp = "";
  const signatures: string[] = [];
  for (const part of header.split(",")) {
    const [key, value] = part.split("=");
    if (key === "t") timestamp = value;
    else if (key === "v1" && value) signatures.push(value);
  }
  if (!timestamp || signatures.length === 0) return false;

  const age = Math.floor(Date.now() / 1000) - Number(timestamp);
  if (!Number.isFinite(age) || Math.abs(age) > toleranceSeconds) return false;

  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    enc.encode(`${timestamp}.${rawBody}`),
  );
  const expected = hexFromBuffer(sig);
  return signatures.some((s) => timingSafeEqual(expected, s));
}
