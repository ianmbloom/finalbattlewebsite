/**
 * POST /api/admin/newsletter/draft
 * Generate a new newsletter draft, optionally using AI.
 * LOCAL-ONLY: Guarded by ADMIN_ENABLED env var.
 */

import { jsonResponse, type D1Database } from "../../_lib";
import videoMap from "../../_videos.json";

interface Env {
  DB?: D1Database;
  ADMIN_ENABLED?: string;
  OPENROUTER_API_KEY?: string;
}

interface DraftBody {
  language: string;
  subject?: string;
  prompt?: string;
}

interface VideoMapEntry {
  slug: string;
  title: { en: string; fa?: string };
  description: { en?: string; fa?: string };
}

const VIDEOS = videoMap as Record<string, VideoMapEntry>;

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  if (env.ADMIN_ENABLED !== "true") {
    return jsonResponse({ error: "Admin not enabled" }, 403);
  }

  if (!env.DB) {
    return jsonResponse({ error: "Database not configured" }, 500);
  }

  let body: DraftBody;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const language = body.language === "fa" ? "fa" : "en";
  const subject = body.subject?.trim() || generateDefaultSubject(language);
  const userPrompt = body.prompt?.trim() || "";

  let bodyHtml: string;

  if (env.OPENROUTER_API_KEY && userPrompt) {
    try {
      bodyHtml = await generateWithAI(env.OPENROUTER_API_KEY, language, userPrompt);
    } catch (err) {
      console.error("AI generation failed, using template:", err);
      bodyHtml = generateTemplateNewsletter(language);
    }
  } else {
    bodyHtml = generateTemplateNewsletter(language);
  }

  try {
    const result = await env.DB.prepare(
      `INSERT INTO newsletter_drafts (language, subject, body_html, status, created_at)
       VALUES (?1, ?2, ?3, 'draft', datetime('now'))
       RETURNING id`
    )
      .bind(language, subject, bodyHtml)
      .first<{ id: number }>();

    return jsonResponse({ id: result?.id, subject, language }, 200);
  } catch (err) {
    console.error("Error creating newsletter draft:", err);
    return jsonResponse({ error: "Database error" }, 500);
  }
};

function generateDefaultSubject(language: string): string {
  const date = new Date().toLocaleDateString(language === "fa" ? "fa-IR" : "en-US", {
    month: "long",
    year: "numeric",
  });
  
  return language === "fa"
    ? `خبرنامه نبرد نهایی - ${date}`
    : `Final Battle Films Newsletter - ${date}`;
}

function generateTemplateNewsletter(language: string): string {
  const videoSlugs = Object.keys(VIDEOS).slice(0, 3);
  const isFA = language === "fa";
  
  const videoList = videoSlugs.map((slug) => {
    const video = VIDEOS[slug];
    const title = isFA ? (video.title.fa ?? video.title.en) : video.title.en;
    const url = isFA ? `https://finalbattle.video/fa/videos/${slug}` : `https://finalbattle.video/videos/${slug}`;
    return `<li><a href="${url}">${title}</a></li>`;
  }).join("\n");

  if (isFA) {
    return `
<h1>سلام!</h1>
<p>از جدیدترین ویدیوهای ما دیدن کنید:</p>
<ul>
${videoList}
</ul>
<p>هر هم‌رسانی پیام را به جهان می‌رساند. ویدیوها را تماشا کنید و با دوستانتان به اشتراک بگذارید.</p>
<p style="text-align: center;">
  <a href="https://finalbattle.video/fa/videos" class="cta-button">تماشای همه ویدیوها</a>
</p>
<p>با سپاس،<br>تیم نبرد نهایی</p>
    `.trim();
  }

  return `
<h1>Hello!</h1>
<p>Check out our latest videos:</p>
<ul>
${videoList}
</ul>
<p>Every share carries the message further. Watch the videos and share with your friends.</p>
<p style="text-align: center;">
  <a href="https://finalbattle.video/videos" class="cta-button">Watch All Videos</a>
</p>
<p>Thank you,<br>The Final Battle Team</p>
  `.trim();
}

async function generateWithAI(apiKey: string, language: string, prompt: string): Promise<string> {
  const systemPrompt = language === "fa"
    ? `You are a newsletter writer for Final Battle Films, a media organization supporting Iranian democracy. Write newsletter content in Farsi (Persian). Use RTL-appropriate formatting. Keep the tone inspiring and action-oriented. Output only the HTML body content (no <html> or <body> tags).`
    : `You are a newsletter writer for Final Battle Films, a media organization supporting Iranian democracy. Write newsletter content in English. Keep the tone inspiring and action-oriented. Output only the HTML body content (no <html> or <body> tags).`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://finalbattle.video",
    },
    body: JSON.stringify({
      model: "anthropic/claude-3.5-sonnet",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
  };

  return data.choices[0]?.message?.content || generateTemplateNewsletter(language);
}
