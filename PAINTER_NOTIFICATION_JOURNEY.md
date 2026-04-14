# Painter Notification Journey — SECTION 4

## Overview

The Painter Notification Journey is the flow through which painters are informed about available jobs they're matched with, review job details, and submit quotes. This is a **critical revenue driver** for the platform as it directly affects painter engagement and job acceptance rates.

---

## Notification Journey Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ CUSTOMER POSTS JOB                                              │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ MATCHING ENGINE IDENTIFIES PAINTERS                             │
│ (Within service radius, matching specialisms, not too busy)     │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ EMAIL NOTIFICATION SENT TO PAINTERS                             │
│ Subject: "New Job: [Job Title] - [Location]"                   │
│ Content: Job overview, budget, deadline, CTA to view job       │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ PAINTER RECEIVES EMAIL                                          │
│ Opens email → Clicks "View Job" button                         │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ PAINTER ARRIVES AT LANDING PAGE                                 │
│ If not logged in: Show login form pre-filled with email       │
│ If logged in: Redirect directly to job detail page             │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ PAINTER REVIEWS JOB DETAILS                                    │
│ • Job title, description, requirements                         │
│ • Location, dates, budget                                      │
│ • Customer's previous reviews & rating                         │
│ • Similar jobs they've completed                               │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                     ┌────────┴────────┐
                     │                 │
                  [Accept]          [Decline]
                     │                 │
                     ▼                 ▼
          ┌─────────────────────┐  [Job removed from available list]
          │ SUBMIT QUOTE        │
          │ • Proposed price    │
          │ • Timeline/dates    │
          │ • Notes to customer │
          └──────────┬──────────┘
                     │
                     ▼
          ┌─────────────────────┐
          │ QUOTE SUBMITTED     │
          │ Painter waits for   │
          │ customer response   │
          └─────────────────────┘
```

---

## Components & Pages

### 1. Notification Email

**Generated when:** Job is posted and painters are matched

**Template:**
```
From: noreply@paintbookco.com
To: [painter email]
Subject: New Job: {jobTitle} — {location}

Hi {painterName},

We found a job that matches your specialisms!

JOB DETAILS
───────────
Title: {jobTitle}
Location: {jobLocation}
Budget: £{jobBudget}
Start Date: {startDate}
Job Type: {jobType}
Specialisms: {specialisms}

CUSTOMER RATING
───────────────
Rating: ⭐ {customerRating}/5 ({reviewCount} reviews)

RESPOND BY
──────────
{deadlineDate} at {deadlineTime}

[VIEW JOB DETAILS]
cta_link: {uniqueLink}?token={emailToken}

Questions? Contact support@paintbookco.com
```

**Features:**
- Pre-filled login if painter clicks link
- Token-based verification (48-hour expiry)
- Painter email verified before showing job
- Deep link directly to job detail page

### 2. Job Notification Landing Page

**Route:** `/job-notification/:jobId`
**Auth:** Optional (login prompt if not authenticated)

**Features:**
- Shows job details and painter's match score
- Quick login form pre-filled with email
- Login redirects to same job view
- After 48 hours: "This job offer has expired" message

**Design:**
```tsx
<JobNotificationPage
  jobId={jobId}
  token={emailToken}
  onLoginSuccess={() => {/* Show job details */}}
/>
```

### 3. Job Detail Review Page

**Component:** `<JobReviewPanel />`
**Parent:** Customer Dashboard, My Jobs tab, or standalone modal

**Sections:**
```
┌─ Job Header ────────────────────────────────────┐
│ Title: {jobTitle}                                │
│ Location: {jobLocation}                          │
│ Budget: £{jobBudget}  |  Duration: {duration}   │
└─────────────────────────────────────────────────┘

┌─ Job Details ───────────────────────────────────┐
│ Description                                     │
│ Requirements                                    │
│ Materials Included                              │
│ Timeline                                        │
│ Property Type                                   │
└─────────────────────────────────────────────────┘

┌─ Customer Info ─────────────────────────────────┐
│ Rating: ⭐ {rating}/5  |  Reviews: {count}      │
│ Member Since: {joinDate}                        │
│ Response Time: {responseTime}                   │
│ Verified Email: ✓                               │
└─────────────────────────────────────────────────┘

┌─ Similar Jobs ──────────────────────────────────┐
│ [Painter's 3 most recent similar jobs]          │
│ Used to show painter's experience in this type  │
└─────────────────────────────────────────────────┘

┌─ Actions ───────────────────────────────────────┐
│ [ACCEPT & QUOTE]  [DECLINE]  [SAVE FOR LATER]  │
└─────────────────────────────────────────────────┘
```

### 4. Quote Submission Form

**Component:** `<QuoteSubmissionForm />`
**Modal:** Opens after painter clicks "Accept & Quote"

**Fields:**
```
1. Proposed Price
   - Amount (£)
   - Show customer's budget for reference
   - Show typical prices for this job type
   - Warning if significantly above/below market

2. Timeline/Availability
   - When can you start? (date picker)
   - Estimated completion date
   - Availability calendar

3. Notes to Customer
   - Proposed approach (text area)
   - Questions about job (text area)
   - Any special requirements (textarea)

4. Confirmation
   - "I understand this job requires KYC verification"
   - "I agree to the PaintBookCo Terms"
   - [SUBMIT QUOTE] button
```

**Validation:**
- Price >= £50
- Price < £50,000
- Start date is in future
- Notes cannot be empty
- All required fields filled

---

## Notification Status Tracking

### job_matches Table
```sql
CREATE TABLE job_matches (
  id                  UUID PRIMARY KEY
  job_id              UUID REFERENCES jobs(id)
  painter_id          UUID REFERENCES painters(id)
  status              TEXT            -- notified, accepted, declined, quoted, matched
  email_sent_at       TIMESTAMP
  email_opened_at     TIMESTAMP
  email_clicked_at    TIMESTAMP
  job_reviewed_at     TIMESTAMP
  quote_submitted_at  TIMESTAMP
  declined_reason     TEXT
  notified_count      INT DEFAULT 1   -- How many times notified
  expires_at          TIMESTAMP       -- 48 hours from creation
  created_at          TIMESTAMP
  updated_at          TIMESTAMP
)
```

### Status Flow
```
notified
  ├─ (painter opens email) → email_opened_at = NOW
  ├─ (painter clicks link) → email_clicked_at = NOW
  ├─ (painter accepts) → status = accepted
  ├─ (painter declines) → status = declined
  └─ (48h expires) → notify_painter("offer_expired")

accepted
  └─ (painter submits quote) → status = quoted

quoted
  ├─ (customer accepts quote) → status = matched
  ├─ (customer declines quote) → status = notified (re-list)
  └─ (7 days no response) → notify_customer("quote_received")
```

---

## Notification Features

### 1. Email Tracking
- **Opened**: When painter clicks link or views email
- **Clicked**: Deep link navigation
- **Response**: When painter submits quote

### 2. Declining Jobs
When painter declines a job offer:
```
Optional: "Why are you declining?"
- Too busy right now
- Budget not suitable
- Travel distance too far
- Not my specialty
- Other (text field)
```
- Decline reason recorded for analytics
- Job automatically goes to next painter

### 3. Re-notification (First Decline)
If painter declines:
```
Wait 2 hours, then:
- Move job to next painter in queue
- Send re-notification email to painters 2-5 in queue
- If all decline within 48h: Lower price by 5%, re-notify all
```

### 4. Dashboard Notifications
In Painter Dashboard, "Available Jobs" tab shows:
```
┌─ New Jobs (3) ──────────────────────────────────┐
│ [Job 1] Expires in 24 hours                     │
│ [Job 2] Expires in 2 hours                      │
│ [Job 3] Expires in 30 minutes                   │
└─────────────────────────────────────────────────┘
```

Pending responses:
```
┌─ My Quotes (2) ─────────────────────────────────┐
│ [Job 1] Quote submitted 2 days ago              │
│ [Job 2] Quote submitted 5 days ago              │
│         ⚠️ Customer hasn't responded            │
└─────────────────────────────────────────────────┘
```

---

## API Endpoints Required

### Email Notification
```
POST /api/notifications/send-job-offer
Request: {
  jobId: UUID
  painterIds: UUID[]
  emailTemplate: "job-offer"
}
Response: {
  sent: number
  failed: number
}
```

### Update Match Status
```
POST /api/job-matches/update-status
Request: {
  matchId: UUID
  status: "accepted" | "declined" | "quoted"
  quoteData?: { price, timeline, notes }
}
Response: {
  success: boolean
  matchId: UUID
  newStatus: string
}
```

### Get Available Jobs for Painter
```
GET /api/painters/{painterId}/available-jobs
Response: {
  jobs: Job[]
  totalCount: number
}
```

### Track Email Events
```
POST /api/notifications/track-event
Request: {
  matchId: UUID
  event: "opened" | "clicked" | "quote_submitted"
  timestamp: ISO string
}
Response: { tracked: boolean }
```

---

## KYC Gate in Notification Flow

After painter clicks "Accept & Quote":
1. Check if painter's KYC status === "approved"
2. If pending: Show notification → "Complete verification to quote"
3. If rejected: Show error → "Your account is not verified"
4. If approved: Show quote form

---

## Notification Frequency Rules

**Per Painter, Per Day:**
- Max 5 job notifications (prevent spam)
- Notifications only 8am–6pm local time
- Skip if painter marked "busy" on calendar

**Per Job:**
- Send to batches of painters
- Batch 1 (best matches): 15 painters
- Wait 2 hours
- Batch 2 (good matches): 15 painters
- Wait 4 hours
- Batch 3 (adequate matches): 15 painters
- Continue until job accepted or 48h expires

---

## Analytics Tracked

```
- Email sent count per job
- Email open rate
- Email click-through rate (CTR)
- Quote submission rate
- Avg time to view job after email
- Avg time to submit quote after viewing
- Decline rate per painter
- Decline reasons distribution
```

---

## Email Template HTML

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: #0A0A0A; color: white; padding: 20px; }
    .title { color: #F97316; font-size: 24px; font-weight: bold; }
    .cta-button {
      background: #F97316;
      color: black;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: bold;
      display: inline-block;
    }
    .footer { color: #999; font-size: 12px; text-align: center; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <p>PaintBookCo</p>
      <p class="title">New Job Opportunity</p>
    </div>
    
    <div style="padding: 20px;">
      <h2>Hi {painterName}!</h2>
      <p>We found a job that matches your profile.</p>
      
      <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3>{jobTitle}</h3>
        <p>{jobLocation}</p>
        <p><strong>Budget: £{jobBudget}</strong></p>
      </div>
      
      <p>This offer expires in 48 hours.</p>
      
      <center style="margin: 30px 0;">
        <a href="{viewJobUrl}" class="cta-button">View Job & Quote</a>
      </center>
      
      <p style="font-size: 12px; color: #666;">
        If the button doesn't work, copy this link:<br>
        {viewJobUrl}
      </p>
    </div>
    
    <div class="footer">
      <p>© 2026 PaintBookCo. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

---

## Implementation Checklist

- [ ] `job_matches` table created with proper indices
- [ ] Email notification endpoint implemented
- [ ] Job notification landing page created
- [ ] Quote submission form built
- [ ] Email tracking events logged
- [ ] Match status update endpoints working
- [ ] KYC gate enforced in quote flow
- [ ] Dashboard "Available Jobs" widget shows pending notifications
- [ ] Re-notification logic after decline
- [ ] Expiry logic (48h auto-remove from available)
- [ ] Analytics dashboard tracking open/click rates
- [ ] Email templates styled and tested
- [ ] Sent to real test painters
- [ ] Monitor quote submission rate

---

**Version:** 1.0  
**Last Updated:** April 2026  
**Status:** ✅ Design Complete — Implementation Required
