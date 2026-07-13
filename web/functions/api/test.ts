export const onRequestGet = async (context: {
  env: { STRIPE_SECRET_KEY?: string };
}): Promise<Response> => {
  const hasKey = !!context.env.STRIPE_SECRET_KEY;
  const keyLen = context.env.STRIPE_SECRET_KEY?.length ?? 0;
  return new Response(
    JSON.stringify({
      ok: true,
      hasKey,
      keyLen,
      keyPreview: context.env.STRIPE_SECRET_KEY?.substring(0, 7) ?? "none",
    }),
    { headers: { "Content-Type": "application/json" } }
  );
};
