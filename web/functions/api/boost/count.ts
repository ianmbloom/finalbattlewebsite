/**
 * Cloudflare Pages Function: public per-video launch counter.
 *
 * Returns the number of completed launches for a video so the panel can show
 * momentum. Only `boost_count` is ever exposed — the pooled `total_cents` stays
 * internal. Fails soft (0) so a missing row or unbound DB never blocks buying.
 */
import { jsonResponse, type D1Database } from "../_lib";

interface Env {
  DB?: D1Database;
}

export const onRequestGet = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const { request, env } = context;
  const slug = new URL(request.url).searchParams.get("slug") ?? "";

  let boostCount = 0;
  if (env.DB && slug) {
    try {
      const row = await env.DB.prepare(
        "SELECT boost_count FROM video_boosts WHERE video_slug = ?",
      )
        .bind(slug)
        .first<{ boost_count: number }>();
      boostCount = row?.boost_count ?? 0;
    } catch {
      boostCount = 0;
    }
  }

  return new Response(JSON.stringify({ boostCount }), {
    headers: {
      "Content-Type": "application/json",
      "cache-control": "public, max-age=30",
    },
  });
};
