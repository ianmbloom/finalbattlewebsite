import { stripeGet, STRIPE_API_VERSION } from "./_lib";

export const onRequestGet = async (context: {
  env: { STRIPE_SECRET_KEY?: string };
}): Promise<Response> => {
  const secret = context.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return new Response(JSON.stringify({ error: "no key" }), { status: 503 });
  }

  try {
    const res = await stripeGet(secret, "balance");
    const status = res.status;
    const text = await res.text();
    return new Response(
      JSON.stringify({
        ok: res.ok,
        status,
        apiVersion: STRIPE_API_VERSION,
        body: text.substring(0, 200),
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
