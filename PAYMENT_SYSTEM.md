# PaintBookCo Payment & Escrow System — SECTION 3

## Overview

PaintBookCo uses a **two-tier payment system**:
1. **Stripe** for payment processing and customer card handling
2. **TransPact** for secure escrow management of funds

This ensures customer payments are protected throughout the job lifecycle.

---

## Architecture

### Payment Flow

```
Customer         Stripe          TransPact       Painter
    |              |                  |              |
    |—Post Job—→   |                  |              |
    |              |                  |              |
    |—Pay (Card)—→ |—Create Intent—→  |              |
    |              |← Client Secret←  |              |
    |← Confirm  ←–|—Process Token—→   |              |
    |              |← Succeeded   ←   |              |
    |              |                  |              |
    |—Fund Escrow—→|                  |              |
    |              |———Create Account→|              |
    |              |←  Account ID   ←|              |
    |              |                  |              |
    |                                 |—Notification→|
    |                                 |              |
    |                                 |←—Quote Sent ←|
    |                                 |              |
    |                                 |—Accept Job  →|
    |                                 |              |
    |                                 |              |
    Work Completed...                 |              |
    |—Approve Job—→|                  |—Release 50%→|
    |              |                  |              |
    |—Release Milestone—→             |—Release 50%→|
    |              |                  |              |
    Dispute (optional)...             |              |
    |—Dispute Job—→|                  |←Hold Funds ←|
    |              |     (Mediation)   |              |
    |              |←  Resolution   ←|              |
```

---

## Components

### 1. Payment Service (`code/client/lib/payments.ts`)

Core payment operations:

```typescript
// Create Stripe payment intent
createPaymentIntent(amount: number, jobId: string)

// Confirm payment after token processing
confirmPayment(paymentIntentId: string, jobId: string)

// Create escrow account for job
createEscrowAccount(customerId, painterId, jobId, amount)

// Fund escrow with customer payment
fundEscrowAccount(escrowAccountId, jobId)

// Release funds to painter
releaseEscrowFunds(escrowAccountId, painterId, amount)

// Hold funds during dispute
holdEscrowFunds(escrowAccountId)

// Approve and release milestone payments
approveMilestonePayment(milestoneId)
releaseMilestonePayment(milestoneId, painterId)

// Get payment history
getPaymentHistory(userId)

// Handle refunds
initiateRefund(paymentIntentId, reason)
```

### 2. Payment Form (`code/client/components/payments/PaymentForm.tsx`)

User interface for entering payment details:

**Features:**
- Amount display and confirmation
- Card details entry (Name, Card Number, Expiry, CVC)
- Real-time validation
- Status feedback (amount → card → processing → success)
- Error handling
- Cancel option

**States:**
- `amount` — Show payment summary and confirm
- `card` — Collect card details
- `processing` — Handle Stripe/escrow processing
- `success` — Confirmation page

**Usage:**
```tsx
import PaymentForm from "@/components/payments/PaymentForm";

<PaymentForm
  jobId={job.id}
  jobTitle={job.title}
  amount={job.total_price}
  onSuccess={() => {/* Refresh */}}
  onCancel={() => {/* Close modal */}}
/>
```

---

## Database Schema

### escrow_accounts Table
```sql
id                    UUID PRIMARY KEY
customer_id           UUID REFERENCES customers
painter_id            UUID REFERENCES painters
job_id                UUID REFERENCES jobs
amount                NUMERIC(10,2)          -- Total escrow amount
status                TEXT                   -- pending, funded, held, released, disputed
transpact_account_id  VARCHAR                -- External escrow account ID
transpact_transaction_id VARCHAR             -- External transaction ID
created_at            TIMESTAMP
updated_at            TIMESTAMP

-- Indices
CREATE INDEX idx_escrow_customer ON escrow_accounts(customer_id)
CREATE INDEX idx_escrow_painter ON escrow_accounts(painter_id)
CREATE INDEX idx_escrow_job ON escrow_accounts(job_id)
CREATE INDEX idx_escrow_status ON escrow_accounts(status)
```

### payment_intents Table
```sql
id                    VARCHAR PRIMARY KEY
customer_id           UUID REFERENCES customers
painter_id            UUID REFERENCES painters (nullable)
job_id                UUID REFERENCES jobs
amount                NUMERIC(10,2)
currency              VARCHAR (default: GBP)
status                TEXT                   -- pending, processing, succeeded, failed
stripe_intent_id      VARCHAR                -- Stripe PaymentIntent ID
created_at            TIMESTAMP
updated_at            TIMESTAMP

-- Indices
CREATE INDEX idx_payment_customer ON payment_intents(customer_id)
CREATE INDEX idx_payment_status ON payment_intents(status)
```

### milestone_payments Table
```sql
id                    UUID PRIMARY KEY
milestone_id          UUID REFERENCES job_milestones
escrow_account_id     UUID REFERENCES escrow_accounts
amount                NUMERIC(10,2)
status                TEXT                   -- pending, approved, paid, disputed
created_at            TIMESTAMP
updated_at            TIMESTAMP
```

---

## Payment Lifecycle

### Job Posting → Payment
1. Customer posts job
2. Painter accepts or quotes
3. Customer reviews quote and decides to pay
4. Customer navigates to payment screen

### Payment Processing
1. Customer enters card details into PaymentForm
2. Frontend creates Stripe PaymentIntent via server API
3. Stripe tokenizes card (never transmitted raw)
4. Frontend confirms payment with token
5. Server processes with Stripe
6. Server creates TransPact escrow account
7. Funds moved to escrow
8. Painter notified job is funded

### Milestone-Based Release
```
Milestone 1 (50%)
├─ Painter submits work proof
├─ Customer approves
└─ 50% released to painter

Milestone 2 (50%)
├─ Painter submits final work
├─ Customer approves
└─ 50% released + 10% commission retained
```

### Dispute Handling
```
Customer disputes job
├─ Funds held in escrow
├─ Admin reviews evidence
│  ├─ Customer claims breach
│  └─ Painter claims non-payment risk
├─ Decision made
├─ Funds released or refunded
└─ Dispute closed
```

---

## Server-Side Implementation (Required)

The following server endpoints must be implemented in `code/server/routes/`:

### Payment Endpoints

**POST /api/payments/create-intent**
```typescript
Request: { amount: number, jobId: string }
Response: { clientSecret: string }

// 1. Create Supabase payment_intents record
// 2. Create Stripe PaymentIntent
// 3. Return clientSecret
```

**POST /api/payments/confirm**
```typescript
Request: { paymentIntentId: string, jobId: string }
Response: { success: boolean }

// 1. Confirm payment with Stripe
// 2. Update payment_intents status
// 3. Call escrow/fund-account
// 4. Send notification to painter
```

**POST /api/payments/refund**
```typescript
Request: { paymentIntentId: string, reason: string }
Response: { refundId: string }

// 1. Validate payment is eligible for refund
// 2. Create Stripe refund
// 3. Update payment status
// 4. Release escrow if held
```

### Escrow Endpoints

**POST /api/escrow/setup-account**
```typescript
Request: { jobId: string, customerId: string, painterId: string, amount: number }
Response: { accountId: string, transpactId: string }

// 1. Create TransPact escrow account
// 2. Store transpactId in Supabase
// 3. Return accountId
```

**POST /api/escrow/fund**
```typescript
Request: { escrowAccountId: string, jobId: string }
Response: { success: boolean }

// 1. Verify payment succeeded
// 2. Transfer funds to TransPact account
// 3. Update escrow_accounts.status = "funded"
// 4. Emit "escrow_funded" event
```

**POST /api/escrow/release**
```typescript
Request: { escrowAccountId: string, painterId: string, amount: number }
Response: { success: boolean }

// 1. Verify job completion approved
// 2. Deduct PaintBookCo commission (10%)
// 3. Release remaining to painter account
// 4. Update escrow_accounts.status = "released"
// 5. Send payment confirmation to painter
```

**POST /api/escrow/hold**
```typescript
Request: { escrowAccountId: string }
Response: { success: boolean }

// 1. Freeze funds in escrow
// 2. Update escrow_accounts.status = "held"
// 3. Notify admin for dispute review
```

### Milestone Endpoints

**POST /api/milestones/approve-payment**
```typescript
Request: { milestoneId: string }
Response: { success: boolean }

// 1. Update milestone_payments.status = "approved"
// 2. Calculate release amount
// 3. Queue payment release
```

**POST /api/milestones/release-payment**
```typescript
Request: { milestoneId: string, painterId: string }
Response: { transactionId: string }

// 1. Verify approval
// 2. Release funds from escrow
// 3. Update milestone status to "paid"
// 4. Send painter notification
```

---

## Environment Variables

```env
# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# TransPact
TRANSPACT_API_KEY="test_transpact_key_placeholder"
TRANSPACT_API_URL="https://api.transpact.com"
TRANSPACT_BANK_ACCOUNT_ID="..."

# Payment Settings
PAINTBOOK_COMMISSION_RATE=0.10      # 10%
PAINTBOOK_PAYOUT_FREQUENCY="weekly" # or "monthly"
```

---

## Security Considerations

### Card Security
- Never store raw card details
- Always use Stripe tokenization
- Implement 3D Secure for high-value transactions
- Comply with PCI DSS

### Escrow Security
- Funds held by third-party (TransPact)
- RLS policies restrict access to own payments
- Audit log all transactions
- Require admin approval for disputes

### Fraud Prevention
- Velocity checks (max X payments per hour)
- Address verification (AVS)
- CVV verification
- Dispute monitoring

---

## Commission Structure

```
Total Job Value: £1000

Customer Pays:    £1000
├─ Payment processing fee (Stripe):    £29 (2.9% + £0.30)
└─ Net to escrow:                       £971

Painter Receives: 90% of job value
├─ Tier 1 (Jobs 1-5):       £900 (90% of £1000)
├─ Tier 2 (Jobs 6-10):      £900 + 1% bonus = £909
├─ Tier 3 (Jobs 11+):       £900 + 2% bonus = £918
└─ PaintBookCo commission:  10%

PaintBookCo earns:
├─ Commission (10%):         £100
├─ Processing fee profit:    £29
└─ Total:                    £129 per job
```

---

## Testing Checklist

- [ ] Create payment intent successfully
- [ ] Process test card payment (4242 4242 4242 4242)
- [ ] Create escrow account
- [ ] Fund escrow with payment
- [ ] Release milestone payment
- [ ] Hold funds on dispute
- [ ] Refund cancelled payment
- [ ] Verify audit logs
- [ ] Test 3D Secure flow
- [ ] Test error scenarios
- [ ] Load test payment processing

---

## Compliance

- **PCI DSS Level 1** — Through Stripe tokenization
- **GDPR** — Customer payment data processed in EU
- **FCA Regulations** — Escrow account handling
- **Terms of Service** — Payment & dispute resolution

---

## Future Enhancements

- [ ] Apple Pay / Google Pay integration
- [ ] Buy now, pay later (Klarna, Affirm)
- [ ] Subscription billing for recurring jobs
- [ ] Payout to bank account vs. wallet
- [ ] Invoice generation for customers
- [ ] Payment analytics dashboard

---

**Version:** 1.0  
**Last Updated:** April 2026  
**Status:** ✅ Design & Components Complete — Server implementation needed
