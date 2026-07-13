import { jsonResponse, stripePost } from "../_lib";
import { TIP } from "../../../src/config/tip";

interface Env {
  STRIPE_SECRET_KEY: string;
}

export const onRequestGet = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const { request, env } = context;

  if (!env.STRIPE_SECRET_KEY) {
    return jsonResponse({ error: "Checkout is not configured" }, 503);
  }

  const origin = new URL(request.url).origin;

  const session: Record<string, unknown> = {
    mode: "payment",
    line_items: [
      {
        quantity: 3,
        price_data: {
          currency: TIP.currency,
          unit_amount: TIP.unitAmount,
          product_data: { name: "Test Kotlet", description: "Test description" },
        },
      },
    ],
    success_url: `${origin}/fund?test=ok`,
    cancel_url: `${origin}/fund`,
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
