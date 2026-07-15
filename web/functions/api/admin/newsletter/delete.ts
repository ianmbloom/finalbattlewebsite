/**
 * POST /api/admin/newsletter/delete?id=<draft_id>
 * Deletes a newsletter draft (only if status is 'draft').
 * LOCAL-ONLY: Guarded by ADMIN_ENABLED env var.
 */

import { jsonResponse, type D1Database } from "../../_lib";

interface Env {
  DB?: D1Database;
  ADMIN_ENABLED?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  if (env.ADMIN_ENABLED !== "true") {
    return jsonResponse({ error: "Admin not enabled" }, 403);
  }

  if (!env.DB) {
    return jsonResponse({ error: "Database not configured" }, 500);
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return jsonResponse({ error: "Missing id parameter" }, 400);
  }

  try {
    const result = await env.DB.prepare(
      `DELETE FROM newsletter_drafts
       WHERE id = ? AND status = 'draft'`
    )
      .bind(id)
      .run();

    if (!result.meta.changes || result.meta.changes === 0) {
      return jsonResponse({ error: "Draft not found or cannot be deleted (already sent)" }, 404);
    }

    return jsonResponse({ success: true }, 200);
  } catch (err) {
    console.error("Error deleting draft:", err);
    return jsonResponse({ error: "Database error" }, 500);
  }
};
