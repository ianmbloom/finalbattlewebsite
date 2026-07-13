import { stripePost } from "./_lib";

export const onRequestGet = async (context: {
  request: Request;
  env: { STRIPE_SECRET_KEY?: string };
}): Promise<Response> => {
  const secret = context.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return new Response(JSON.stringify({ error: "no key" }), { status: 503 });
  }

  const origin = new URL(context.request.url).origin;

  const session = {
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: 500,
          product_data: { name: "Test Item", description: "Test description" },
        },
      },
    ],
    success_url: `${origin}/fund?test=ok`,
    cancel_url: `${origin}/fund`,
  };

  try {
    const res = await stripePost(secret, "checkout/sessions", session);
    const status = res.status;
    const body = await res.text();
    return new Response(
      JSON.stringify({ ok: res.ok, status, body: body.substring(0, 500) }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
