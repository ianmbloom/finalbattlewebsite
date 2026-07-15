/**
 * POST /api/admin/newsletter/send?id=<draft_id>
 * Sends an approved newsletter to all subscribers of that language.
 * LOCAL-ONLY: Guarded by ADMIN_ENABLED env var.
 * 
 * NOTE: This endpoint is a placeholder for Cloudflare Email Service integration.
 * When CF Email Service is configured, update this to use the email binding.
 */

import { jsonResponse, type D1Database } from "../../_lib";

interface Env {
  DB?: D1Database;
  ADMIN_ENABLED?: string;
  CF_EMAIL_FROM?: string;
}

interface DraftRow {
  id: number;
  language: string;
  subject: string;
  body_html: string;
  status: string;
}

interface SubscriberRow {
  email: string;
  switch_token: string | null;
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
    const draft = await env.DB.prepare(
      `SELECT id, language, subject, body_html, status
       FROM newsletter_drafts
       WHERE id = ?`
    )
      .bind(id)
      .first<DraftRow>();

    if (!draft) {
      return jsonResponse({ error: "Draft not found" }, 404);
    }

    if (draft.status !== "approved") {
      return jsonResponse({ error: "Draft must be approved before sending" }, 400);
    }

    const subscribers = await env.DB.prepare(
      `SELECT email, switch_token
       FROM subscribers
       WHERE locale = ? AND marketing = 1`
    )
      .bind(draft.language)
      .all<SubscriberRow>();

    if (!subscribers.results || subscribers.results.length === 0) {
      return jsonResponse({ error: "No subscribers for this language" }, 400);
    }

    // TODO: Integrate with Cloudflare Email Service when available
    // For now, we'll just log the send and mark as sent
    console.log(`[Newsletter] Would send to ${subscribers.results.length} subscribers:`);
    console.log(`  Subject: ${draft.subject}`);
    console.log(`  Language: ${draft.language}`);
    
    // Mark as sent
    await env.DB.prepare(
      `UPDATE newsletter_drafts
       SET status = 'sent', sent_at = datetime('now')
       WHERE id = ?`
    )
      .bind(id)
      .run();

    return jsonResponse({
      success: true,
      sent: subscribers.results.length,
      message: "Newsletter marked as sent (email delivery pending CF Email Service integration)",
    }, 200);
  } catch (err) {
    console.error("Error sending newsletter:", err);
    return jsonResponse({ error: "Database error" }, 500);
  }
};
