/**
 * Cloudflare Pages Function: Stripe webhook -> Printify fulfillment + email capture.
 *
 * On `checkout.session.completed` we:
 *   1. Verify the Stripe signature (STRIPE_WEBHOOK_SECRET).
 *   2. Re-fetch the session with line items expanded so we can read the
 *      `sku/format/size/lang` metadata we stamped on each product in /api/checkout.
 *   3. Record the buyer's email in the D1 `subscribers` table (source=purchase).
 *   4. Submit one Printify order using the product + variant ids in _products.json.
 *      Lines whose language version has no Printify ids yet are skipped and
 *      fulfilled manually; the order is still acknowledged.
 *
 * By default the order is created but NOT sent to production, so the first real
 * orders can be reviewed in Printify before money is spent on printing. Set the
 * `PRINTIFY_SEND_TO_PRODUCTION=true` env var to fulfill automatically.
 *
 * Secrets/bindings live in the Cloudflare Pages project (Settings > Variables).
 */
import {
  CATALOG,
  recordEmail,
  stripeGet,
  verifyStripeSignature,
  type D1Database,
  type Format,
} from "./_lib";

interface Env {
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  PRINTIFY_API_TOKEN?: string;
  PRINTIFY_SHOP_ID?: string;
  /** Set to "true" to auto-send Printify orders to production (default: draft for review). */
  PRINTIFY_SEND_TO_PRODUCTION?: string;
  DB?: D1Database;
}

interface StripeAddress {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
}

interface StripeSession {
  id: string;
  customer_details?: { email?: string | null; name?: string | null; address?: StripeAddress | null } | null;
  shipping_details?: { name?: string | null; address?: StripeAddress | null } | null;
  consent?: { promotions?: string | null } | null;
  metadata?: { locale?: string } | null;
  _embedded?: never;
}

interface StripeLineItem {
  quantity?: number | null;
  price?: { product?: { metadata?: Record<string, string> } | null } | null;
}

interface ParsedItem {
  sku: string;
  format: Format;
  size: string;
  lang: string;
  quantity: number;
}

interface Recipient {
  name: string;
  email: string;
  address: StripeAddress;
}

function recipientOf(session: StripeSession): Recipient {
  const ship = session.shipping_details;
  const cust = session.customer_details;
  return {
    name: ship?.name ?? cust?.name ?? "",
    email: cust?.email ?? "",
    address: ship?.address ?? cust?.address ?? {},
  };
}

/**
 * Build Printify line items from the trusted catalog. A line resolves to a
 * Printify product + variant via `CATALOG[sku][format].print[lang]`; lines with
 * no mapping (ids not filled in yet) are dropped for manual fulfillment.
 */
function printifyLineItems(items: ParsedItem[]) {
  return items
    .map((it) => {
      const entry = CATALOG[it.sku];
      const fmt = it.format === "tee" ? entry.tee : entry.poster;
      const print = fmt.print[it.lang];
      if (!print || !print.productId) return null;
      const variantId = print.variantIds[it.size];
      if (!variantId) return null;
      return {
        product_id: print.productId,
        variant_id: variantId,
        quantity: it.quantity,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
}

async function submitPrintify(
  env: Env,
  session: StripeSession,
  rcpt: Recipient,
  items: ParsedItem[],
): Promise<Response | null> {
  if (!env.PRINTIFY_API_TOKEN || !env.PRINTIFY_SHOP_ID) return null;
  const lineItems = printifyLineItems(items);
  if (lineItems.length === 0) return null;

  const [firstName, ...rest] = rcpt.name.split(" ");
  return fetch(
    `https://api.printify.com/v1/shops/${env.PRINTIFY_SHOP_ID}/orders.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.PRINTIFY_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        external_id: session.id,
        label: `Final Battle ${session.id}`,
        line_items: lineItems,
        shipping_method: 1,
        send_shipping_notification: false,
        // Draft by default so the first orders can be reviewed in Printify;
        // set PRINTIFY_SEND_TO_PRODUCTION=true to fulfill automatically.
        send_to_production: env.PRINTIFY_SEND_TO_PRODUCTION === "true",
        address_to: {
          first_name: firstName ?? "",
          last_name: rest.join(" "),
          email: rcpt.email,
          country: rcpt.address.country ?? "",
          region: rcpt.address.state ?? "",
          city: rcpt.address.city ?? "",
          address1: rcpt.address.line1 ?? "",
          address2: rcpt.address.line2 ?? "",
          zip: rcpt.address.postal_code ?? "",
        },
      }),
    },
  );
}

export const onRequestPost = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const { request, env } = context;
  const raw = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!(await verifyStripeSignature(raw, signature, env.STRIPE_WEBHOOK_SECRET))) {
    return new Response("Invalid signature", { status: 401 });
  }

  let event: { type?: string; data?: { object?: StripeSession } };
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response("Bad payload", { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    // Acknowledge other event types so Stripe stops retrying.
    return new Response("Ignored", { status: 200 });
  }

  const sessionId = event.data?.object?.id;
  if (!sessionId) return new Response("Missing session id", { status: 400 });

  // Re-fetch the session with line items + product metadata expanded.
  const res = await stripeGet(
    env.STRIPE_SECRET_KEY,
    `checkout/sessions/${sessionId}?expand[]=line_items.data.price.product`,
  );
  if (!res.ok) {
    const detail = await res.text();
    return new Response(`Could not load session: ${detail}`, { status: 502 });
  }
  const session = (await res.json()) as StripeSession & {
    line_items?: { data?: StripeLineItem[] };
  };

  const rcpt = recipientOf(session);

  // Record the buyer email regardless of fulfillment outcome.
  if (rcpt.email) {
    await recordEmail(env.DB, {
      email: rcpt.email,
      source: "purchase",
      locale: session.metadata?.locale === "fa" ? "fa" : "en",
      marketing: session.consent?.promotions === "opt_in",
    });
  }

  const parsed = (session.line_items?.data ?? [])
    .map((li): ParsedItem | null => {
      const meta = li.price?.product?.metadata;
      const sku = meta?.sku ?? "";
      const format =
        meta?.format === "poster" ? "poster" : meta?.format === "tee" ? "tee" : null;
      if (!sku || !format || !CATALOG[sku]) return null;
      return {
        sku,
        format,
        size: meta?.size ?? "",
        lang: meta?.lang || "en",
        quantity: li.quantity ?? 1,
      };
    })
    .filter((x): x is ParsedItem => x !== null);

  const result = await submitPrintify(env, session, rcpt, parsed);
  if (result && !result.ok) {
    const detail = await result.text();
    return new Response(`Fulfillment error: ${detail}`, { status: 502 });
  }

  return new Response("ok", { status: 200 });
};
