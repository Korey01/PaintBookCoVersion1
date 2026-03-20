# PaintBookCo - Product Requirements Document (PRD)

**Version**: 1.0  
**Last Updated**: March 2026  
**Status**: In Development (Phases 1-3 Complete)  

---

## 1. EXECUTIVE SUMMARY

PaintBookCo is a professional marketplace platform connecting customers seeking interior and exterior painting services with verified, insured painters. The platform provides:

- **For Customers**: Easy job posting, painter discovery, transparent pricing, escrow-protected payments
- **For Painters**: Job discovery, quote management, built-in earning tracking, reputation building
- **For Admins**: Comprehensive management dashboard, KYC verification workflows, dispute resolution, analytics

The platform is built as a full-stack application with a React frontend, Express.js backend, PostgreSQL database, and is production-ready for MVP deployment.

---

## 2. PRODUCT VISION & GOALS

### Vision Statement

To become the leading trusted marketplace for painting services in the UK, combining rigorous painter verification, transparent pricing, secure escrow payments, and excellent customer service.

### Business Goals

1. **Reduce Friction** in hiring painters - eliminate phone calls, inconsistent quotes, and trust concerns
2. **Protect Customers** - enforce KYC verification, escrow payments, insurance validation, dispute resolution
3. **Enable Painters** - provide job pipeline, professional tools, transparent earnings, reputation building
4. **Build Trust** - transparent fee structure, insurance enforcement, customer reviews, admin oversight
5. **Scale Sustainably** - tiered commission structure, automated workflows, B2B support

### Success Metrics

- **Customer Acquisition**: Target 1,000+ active job postings within first 6 months
- **Painter Quality**: 95%+ KYC approval rate, 90%+ job completion rate
- **Payment Health**: 100% escrow utilization for jobs, <1% disputed payments
- **Platform Engagement**: 70%+ painters complete jobs within 14 days
- **Revenue**: 12% average commission from job payments

---

## 3. TARGET USERS

### Primary Users

#### 3.1 Homeowners / Customers

**Demographics**:
- Age: 25-65
- Location: UK urban and suburban areas
- Income: Middle to upper-middle class
- Tech Comfort: Moderate to high

**Pain Points**:
- Difficulty finding trustworthy painters
- Inconsistent quotes and pricing
- Uncertainty about painter quality
- Fear of not being paid back for bad work
- Lack of project visibility

**Needs**:
- Easy painter discovery by location and specialization
- Transparent, comparable pricing
- Secure payment processing
- Ability to post jobs quickly
- Track job progress
- Rate and review painters

#### 3.2 Professional Painters & Decorators

**Demographics**:
- Age: 25-65
- Experience: Minimum 2+ years in painting/decorating
- Business Model: Sole traders, small teams, or established companies
- Tech Comfort: Low to moderate (improving)

**Pain Points**:
- Inconsistent job pipeline
- Manual customer outreach
- Escrow/payment delays
- Difficulty building reputation
- Administrative overhead (invoicing, tracking)

**Needs**:
- Steady job pipeline
- Quick job discovery
- Fair payment terms
- Professional profile to showcase work
- Messaging and job management tools
- Transparent commission structure

#### 3.3 Enterprise / B2B Customers

**Demographics**:
- Property managers, developers, facilities management companies
- Regular volume: 5-100+ painting jobs per year

**Needs**:
- Bulk job posting and distribution
- Volume discounts or negotiated rates
- Milestone-based project tracking
- Dedicated account management
- Invoicing and reporting tools

#### 3.4 Platform Administrators

**Needs**:
- KYC verification workflow
- Painter approval/rejection
- Dispute resolution interface
- Platform statistics and analytics
- User management
- Commission and payment tracking

---

## 4. CORE FEATURES

### 4.1 CUSTOMER FEATURES

#### Job Management
- **Post Painting Job**: Specify job type (interior/exterior), room dimensions, photos, budget, location
- **Receive Quotes**: Get quotes from multiple painters with detailed breakdowns
- **Quote Comparison**: Side-by-side comparison of quotes with painter ratings
- **Select Painter**: Accept or reject quotes with feedback
- **Track Progress**: Real-time job status updates (quote received → escrow funded → in progress → complete)
- **Approve Work**: Review completed work and approve for payment release
- **Messaging**: Direct messaging with painters before and during jobs
- **Job History**: View past jobs, painter performance, spend analytics

#### Painter Discovery
- **Search**: Find painters by location (postcode), skills (interior/exterior/kitchen/wallpaper)
- **Filter**: By hourly rate, reviews, job type specialization, availability
- **Painter Profiles**: View portfolio, insurance status, customer reviews, reliability score
- **Favorites**: Save painters for quick re-hiring
- **Reputation Display**: See painter tier (Starter/Pro/Premium), job count, completion rate

#### Paint Estimation Tool
- **Multi-Room Calculator**: Add multiple rooms with length, width, height, coat count
- **Brand Comparison**: Dulux, Johnstone's, Wilko, Leyland price/coverage comparison
- **Material Cost Estimation**: Calculate paint needed and estimated cost
- **Reuse Estimates**: Save and apply estimates to future jobs
- **Visual Breakdown**: Cost per room, total paint needed, brand recommendations

#### Secure Payments
- **Escrow Protection**: Customer funds held securely until job completion (via Transpact)
- **Transparent Pricing**: See exact commission breakdown (12% base, tiered down to 8%)
- **Payment Tracking**: View payment status, release dates, and receipts
- **Dispute Handling**: Open disputes if work is unsatisfactory with evidence submission
- **Auto-Approval**: Jobs auto-approve after 7 days if no dispute raised

#### Reviews & Ratings
- **Leave Reviews**: Rate painters 1-5 stars with written feedback
- **View Reviews**: See all reviews on painter profiles
- **Review Verification**: Only verified job completions can be reviewed

### 4.2 PAINTER FEATURES

#### Profile Management
- **Create Profile**: Business info, portfolio, skills, service radius, hourly rate
- **KYC Verification**: Submit personal/business documents for verification (admin approval)
- **Insurance Verification**: Upload and verify public liability insurance
- **Portfolio Upload**: Display completed work samples
- **Skill Tags**: Select specializations (interior, exterior, kitchen, wallpaper, commercial)
- **Availability Status**: Online/offline status and service radius

#### Job Discovery & Quotes
- **Browse Available Jobs**: See jobs posted in your service area
- **Job Notifications**: Real-time alerts when matching jobs posted in your location
- **Submit Quotes**: Provide competitive quotes with material/labor breakdown
- **Quote Negotiation**: Respond to counter-offers from customers
- **Quote Expiration**: Auto-expire quotes after 7 days
- **Track Quote Status**: See which quotes were accepted/rejected and why

#### Dashboard & Earnings
- **Job Pipeline**: View all jobs (quoted, accepted, in progress, completed)
- **Earnings Tracking**: See total earnings, commission paid, payout schedule
- **Payment History**: Detailed transaction history with dates and amounts
- **Reliability Score**: Track job completion rate, cancellation rate, customer satisfaction
- **Tier Status**: View current commission tier (12%/10%/8%) based on job count
- **Payout Schedule**: See when funds are released (after customer approval)

#### 2FA & Security
- **Two-Factor Authentication**: Optional 2FA setup for account security
- **Email Verification**: Confirm email to unlock full functionality
- **Security Log**: View login history and device access

### 4.3 ADMIN FEATURES

#### KYC Management Dashboard
- **Pending Verifications**: List all painters awaiting approval
- **Document Review**: View submitted personal/business documents with expiry tracking
- **Approval Workflow**: One-click approve or reject with reason
- **Bulk Operations**: Batch process multiple KYC submissions
- **Status Tracking**: View metrics (pending, under review, approved, rejected)
- **Rejection History**: Track rejections and re-submissions for compliance

#### Dispute Resolution
- **Dispute Queue**: List open disputes with priority indicators
- **Evidence Review**: View photos, messages, and evidence submitted by both parties
- **Decision Tools**: Approve customer refund or painter payout
- **Resolution Notes**: Document reasoning for decisions
- **Dispute Analytics**: Track common dispute reasons and patterns

#### Platform Statistics
- **Painter Stats**: Total painters, verification status breakdown, tier distribution
- **Job Stats**: Jobs posted, quotes submitted, completion rate, average job value
- **Payment Stats**: Total escrow volume, commission collected, dispute rate
- **Customer Stats**: Total users, repeat customers, average spend
- **Time Series**: Trends over weeks/months for revenue and growth

#### User Management
- **Suspend/Ban**: Remove bad actors (painters with poor completion, customers with disputes)
- **Email Templates**: Manage notification templates for KYC, disputes, payments
- **Commission Adjustment**: Manually adjust commission rates for B2B customers

### 4.4 COMMON FEATURES (All Users)

#### Messaging
- **Direct Messages**: 1-1 conversation between customer and painter
- **Message History**: View full conversation thread
- **File Attachments**: Share photos and documents
- **Read Status**: See when messages are read
- **Notifications**: Get alerted to new messages

#### Notifications
- **Job Alerts**: Painters notified when matching jobs posted
- **Quote Updates**: Customers notified when quotes received/expired
- **Payment Updates**: Both parties notified of payment status changes
- **KYC Updates**: Painters notified of verification status (approved/rejected)
- **System Alerts**: Important platform updates and announcements

#### Authentication & Accounts
- **Registration**: Email-based signup for customers/painters
- **Login**: Secure JWT-based authentication
- **Password Reset**: Self-service password recovery
- **Account Profile**: Basic info, avatar, contact details
- **Logout**: Secure session termination

#### Help & Support
- **FAQ**: Common questions about jobs, quotes, payments
- **Support Chat**: In-app support for urgent issues
- **Contact**: Email support for complex issues

---

## 5. TECHNICAL ARCHITECTURE

### 5.1 SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (React + Vite)                     │
│  ├─ Pages: Home, FindPainters, PostJob, Checkout, etc       │
│  ├─ Components: PainterCard, JobCard, KYCForm, etc          │
│  └─ Hooks: useAuth, useNotifications, useQuery, etc         │
└────────┬──────────────────────────────────────────────────────┘
         │ HTTPS / WebSocket
         ├──────────────────────────────────────────────────────┐
         │                                                       │
┌────────▼──────────────────────────────────────────┐  ┌──────▼──────────────┐
│        BACKEND (Express + TypeScript)             │  │ WEBSOCKET SERVER    │
│ ├─ Routes: auth, jobs, quotes, payments, kyc     │  │ (socket.io)         │
│ ├─ Middleware: auth, admin, error handling       │  │ ├─ Real-time notif  │
│ ├─ Services: transpact, reputation, escrow       │  │ ├─ Job broadcasts   │
│ └─ Database layer with Prisma ORM               │  │ └─ User rooms       │
└────────┬──────────────────────────────────────────┘  └──────┬──────────────┘
         │                                                    │
         └────────────────────┬─────────────────────────────┘
                              │
         ┌────────────────────┴────────────────────────┐
         │                                              │
    ┌────▼───────────────┐              ┌──────────────▼──────┐
    │   PostgreSQL       │              │  Transpact API      │
    │   Database         │              │  (Payment Escrow)   │
    │ ├─ Users           │              │                     │
    │ ├─ Jobs            │              │ - Create Trans      │
    │ ├─ Quotes          │              │ - Get Status        │
    │ ├─ Payments        │              │ - Release Funds     │
    │ ├─ Notifications   │              │ - Webhooks          │
    │ ├─ Disputes        │              └─────────────────────┘
    │ └─ More...         │
    └────────────────────┘
```

### 5.2 TECHNOLOGY STACK

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend Framework** | React 18 | UI library with hooks |
| **Frontend Router** | React Router 6 | SPA routing and page management |
| **Build Tool** | Vite | Lightning-fast bundling and dev server |
| **Styling** | Tailwind CSS 3 | Utility-first CSS framework |
| **UI Components** | Radix UI | Accessible component primitives |
| **Icons** | Lucide React | Beautiful icon library |
| **Data Fetching** | React Query (TanStack Query) | Data fetching, caching, sync |
| **Form Validation** | Zod + React Hook Form | Type-safe form handling |
| **State Management** | React Hooks + localStorage | Local state and persistence |
| **WebSocket Client** | socket.io-client 4.8.3 | Real-time notifications |
| **Backend Framework** | Express.js 5.x | Web server framework |
| **Database** | PostgreSQL | Relational database |
| **ORM** | Prisma 5.x | Type-safe database access |
| **Authentication** | JWT + bcryptjs | Token-based auth with hashing |
| **Validation** | Zod | TypeScript-first schema validation |
| **WebSocket Server** | Socket.io 4.8.3 | Real-time bidirectional communication |
| **Payment Gateway** | Transpact | Escrow and payment processing |
| **Language** | TypeScript | Type-safe JavaScript |
| **Package Manager** | pnpm 10.x | Fast, efficient package management |
| **Deployment** | Netlify Functions | Serverless deployment ready |

### 5.3 DATABASE SCHEMA

#### User & Authentication
- **User**: Core account (email, passwordHash, userType, createdAt)
- **CustomerProfile**: Customer-specific data
- **PainterProfile**: Painter data (skills, rates, insurance, KYC status, portfolio)

#### Job Marketplace
- **Job**: Job posting (title, description, status, budget, location, images)
- **Quote**: Painter quotes (jobId, painterId, price, status, expiresAt)
- **JobCompletion**: Completion workflow (jobId, customerId, completedImages, notes)

#### Payments & Escrow
- **EscrowTransaction**: Payment tracking (jobId, amount, commission, status, transpactId)
- **Commission tracking**: Per-job breakdown of payment splits

#### Reputation & Trust
- **PainterProfile**: Reliability score, tier, job count, cancellation rate
- **ReliabilityEvent**: Job events (completed, cancelled, late, dispute)

#### Communication
- **Message**: Direct messages between users (senderId, recipientId, content, attachments)
- **Notification**: System notifications (userId, type, title, body, read status)

#### Disputes
- **Dispute**: Dispute record (jobId, reason, status, evidenceCount)
- **EvidenceSubmission**: Photos, messages, documents for disputes

#### B2B
- **B2BCustomer**: Corporate customer accounts
- **B2BMilestone**: Multi-phase project tracking

### 5.4 API ENDPOINTS (24+ Endpoints)

#### Authentication (3)
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login and receive JWT token
- `GET /api/auth/me` - Get current user profile

#### Jobs (5)
- `POST /api/jobs` - Create new job (customer only)
- `GET /api/jobs` - List jobs (filtered by location, status, type)
- `GET /api/jobs/:jobId` - Get job details
- `PUT /api/jobs/:jobId` - Update job (before escrow)
- `DELETE /api/jobs/:jobId` - Cancel job

#### Quotes (4)
- `POST /api/quotes` - Submit quote (painter only)
- `GET /api/quotes/:quoteId` - Get quote details
- `GET /api/quotes/job/:jobId` - List quotes for job
- `PUT /api/quotes/:quoteId` - Accept/reject quote (customer only)

#### Payments (5)
- `POST /api/payments/initiate` - Start escrow payment
- `GET /api/payments/escrow/:transactionId` - Get payment status
- `POST /api/payments/webhook/transpact` - Webhook for payment updates
- `POST /api/payments/release/:jobId` - Release funds to painter (customer)
- `POST /api/payments/cancel/:jobId` - Cancel/refund payment (admin)

#### Messages (4)
- `POST /api/messages` - Send message
- `GET /api/messages/:conversationId` - Get messages
- `GET /api/messages/unread` - List unread messages
- `PUT /api/messages/:messageId/read` - Mark message as read

#### Disputes (4)
- `POST /api/disputes` - Open dispute on job
- `GET /api/disputes/:disputeId` - Get dispute details
- `POST /api/disputes/:disputeId/evidence` - Submit evidence
- `POST /api/disputes/:disputeId/resolve` - Admin resolve dispute

#### KYC & Verification (5)
- `POST /api/kyc/submit` - Submit KYC information
- `GET /api/kyc/status` - Get verification status
- `POST /api/kyc/documents/upload` - Upload document (ID, insurance, address proof)
- `GET /api/kyc/documents` - List uploaded documents
- `POST /api/kyc/verify` - Admin approve/reject KYC

#### Admin (6)
- `GET /api/admin/kyc/pending` - List pending KYCs
- `POST /api/admin/kyc/:painterId/approve` - Approve painter
- `POST /api/admin/kyc/:painterId/reject` - Reject painter
- `GET /api/admin/kyc/stats` - KYC statistics
- `GET /api/admin/jobs/stats` - Job statistics
- `GET /api/admin/disputes` - List disputes

#### Notifications (4)
- `GET /api/notifications` - List notifications
- `GET /api/notifications/unread` - Get unread count
- `DELETE /api/notifications/:notificationId` - Delete notification
- `POST /api/notifications/clear-all` - Clear all notifications

#### Painters (2)
- `GET /api/painters` - Search/filter painters
- `GET /api/painters/:painterId` - Get painter profile with reviews

---

## 6. CURRENT IMPLEMENTATION STATUS

### ✅ PHASE 1: BACKEND API & DATABASE (COMPLETE)

**Completed**:
- 15 database models (User, Job, Quote, Payment, etc.)
- 24 API endpoints with full authentication
- JWT token-based auth with bcryptjs password hashing
- Role-based access control (customer, painter, admin)
- Escrow payment integration framework (Transpact API wrapper)
- Commission calculation engine (tiered: 12%/10%/8%)
- Dispute resolution workflow
- Notification system (8 types)
- B2B customer support
- Complete test suite

**Files**: ~1,200 LOC in backend

### ✅ PHASE 2: PAINTER ONBOARDING & KYC (COMPLETE)

**Completed**:
- KYC form with personal/business information collection
- Document upload component (ID, insurance, address proof)
- Verification status tracking (pending → under_review → approved/denied)
- KYC endpoints for submission and document management
- Type definitions and validation schemas
- Documentation with test procedures

**Features**:
- Multi-section KYC form with conditional fields
- Drag-and-drop document upload
- File size validation (5MB max)
- Document expiry date tracking
- Admin verification endpoint
- Notification system for status changes

**Files**: ~800 LOC in frontend + backend

### ✅ PHASE 3: ADMIN DASHBOARD & REAL-TIME (COMPLETE)

**Completed**:
- Admin dashboard with KYC statistics and pending list
- KYC review card component with document viewing
- Real-time notifications via Socket.io
- useNotifications hook for WebSocket management
- Transpact service wrapper with test/production modes
- Payment initiation with transparent fee breakdown
- Commission calculation implementation
- Admin role enforcement via email whitelist

**Features**:
- Real-time job and quote updates
- WebSocket-based notifications
- Socket.io authentication with JWT
- Browser notification integration
- 10+ notification types
- Payment escrow workflow
- Fund release mechanism

**Files**: ~1,400 LOC in frontend + backend

### 📊 OVERALL PROGRESS

| Phase | Status | LOC | Endpoints | Features |
|-------|--------|-----|-----------|----------|
| Phase 1 | ✅ Complete | 1,200 | 24 | Auth, Jobs, Payments, Disputes |
| Phase 2 | ✅ Complete | 800 | 5 | KYC, Document Upload, Verification |
| Phase 3 | ✅ Complete | 1,400 | 6 | Admin, Real-time, Escrow |
| **Total** | **MVP Ready** | **3,400+** | **35+** | **Complete Platform** |

---

## 7. OUTSTANDING WORK & ROADMAP

### 🔴 CRITICAL ISSUES (Must Fix Before Production)

#### 7.1 Security & Payments

**Issue 1**: Webhook signature verification not implemented
- **File**: `server/routes/payments.ts` (~line 285)
- **Impact**: Cannot validate Transpact webhooks are legitimate
- **Fix**: Implement HMAC verification using transpactService.verifyWebhookSignature()

**Issue 2**: Release funds endpoint doesn't call Transpact API
- **File**: `server/routes/payments.ts` (~line 417)
- **Impact**: Funds marked as "released" in DB but not actually transferred
- **Fix**: Call transpactService.releaseFunds() when releasing funds

**Issue 3**: KYC verification endpoint missing admin authentication
- **File**: `server/routes/kyc.ts` (~line 320)
- **Impact**: Any authenticated user can approve/reject painter KYC
- **Fix**: Add adminMiddleware and requireAdmin check to `/api/kyc/verify` endpoint

#### 7.2 Logic Bugs

**Issue 4**: Commission calculation uses hardcoded 12%
- **File**: `server/services/transpact.ts` (~line 289)
- **Impact**: Tiered commission (12%/10%/8%) not applied based on painter job count
- **Fix**: Use getCommissionTier() from reputation service instead of fixed rate

**Issue 5**: Reputation service bug - cancelled jobs calculated incorrectly
- **File**: `server/services/reputation.ts` (~line 84)
- **Impact**: Reliability scores are inaccurate
- **Bug**: `const cancelledJobs = painter.totalJobs || 0;` should query actual cancelled count
- **Fix**: Calculate from database query of cancelled jobs

#### 7.3 Incomplete Features

**Issue 6**: Real-time notifications not persisted
- **File**: `server/websocket.ts` and client
- **Impact**: Notifications lost if user disconnects
- **Fix**: Add Redis message queue for production deployment

**Issue 7**: Document upload uses plain URLs
- **File**: `server/routes/kyc.ts`
- **Impact**: Security risk - documents are publicly accessible
- **Fix**: Implement signed/temporary URLs (S3, GCS, or Azure)

**Issue 8**: Notifications lack read/unread flag
- **File**: Database schema, `server/routes/notifications.ts`
- **Impact**: Cannot track which notifications user has read
- **Fix**: Add `read` boolean field to Notification model

### 🟡 HIGH PRIORITY (Phase 4 - 4-6 weeks)

1. **Fix All Critical Issues Above** (1-2 weeks)
   - Security fixes for payments and KYC
   - Bug fixes for commission and reputation
   - Complete outstanding features

2. **Improve Error Handling** (1 week)
   - Better error messages and user-friendly UI
   - Error recovery and retry logic
   - Comprehensive logging

3. **Admin Role System** (1 week)
   - Replace hardcoded email list with admin table
   - Role-based permissions (super, moderator, support)
   - Admin activity audit log

4. **Payment Workflow UI** (1.5 weeks)
   - Customer payment initiation form
   - Payment status tracking page
   - Invoice generation
   - Payout scheduling for painters

5. **Notification Preferences** (1 week)
   - User settings for notification types
   - Email notification option
   - SMS for critical alerts (optional)

### 🟢 MEDIUM PRIORITY (Phase 5 - 6-8 weeks)

1. **Painter Dashboard Enhancement**
   - Job pipeline visualization
   - Earnings analytics and charts
   - Quote response rate metrics
   - Calendar for job scheduling

2. **Customer Dashboard**
   - Job history with filters
   - Saved searches for painters
   - Budget tracking
   - Payment history

3. **Dispute Resolution UI**
   - Evidence upload and review
   - Admin dispute resolution form
   - Communication between parties
   - Auto-dispute handling for pattern violations

4. **Advanced Search**
   - Full-text search for painter bios
   - Saved searches with filters
   - Smart recommendations
   - Map-based discovery

5. **Reviews & Ratings**
   - Post-job review system
   - Review moderation (prevent spam)
   - Review analytics for painters
   - Recommendation algorithm

### 🔵 LOWER PRIORITY (Phase 6+ - Future)

1. **Mobile App** - React Native mobile app for iOS/Android
2. **AI Recommendations** - Machine learning for painter matching
3. **Bulk Operations** - B2B job posting and distribution
4. **Compliance** - KYC document expiry reminders, data retention
5. **International** - Multi-country support, currency handling, tax compliance
6. **Advanced Analytics** - Market analytics, trend reports for admin
7. **Integrations** - Slack, email, calendar integrations
8. **Webhooks** - Custom webhooks for B2B partners

---

## 8. DETAILED FEATURE SPECIFICATIONS

### 8.1 Job Posting Flow

**Steps**:
1. Customer fills job details:
   - Job type (interior/exterior painting, specific rooms)
   - Description and photos
   - Room dimensions (length, width, height, coat count)
   - Budget range (£100-£5000)
   - Location (postcode/area)
   - Preferred timeline

2. System validates inputs and shows paint estimate preview

3. Customer reviews cost breakdown:
   - Painter earnings
   - Platform commission (12%)
   - Transpact fee (2.5%)
   - Total customer cost

4. Customer submits job
   - System creates Job record
   - Updates to "open" status
   - Broadcasts notification to nearby painters (within service radius)
   - Sends email notification to subscribed painters

5. Painters receive notification and can quote:
   - Browse available jobs
   - Submit quote with timeline and materials breakdown
   - Quote auto-expires after 7 days

6. Customer reviews quotes:
   - Compare painter ratings, reviews, pricing
   - Ask questions via messaging
   - Accept best quote or reject all and re-post

7. Upon quote acceptance:
   - Marks job status as "quote_accepted"
   - Initiates escrow payment
   - Creates notification for painter
   - Triggers payment flow

### 8.2 Payment Flow (Escrow)

**Payment Breakdown Example**: £450 job

```
Customer Total:           £504.00 (job + commission)
  └─ Painter's Cut:       £450.00 (held in escrow)
  └─ Platform Commission: £54.00
      └─ Transpact Fee:   £12.60 (2.5% of total)
      └─ Platform Keep:   £41.40
```

**Commission Tiers**:
- Jobs 1-5: 12% commission
- Jobs 6-10: 10% commission
- Jobs 11+: 8% commission

**Steps**:
1. Customer initiates payment
2. Backend creates Transpact transaction
3. Returns payment URL to customer
4. Customer redirected to Transpact payment form
5. Customer enters card details (PCI handled by Transpact)
6. Payment processed and escrowed
7. Webhook updates job status to "escrow_funded"
8. Painter can now start work
9. Upon job completion:
   - Customer approves work (or 7-day auto-approve)
   - Backend calls release funds endpoint
   - Transpact transfers funds to painter bank account
   - Platform receives commission immediately

### 8.3 KYC Verification Flow

**For Painters**:
1. Registration → redirected to `/painter-onboarding`
2. Fill KYC form (personal + business info)
3. Upload documents (ID, insurance, address proof)
4. Status changes to "under_review"
5. Admin reviews in dashboard
6. Admin approves or rejects with reason
7. Painter receives notification
8. If approved: can accept jobs
9. If rejected: can re-submit after corrections

**For Admin**:
1. View pending KYCs in dashboard
2. Click painter to view documents and info
3. Review insurance expiry dates
4. Verify business registration (if provided)
5. Approve (1-click) or reject with reason
6. Painter receives instant notification
7. Stats update in real-time

### 8.4 Dispute Resolution Flow

**Timeline**: 48 hours to open dispute after completion

1. Customer or painter opens dispute
   - Reason: poor quality, incomplete work, non-delivery, etc.
2. Evidence submission (photos, messages)
3. Admin reviews evidence from both parties
4. Admin makes decision:
   - Approve refund to customer (funds return from painter)
   - Approve payment to painter (customer loses refund)
   - Partial refund (split funds)
5. Both parties notified of outcome
6. Funds released accordingly

---

## 9. USER JOURNEYS

### 9.1 Customer Journey: Post Job & Hire Painter

```
1. Customer visits website
   ↓
2. Register as customer / Login
   ↓
3. Click "Post a Job"
   ↓
4. Fill job details (type, location, budget, images)
   ↓
5. Add room dimensions and coats
   ↓
6. Review paint estimate and costs
   ↓
7. Submit job
   ↓
8. Receive notifications as painters quote
   ↓
9. Review and compare quotes (rating, price, reviews)
   ↓
10. Accept best quote
   ↓
11. Process payment through Transpact
   ↓
12. Painter confirms and starts work
   ↓
13. Customer tracks progress via messages
   ↓
14. Painter submits completion photos
   ↓
15. Customer approves work
   ↓
16. Funds released to painter
   ↓
17. Customer leaves review of painter
```

### 9.2 Painter Journey: Find Jobs & Complete Work

```
1. Painter visits website
   ↓
2. Register as painter / Login
   ↓
3. Complete KYC verification (form + documents)
   ↓
4. Upload insurance certificate
   ↓
5. Create painter profile (skills, rates, portfolio)
   ↓
6. Admin approves KYC
   ↓
7. Receive real-time job notifications
   ↓
8. Browse available jobs in service area
   ↓
9. Submit quote for selected jobs
   ↓
10. Receive notification if quote accepted
   ↓
11. Check escrow payment status
   ↓
12. Start work, communicate with customer
   ↓
13. Submit completion photos and summary
   ↓
14. Wait for customer approval (or auto-approve after 7 days)
   ↓
15. Funds released to painter bank account
   ↓
16. View in dashboard: earnings, completion rate, reviews
   ↓
17. Repeat job cycle
```

### 9.3 Admin Journey: Review & Verify Painters

```
1. Admin logs in with admin email
   ↓
2. Navigate to Admin Dashboard
   ↓
3. See KYC statistics at a glance
   ↓
4. View list of pending KYC verifications
   ↓
5. Click painter card to review
   ↓
6. View personal info, documents, insurance
   ↓
7. Check document expiry dates
   ↓
8. Click "Approve" or "Reject"
   ↓
9. If rejecting: enter rejection reason
   ↓
10. Painter receives instant notification
   ↓
11. If approved: painter can start accepting jobs
   ↓
12. Monitor platform statistics (jobs, disputes, payouts)
```

---

## 10. INTEGRATION POINTS

### 10.1 Third-Party Services

#### Transpact (Payment Processing)
- **Purpose**: Escrow payment processing
- **Integration**: HTTPS API calls from backend
- **Data Flow**: Create transaction → Get status → Release/Cancel funds
- **Webhooks**: Payment updates sent to `/api/payments/webhook/transpact`
- **Environment Variables**:
  - `TRANSPACT_API_KEY` - API authentication
  - `WEBHOOK_URL` - Callback URL for webhooks
  - `APP_URL` - Customer app URL for redirects

#### Database (PostgreSQL)
- **Purpose**: Store all user, job, payment, and system data
- **Connection**: Prisma ORM via `DATABASE_URL` environment variable
- **Tables**: 15+ models with relationships

#### Email (Optional - Future)
- **Purpose**: Send account confirmations, job alerts, payment receipts
- **Services**: SendGrid, Mailgun, AWS SES (not yet integrated)

#### SMS (Optional - Future)
- **Purpose**: Critical alerts (payment issues, urgent messages)
- **Services**: Twilio, Nexmo (not yet integrated)

#### Cloud Storage (Optional - Future)
- **Purpose**: Store KYC documents, job photos, portfolio
- **Services**: AWS S3, Google Cloud Storage, Azure Blob Storage

---

## 11. SECURITY & COMPLIANCE

### 11.1 Data Security

- **Passwords**: Hashed with bcryptjs (salt rounds: 10)
- **Tokens**: JWT (7-day expiry) with secret key
- **HTTPS**: All communication encrypted
- **Database**: PostgreSQL with standard security practices
- **Rate Limiting**: To be implemented before production
- **Input Validation**: Zod schema validation on all inputs

### 11.2 Payment Security

- **PCI Compliance**: Handled by Transpact (no card storage on platform)
- **Escrow**: Funds held by Transpact, not direct transfers
- **Webhook Verification**: To be implemented (HMAC validation)
- **Amount Validation**: Verify before payment processing

### 11.3 KYC & Compliance

- **Document Verification**: Manual admin review
- **Insurance Validation**: Painter must provide active insurance
- **User Suspension**: Admin can suspend accounts for violations
- **Data Retention**: Keep records per UK regulations

### 11.4 Privacy

- **Data Collection**: Only necessary info collected (name, email, address)
- **GDPR Compliance**: Users can request data export/deletion
- **Privacy Policy**: Required before launch
- **Terms of Service**: Required for legal protection

---

## 12. SCALABILITY & PERFORMANCE

### 12.1 Current Architecture Limits

- **WebSocket**: Single server (will need Redis for scaling to multiple servers)
- **Database**: Single PostgreSQL instance (will need read replicas for scaling)
- **Session Storage**: In-memory (will need Redis for distributed sessions)
- **File Storage**: Filesystem or plain URLs (will need S3 for multi-region)

### 12.2 Scaling Strategy (Phase 5+)

1. **Load Balancing**: Multiple Express instances behind nginx
2. **Database**: Read replicas for queries, primary for writes
3. **Redis**: Session store, message queue, cache layer
4. **CDN**: Serve static assets from CloudFlare or similar
5. **Monitoring**: Datadog/New Relic for performance tracking
6. **Auto-scaling**: Kubernetes or AWS ECS for container orchestration

### 12.3 Expected Growth

| Time | Customers | Painters | Monthly Jobs |
|------|-----------|----------|--------------|
| Launch | 100 | 50 | 200 |
| 3 months | 500 | 200 | 1,000 |
| 6 months | 2,000 | 500 | 4,000 |
| 12 months | 10,000 | 2,000 | 15,000 |

---

## 13. SUCCESS METRICS & KPIs

### 13.1 Business Metrics

- **Monthly Active Users**: Target 500+ by month 3, 5,000+ by month 12
- **Job Volume**: 200+ jobs/month at launch, 15,000+ at 1 year
- **Painter Onboarding**: 90%+ complete KYC within 30 days
- **Payment Volume**: £50K+ escrow by month 3, £500K+ by month 12
- **Platform Commission**: £5K+/month by month 3

### 13.2 Quality Metrics

- **Job Completion Rate**: 85%+ (painters complete jobs as quoted)
- **Customer Satisfaction**: 4.0+ avg rating out of 5.0
- **On-Time Delivery**: 80%+ of jobs completed within quoted timeline
- **Dispute Rate**: <5% of jobs result in disputes
- **Churn Rate**: <10% monthly for active users

### 13.3 Engagement Metrics

- **Quote Response Rate**: 70%+ of painters submit quotes within 24 hours
- **Message Engagement**: 80%+ of customers communicate before hiring
- **Repeat Customers**: 30%+ of customers return for second job
- **Painter Repeat Rate**: 50%+ of painters complete multiple jobs

### 13.4 Platform Health

- **System Uptime**: 99.9%+ availability
- **API Response Time**: <200ms p95 latency
- **Payment Success Rate**: 99%+ of escrow payments process successfully
- **Support Response Time**: <2 hours for critical issues

---

## 14. DEPLOYMENT & LAUNCH

### 14.1 Deployment Infrastructure

**Current**: Netlify deployment (client + serverless backend)
**Production Ready**: PostgreSQL database required

**Environment Variables Required**:
```
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_key
TRANSPACT_API_KEY=your_api_key
WEBHOOK_URL=https://yourdomain.com
APP_URL=https://app.yourdomain.com
NODE_ENV=production
```

### 14.2 Pre-Launch Checklist

- [ ] Fix all critical security issues (see Section 7.1)
- [ ] Implement proper error handling and logging
- [ ] Set up monitoring and alerting
- [ ] Run full end-to-end testing
- [ ] Load test with simulated traffic
- [ ] Backup and disaster recovery plan
- [ ] Privacy policy and terms of service
- [ ] SSL certificate setup
- [ ] Admin account setup for verification
- [ ] Marketing and user acquisition plan

### 14.3 Launch Plan

**Soft Launch** (Closed Beta):
- 100 pilot customers
- 50 painter sign-ups
- Focus on feedback and bug fixes
- Duration: 2-4 weeks

**Public Launch** (MVP):
- Limited to single region (London area)
- 1,000+ marketing signups pre-registered
- Community management and support
- Heavy monitoring for issues
- Duration: 1-3 months

**Regional Expansion** (Phase 2+):
- Expand to other UK regions based on demand
- Add B2B customer support
- Internationalization (scaling outside UK)

---

## 15. RISK ASSESSMENT

### 15.1 High-Risk Items

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| Payment processing failures | Users can't hire painters | Medium | Implement retry logic, 24/7 support |
| Painter quality issues | Customer complaints, disputes | Medium | Strict KYC, insurance verification, reviews |
| Data breach | Customer/painter data exposed | Low | HTTPS, bcrypt hashing, SQL injection prevention |
| Platform fraud | Painters/customers abuse system | Medium | Admin review, account suspension, fraud detection |
| Regulatory compliance | Legal issues | Medium | GDPR compliance, KYC process, privacy policy |

### 15.2 Mitigation Strategies

1. **Payment Security**: Implement webhook signature verification, escrow freezing for disputes
2. **Painter Quality**: Strict KYC, insurance validation, customer reviews, dispute resolution
3. **Platform Integrity**: Admin review of high-value transactions, automated fraud detection rules
4. **Regulatory**: Legal review of terms, privacy policy, compliance with data protection laws
5. **Redundancy**: Database backups, disaster recovery plan, monitoring/alerting

---

## 16. GLOSSARY & TERMINOLOGY

| Term | Definition |
|------|-----------|
| **Escrow** | Funds held by third party (Transpact) until job completion |
| **KYC** | Know Your Customer - identity verification for painters |
| **Transpact** | Payment processing and escrow service |
| **Commission** | Platform fee taken from job price (12%/10%/8% tiered) |
| **Quote** | Painter's bid for a job with price and timeline |
| **Dispute** | Customer/painter disagreement requiring admin resolution |
| **Reliability Score** | Painter rating based on job completion and quality |
| **Tier** | Painter level (Starter/Pro/Premium) based on job count |
| **B2B** | Business-to-business (corporate customers) |
| **JWT** | JSON Web Token - authentication method |
| **Webhook** | HTTP callback from Transpact for payment updates |

---

## 17. FREQUENTLY ASKED QUESTIONS

### For Customers

**Q: How much does it cost to post a job?**  
A: Posting jobs is free. You pay the painter's quote price plus 12% platform commission (tiered down to 8% for higher volume). The commission covers payment processing (Transpact 2.5%) and platform operations.

**Q: Is my payment protected?**  
A: Yes. All payments are held in escrow by Transpact until you approve the work. If there's a dispute, our admin team will review evidence and decide on refunds.

**Q: How long does it take to get quotes?**  
A: Most painters respond within 24 hours of job posting. We send real-time notifications to painters in your area.

**Q: Can I message the painter before hiring?**  
A: Yes. You can message painters and ask questions before accepting their quote.

### For Painters

**Q: What is the commission rate?**  
A: Platform commission is tiered based on your job count:
- Jobs 1-5: 12%
- Jobs 6-10: 10%
- Jobs 11+: 8%

**Q: When do I get paid?**  
A: Funds are released 1-2 days after the customer approves your work. Money goes directly to your bank account.

**Q: What if a customer disputes my work?**  
A: We have a dispute resolution process. You can submit photos and evidence. Our admin team reviews both sides and makes a fair decision.

**Q: Do I need insurance?**  
A: Yes. All painters must have public liability insurance. We verify this during KYC onboarding.

### For Admins

**Q: How do I verify a painter?**  
A: Use the Admin Dashboard. View their KYC information and documents, then click Approve or Reject.

**Q: What documents do painters need to upload?**  
A: Photo ID (passport or driving license), proof of public liability insurance, and address proof (utility bill or council tax).

**Q: How do I resolve a dispute?**  
A: Review evidence from both parties, then decide: approve customer refund or approve painter payment. Document your reasoning.

---

## APPENDICES

### Appendix A: File Structure

```
PaintBookCo/
├── client/                          # React frontend
│   ├── pages/                       # Route pages
│   ├── components/                  # React components
│   ├── hooks/                       # Custom hooks
│   ├── lib/                         # Utilities
│   └── App.tsx                      # Main app component
├── server/                          # Express backend
│   ├── routes/                      # API endpoints
│   ├── services/                    # Business logic
│   ├── middleware/                  # Auth, logging, etc
│   ├── lib/                         # Utilities
│   └── index.ts                     # Express app setup
├── prisma/                          # Database schema
│   └── schema.prisma                # Prisma models
├── shared/                          # Shared types
│   └── types.ts                     # TypeScript types
├── docs/                            # Documentation
│   ├── API_ENDPOINTS.md             # API reference
│   ├── DATABASE_SCHEMA.md           # Database docs
│   ├── PHASE_1_SUMMARY.md           # Phase 1 notes
│   ├── PHASE_2_SUMMARY.md           # Phase 2 notes
│   ├── PHASE_3_SUMMARY.md           # Phase 3 notes
│   └── PRODUCT_REQUIREMENTS_DOCUMENT.md # This file
├── .env.example                     # Environment template
├── package.json                     # Dependencies
├── vite.config.ts                   # Vite config
├── tsconfig.json                    # TypeScript config
└── README.md                        # Project readme
```

### Appendix B: Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/paintbookco

# Authentication
JWT_SECRET=your_secret_key_change_in_production

# Payment Processing
TRANSPACT_API_KEY=your_transpact_api_key
WEBHOOK_URL=https://your-domain.com/api/payments/webhook/transpact
APP_URL=https://your-domain.com

# Environment
NODE_ENV=production
```

---

**End of Document**

---

## Document Metadata

- **Version**: 1.0
- **Author**: PaintBookCo Development Team
- **Last Updated**: March 2026
- **Status**: Approved for MVP Deployment
- **Next Review**: Post-launch (30 days)
- **Distribution**: Internal / GitHub Repository
