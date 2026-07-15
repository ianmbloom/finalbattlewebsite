/**
 * GET /api/admin/newsletter/stats?lang=<en|fa>
 * Returns subscriber count and draft count for a language.
 * LOCAL-ONLY: Guarded by ADMIN_ENABLED env var.
 */

import { jsonResponse, type D1Database } from "../../_lib";

interface Env {
  DB?: D1Database;
  ADMIN_ENABLED?: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  if (env.ADMIN_ENABLED !== "true") {
    return jsonResponse({ error: "Admin not enabled" }, 403);
  }

  if (!env.DB) {
    return jsonResponse({ error: "Database not configured" }, 500);
  }

  const url = new URL(request.url);
  const lang = url.searchParams.get("lang") || "en";

  try {
    const subscriberResult = await env.DB.prepare(
      `SELECT COUNT(*) as count FROM subscribers WHERE locale = ?`
    )
      .bind(lang)
      .first<{ count: number }>();

    const draftResult = await env.DB.prepare(
      `SELECT COUNT(*) as count FROM newsletter_drafts WHERE language = ?`
    )
      .bind(lang)
      .first<{ count: number }>();

    return jsonResponse({
      subscribers: subscriberResult?.count ?? 0,
      drafts: draftResult?.count ?? 0,
    }, 200);
  } catch (err) {
    console.error("Error fetching newsletter stats:", err);
    return jsonResponse({ error: "Database error" }, 500);
  }
};
