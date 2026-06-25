/**
 * Cloudflare Pages Function: newsletter signup -> Cloudflare D1.
 *
 * The site's newsletter form POSTs `{ email, locale }` here. We validate
 * server-side and upsert the address into the unified `subscribers` table
 * (source=newsletter, marketing opt-in). No third-party email SaaS: the list is
 * exported to a sender when campaigns run.
 */
import { jsonResponse, recordEmail, type D1Database } from "./_lib";

interface Env {
  DB?: D1Database;
}

interface SubscribeBody {
  email?: unknown;
  locale?: unknown;
}

// Pragmatic email check: a single @ with a dotted domain, no spaces.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const onRequestPost = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const { request, env } = context;

  let payload: SubscribeBody;
  try {
    payload = (await request.json()) as SubscribeBody;
  } catch {
    return jsonResponse({ error: "Bad payload" }, 400);
  }

  const email =
    typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const locale = payload.locale === "fa" ? "fa" : "en";
  if (!EMAIL_RE.test(email)) {
    return jsonResponse({ error: "Invalid email" }, 400);
  }

  if (!env.DB) {
    return jsonResponse({ error: "Email signup is not configured" }, 503);
  }

  try {
    // The newsletter form's consent copy makes this an explicit marketing opt-in.
    await recordEmail(env.DB, { email, source: "newsletter", locale, marketing: true });
  } catch {
    return jsonResponse({ error: "Could not save email" }, 502);
  }

  return jsonResponse({ ok: true }, 200);
};
