/**
 * GET /api/newsletter/switch?token=<switch_token>&lang=<en|fa>
 * 
 * Public endpoint for subscribers to switch their newsletter language preference.
 * The switch_token is generated when they subscribe and included in newsletter emails.
 * After updating, redirects to a confirmation page.
 */

import { jsonResponse, type D1Database } from "../_lib";

interface Env {
  DB?: D1Database;
}

const VALID_LOCALES = ["en", "fa"];

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  const url = new URL(request.url);
  
  const token = url.searchParams.get("token");
  const targetLang = url.searchParams.get("lang");
  
  if (!token || !targetLang) {
    return new Response(renderErrorPage("Missing token or language parameter."), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
  
  if (!VALID_LOCALES.includes(targetLang)) {
    return new Response(renderErrorPage("Invalid language. Use 'en' or 'fa'."), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
  
  if (!env.DB) {
    return new Response(renderErrorPage("Service temporarily unavailable."), {
      status: 503,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
  
  try {
    const result = await env.DB.prepare(
      `UPDATE subscribers 
       SET locale = ?1, updated_at = ?2
       WHERE switch_token = ?3`
    )
      .bind(targetLang, new Date().toISOString(), token)
      .run();
    
    if (!result.meta.changes || result.meta.changes === 0) {
      return new Response(renderErrorPage("Invalid or expired token."), {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
    
    return new Response(renderSuccessPage(targetLang), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    console.error("Error switching newsletter language:", err);
    return new Response(renderErrorPage("An error occurred. Please try again."), {
      status: 500,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
};

function renderSuccessPage(lang: string): string {
  const isFA = lang === "fa";
  const dir = isFA ? "rtl" : "ltr";
  const title = isFA ? "زبان تغییر کرد" : "Language Updated";
  const message = isFA
    ? "از این پس خبرنامه‌ها را به فارسی دریافت خواهید کرد."
    : "You will now receive newsletters in English.";
  const homeLink = isFA ? "/fa/" : "/";
  const homeText = isFA ? "بازگشت به خانه" : "Back to Home";
  
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} | Final Battle Films</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #1a1a2e;
      color: #eaeaea;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 1rem;
    }
    .card {
      background: #16213e;
      border: 1px solid #0f3460;
      border-radius: 0.5rem;
      padding: 2rem;
      text-align: center;
      max-width: 400px;
    }
    h1 { color: #4ade80; margin: 0 0 1rem; font-size: 1.5rem; }
    p { margin: 0 0 1.5rem; color: #a0a0a0; }
    a {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background: #e94560;
      color: white;
      text-decoration: none;
      border-radius: 0.375rem;
    }
    a:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <div class="card">
    <h1>✓ ${title}</h1>
    <p>${message}</p>
    <a href="${homeLink}">${homeText}</a>
  </div>
</body>
</html>`;
}

function renderErrorPage(message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Error | Final Battle Films</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #1a1a2e;
      color: #eaeaea;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 1rem;
    }
    .card {
      background: #16213e;
      border: 1px solid #0f3460;
      border-radius: 0.5rem;
      padding: 2rem;
      text-align: center;
      max-width: 400px;
    }
    h1 { color: #e94560; margin: 0 0 1rem; font-size: 1.5rem; }
    p { margin: 0 0 1.5rem; color: #a0a0a0; }
    a {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background: #e94560;
      color: white;
      text-decoration: none;
      border-radius: 0.375rem;
    }
    a:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Error</h1>
    <p>${message}</p>
    <a href="/">Back to Home</a>
  </div>
</body>
</html>`;
}
