# Backend Integration Guide — PaintBookCo

## Overview

The PaintBookCo backend is **fully deployed and production-ready** on Supabase. This document explains how the frontend connects to existing infrastructure.

**Important:** Do NOT build new backend endpoints. Use the existing ones listed below.

---

## Architecture Overview

```
┌─ Frontend (React + TypeScript) ────────────────────────────────┐
│                                                                │
│  code/client/lib/api.ts (API Client)                           │
│  ├─ callFunction() helper                                      │
│  ├─ matchJobToPainters()                                       │
│  ├─ submitMilestone()                                          │
│  ├─ approveMilestone()                                         │
│  ├─ createTranspactAccount()                                   │
│  └─ ... (15+ functions)                                        │
│                                                                │
└────────────────┬─────────────────────────────────────────────┘
                 │ HTTP/JSON via fetch()
                 │
┌────────────────▼─────────────────────────────────────────────┐
│ Supabase Platform                                             │
│ (kvuidnkmxqftbmlyvlyl)                                        │
│                                                               │
│ ├─ Edge Functions (Base URL)                                 │
│ │  https://kvuidnkmxqftbmlyvlyl.supabase.co/functions/v1/  │
│ │                                                            │
│ │  ✅ match-job-to-painters                                 │
│ │  ✅ accept-job                                            │
│ │  ✅ submit-milestone                                      │
│ │  ✅ approve-milestone                                     │
│ │  ✅ request-milestone-changes                             │
│ │  ✅ release-milestone-payment                             │
│ │  ✅ create-transpact                                      │
│ │  ✅ get-transpact-status                                  │
│ │  ✅ void-transpact                                        │
│ │  ✅ submit-review                                         │
│ │  ✅ download-my-data                                      │
│ │  ✅ delete-my-account                                     │
│ │  ✅ generate-stream-token                                 │
│ │  ✅ filter-message                                        │
│ │  ✅ transpact-webhook-receiver                            │
│ │                                                            │
│ ├─ Database (PostgreSQL)                                     │
│ │  ✅ All 9 tables with RLS policies                        │
│ │  ✅ audit_log for version control                         │
│ │  ├─ painters                                              │
│ │  ├─ jobs                                                  │
│ │  ├─ job_matches                                           │
│ │  ├─ job_milestones                                        │
│ │  ├─ reviews                                               │
│ │  ├─ notification_preferences                              │
│ │  ├─ message_block_log                                     │
│ │  └─ transpact_events                                      │
│ │                                                            │
│ └─ Authentication (Supabase Auth)                            │
│    ✅ Email/Password signup & login                          │
│    ✅ Email confirmation                                     │
│    ✅ JWT token generation                                   │
│                                                               │
└────────────────┬──────────────────────────────────────────────┘
                 │
        ┌────────┼────────┬──────────┐
        │        │        │          │
        ▼        ▼        ▼          ▼
     Transpact SendGrid Stream Chat Make.com
     (Escrow) (Email)   (Chat)     (Automation)
        ✅       ✅        ✅         ✅
```

---

## API Client Usage

All frontend calls go through `code/client/lib/api.ts`:

### Example: Submit Milestone

```typescript
import { submitMilestone } from "@/lib/api";

async function handleSubmit(milestoneId: string, notes: string) {
  const { success, error } = await submitMilestone(milestoneId, notes);
  
  if (!success && error) {
    console.error("Failed:", error);
    return;
  }
  
  console.log("Milestone submitted!");
}
```

### How `callFunction()` Works

1. Get current user's JWT token from Supabase Auth
2. Add headers:
   - `apikey`: Supabase anon key (from env)
   - `Authorization: Bearer [JWT token]`
   - `Content-Type: application/json`
3. POST to `https://kvuidnkmxqftbmlyvlyl.supabase.co/functions/v1/{functionName}`
4. Parse response JSON
5. Return `{ data, error }`

---

## Available Edge Functions

### Job Management

**`match-job-to-painters`**
```typescript
import { matchJobToPainters } from "@/lib/api";

const { success, error } = await matchJobToPainters(jobId);
```
- Automatically matches job to best painters
- Called after customer posts job
- Triggers Make.com workflow to send emails

**`accept-job`**
```typescript
import { acceptJob } from "@/lib/api";

const { success, error } = await acceptJob(jobId);
```
- Painter accepts a matched job
- Updates job_matches table
- Sends email to customer

### Milestone Management

**`submit-milestone`**
```typescript
import { submitMilestone } from "@/lib/api";

const { success, error } = await submitMilestone(
  milestoneId,
  "Completed interior walls painting"
);
```
- Painter submits milestone for approval
- Updates milestone status to "submitted"
- Triggers email to customer

**`approve-milestone`**
```typescript
import { approveMilestone } from "@/lib/api";

const { success, error } = await approveMilestone(
  milestoneId,
  "Looks great!" // optional notes
);
```
- Customer approves painter's work
- Updates milestone status to "approved"
- Triggers `release-milestone-payment`

**`request-milestone-changes`**
```typescript
import { requestMilestoneChanges } from "@/lib/api";

const { success, error } = await requestMilestoneChanges(
  milestoneId,
  "Please touch up the left corner"
);
```
- Customer requests changes to milestone
- Sends email to painter with notes
- Milestone status remains "submitted"

**`release-milestone-payment`**
```typescript
import { releaseMilestonePayment } from "@/lib/api";

const { transactionId, error } = await releaseMilestonePayment(milestoneId);
```
- Releases escrow funds to painter
- Updates milestone status to "paid"
- Deducts PaintBookCo commission (10%)
- Returns Transpact transaction ID

### Escrow Management

**`create-transpact`**
```typescript
import { createTranspactAccount } from "@/lib/api";

const { accountId, error } = await createTranspactAccount(
  jobId,
  1500, // amount
  "customer@example.com",
  "painter@example.com"
);
```
- Creates escrow account via Transpact SOAP API
- Funds held until job completion
- Returns Transpact account ID

**`get-transpact-status`**
```typescript
import { getTranspactStatus } from "@/lib/api";

const { status, error } = await getTranspactStatus(accountId);
// status: "pending", "funded", "held", "released", "disputed"
```
- Checks current escrow status
- Used to display payment status in UI

**`void-transpact`**
```typescript
import { voidTranspact } from "@/lib/api";

const { success, error } = await voidTranspact(
  accountId,
  "Customer cancelled job"
);
```
- Cancels escrow account
- Refunds customer
- Used when job is cancelled

### Reviews

**`submit-review`**
```typescript
import { submitReview } from "@/lib/api";

const { reviewId, error } = await submitReview(
  jobId,
  5, // rating 1-5
  "Excellent work! Highly recommend."
);
```
- Customer submits review of painter
- Updates painters table with rating
- Stores review in reviews table

### Account Management

**`download-my-data`**
```typescript
import { downloadMyData } from "@/lib/api";

const { csvUrl, error } = await downloadMyData();
// Opens CSV download of all user data
```
- GDPR compliance: downloads all user data
- Returns signed S3 URL
- User can download personal data

**`delete-my-account`**
```typescript
import { deleteMyAccount } from "@/lib/api";

const { success, error } = await deleteMyAccount(
  "Switching platforms" // optional reason
);
```
- Permanently deletes user account
- Anonymizes all personal data
- Keeps audit trail for legal compliance

### Chat Integration

**`generate-stream-token`**
```typescript
import { generateStreamToken } from "@/lib/api";

const { token, error } = await generateStreamToken();
// Use token to initialize Stream Chat client
```
- Generates JWT token for Stream Chat
- Token includes user ID and PII filtering
- Valid for 24 hours

**`filter-message`**
```typescript
import { filterMessage } from "@/lib/api";

const { filtered, error } = await filterMessage(userMessage);
// filtered: boolean (true = PII detected)
```
- Checks message for PII (email, phone, address)
- Alerts if sensitive info detected
- Prevents sharing personal data in chat

---

## Direct Database Queries

Some operations use direct Supabase queries (not Edge Functions):

### Get Job Details
```typescript
import { getJob } from "@/lib/api";

const { data: job, error } = await getJob(jobId);
```

### Get Jobs List
```typescript
import { getJobs } from "@/lib/api";

const { data: jobs, error } = await getJobs(
  customerId, // optional
  painterId    // optional
);
```

### Get Job Milestones
```typescript
import { getMilestones } from "@/lib/api";

const { data: milestones, error } = await getMilestones(jobId);
```

### Get Job Matches (for Painter)
```typescript
import { getJobMatches } from "@/lib/api";

const { data: matches, error } = await getJobMatches(painterId);
// Includes job details via join
```

### Get Reviews
```typescript
import { getReviews } from "@/lib/api";

const { data: reviews, error } = await getReviews(
  jobId,    // optional
  painterId // optional
);
```

### Notification Preferences
```typescript
import { 
  getNotificationPreferences,
  updateNotificationPreferences 
} from "@/lib/api";

// Get preferences
const { data: prefs, error } = await getNotificationPreferences(userId);

// Update preferences
await updateNotificationPreferences(userId, {
  email_job_alerts: false,
  sms_notifications: true,
  in_app_notifications: true,
});
```

---

## Make.com Automation Workflows

These workflows are **already configured** and triggered by database changes or API calls:

| Workflow | Trigger | Action |
|----------|---------|--------|
| KYC Approved | `painters.kyc_status = "approved"` | Send email congratulating painter |
| Job Posted → HubSpot | `jobs.created_at` | Create deal in HubSpot CRM |
| Painter Accepted → Email | `jobs.painter_id` updated | Email customer with painter details |
| Escrow Funded | `transpact_events.event = "funded"` | Share contact details between parties |
| No Match (24h) | Job has no matches after 24h | Alert customer + auto-email |
| Daily CEO Digest | 6 AM daily | Email CEO summary of activity |
| Dispute Raised | `job_milestones.status = "disputed"` | Alert all parties + Korey |
| Job Completed | `jobs.status = "completed"` | Notify parties + update HubSpot |
| Milestone Submitted | `job_milestones.status = "submitted"` | Email customer review request |
| Milestone Approved | `job_milestones.status = "approved"` | Email painter approval + payment info |
| Milestone Changes | RLS → `request-milestone-changes` | Email painter with change requests |
| PII Violation | Message contains email/phone/address | Alert Korey + log violation |

---

## Environment Variables Required

```env
# Supabase (already set)
VITE_SUPABASE_URL="https://kvuidnkmxqftbmlyvlyl.supabase.co"
VITE_SUPABASE_ANON_KEY="[from Bitwarden]"

# Stream Chat (for real-time chat)
VITE_STREAM_API_KEY="[from Bitwarden if using Stream]"

# Other services (optional, used by Make.com)
SENDGRID_API_KEY=[configured in Make.com]
TRANSPACT_API_KEY=[configured in Supabase Edge Functions]
HUBSPOT_API_KEY=[configured in Make.com]
```

---

## Authentication Flow

1. **Signup**: Frontend → `supabase.auth.signUp()` → Supabase Auth → Email sent
2. **Email Confirmation**: User clicks link → Supabase auto-authenticates
3. **Login**: Frontend → `supabase.auth.signInWithPassword()` → JWT token
4. **API Calls**: Every call includes JWT in `Authorization: Bearer [token]`
5. **RLS**: Database rows filtered by `auth.uid()` in RLS policies

### Getting JWT Token
```typescript
const { data: sessionData } = await supabase.auth.getSession();
const token = sessionData?.session?.access_token; // Use this in API calls
```

---

## Error Handling

All API functions return `{ data, error }` object:

```typescript
const { success, error } = await submitMilestone(id, notes);

if (!success && error) {
  // Handle error
  console.error("API Error:", error);
  // Example errors:
  // - "401: Not authenticated"
  // - "400: Invalid milestone ID"
  // - "500: Database connection failed"
}
```

---

## WebSocket/Real-time Updates

**Not yet implemented** but infrastructure ready:

```typescript
// Future: Set up Supabase Realtime for:
// - Live job notifications
// - Chat message updates
// - Milestone status changes

const channel = supabase
  .channel('jobs')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'jobs'
  }, (payload) => {
    console.log('Job updated:', payload);
  })
  .subscribe();
```

---

## Deployment Checklist

- [ ] All environment variables set in Netlify
- [ ] CORS enabled for paintbookco.co.uk domain
- [ ] Supabase RLS policies reviewed
- [ ] Edge Functions deployed (already done)
- [ ] Make.com workflows active
- [ ] Transpact sandbox configured
- [ ] Stream Chat keys configured
- [ ] SendGrid sender verified
- [ ] SSL certificate installed
- [ ] DNS records updated

---

## Troubleshooting

### "Not authenticated" Error
- Check JWT token is being sent in Authorization header
- Verify user is logged in via `supabase.auth.getSession()`
- Check token hasn't expired (JWTs expire after 24 hours)

### "401: Unauthorized" Error
- Check RLS policies allow the operation
- Verify `apikey` header is correct
- Ensure Supabase Auth is properly configured

### "No function found" Error
- Check function name spelling
- Verify function is deployed in Supabase
- Check function logs in Supabase dashboard

### Edge Function Timeout
- Check function logs for performance issues
- Increase timeout in function.json if needed
- Optimize database queries

---

**Version:** 1.0  
**Last Updated:** April 2026  
**Backend Status:** ✅ Production Ready  
**Frontend Integration:** 🔄 In Progress (62% complete)
