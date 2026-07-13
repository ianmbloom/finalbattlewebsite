# Cursor Agent Build Spec — "Launch This Video" Boost Mechanic
## Final Battle Iran (finalbattleiran.org) — COMPLETE

> Read this entire document before writing any code. This is an ADDITIVE feature on an existing
> Astro 6 / Tailwind v4 / Cloudflare Pages site. Do not restructure existing routing, layouts, or
> the design system. Match the existing austere, dark, serif editorial aesthetic (minimal motion).
> Do not add heavy dependencies. Reuse the existing Stripe integration used by the merch shop.

---

## 0. Existing stack (DO NOT CHANGE)

- Astro 6, static output. Tailwind CSS v4. Cloudflare Pages.
- Serverless: Cloudflare Pages Functions (`/functions/**`).
- Video files: MP4 on Cloudflare R2. Email + data: Cloudflare D1 (SQLite).
- Payments: Stripe Checkout (already integrated for merch). Merch fulfillment: Printify.
- Bilingual: EN at `/`, FA at `/fa/` (RTL). All UI strings centralized + keyed by locale.
- Content model: one structured data file per video (per-language title, transcript, R2 src,
  thumbnail, category, live social post URLs for X / Instagram / YouTube).

## 0.1 For-profit legal posture (NON-NEGOTIABLE)

This is a SERVICE PURCHASE, not a donation. Never use "donate", "donation", "charity",
"tax-deductible", "gift", or a "nonprofit" implication anywhere in code, copy, or comments.
The buyer is purchasing paid reach on X.

---

## 1. Feature summary

Per-video "Launch this video" mechanic. A visitor buys paid reach on X for one specific video
via Stripe Checkout at fixed tiers ($10/$20/$50). Payments are pooled; a public per-video support
counter shows momentum. The mechanic renders ONLY on ad-safe videos (`boostTier` 1 or 2), never on
organic-only videos (`boostTier` 3), enforced BOTH client-side and server-side.

Locked copy (EN):
- Anthem: `For the price of one Shahed drone, we can open the eyes of millions.`
- Action: `Launch this video:`
- Tiers: `$10  $20  $50`
- Mechanics: `Buy this video paid reach on X and fund our next production.`
- Confirm title: `It's in the air.`
- Confirm body: `This message is now heading toward more people who haven't heard it.`
- Repost (optional): `Add your own voice — repost on X`

No "independent media venture" label. The mechanics sentence IS the disclosure.

---

## 2. Files to create / modify

CREATE:
```
src/config/boost.ts
src/components/LaunchThisVideo.astro          (+ small client script or island)
src/pages/launched.astro
src/pages/fa/launched.astro
src/pages/support-terms.astro                 (or /how-launch-works)
src/pages/fa/support-terms.astro
functions/api/boost/create-checkout.ts
functions/api/boost/count.ts
functions/api/stripe/webhook.ts               (EXTEND if it already exists; do not duplicate)
migrations/0002_video_boosts.sql
```
MODIFY:
```
src/data/videos/*.<ext>                        (add boostTier to every video)
src/i18n/en.<ext>  and  src/i18n/fa.<ext>      (add launch.* keys, both locales)
src/pages/videos/[slug].astro                  (render <LaunchThisVideo/>)
src/pages/fa/videos/[slug].astro               (render <LaunchThisVideo/>)
<existing engagement popup component>          (swap donation nudge for Launch panel)
wrangler.toml / Pages bindings                 (ensure D1 + Stripe secret bindings present)
```

If actual paths differ, adapt to the real repo layout but preserve intent. Detect the real i18n
and video-data file formats from the repo and follow them exactly.

---

## 3. Config — single source of truth

`src/config/boost.ts`:
```ts
export const BOOST = {
  tiers: [10, 20, 50] as const,   // USD; server allowlist MUST import this
  currency: "usd",
  platform: "X",
} as const;
export type BoostTier = (typeof BOOST.tiers)[number];
```
Both the component and the server handler import `BOOST.tiers`. Amounts must never be hardcoded
separately, so they cannot drift.

---

## 4. Content model — `boostTier`

Add to every video data file:
```ts
/**
 * 1 = ad-safe            -> show Launch mechanic
 * 2 = caution (ad-safe)  -> show Launch mechanic
 * 3 = organic-only       -> HIDE Launch mechanic (share bar only)
 */
boostTier: 1 | 2 | 3;
```
Build rule: if a video is missing `boostTier`, treat it as `3` AND emit a build-time
`console.warn("[boost] unflagged video: <slug> -> defaulting to tier 3")`. The mechanic must NEVER
render for an unset or tier-3 video.

Suggested initial classification from content review (operator can adjust):
- Tier 1: transition-mechanics + human-interest scripts (chaos/day-one/rights/economy/hospitals/
  lights/schools/diaspora/"something unprecedented", etc.)
- Tier 2: scripts naming Reza Pahlavi / IPP explicitly, "regime/democracy" heavy framing.
- Tier 3: scripts with "executions/mass murder/occupation" language (e.g. "A Captive Nation").

---

## 5. D1 migration `migrations/0002_video_boosts.sql`

```sql
CREATE TABLE IF NOT EXISTS video_boosts (
  video_slug   TEXT PRIMARY KEY,
  boost_count  INTEGER NOT NULL DEFAULT 0,   -- number of completed launches (payments)
  total_cents  INTEGER NOT NULL DEFAULT 0,   -- pooled, for internal reporting only
  updated_at   TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS stripe_events (
  event_id     TEXT PRIMARY KEY,             -- idempotency guard
  processed_at TEXT NOT NULL
);
```
Run/register the migration in the existing D1 setup. Do not drop or alter existing tables.

---

## 6. Component `<LaunchThisVideo />`

Props: `{ videoSlug: string; boostTier: 1|2|3; locale: "en"|"fa"; }`

Render logic:
- If `boostTier === 3` (or unset): render NOTHING.
- Else render the panel:
  - `<p class="anthem">` = t("launch.anthem")
  - `<p class="action">` = t("launch.action")
  - three `<button data-amount="10|20|50">` from `BOOST.tiers`, labeled `$` + value
  - `<p class="mechanics">` = t("launch.mechanics")
  - `<p class="counter" data-slug={videoSlug}>` = rendered from count (see below)
  - small text link to `/support-terms` (localized) labeled e.g. "How this works"

Styling: reuse existing tokens/classes (dark bg, serif display for anthem, muted small text for
mechanics/counter). RTL-correct on `/fa/`. No animation beyond simple hover/disabled opacity.

Client script (island or inline `<script>`):
```ts
// on mount: fetch counter
const el = /* .counter[data-slug] */;
fetch(`/api/boost/count?slug=${slug}`)
  .then(r => r.json())
  .then(({ boostCount }) => { el.textContent = t("launch.counter", { count: format(boostCount) }); })
  .catch(() => { el.hidden = true; });   // fail silent, never block the buy

// on tier click:
async function onTier(amount) {
  setDisabled(true);
  try {
    const res = await fetch("/api/boost/create-checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ videoSlug: slug, amount, locale }),
    });
    if (!res.ok) throw new Error(String(res.status));
    const { url } = await res.json();
    window.location.assign(url);           // redirect to Stripe Checkout
  } catch (e) {
    setDisabled(false);
    showInlineError(t("launch.error"));    // "Something went wrong. Please try again."
  }
}
```
Counter display: if `boostCount === 0`, hide the counter line entirely (no "0 launched").

---

## 7. Pages Function `functions/api/boost/create-checkout.ts`

```ts
import Stripe from "stripe";           // reuse existing import style/version in repo
import { BOOST } from "../../../src/config/boost";   // or duplicate the allowlist literal safely

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: { videoSlug?: string; amount?: number; locale?: string };
  try { body = await request.json(); } catch { return json(400, { error: "bad_json" }); }

  const { videoSlug, amount, locale } = body;
  const loc = locale === "fa" ? "fa" : "en";

  // 1. amount allowlist
  if (!BOOST.tiers.includes(amount as any)) return json(400, { error: "bad_amount" });

  // 2. slug must exist AND not be tier 3  (load from bundled video index — see note)
  const video = getVideoBySlug(videoSlug);
  if (!video || video.boostTier === 3) return json(400, { error: "not_launchable" });

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: /* match merch handler */ });
  const base = new URL(request.url).origin;
  const prefix = loc === "fa" ? "/fa" : "";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{
      quantity: 1,
      price_data: {
        currency: BOOST.currency,
        unit_amount: (amount as number) * 100,
        product_data: { name: `Launch: ${video.title[loc]}` },
      },
    }],
    metadata: { type: "boost", videoSlug: video.slug, amount: String(amount), locale: loc },
    success_url: `${base}${prefix}/launched?slug=${video.slug}`,
    cancel_url:  `${base}${prefix}/videos/${video.slug}`,
  });

  return json(200, { url: session.url });
};

function json(status: number, data: unknown) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });
}
```
NOTE on `getVideoBySlug`: the function needs the video index (slug -> {title, boostTier}) at the
edge. Generate a lightweight JSON manifest of `{ slug, title{en,fa}, boostTier }` at build time and
import it in the function, OR store the manifest in a KV/D1 table. Do NOT ship full transcripts to
the edge. This server check is the authoritative guard against launching tier-3 videos.

---

## 8. Pages Function `functions/api/boost/count.ts`

```ts
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const slug = new URL(request.url).searchParams.get("slug") ?? "";
  const row = await env.DB.prepare(
    "SELECT boost_count FROM video_boosts WHERE video_slug = ?"
  ).bind(slug).first<{ boost_count: number }>();
  return new Response(JSON.stringify({ boostCount: row?.boost_count ?? 0 }), {
    headers: { "content-type": "application/json", "cache-control": "public, max-age=30" },
  });
};
```
Never return `total_cents` publicly.

---

## 9. Stripe webhook `functions/api/stripe/webhook.ts`  (extend existing if present)

```ts
import Stripe from "stripe";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const sig = request.headers.get("stripe-signature");
  const raw = await request.text();
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: /* match */ });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(raw, sig!, env.STRIPE_WEBHOOK_SECRET);
  } catch { return new Response("bad signature", { status: 400 }); }

  // idempotency
  const seen = await env.DB.prepare("SELECT 1 FROM stripe_events WHERE event_id = ?")
    .bind(event.id).first();
  if (seen) return new Response("ok", { status: 200 });

  if (event.type === "checkout.session.completed") {
    const s = event.data.object as Stripe.Checkout.Session;
    if (s.metadata?.type === "boost") {
      const slug = s.metadata.videoSlug;
      const cents = parseInt(s.metadata.amount, 10) * 100;
      const now = new Date().toISOString();
      await env.DB.prepare(`
        INSERT INTO video_boosts (video_slug, boost_count, total_cents, updated_at)
        VALUES (?, 1, ?, ?)
        ON CONFLICT(video_slug) DO UPDATE SET
          boost_count = boost_count + 1,
          total_cents = total_cents + excluded.total_cents,
          updated_at  = excluded.updated_at
      `).bind(slug, cents, now).run();
    }
    // IMPORTANT: keep existing merch handling for non-boost sessions intact.
  }

  await env.DB.prepare("INSERT INTO stripe_events (event_id, processed_at) VALUES (?, ?)")
    .bind(event.id, new Date().toISOString()).run();

  return new Response("ok", { status: 200 });
};
```
If a webhook handler already exists, ADD the `metadata.type === "boost"` branch and the idempotency
table use without altering existing merch logic.

---

## 10. Success page `/launched` (+ `/fa/launched`)

- Read `?slug=`.
- Show `t("launch.confirm.title")` and `t("launch.confirm.body")`.
- Show one optional, untracked link to the video's X post URL:
  `t("launch.confirm.repost")` -> opens `video.social.x` in new tab. Never required.
- If slug is missing/invalid, still show the confirmation title/body (do not error); just omit the
  repost link.
- Match brand; minimal motion.

---

## 11. Engagement popup changes

The existing popup: tracks videos-opened client-side, rate-limited + cooldown-gated, asks email
first, later shows a donation nudge to deeply-engaged repeat visitors.

- Replace the "Buy us a kotlet" donation nudge with the `<LaunchThisVideo />` panel bound to the
  CURRENT video's slug + boostTier.
- If current video `boostTier === 3`: fall back to the email/share nudge only. Never show Launch.
- Preserve ALL existing gating and cooldowns. Do not increase frequency or aggressiveness.
- Keep Buy Me a Coffee ONLY as a general tip link on `/support`. The per-video mechanic never routes
  through Buy Me a Coffee.

---

## 12. i18n keys — add to BOTH en and fa

EN:
```
launch.anthem          = "For the price of one Shahed drone, we can open the eyes of millions."
launch.action          = "Launch this video:"
launch.mechanics       = "Buy this video paid reach on X and fund our next production."
launch.counter         = "{count} launched"
launch.error           = "Something went wrong. Please try again."
launch.howItWorks      = "How this works"
launch.confirm.title   = "It's in the air."
launch.confirm.body    = "This message is now heading toward more people who haven't heard it."
launch.confirm.repost  = "Add your own voice — repost on X"
```
FA (RTL — human translations; replace if the operator supplies preferred wording):
```
launch.anthem          = "به قیمت یک پهپاد شاهد، می‌توانیم چشم میلیون‌ها نفر را باز کنیم."
launch.action          = "این ویدیو را پرتاب کن:"
launch.mechanics       = "برای این ویدیو در ایکس بازدید تبلیغاتی بخر و تولید بعدی ما را تأمین کن."
launch.counter         = "{count} پرتاب شده"
launch.error           = "مشکلی پیش آمد. لطفاً دوباره تلاش کنید."
launch.howItWorks      = "این چگونه کار می‌کند"
launch.confirm.title   = "پرتاب شد."
launch.confirm.body    = "این پیام حالا به سوی افراد بیشتری در حرکت است که هنوز آن را نشنیده‌اند."
launch.confirm.repost  = "صدای خودت را اضافه کن — در ایکس بازنشر کن"
```
Interpolation `{count}` must use the existing i18n interpolation mechanism. If none exists, add a
minimal `format(str, vars)` helper. Never render an EN string on the FA site.

---

## 13. `/support-terms` page (EN + FA) — plain-English service terms

Cover, in prose (no legalese dump):
- What you buy: paid promotion of the selected video on X.
- Pooled model: funds are pooled and spent as ad reach, weighted by each video's support; ad buys
  run on a cadence, not per transaction.
- Platform discretion: X may reject or limit a promotion; if so, funds are applied to other videos
  where they have the greatest impact.
- A portion funds production of future videos.
- Purchases are non-refundable. This is a commercial purchase, not a charitable donation, and is not
  tax-deductible.

---

## 14. Environment / bindings (verify, do not leak secrets)

Pages project must expose:
- `env.DB` — the existing D1 binding.
- `env.STRIPE_SECRET_KEY` — reuse the merch secret binding.
- `env.STRIPE_WEBHOOK_SECRET` — signing secret for the webhook route.
Add any missing binding to `wrangler.toml` / Pages dashboard config. Never commit secret values.

---

## 15. Edge cases & rules

- Client-disabled JS: tier buttons do nothing gracefully (no broken layout). Acceptable — mechanic
  requires JS for Checkout redirect.
- Double-click a tier: buttons disabled during request; server + webhook idempotent anyway.
- Tampered amount or tier-3 slug via direct API call: server returns 400 (Section 7 guards).
- Webhook retries: idempotency table prevents double counting.
- Counter fetch failure: hide counter, never block purchasing.
- FA missing translation for any key: build must fail or warn loudly, not silently fall back to EN.

---

## 16. Acceptance criteria (verify ALL)

1. Every video has `boostTier`; unset -> 3 with build warning.
2. `<LaunchThisVideo/>` renders on tier 1 & 2 pages (EN + FA), hidden on tier 3.
3. Tier buttons create Stripe Checkout with correct `unit_amount` + metadata `{type:"boost",...}`.
4. `create-checkout` rejects non-allowlisted amounts and tier-3/unknown slugs with 400.
5. Webhook verifies signature, is idempotent, increments `video_boosts`, leaves merch logic intact.
6. `/api/boost/count` returns live counts; counter hidden at 0; never exposes cents.
7. `/launched` (EN+FA) shows confirmation + optional repost link; tolerant of missing slug.
8. Popup shows Launch only for current tier-1/2 video, keeps existing gating, never for tier 3.
9. All `launch.*` keys present EN + FA; `{count}` interpolates; no EN leakage on FA.
10. No donation/charity language; no "independent media venture" label anywhere.
11. Buy Me a Coffee only on /support as general tip.
12. Existing merch checkout unaffected; Stripe config reused, not duplicated.
13. Migration `0002_video_boosts.sql` creates both tables idempotently.
14. `/support-terms` (EN+FA) live and linked from panel + success page.

---

## 17. Out of scope (DO NOT build)

- Audience-aware / geo popup variants (single audience assumed).
- Meta / Instagram / TikTok paid flows (X only; TikTok organic-only by policy).
- X Ads API / automated ad buying (operator deploys ad spend manually from the pool).
- Per-buyer reach reporting (aggregate email updates handled off-site).
- Refund flows (non-refundable per terms).
- Reach-estimate numbers on tiers (ship bare $ amounts; numbers are a later A/B once real CPM known).
