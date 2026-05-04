# PaintBookCo Launch Readiness Report

**Date:** 2026-05-04  
**Audit branch:** `fix/task-7-painter-dashboard` (contains all task commits)  
**Target merge branch:** `claude/audit-paintbookco-app-MX6XN`

---

## 1. Summary of Changes

All 10 audit tasks have been completed across 8 commits. The platform is now
architecturally consistent with PaintBookCo's core rules:

- Customers access jobs via `/job/[token]` — no registration, no login
- Painters register with KYC (Didit) + insurance and access `/dashboard/painter`
- All payments via Transpact escrow — no Stripe anywhere in active code
- Commission tiers: 12% (jobs 1–5), 10% (6–10), 8% (11+)
- 48-hour auto-release after completion requested (scheduled via Make.com)

---

## 2. Task Completion Status

| # | Task | Status | Commit |
|---|------|--------|--------|
| 1 | Critical route/component fixes | ✅ Done | `5a85a56` |
| 2 | Remove dead pages and routes | ✅ Done | `456a82c` |
| 3 | Navigation fixes (Header/Footer) | ✅ Done | `b7b5358` |
| 4 | Stream Chat integration | ✅ Done | `a8db007` |
| 5 | Invoice generation (generate-invoice) | ✅ Done | `a332423` |
| 6 | Transpact payment integration | ✅ Done | `38c0403` |
| 7 | Painter dashboard fixes | ✅ Done | `4bf9d18` |
| 8 | Admin dashboard verification | ✅ Done | `4bf9d18` |
| 9 | Code quality cleanup | ✅ Done | `8d35890` |
| 10 | Launch readiness report | ✅ This document | — |

---

## 3. Critical Platform Rule Compliance

### Customer flow (no auth)
- `/job/:token` — standalone page, no layout wrapper, no login prompt ✅
- Customer token validated server-side via `customer_token` field on transactions ✅
- `create-transpact`, `confirm-completion`, `raise-dispute`, `cancel-job` all use
  `customer_token` for auth (no Supabase JWT required) ✅
- Painter name shown as first name only until escrow funded; full name after ✅

### Painter flow
- `/dashboard/painter` — protected route, requires `painter` role ✅
- KYC via Didit at `/kyc/painter` ✅
- Insurance submission before activation ✅
- Available jobs tab: postcode district only shown (no customer PII) ✅
- Chat initiates via `initiate-chat` edge function (painter-side action) ✅
- Invoice generation inline in chat with line items and auto-calculated total ✅

### Payment flow (Transpact only)
- No Stripe imports, no Stripe references in active code ✅
- Transpact SOAP API via `_shared/transpact.ts` helper ✅
- Escrow events handled by `transpact-webhook-receiver` (events 7/10/11/12/16) ✅
- Amount mismatch: alert email sent, status NOT updated ✅
- Idempotent: duplicate events deduplicated via `transpact_events` table ✅
- 48h auto-release: `auto-release-escrow` function, authorised via SERVICE_ROLE_KEY ✅

### Commission tiers
Consistent across all three locations:
- `create-transpact/index.ts`: `commissionRate()` function ✅
- `generate-invoice/index.ts`: inline calculation ✅
- `PainterDashboard.tsx`: overview display ✅

---

## 4. Edge Functions Status

| Function | Purpose | Status |
|----------|---------|--------|
| `generate-stream-token` | Stream Chat tokens for painter+customer | ✅ Rewritten |
| `initiate-chat` | Painter claims job, creates Stream channel | ✅ Updated |
| `generate-invoice` | HTML invoice generation (no AI dependency) | ✅ Rewritten |
| `create-transpact` | Creates Transpact escrow transaction | ✅ Rewritten |
| `transpact-webhook-receiver` | Handles all Transpact events | ✅ Rewritten |
| `confirm-completion` | Customer confirms job done | ✅ Verified |
| `raise-dispute` | Customer raises dispute | ✅ Verified |
| `cancel-job` | Customer cancels pre-invoice | ✅ Verified |
| `auto-release-escrow` | 48h auto-release scheduled job | ✅ Created |
| `admin-action` | KYC/insurance approval actions | ✅ Existing (verified) |

### Required Environment Variables (Supabase secrets)
All functions depend on these being set:
```
SUPABASE_URL
SUPABASE_ANON_KEY
SERVICE_ROLE_KEY
STREAM_API_KEY
STREAM_API_SECRET
TRANSPACT_USERNAME
TRANSPACT_PASSWORD
TRANSPACT_API_URL
TRANSPACT_IS_TEST          # "true" for staging, "false" for production
MAKE_ESCROW_FUNDED_WEBHOOK
MAKE_CONTACT_SHARED_WEBHOOK
MAKE_JOB_COMPLETED_WEBHOOK
MAKE_INVOICE_SENT_WEBHOOK
MAKE_DISPUTE_RAISED_WEBHOOK
ADMIN_EMAIL
SENDGRID_API_KEY           # for mismatch alerts
SIGHTENGINE_USER           # PII filter in chat
SIGHTENGINE_SECRET
```

### Scheduled Job Setup
`auto-release-escrow` must be called hourly. Set up ONE of:
- **Make.com**: scheduled scenario → POST to function URL with header
  `x-admin-secret: <SERVICE_ROLE_KEY>`
- **Supabase pg_cron**:
  ```sql
  select cron.schedule('auto-release', '0 * * * *',
    $$ select net.http_post(url := '<FUNCTION_URL>',
       headers := '{"x-admin-secret":"<SERVICE_ROLE_KEY>"}') $$);
  ```

---

## 5. Security Checklist

| Check | Status |
|-------|--------|
| No `alert()`/`confirm()`/`window.prompt()` in active client code | ✅ |
| No `localStorage` for sensitive or auth data | ✅ |
| No hardcoded emails (all use `ADMIN_EMAIL` env var) | ✅ |
| No Stripe SDK or Stripe references in active routes | ✅ |
| No Builder.io runtime imports in production pages | ✅ |
| `dangerouslySetInnerHTML` always wrapped in `DOMPurify.sanitize()` | ✅ |
| `Math.random()` not used in token/ID generation | ✅ (only in UI skeleton) |
| Customer auth via token, not Supabase JWT | ✅ |
| Admin dashboard gated behind `ADMIN_EMAIL` check | ✅ |
| Transpact webhook deduplication via `transpact_events` table | ✅ |
| PII filter on Stream Chat (client regex + SightEngine) | ✅ |

---

## 6. Known Limitations and Blockers

### Git push access (non-blocking)
The local git remote proxy (`127.0.0.1:44023`) returns **403 Forbidden** for
`git-receive-pack` (push). All commits are staged locally on branch
`fix/task-7-painter-dashboard` and are ready to push once push access is
restored. The MCP GitHub integration also lacks write permission.

**To push when access is available:**
```bash
git push -u origin fix/task-7-painter-dashboard
```
Then merge to `claude/audit-paintbookco-app-MX6XN` via PR.

### Database schema (must verify before launch)
The following columns are assumed to exist — verify against actual schema:
- `sessions`: `painter_id`, `chat_channel_id`, `customer_token`, `converted_to_transaction`
- `transactions`: `transpact_transaction_id`, `escrow_funded`, `auto_released`,
  `disputed_at`, `cancelled_at`, `completion_requested_at`, `funded_at`
- `painters`: `transpact_registered`, `available_from`, `available_to`,
  `gallery_size_bytes`, `service_radius_km`
- `transpact_events`: `transpact_number`, `event_id`, `amount`, `description`,
  `raw_payload`, `job_id`, `processed_at`
- `job_milestones`: `transaction_id`, `status`, `approved_at`, `paid_at`,
  `transpact_release_id`

### Transpact test mode
Set `TRANSPACT_IS_TEST=true` in Supabase secrets during staging. Switch to
`false` for production. Test transactions won't move real money.

### Stream Chat channel naming
All channels use `job-[session_id]`. Ensure Stream Dashboard channel type
`messaging` is configured. Customer user IDs are `customer-[session_id]`;
painter user IDs are their Supabase `auth.users.id`.

---

## 7. Pre-launch Checklist

**Infrastructure**
- [ ] All environment variables set in Supabase secrets (see list above)
- [ ] `TRANSPACT_IS_TEST=false` for production
- [ ] `auto-release-escrow` scheduled hourly via Make.com or pg_cron
- [ ] Make.com webhook scenarios active for all 5 MAKE_* URLs
- [ ] Stream Chat app configured with `messaging` channel type

**Database**
- [ ] All assumed columns exist (see schema notes above)
- [ ] `transpact_events` table exists with unique index on `(transpact_number, event_id)`
- [ ] RLS policies: customers can only read their own session/transaction via token
- [ ] `painter_gallery` storage bucket exists and is public-readable
- [ ] `painter-insurance` storage bucket exists and is private

**Testing**
- [ ] End-to-end: PostJob → painter accepts → invoice → Transpact escrow → confirm complete
- [ ] Transpact test mode: verify event 16 (funded), event 10 (completed) webhooks
- [ ] 48h auto-release: manually set `completion_requested_at` to 49h ago and run function
- [ ] Admin dashboard: approve KYC, verify insurance, activate painter
- [ ] Dispute flow: raise dispute, verify status frozen, admin releases
- [ ] Amount mismatch alert: send mismatched event 16, verify email sent and status NOT updated

**Content**
- [ ] Privacy Policy references Transpact (not Stripe) — check /privacy
- [ ] Terms reference Transpact escrow — check /terms
- [ ] Trust & Safety page: "Transpact secure escrow" ✅ (fixed in this audit)
