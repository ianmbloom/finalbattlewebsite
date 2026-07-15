/**
 * Email template helpers for bilingual newsletters.
 * Supports LTR (English) and RTL (Farsi) layouts.
 */

import type { Locale } from "@/consts";

export interface NewsletterContent {
  subject: string;
  preheader?: string;
  body: string;
  language: Locale;
}

const FONTS = {
  en: "'Inter', 'Cormorant Garamond', Georgia, serif",
  fa: "'Vazirmatn', 'Inter', system-ui, sans-serif",
};

const SITE_URL = "https://finalbattle.video";

/**
 * Generate the full HTML email template for a newsletter.
 */
export function renderNewsletterHtml(content: NewsletterContent, switchToken?: string): string {
  const { subject, preheader, body, language } = content;
  const isRTL = language === "fa";
  const dir = isRTL ? "rtl" : "ltr";
  const fontFamily = FONTS[language];
  
  const switchUrl = switchToken
    ? `${SITE_URL}/api/newsletter/switch?token=${switchToken}&lang=${isRTL ? "en" : "fa"}`
    : null;
  
  const switchText = isRTL
    ? "Switch to English newsletter"
    : "تغییر به خبرنامه فارسی";
  
  const unsubscribeText = isRTL ? "لغو عضویت" : "Unsubscribe";
  const footerText = isRTL
    ? "این ایمیل را دریافت می‌کنید زیرا در خبرنامه Final Battle Films عضو شدید."
    : "You're receiving this email because you subscribed to the Final Battle Films newsletter.";
  
  return `<!DOCTYPE html>
<html lang="${language}" dir="${dir}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(subject)}</title>
  ${preheader ? `<meta name="description" content="${escapeHtml(preheader)}">` : ""}
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
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
    .switch-lang {
      margin-top: 15px;
    }
    @media (prefers-color-scheme: dark) {
      body { background-color: #1a1a2e; }
    }
  </style>
</head>
<body>
  ${preheader ? `<div style="display:none;font-size:1px;color:#1a1a2e;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${escapeHtml(preheader)}</div>` : ""}
  
  <div class="wrapper">
    <div class="header">
      <a href="${SITE_URL}${isRTL ? "/fa/" : "/"}" class="logo">
        ${isRTL ? "نبرد نهایی" : "Final Battle Films"}
      </a>
    </div>
    
    <div class="content">
      ${body}
    </div>
    
    <div class="footer">
      <p>${footerText}</p>
      ${switchUrl ? `<p class="switch-lang"><a href="${switchUrl}">${switchText}</a></p>` : ""}
      <p><a href="${SITE_URL}/unsubscribe">${unsubscribeText}</a></p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Generate a plain text version of the newsletter for email clients that don't support HTML.
 */
export function renderNewsletterText(content: NewsletterContent): string {
  const { subject, body, language } = content;
  const isRTL = language === "fa";
  
  const plainBody = body
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
  
  const header = isRTL ? "نبرد نهایی" : "Final Battle Films";
  const footer = isRTL
    ? "لغو عضویت: https://finalbattle.video/unsubscribe"
    : "Unsubscribe: https://finalbattle.video/unsubscribe";
  
  return `${header}\n${"=".repeat(40)}\n\n${subject}\n\n${plainBody}\n\n${"=".repeat(40)}\n${footer}`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
