/**
 * GET /api/admin/newsletter/preview?id=<draft_id>
 * Returns the rendered HTML preview of a newsletter draft.
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
  body_html: string;
  status: string;
}

const FONTS = {
  en: "'Inter', 'Cormorant Garamond', Georgia, serif",
  fa: "'Vazirmatn', 'Inter', system-ui, sans-serif",
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
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

    const isRTL = draft.language === "fa";
    const dir = isRTL ? "rtl" : "ltr";
    const fontFamily = FONTS[draft.language as keyof typeof FONTS] || FONTS.en;

    const html = `<!DOCTYPE html>
<html lang="${draft.language}" dir="${dir}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(draft.subject)}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #1a1a2e;
      font-family: ${fontFamily};
      font-size: 16px;
      line-height: 1.6;
      color: #eaeaea;
      direction: ${dir};
    }
    .wrapper {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 30px 0;
      border-bottom: 1px solid #0f3460;
    }
    .logo {
      font-size: 24px;
      font-weight: 600;
      color: #e94560;
      text-decoration: none;
    }
    .content {
      background-color: #16213e;
      padding: 30px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .content h1 {
      color: #ffffff;
      font-size: 24px;
      margin: 0 0 20px;
    }
    .content h2 {
      color: #e94560;
      font-size: 20px;
      margin: 25px 0 15px;
    }
    .content p {
      margin: 0 0 15px;
      color: #d0d0d0;
    }
    .content a {
      color: #e94560;
    }
    .content ul, .content ol {
      color: #d0d0d0;
      padding-${isRTL ? "right" : "left"}: 20px;
    }
    .content li {
      margin-bottom: 8px;
    }
    .cta-button {
      display: inline-block;
      background-color: #e94560;
      color: #ffffff !important;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      margin: 15px 0;
    }
    .footer {
      text-align: center;
      padding: 30px 0;
      font-size: 12px;
      color: #666;
    }
    .footer a {
      color: #888;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <span class="logo">${isRTL ? "نبرد نهایی" : "Final Battle Films"}</span>
    </div>
    <div class="content">
      ${draft.body_html}
    </div>
    <div class="footer">
      <p>${isRTL ? "پیش‌نمایش - این ایمیل ارسال نشده است" : "Preview - This email has not been sent"}</p>
    </div>
  </div>
</body>
</html>`;

    return jsonResponse({ html, status: draft.status }, 200);
  } catch (err) {
    console.error("Error fetching draft preview:", err);
    return jsonResponse({ error: "Database error" }, 500);
  }
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
