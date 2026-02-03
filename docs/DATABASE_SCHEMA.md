# PaintBook Database Schema

## Overview

The database is managed with Prisma ORM and PostgreSQL. The schema supports:
- Multi-user platform (customers, painters, admins)
- Job posting and quote workflow
- Escrow-based payment system (Transpact integration)
- Dispute resolution
- Reputation and reliability tracking
- B2B customer management

---

## Core Models

### User
Main user account model. Parent of CustomerProfile or PainterProfile.

```prisma
model User {
  id        String      @id @default(cuid())
  email     String      @unique
  password  String      // bcrypt hashed
  userType  UserType    // "customer" | "painter"
  
  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  customerProfile   CustomerProfile?
  painterProfile    PainterProfile?
  jobs              Job[]
  quotes            Quote[]
  notifications     Notification[]
  messages          Message[]
  sentMessages      Message[] @relation("SentMessages")
  receivedMessages  Message[] @relation("ReceivedMessages")
  disputes          Dispute[]
  disputeInitiated  Dispute[] @relation("InitiatedBy")
}
```

---

### CustomerProfile
Profile data for customers.

```prisma
model CustomerProfile {
  id                  String
  userId              String      @unique
  user                User        @relation(fields: [userId])
  
  firstName           String?
  lastName            String?
  phone               String?
  postcode            String?
  favoritesPainterIds String[]    @default([])
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Fields:**
- `favoritesPainterIds` - Array of painter profile IDs for quick access

---

### PainterProfile
Profile data for painters. Includes verification, insurance, and reputation fields.

```prisma
model PainterProfile {
  id                      String
  userId                  String      @unique
  user                    User        @relation(fields: [userId])
  
  // Basic info
  businessName            String?
  bio                     String?
  phone                   String?
  postcode                String      // Required
  serviceRadius           Int         @default(15)  // miles
  
  // Skills & availability
  skills                  String[]    @default([])  // interior, exterior, kitchen, wallpaper
  availability            String[]    @default([])  // This week, Next week, etc
  
  // Pricing
  rateMin                 Float       @default(18)
  rateMax                 Float       @default(35)
  
  // Portfolio
  portfolioImages         String[]    @default([])
  
  // ID Verification (KYC)
  verificationStatus      VerificationStatus @default(pending)
  idType                  String?     // passport, driving_license, etc
  idNumber                String?
  idExpiryDate            DateTime?
  idDocuments             String[]    @default([])
  
  // Insurance
  hasInsurance            Boolean     @default(false)
  insuranceInsurer        String?
  insurancePolicy         String?
  insuranceExpiry         DateTime?
  insuranceDocs           String[]    @default([])
  
  // Reputation & Tier
  tier                    Tier        @default(starter)    // starter, pro, premium
  reliabilityScore        Float       @default(0)
  totalJobs               Int         @default(0)
  totalEarnings           Float       @default(0)
  cancellationRate        Float       @default(0)
  
  // 2FA (Two-Factor Auth)
  twoFAEnabled            Boolean     @default(false)
  twoFASecret             String?     // TOTP secret
  
  // Commission tracking
  currentCommissionTier   Int         @default(0)   // 12%, 10%, or 8%
  jobsInCurrentTier       Int         @default(0)
  
  createdAt               DateTime    @default(now())
  updatedAt               DateTime    @updatedAt
  
  // Relations
  reliabilityEvents       ReliabilityEvent[]
}

enum VerificationStatus {
  pending       // Awaiting submission
  under_review  // Admin reviewing
  approved      // KYC passed
  denied        // KYC failed
}

enum Tier {
  starter
  pro
  premium
}
```

**Key Features:**
- KYC verification with document uploads
- Insurance tracking
- Reliability scoring for reputation
- Commission tier tracking (affects fees)
- 2FA support for enhanced security

---

## Job Management Models

### Job
Main job posting model.

```prisma
model Job {
  id                      String
  customerId              String
  customer                User        @relation(fields: [customerId])
  
  jobType                 JobType
  title                   String
  description             String?
  
  postcode                String
  
  budgetMin               Float?
  budgetMax               Float?
  
  images                  String[]    @default([])
  
  // Paint estimator data
  paintBrand              String?
  rooms                   Json[]      @default([])  // RoomDimension objects
  estimatedMaterialCost   Float?
  estimatedLitres         Float?
  estimatedWallArea       Float?
  
  // Escrow & payment
  useEscrow               Boolean     @default(true)
  escrowAmount            Float?
  escrowProvider          String      @default("transpact")
  escrowTransactionId     String?
  escrowStatus            EscrowStatus @default(not_initiated)
  
  // Status
  status                  JobStatus   @default(open)
  
  // Selected painter (after quote accepted)
  painterId               String?
  painter                 PainterProfile? @relation(fields: [painterId])
  
  // Contact
  customerEmail           String?
  customerPhone           String?
  
  createdAt               DateTime    @default(now())
  updatedAt               DateTime    @updatedAt
  
  // Relations
  quotes                  Quote[]
  escrowTransactions      EscrowTransaction[]
  messages                Message[]
  notifications           Notification[]
  disputes                Dispute[]
  completion              JobCompletion?
}

enum JobType {
  interior
  exterior
  kitchen
  wallpaper
  other
}

enum JobStatus {
  open              // Posted, no quotes
  quote_requested   // Quote requested from specific painter
  quote_received    // Quote(s) received
  quote_accepted    // Quote accepted, awaiting payment
  escrow_funded     // Payment received
  in_progress       // Work started
  completed         // Work done, pending approval
  approved          // Approved by customer
  cancelled         // Cancelled
  dispute           // Under dispute
}

enum EscrowStatus {
  not_initiated     // No payment
  pending           // Payment initiated
  funded            // Money received
  released          // Funds released to painter
  refunded          // Refunded
  frozen            // Dispute hold
}
```

**Room Dimension Schema (stored as Json):**
```typescript
interface RoomDimension {
  id: string;           // Unique ID for room
  name: string;         // "Living Room", "Bedroom 1", etc
  length: number;       // meters
  width: number;        // meters
  height: number;       // meters
  coats: number;        // Number of paint coats
}
```

---

### Quote
Painter's quote on a job.

```prisma
model Quote {
  id                      String
  jobId                   String
  job                     Job         @relation(fields: [jobId])
  
  painterId               String
  painter                 User        @relation(fields: [painterId])
  
  jobPrice                Float
  consultationFee         Float       @default(0)
  totalPrice              Float
  
  status                  QuoteStatus @default(pending)
  rejectionReason         String?
  
  negotiationHistory      Json[]      @default([])
  
  createdAt               DateTime    @default(now())
  updatedAt               DateTime    @updatedAt
  acceptedAt              DateTime?
  expiresAt               DateTime?
}

enum QuoteStatus {
  pending         // Awaiting customer response
  accepted        // Customer accepted
  rejected        // Customer rejected
  counter_offered // Painter counter-offered
  expired         // Quote expired
}
```

**Negotiation History Schema:**
```typescript
interface NegotiationEntry {
  proposedBy: string;    // User ID
  price: number;
  timestamp: string;     // ISO date
  status: QuoteStatus;
}
```

---

### JobCompletion
Tracks job completion and approval workflow.

```prisma
model JobCompletion {
  id                      String      @id @default(cuid())
  jobId                   String      @unique
  job                     Job         @relation(fields: [jobId])
  
  markedCompleteAt        DateTime?
  completionNotes         String?
  completionImages        String[]    @default([])
  
  approvedAt              DateTime?
  approvalNotes           String?
  
  autoApprovedAt          DateTime?   // After 7 days
  
  createdAt               DateTime    @default(now())
  updatedAt               DateTime    @updatedAt
}
```

---

## Payment & Escrow Models

### EscrowTransaction
Tracks escrow payments through Transpact.

```prisma
model EscrowTransaction {
  id                              String
  jobId                           String
  job                             Job         @relation(fields: [jobId])
  
  transpactTransactionId          String?
  transpactStatus                 String?
  
  totalAmount                     Float
  painterbookcoCommission         Float       // Platform fee
  escrowCost                      Float       // Transpact fee
  painterAmount                   Float       // What painter gets
  
  commissionRate                  Float       @default(12)
  
  customerPaidAmount              Float       @default(0)
  painterPaidAmount               Float       @default(0)
  
  status                          EscrowStatus @default(not_initiated)
  
  cancelled                       Boolean     @default(false)
  cancellationType                CancellationType?
  cancellationReason              String?
  
  fundedAt                        DateTime?
  releasedAt                      DateTime?
  cancelledAt                     DateTime?
  
  createdAt                       DateTime    @default(now())
  updatedAt                       DateTime    @updatedAt
}

enum CancellationType {
  pre_escrow      // Before payment
  post_escrow     // After payment
  late            // <24-48h before start
}
```

**Commission Tiers:**
- Jobs 1-5: 12% commission
- Jobs 6-10: 10% commission
- Jobs 11+: 8% commission

**Example Calculation:**
```
Job value: £1000
Commission rate: 12%
Commission: £120
Escrow cost (2.5%): £25
Painter receives: £880
```

---

## Dispute & Reputation Models

### Dispute
Dispute resolution tracking.

```prisma
model Dispute {
  id                              String      @id @default(cuid())
  jobId                           String
  job                             Job         @relation(fields: [jobId])
  
  initiatedBy                     String
  initiatedByUser                 User        @relation("InitiatedBy", fields: [initiatedBy])
  
  otherId                         String
  otherUser                       User        @relation(fields: [otherId])
  
  reason                          String
  description                     String?
  evidence                        EvidenceSubmission[]
  
  status                          DisputeStatus @default(open)
  resolution                      String?
  
  customerRefundAmount            Float?
  painterCompensationAmount       Float?
  
  createdAt                       DateTime    @default(now())
  updatedAt                       DateTime    @updatedAt
  openedAt                        DateTime    @default(now())
  resolvedAt                      DateTime?
}

enum DisputeStatus {
  open        // Awaiting review
  in_review   // Admin reviewing
  resolved    // Resolved
  closed      // Closed
}
```

---

### ReliabilityEvent
Tracks events that affect painter reliability score.

```prisma
model ReliabilityEvent {
  id                              String
  painterId                       String
  painter                         PainterProfile @relation(fields: [painterId])
  
  eventType                       ReliabilityEventType
  value                           Float       // +1, -0.5, etc
  reason                          String?
  
  createdAt                       DateTime    @default(now())
}

enum ReliabilityEventType {
  job_completed
  job_cancelled
  late_arrival
  customer_dispute
  low_quality_work
  on_time
  excellent_review
}
```

**Scoring Rules:**
- `job_completed`: +1
- `job_cancelled`: -0.5
- `late_arrival`: -0.25
- `customer_dispute`: -1
- `low_quality_work`: -2
- `on_time`: +0.25
- `excellent_review`: +1.5

---

## Communication Models

### Message
Direct messages between customer and painter.

```prisma
model Message {
  id                              String
  jobId                           String
  job                             Job         @relation(fields: [jobId])
  
  senderId                        String
  sender                          User        @relation("SentMessages", fields: [senderId])
  
  recipientId                     String
  recipient                       User        @relation("ReceivedMessages", fields: [recipientId])
  
  content                         String
  attachments                     String[]    @default([])
  
  createdAt                       DateTime    @default(now())
  readAt                          DateTime?
}
```

---

### Notification
System notifications.

```prisma
model Notification {
  id                              String
  userId                          String
  user                            User        @relation(fields: [userId])
  
  jobId                           String
  job                             Job         @relation(fields: [jobId])
  
  type                            NotificationType
  title                           String
  body                            String
  
  readAt                          DateTime?
  
  createdAt                       DateTime    @default(now())
}

enum NotificationType {
  job_posted
  quote_requested
  quote_received
  quote_accepted
  payment_received
  job_complete
  job_approved
  dispute_raised
  message_received
}
```

---

## B2B Models

### B2BCustomer
B2B customer management.

```prisma
model B2BCustomer {
  id                              String
  
  companyName                     String
  contactEmail                    String      @unique
  contactPhone                    String?
  
  projectDescription              String?
  location                        String?
  
  status                          B2BStatus   @default(discovery)
  
  meetingNotes                    String?
  meetingDate                     DateTime?
  
  agreementStatus                 AgreementStatus @default(none)
  agreementUrl                    String?
  
  milestones                      B2BMilestone[]
  
  createdAt                       DateTime    @default(now())
  updatedAt                       DateTime    @updatedAt
}

enum B2BStatus {
  discovery
  consultation
  agreement
  active
  completed
  rejected
}

enum AgreementStatus {
  none
  drafted
  pending_signature
  signed
}
```

---

### B2BMilestone
Milestones for B2B projects.

```prisma
model B2BMilestone {
  id                              String
  customerId                      String
  customer                        B2BCustomer @relation(fields: [customerId])
  
  title                           String
  description                     String?
  scope                           String?
  
  budgetAmount                    Float
  
  status                          MilestoneStatus @default(pending)
  
  dueDate                         DateTime?
  completedAt                     DateTime?
  
  createdAt                       DateTime    @default(now())
  updatedAt                       DateTime    @updatedAt
}

enum MilestoneStatus {
  pending
  in_progress
  completed
  approved
}
```

---

## Indexes and Performance

The following indexes are recommended:

```sql
-- User lookups
CREATE INDEX idx_user_email ON "User"(email);

-- Job queries
CREATE INDEX idx_job_customer_id ON "Job"("customerId");
CREATE INDEX idx_job_painter_id ON "Job"("painterId");
CREATE INDEX idx_job_postcode ON "Job"(postcode);
CREATE INDEX idx_job_status ON "Job"(status);
CREATE INDEX idx_job_created_at ON "Job"("createdAt" DESC);

-- Quote queries
CREATE INDEX idx_quote_job_id ON "Quote"("jobId");
CREATE INDEX idx_quote_painter_id ON "Quote"("painterId");
CREATE INDEX idx_quote_status ON "Quote"(status);

-- Escrow queries
CREATE INDEX idx_escrow_job_id ON "EscrowTransaction"("jobId");
CREATE INDEX idx_escrow_status ON "EscrowTransaction"(status);

-- Message queries
CREATE INDEX idx_message_job_id ON "Message"("jobId");
CREATE INDEX idx_message_sender_id ON "Message"("senderId");
CREATE INDEX idx_message_recipient_id ON "Message"("recipientId");

-- Notification queries
CREATE INDEX idx_notification_user_id ON "Notification"("userId");
CREATE INDEX idx_notification_read_at ON "Notification"("readAt");
```

---

## Setting Up the Database

1. Install Prisma CLI:
   ```bash
   npm install -D prisma
   ```

2. Create `.env` with `DATABASE_URL`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/paintbook"
   ```

3. Initialize Prisma:
   ```bash
   npx prisma init
   ```

4. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

5. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

6. View database:
   ```bash
   npx prisma studio
   ```
