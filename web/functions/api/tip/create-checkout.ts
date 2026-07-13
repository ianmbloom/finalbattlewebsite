/**
 * Cloudflare Pages Function: create a Stripe Checkout Session for the
 * "Buy us some kotlets" tip.
 *
 * A visitor contributes toward production by buying N kotlets at a fixed unit
 * price and can still fine-tune the quantity at Checkout. There is nothing to
 * fulfill — the webhook only records the buyer's email — so the session carries
 * `type: "tip"` in its metadata to branch away from the merch path.
 *
 * Returns `{ url }` (the hosted Stripe Checkout page) for the client to redirect
 * to. Reuses the SDK-free Stripe helpers in ../_lib (form-encoded fetch).
 */
import { jsonResponse, stripePost } from "../_lib";
import { TIP } from "../../../src/config/tip";

interface Env {
  STRIPE_SECRET_KEY: string;
}

interface TipBody {
  locale?: unknown;
  quantity?: unknown;
}

export const onRequestPost = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const { request, env } = context;

  if (!env.STRIPE_SECRET_KEY) {
    return jsonResponse({ error: "Checkout is not configured (v2)" }, 503);
  }

  let body: TipBody;
  try {
    body = (await request.json()) as TipBody;
  } catch {
    body = {};
  }
  const loc = body.locale === "fa" ? "fa" : "en";

  // The starting count only seeds the Checkout page (buyers can adjust there),
  // but keep it a sane integer inside the shared bounds regardless of input.
  const requested = Math.floor(Number(body.quantity));
  const quantity =
    Number.isFinite(requested) && requested >= 1 && requested <= TIP.maxQuantity
      ? requested
      : TIP.quantities[0];

  const origin = new URL(request.url).origin;
  const prefix = loc === "fa" ? "/fa" : "";
  const name = "Final Battle Films Patronage";
  const disclosure = "Your patronage helps fund our next video. All payments final.";

  const session: Record<string, unknown> = {
    mode: "payment",
    locale: "en",
    line_items: [
      {
        quantity,
        adjustable_quantity: { enabled: true, minimum: 1, maximum: TIP.maxQuantity },
        price_data: {
          currency: TIP.currency,
          unit_amount: TIP.unitAmount,
          product_data: { name, description: disclosure },
        },
      },
    ],
    custom_text: {
      submit: { message: disclosure },
    },
    metadata: {
      type: "tip",
      locale: loc,
    },
    success_url: `${origin}${prefix}/fund?tip=thanks`,
    cancel_url: `${origin}${prefix}/fund`,
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
