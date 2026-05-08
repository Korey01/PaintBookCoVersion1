# Bug Fix Report — PaintBookCo Chat & Invoice Flow

**Branch:** `claude/audit-paintbookco-app-MX6XN`  
**Date:** 2026-05-08  
**Test job:** `dbb8c723-e92b-4138-8656-604e17d492b5` (status: `painter_contacted`)

---

## BUG 1 — Customer chat link shows "Chat Unavailable"

### Root Cause
`client/pages/ChatPage.tsx` was rewritten to only handle the **painter** path (token + user in URL params). The **customer** path (`?customer_token=...&session_id=...`) had been completely removed. Customers visiting their chat link always hit the early-exit guard and saw "Invalid chat link."

Additionally, `supabase/functions/generate-stream-token/index.ts`'s `upsertStreamUser` helper sent:
```
Authorization: serverToken
```
instead of the required:
```
Authorization: Bearer <serverToken>
```
causing the Stream user upsert to fail with a 401 on every customer token generation.

### Files Changed
- `client/pages/ChatPage.tsx` — restored customer path: detects `customer_token` + `session_id` params, exchanges them for a Stream token via `generate-stream-token`, then connects
- `supabase/functions/generate-stream-token/index.ts` — fixed `Authorization` header in `upsertStreamUser`

### SQL / Env Vars
None.

---

## BUG 2 — Customer email contains `https://paintbookco.co.uk/job/` with no token

### Root Cause
`supabase/functions/initiate-chat/index.ts` fires the `MAKE_CHAT_CREATED_WEBHOOK` when a painter contacts a customer. The webhook payload did **not include `customer_token`** as a standalone field. Make.com's email scenario builds the job portal URL as `https://paintbookco.co.uk/job/{{customer_token}}` — without the field the token resolves to an empty string.

Secondary issue in `supabase/functions/generate-invoice/index.ts`: the `paymentUrl` was constructed by mangling `SUPABASE_URL`:
```ts
// BEFORE (wrong):
const paymentUrl = `${Deno.env.get("SUPABASE_URL")?.replace("supabase.co", "paintbookco.co.uk") ?? "https://www.paintbookco.co.uk"}/job/${sessionToken ?? txId}`;
// Produces e.g. https://abcdef.paintbookco.co.uk/job/...
```
This produced an invalid subdomain URL instead of `https://www.paintbookco.co.uk/job/...`.

### Files Changed
- `supabase/functions/initiate-chat/index.ts` — added `customer_token: session.customer_token` to `MAKE_CHAT_CREATED_WEBHOOK` payload
- `supabase/functions/generate-invoice/index.ts` — hardcoded `https://www.paintbookco.co.uk` in `paymentUrl`

### SQL / Env Vars
None. Requires Make.com scenario to use `{{customer_token}}` field in the job portal URL template.

---

## BUG 3 — Painter "Generate Invoice" returns "Failed to create transaction"

### Root Cause
The `transactions` table schema (migration `20260417000002_transactions.sql`) declared four columns as `NOT NULL`:
- `customer_last_name`
- `customer_phone`
- `customer_address`
- `customer_postcode`

`supabase/functions/generate-invoice/index.ts` never provided values for these columns in the `INSERT`, causing a PostgreSQL `NOT NULL` constraint violation. The sessions table only stores `first_name`, `last_name`, `phone`, and `postcode` — there is no `address` field captured at job submission time.

### Files Changed
- `supabase/functions/generate-invoice/index.ts` — INSERT now includes `customer_last_name`, `customer_phone`, `customer_postcode` from the session; `customer_address` is omitted (not collected)

### SQL Schema Changes
```sql
-- supabase/migrations/20260508000001_relax_transaction_constraints.sql
ALTER TABLE public.transactions
  ALTER COLUMN customer_last_name DROP NOT NULL,
  ALTER COLUMN customer_phone DROP NOT NULL,
  ALTER COLUMN customer_address DROP NOT NULL,
  ALTER COLUMN customer_postcode DROP NOT NULL;
```

### Env Vars
None.

---

## BUG 4 — Painter "Open Chat" button in My Jobs shows no jobs / chat never opens

### Root Cause
`supabase/migrations/20260417000001_sessions.sql` — the `sessions` table was missing two columns that `initiate-chat` writes and the dashboard reads:

| Column | Used by |
|---|---|
| `painter_id uuid` | `initiate-chat` UPDATE; `loadSessions` `.eq("painter_id", ...)` filter; `generate-stream-token` painter-assignment check |
| `chat_channel_id text` | `initiate-chat` UPDATE; "Open Chat" visibility guard in `MyJobsTab` |

Because these columns didn't exist in the migration, PostgREST rejected `initiate-chat`'s `UPDATE` (silently — the function continued and returned success anyway). As a result:
- `sessions.painter_id` was never set → `loadSessions` query returned no rows → "No jobs yet" shown
- `sessions.chat_channel_id` was never set → "Open Chat" button never rendered

Additionally, `client/components/dashboard/PainterDashboard.tsx`'s `MyJobsTab` passed non-existent props (`jobStatus`, `transactionId`) to `PaintBookChat`, which would cause a TypeScript build error.

### Files Changed
- `client/components/dashboard/PainterDashboard.tsx` — removed invalid `jobStatus` and `transactionId` props from `PaintBookChat` usage

### SQL Schema Changes
```sql
-- supabase/migrations/20260508000002_sessions_chat_columns.sql
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS painter_id uuid REFERENCES public.painters(id),
  ADD COLUMN IF NOT EXISTS chat_channel_id text;

CREATE INDEX IF NOT EXISTS sessions_painter_id_idx ON public.sessions (painter_id);
CREATE INDEX IF NOT EXISTS sessions_chat_channel_id_idx ON public.sessions (chat_channel_id);
```

### Env Vars
None.

---

## BUG 5 — Painter messages don't deliver (Stream channel membership)

### Root Cause
`client/pages/ChatPage.tsx`'s `connectToChat` (now `connectToStream`) created the channel reference with:
```ts
const chatChannel = chatClient.channel("messaging", channel_id!, {
  name: "Job Discussion",
  members: [streamUserId],  // only one user!
});
```
For `messaging`-type channels (private), Stream Chat uses the `members` array in the client-side channel constructor **only if the channel is being created for the first time**. If the channel already exists server-side (created by `initiate-chat` with both painter and customer), the members are not overridden. However, if `initiate-chat`'s channel creation failed silently, the first client to call `watch()` would create a channel with only themselves as a member, locking out the other party.

The fix removes `members` from the client-side call entirely. The channel is always created server-side by `initiate-chat` with both `painter.id` and `customer-{session_id}` as members before either party connects.

### Files Changed
- `client/pages/ChatPage.tsx` — `connectToStream` no longer passes `members` or channel `data`; also handles stale `StreamChat.getInstance()` singletons by disconnecting before reconnecting

### SQL / Env Vars
None.

---

## Summary of All Files Changed

| File | Bugs Fixed |
|---|---|
| `client/pages/ChatPage.tsx` | BUG 1, BUG 5 |
| `client/components/dashboard/PainterDashboard.tsx` | BUG 4 |
| `supabase/functions/generate-stream-token/index.ts` | BUG 1 |
| `supabase/functions/initiate-chat/index.ts` | BUG 2 |
| `supabase/functions/generate-invoice/index.ts` | BUG 2, BUG 3 |
| `supabase/migrations/20260508000001_relax_transaction_constraints.sql` | BUG 3 (new) |
| `supabase/migrations/20260508000002_sessions_chat_columns.sql` | BUG 4 (new) |

## Required Actions After Deployment

1. **Run migrations** against the production Supabase database:
   - `20260508000001_relax_transaction_constraints.sql`
   - `20260508000002_sessions_chat_columns.sql`

2. **Deploy edge functions** (all changed):
   - `generate-stream-token`
   - `initiate-chat`
   - `generate-invoice`

3. **Update Make.com scenario** for "Chat Created" customer email:
   - Ensure the job portal URL uses the `customer_token` field now included in the webhook payload
   - Template should be: `https://www.paintbookco.co.uk/job/{{customer_token}}`

4. **No new environment variables required.**
