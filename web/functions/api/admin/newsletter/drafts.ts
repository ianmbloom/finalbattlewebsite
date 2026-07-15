/**
 * GET /api/admin/newsletter/drafts?lang=<en|fa>
 * Returns list of newsletter drafts for a language.
 * LOCAL-ONLY: Guarded by ADMIN_ENABLED env var.
 */

import { jsonResponse, type D1Database } from "../../_lib";

interface Env {
  DB?: D1Database;
  ADMIN_ENABLED?: string;
}

interface DraftRow {
  id: number;
  language: string;
  subject: string;
  status: string;
  created_at: string;
  sent_at: string | null;
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
    const result = await env.DB.prepare(
      `SELECT id, language, subject, status, created_at, sent_at
       FROM newsletter_drafts
       WHERE language = ?
       ORDER BY created_at DESC
       LIMIT 50`
    )
      .bind(lang)
      .all<DraftRow>();

    return jsonResponse({ drafts: result.results }, 200);
  } catch (err) {
    console.error("Error fetching newsletter drafts:", err);
    return jsonResponse({ error: "Database error" }, 500);
  }
};
