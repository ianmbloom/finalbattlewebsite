/**
 * POST /api/admin/confirm-post
 * Records a platform post confirmation in D1.
 * LOCAL-ONLY: Guarded by ADMIN_ENABLED env var.
 */

import { jsonResponse, type D1Database } from "../_lib";

interface Env {
  DB?: D1Database;
  ADMIN_ENABLED?: string;
}

interface ConfirmPostBody {
  videoSlug: string;
  platform: string;
  language: string;
  externalUrl: string;
  externalId?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  if (env.ADMIN_ENABLED !== "true") {
    return jsonResponse({ error: "Admin not enabled" }, 403);
  }

  if (!env.DB) {
    return jsonResponse({ error: "Database not configured" }, 500);
  }

  let body: ConfirmPostBody;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const { videoSlug, platform, language, externalUrl, externalId } = body;

  if (!videoSlug || !platform || !language || !externalUrl) {
    return jsonResponse(
      { error: "Missing required fields: videoSlug, platform, language, externalUrl" },
      400
    );
  }

  const validPlatforms = ["x", "youtube", "linkedin", "instagram"];
  if (!validPlatforms.includes(platform)) {
    return jsonResponse({ error: `Invalid platform: ${platform}` }, 400);
  }

  const validLanguages = ["en", "fa"];
  if (!validLanguages.includes(language)) {
    return jsonResponse({ error: `Invalid language: ${language}` }, 400);
  }

  const now = new Date().toISOString();

  try {
    await env.DB.prepare(
      `INSERT INTO platform_posts (video_slug, platform, language, external_url, external_id, posted_at, status, created_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'posted', ?6)
       ON CONFLICT(video_slug, platform, language) DO UPDATE SET
         external_url = excluded.external_url,
         external_id = COALESCE(excluded.external_id, platform_posts.external_id),
         posted_at = excluded.posted_at,
         status = 'posted'`
    )
      .bind(
        videoSlug,
        platform,
        language,
        externalUrl,
        externalId ?? null,
        now
      )
      .run();

    return jsonResponse({ success: true, videoSlug, platform, language }, 200);
  } catch (err) {
    console.error("Error confirming post:", err);
    return jsonResponse({ error: "Database error" }, 500);
  }
};
