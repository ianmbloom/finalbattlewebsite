# Spend Reports: Launch This Video Transactions

This document covers how to generate spend reports for the "Launch This Video" promotion fund and mark transactions as allocated after running ads.

## Overview

When visitors pay to launch a video ($10 / $20 / $50 tiers), each transaction is logged to the `boost_transactions` table in D1. This table tracks:

| Column | Purpose |
|--------|---------|
| `video_slug` | Which video was launched |
| `amount_cents` | Payment amount in cents (1000 = $10) |
| `stripe_session_id` | Stripe Checkout session (idempotency key) |
| `buyer_email` | Supporter's email (if provided) |
| `locale` | `en` or `fa` |
| `allocated` | `0` = pending, `1` = spent on ads |
| `created_at` | ISO timestamp of payment |

The `allocated` flag lets you track which funds have been deployed as ad spend and which are still in the pool.

---

## Generate a Spend Report

### Pending funds by video

Show unallocated funds grouped by video:

```bash
cd web
npx wrangler d1 execute finalbattle-emails --remote --command \
  "SELECT video_slug, 
          SUM(amount_cents)/100.0 as total_usd, 
          COUNT(*) as launches
   FROM boost_transactions 
   WHERE allocated = 0 
   GROUP BY video_slug
   ORDER BY total_usd DESC"
```

### Total pending across all videos

```bash
npx wrangler d1 execute finalbattle-emails --remote --command \
  "SELECT SUM(amount_cents)/100.0 as pending_usd, COUNT(*) as transactions
   FROM boost_transactions 
   WHERE allocated = 0"
```

### Transactions in a date range

```bash
npx wrangler d1 execute finalbattle-emails --remote --command \
  "SELECT video_slug, amount_cents/100.0 as usd, buyer_email, created_at
   FROM boost_transactions 
   WHERE created_at >= '2026-07-01' AND created_at < '2026-08-01'
   ORDER BY created_at"
```

### All-time totals (including already-spent)

```bash
npx wrangler d1 execute finalbattle-emails --remote --command \
  "SELECT video_slug,
          SUM(amount_cents)/100.0 as total_usd,
          SUM(CASE WHEN allocated = 1 THEN amount_cents ELSE 0 END)/100.0 as spent_usd,
          SUM(CASE WHEN allocated = 0 THEN amount_cents ELSE 0 END)/100.0 as pending_usd,
          COUNT(*) as launches
   FROM boost_transactions
   GROUP BY video_slug
   ORDER BY total_usd DESC"
```

---

## Mark Transactions as Allocated

After running ads with the pooled funds, mark those transactions as spent:

### Mark all pending transactions

```bash
npx wrangler d1 execute finalbattle-emails --remote --command \
  "UPDATE boost_transactions SET allocated = 1 WHERE allocated = 0"
```

### Mark transactions up to a specific date

```bash
npx wrangler d1 execute finalbattle-emails --remote --command \
  "UPDATE boost_transactions 
   SET allocated = 1 
   WHERE allocated = 0 AND created_at < '2026-08-01'"
```

### Mark transactions for a specific video only

```bash
npx wrangler d1 execute finalbattle-emails --remote --command \
  "UPDATE boost_transactions 
   SET allocated = 1 
   WHERE allocated = 0 AND video_slug = 'the-nation-has-a-future'"
```

---

## Recommended Workflow

1. **Before running ads:** Generate the pending funds report to see how much is available per video.

2. **Run ads on X:** Allocate spend weighted toward the videos with the most backing (as described in `/support-terms`).

3. **After running ads:** Mark the corresponding transactions as allocated so they don't appear in the next report.

4. **Keep records:** The transaction log serves as an audit trail. You can always query historical spend with the all-time totals query.

---

## Related Tables

| Table | Purpose |
|-------|---------|
| `boost_transactions` | Individual transaction log (this doc) |
| `video_boosts` | Aggregate counters per video (`boost_count`, `total_cents`) |
| `subscribers` | Buyer emails captured from Launch purchases |
| `stripe_events` | Webhook idempotency guard |

The `video_boosts` table powers the public "X launched" counter on the site. The `boost_transactions` table is for internal reporting only.

---

## Applying the Migration

If the `boost_transactions` table doesn't exist yet:

```bash
cd web
npm run db:transactions        # production
npm run db:transactions:local  # local dev
```
