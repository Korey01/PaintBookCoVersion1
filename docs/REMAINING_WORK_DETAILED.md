# PaintBookCo: Complete Remaining Work List

**Status**: Critical fixes complete, now tracking all remaining work
**Last Updated**: March 2026
**Total Estimated Effort**: ~240-320 hours (6-8 weeks with full team)

---

## SECTION 1: CRITICAL REMAINING ISSUES (Must Fix Before Launch)

### 1.1 File Storage & Document Security (HIGH PRIORITY)

**Issue**: KYC documents stored as plain URLs (security risk)

**Current State**:
- Documents stored in DB as plain URL strings
- No file storage service (S3, GCS, Azure)
- No signed/temporary URLs
- Public accessibility - anyone with URL can access documents

**What Needs to be Done**:

- [ ] Choose cloud storage provider
  - [ ] AWS S3 (recommended)
    - Estimate: 4-6 hours setup
    - Create S3 bucket
    - Configure IAM roles
    - Enable encryption at rest
    - Set up CloudFront CDN (optional)
  
  - [ ] Google Cloud Storage (alternative)
  - [ ] Azure Blob Storage (alternative)
  - [ ] Cloudinary (easier, includes image optimization)

- [ ] Implement signed URL generation
  - [ ] Create file upload endpoint: `POST /api/upload`
  - [ ] Generate pre-signed URLs with 1-hour expiry
  - [ ] Validate file type (PDF, JPG, PNG only)
  - [ ] Validate file size (max 5MB)
  - [ ] Optional: Scan files for malware (VirusTotal API)
  - Estimate: 8-10 hours

- [ ] Update KYC document handling
  - [ ] Modify KYCForm component to upload files
  - [ ] Replace plain URLs with file upload flow
  - [ ] Store signed URLs in DB
  - [ ] Update document display to use signed URLs
  - Estimate: 6-8 hours

- [ ] Migrate existing documents (if any)
  - [ ] Export old URL documents
  - [ ] Upload to storage service
  - [ ] Update DB with new signed URLs
  - Estimate: 2-3 hours

**Total Effort**: ~20-27 hours
**Must Complete By**: Before first KYC document upload

---

### 1.2 Error Handling & User Feedback UI (HIGH PRIORITY)

**Issue**: Many pages throw generic errors, poor UX on failures

**Current State**:
- Error pages show "Error" popup on failures
- No retry logic
- No error recovery
- Users don't know what went wrong

**What Needs to be Done**:

- [ ] Create error boundary component
  - [ ] Global error catch and display
  - [ ] Error logging to backend
  - [ ] User-friendly error messages
  - Estimate: 3-4 hours

- [ ] Add error handling to all major flows
  - [ ] Job posting: Show validation errors
  - [ ] Payment flow: Show payment errors with retry
  - [ ] Quote submission: Show quote errors
  - [ ] KYC submission: Show validation/submission errors
  - [ ] Login/signup: Show auth errors
  - Estimate: 8-10 hours

- [ ] Add loading states
  - [ ] Show spinners while loading
  - [ ] Disable buttons while submitting
  - [ ] Show progress for multi-step forms
  - Estimate: 4-5 hours

- [ ] Add toast notifications for success/error
  - [ ] Job posted successfully
  - [ ] Quote submitted
  - [ ] Payment processing
  - [ ] Document uploaded
  - Estimate: 3-4 hours

**Total Effort**: ~18-23 hours
**Priority**: Must complete before testing with real users

---

### 1.3 Admin Dashboard - Core Features (HIGH PRIORITY)

**Issue**: Admin dashboard only has basic KYC review, missing critical features

**Current State**:
- Admin dashboard exists (AdminDashboard.tsx)
- KYC review card exists (KYCReviewCard.tsx)
- Only shows pending KYCs and statistics
- Missing: users management, jobs, payments, disputes, feedback

**Pages to Build**:

#### A. Dashboard Home / Overview
- [ ] Key metrics display
  - [ ] Total users (customers + painters)
  - [ ] Active users (this month)
  - [ ] Total jobs posted
  - [ ] Jobs in progress
  - [ ] Pending quotes
  - [ ] Total escrow held
  - [ ] Commission collected (today/month/all-time)
  - [ ] Open disputes
  - [ ] Support tickets
  - Estimate: 4-5 hours

- [ ] Charts & graphs
  - [ ] Revenue trend (last 30 days)
  - [ ] New users chart (daily, customers vs painters)
  - [ ] Jobs posted trend (daily)
  - [ ] Payment success rate (%)
  - [ ] System health status
  - Estimate: 6-8 hours (using Recharts)

- [ ] Quick action buttons
  - [ ] View pending KYCs
  - [ ] View open disputes
  - [ ] View pending support tickets
  - Estimate: 2 hours

**Subtotal**: ~12-15 hours

#### B. Users Management Page
- [ ] User list view
  - [ ] Filter by type (customer/painter)
  - [ ] Filter by status (active/suspended/banned)
  - [ ] Search by email
  - [ ] Pagination
  - Estimate: 4-5 hours

- [ ] User profile view
  - [ ] Show user info (name, email, registration date)
  - [ ] For painters: show KYC status, tier, earnings
  - [ ] For customers: show total jobs posted, spend
  - [ ] User activity history (logins, actions)
  - Estimate: 3-4 hours

- [ ] User actions
  - [ ] Suspend user account
  - [ ] Ban user (permanent)
  - [ ] Reset password (admin)
  - [ ] Send message/announcement to user
  - [ ] View user activity log
  - Estimate: 5-6 hours

**Subtotal**: ~12-15 hours

#### C. Painters Management Page
- [ ] Painter list view
  - [ ] Filter by KYC status (pending/approved/rejected)
  - [ ] Filter by tier (starter/pro/premium)
  - [ ] Filter by job count
  - [ ] Search by name/email
  - [ ] Sort by earnings, jobs, rating
  - Estimate: 5-6 hours

- [ ] Painter profile view
  - [ ] Personal info
  - [ ] KYC documents
  - [ ] Insurance info
  - [ ] Portfolio
  - [ ] Statistics (jobs, earnings, completion rate, rating)
  - [ ] Reliability events history
  - Estimate: 4-5 hours

- [ ] Painter management actions
  - [ ] View/approve/reject KYC (already built)
  - [ ] Adjust commission tier (manual override)
  - [ ] Suspend/ban painter
  - [ ] View earnings and payouts
  - Estimate: 3-4 hours

**Subtotal**: ~12-15 hours

#### D. Jobs Management Page
- [ ] Job list view
  - [ ] Filter by status (open/quoted/accepted/in_progress/completed/disputed)
  - [ ] Filter by date range
  - [ ] Search by customer email or job title
  - [ ] Sort by price, date, status
  - [ ] Pagination
  - Estimate: 5-6 hours

- [ ] Job detail view
  - [ ] Job info (title, description, location, budget)
  - [ ] Customer info
  - [ ] Accepted quote and painter info
  - [ ] Payment status
  - [ ] Messages/communications
  - [ ] Completion images
  - Estimate: 4-5 hours

- [ ] Job actions
  - [ ] View quotes for job
  - [ ] Cancel job (with refund)
  - [ ] Force completion (if stuck)
  - [ ] Trigger payment release
  - Estimate: 3-4 hours

**Subtotal**: ~12-15 hours

#### E. Payments & Transactions Page
- [ ] Transaction list view
  - [ ] Filter by status (pending/funded/released/refunded/disputed)
  - [ ] Filter by date range
  - [ ] Filter by painter/customer
  - [ ] Sort by amount, date, status
  - [ ] Pagination
  - Estimate: 5-6 hours

- [ ] Transaction detail view
  - [ ] Payment breakdown (job price, commission, fee)
  - [ ] Customer and painter info
  - [ ] Transpact transaction ID and status
  - [ ] Fund release date/time
  - [ ] Refund history (if applicable)
  - Estimate: 3-4 hours

- [ ] Transaction actions
  - [ ] Manual fund release (if Transpact fails)
  - [ ] Process refund to customer
  - [ ] View Transpact status
  - [ ] Resend webhook notification
  - Estimate: 4-5 hours

- [ ] Financial reports
  - [ ] Revenue by date
  - [ ] Commission breakdown
  - [ ] Payout to painters
  - [ ] Transpact fees
  - [ ] Export to CSV/PDF
  - Estimate: 6-8 hours

**Subtotal**: ~18-23 hours

#### F. Disputes Management Page
- [ ] Disputes list view
  - [ ] Filter by status (open/resolved)
  - [ ] Filter by outcome (approved/rejected/pending)
  - [ ] Filter by date range
  - [ ] Sort by date, amount
  - Estimate: 3-4 hours

- [ ] Dispute detail view
  - [ ] Job info and payment details
  - [ ] Customer and painter info
  - [ ] Dispute reason and description
  - [ ] Evidence (photos, messages)
  - [ ] Admin notes and resolution
  - Estimate: 4-5 hours

- [ ] Dispute resolution
  - [ ] Approve refund to customer
  - [ ] Approve payment to painter
  - [ ] Award partial refund (split funds)
  - [ ] Add resolution notes
  - [ ] Notify both parties
  - Estimate: 5-6 hours

**Subtotal**: ~12-15 hours

#### G. Feedback & Complaints Page
- [ ] Feedback list view
  - [ ] Filter by type (feedback/bug/complaint/feature-request)
  - [ ] Filter by status (new/in-progress/resolved/closed)
  - [ ] Filter by user type
  - [ ] Search by keyword
  - [ ] Sort by date, rating
  - Estimate: 4-5 hours

- [ ] Feedback detail view
  - [ ] Feedback message and context
  - [ ] User info
  - [ ] Screenshots/attachments
  - [ ] Status and response
  - Estimate: 2-3 hours

- [ ] Feedback management
  - [ ] Mark as reviewed
  - [ ] Change status (in-progress → resolved)
  - [ ] Add response/reply
  - [ ] Track resolution time
  - [ ] Close ticket
  - Estimate: 3-4 hours

**Subtotal**: ~9-12 hours

#### H. Analytics & Reports Page
- [ ] Report generation
  - [ ] Daily/weekly/monthly revenue reports
  - [ ] User growth trends
  - [ ] Job completion rate trend
  - [ ] Painter quality metrics
  - [ ] Payment success rate
  - [ ] Dispute rate analysis
  - Estimate: 8-10 hours

- [ ] Export functionality
  - [ ] Export to CSV
  - [ ] Export to PDF
  - [ ] Email reports
  - Estimate: 3-4 hours

**Subtotal**: ~11-14 hours

#### I. Admin Settings Page
- [ ] Commission rate management
  - [ ] View/edit commission tiers (12%/10%/8%)
  - [ ] Set custom rates per painter (if needed)
  - Estimate: 2-3 hours

- [ ] Email template management
  - [ ] View/edit email templates
  - [ ] Preview emails
  - [ ] Test send email
  - Estimate: 3-4 hours

- [ ] Platform settings
  - [ ] Maintenance mode toggle
  - [ ] Feature flags
  - [ ] System announcements
  - Estimate: 3-4 hours

- [ ] Admin user management
  - [ ] List admin users
  - [ ] Add/remove admins
  - [ ] Set admin roles (super/moderator/support)
  - Estimate: 3-4 hours

**Subtotal**: ~11-15 hours

**TOTAL ADMIN DASHBOARD EFFORT**: ~130-160 hours (3-4 weeks)

---

## SECTION 2: BACKEND API ENDPOINTS (Needs to be built/enhanced)

### 2.1 Admin-specific Endpoints (Already partially done)

- [x] GET /api/admin/kyc/pending (DONE)
- [x] GET /api/admin/kyc/:painterId (DONE)
- [x] POST /api/admin/kyc/:painterId/approve (DONE)
- [x] POST /api/admin/kyc/:painterId/reject (DONE)

**Missing Admin Endpoints**:

- [ ] **Users Management**
  - [ ] GET /api/admin/users (list users with filters)
  - [ ] GET /api/admin/users/:userId (user profile)
  - [ ] POST /api/admin/users/:userId/suspend (suspend user)
  - [ ] POST /api/admin/users/:userId/ban (ban user)
  - [ ] POST /api/admin/users/:userId/reset-password (reset password)
  - Estimate: 8-10 hours

- [ ] **Painters Management**
  - [ ] GET /api/admin/painters (list painters with filters)
  - [ ] GET /api/admin/painters/:painterId (painter profile)
  - [ ] POST /api/admin/painters/:painterId/tier (set commission tier)
  - Estimate: 6-8 hours

- [ ] **Jobs Management**
  - [ ] GET /api/admin/jobs (list jobs with filters)
  - [ ] GET /api/admin/jobs/:jobId (job detail)
  - [ ] POST /api/admin/jobs/:jobId/cancel (cancel with refund)
  - [ ] POST /api/admin/jobs/:jobId/complete (force completion)
  - Estimate: 8-10 hours

- [ ] **Payments Management**
  - [ ] GET /api/admin/payments (list transactions)
  - [ ] GET /api/admin/payments/:transactionId (detail)
  - [ ] POST /api/admin/payments/:transactionId/release (manual release)
  - [ ] POST /api/admin/payments/:transactionId/refund (process refund)
  - [ ] GET /api/admin/payments/reports (analytics)
  - Estimate: 10-12 hours

- [ ] **Disputes Management**
  - [ ] GET /api/admin/disputes (list disputes)
  - [ ] GET /api/admin/disputes/:disputeId (detail)
  - [ ] POST /api/admin/disputes/:disputeId/resolve (resolve dispute)
  - Estimate: 6-8 hours

- [ ] **Feedback Management**
  - [ ] GET /api/admin/feedback (list feedback)
  - [ ] GET /api/admin/feedback/:feedbackId (detail)
  - [ ] PUT /api/admin/feedback/:feedbackId (update status)
  - [ ] POST /api/admin/feedback/:feedbackId/reply (add response)
  - Estimate: 6-8 hours

- [ ] **Analytics & Reports**
  - [ ] GET /api/admin/analytics/revenue (revenue data)
  - [ ] GET /api/admin/analytics/users (user growth)
  - [ ] GET /api/admin/analytics/jobs (job metrics)
  - [ ] GET /api/admin/analytics/payments (payment metrics)
  - Estimate: 8-10 hours

**Total Endpoint Development**: ~52-64 hours

### 2.2 User Feedback System

- [ ] Create Feedback model in database
  - [ ] Fields: id, userId, type, title, message, status, rating, attachments, createdAt, updatedAt
  - Estimate: 1-2 hours

- [ ] Create API endpoints
  - [ ] POST /api/feedback (submit feedback)
  - [ ] GET /api/feedback/my-feedback (user's feedback)
  - [ ] GET /api/admin/feedback (all feedback for admin)
  - Estimate: 4-5 hours

- [ ] Create feedback form component
  - [ ] Feedback widget/button
  - [ ] Modal form
  - [ ] File upload for screenshots
  - [ ] Type selector (feedback/bug/complaint)
  - Estimate: 3-4 hours

- [ ] Create admin feedback management
  - [ ] List view with filters
  - [ ] Detail view with evidence
  - [ ] Status update and response
  - Estimate: 4-5 hours

**Total Feedback System**: ~12-16 hours

---

## SECTION 3: COMMUNICATION & NOTIFICATIONS

### 3.1 Email Service Integration

**Current State**: Not implemented

**What Needs to be Done**:

- [ ] Choose email provider (Select one)
  - [ ] SendGrid (recommended)
    - Estimate: 2-3 hours setup
  - [ ] Mailgun
  - [ ] AWS SES

- [ ] Create email templates
  - [ ] Welcome email (new user registration)
  - [ ] Email verification (confirm email)
  - [ ] Password reset email
  - [ ] Job posted notification (to painters in area)
  - [ ] Quote received (to customer)
  - [ ] Quote accepted (to painter)
  - [ ] Payment received (to both parties)
  - [ ] Job completed (to customer)
  - [ ] KYC status update (approved/rejected)
  - [ ] Dispute notification (to both parties)
  - [ ] Admin alert (critical issues)
  - Estimate: 8-10 hours (design + copy)

- [ ] Create email service module
  - [ ] sendWelcomeEmail()
  - [ ] sendVerificationEmail()
  - [ ] sendPasswordResetEmail()
  - [ ] sendJobNotificationEmail()
  - [ ] sendQuoteNotificationEmail()
  - [ ] sendPaymentNotificationEmail()
  - [ ] sendKYCStatusEmail()
  - [ ] sendDisputeEmail()
  - [ ] sendAdminAlertEmail()
  - Estimate: 10-12 hours

- [ ] Integrate email sending to key flows
  - [ ] User registration → welcome email
  - [ ] Email verification link → verification email
  - [ ] Password reset → reset email
  - [ ] Job posted → notify painters
  - [ ] Quote received → notify customer
  - [ ] Payment received → notify both
  - [ ] KYC status change → notify painter
  - [ ] Dispute opened → notify both
  - Estimate: 8-10 hours

**Total Email Service**: ~28-35 hours

### 3.2 SMS Service (Optional but Recommended)

- [ ] Choose SMS provider
  - [ ] Twilio (recommended)
  - [ ] AWS SNS
  - [ ] Nexmo/Vonage

- [ ] Implement SMS templates
  - [ ] Quote received notification (urgent)
  - [ ] Payment processed
  - [ ] Critical alerts (payment failures, disputes)

- [ ] Create SMS service module
  - [ ] sendQuoteNotificationSMS()
  - [ ] sendPaymentSMS()
  - [ ] sendCriticalAlertSMS()

- [ ] Integrate SMS to critical flows only (not all notifications)

**Total SMS Service**: ~10-15 hours (optional)

### 3.3 Real-time Notifications Enhancement

**Current State**: Socket.io is implemented but incomplete

- [ ] Test Socket.io connection
  - [ ] Verify WebSocket server running
  - [ ] Test authentication
  - [ ] Test notifications receiving
  - Estimate: 2-3 hours

- [ ] Add persistence layer (for production)
  - [ ] Set up Redis for message queue
  - [ ] Store undelivered notifications
  - [ ] Implement retry logic
  - Estimate: 6-8 hours (optional for MVP, needed for scale)

- [ ] Add notification preferences UI
  - [ ] User can disable certain notification types
  - [ ] User can choose email vs in-app vs SMS
  - [ ] Unsubscribe option
  - Estimate: 4-5 hours

**Total Notifications Enhancement**: ~12-16 hours

---

## SECTION 4: FRONTEND FEATURES & IMPROVEMENTS

### 4.1 Customer Dashboard Enhancement

**Current State**: Likely minimal/basic

- [ ] Jobs tab
  - [ ] List of customer's posted jobs
  - [ ] Filter by status (open, in-progress, completed)
  - [ ] View job details and quotes received
  - [ ] Cancel job option
  - [ ] View job progress
  - [ ] View completion images

- [ ] Quotes received tab
  - [ ] List all quotes received for jobs
  - [ ] Sort by price, painter rating
  - [ ] View painter profile
  - [ ] Accept/reject quote with message
  - [ ] Negotiate (counter-offer)

- [ ] Messages tab
  - [ ] List of conversations with painters
  - [ ] Unread message count
  - [ ] Message history
  - [ ] Quick response templates

- [ ] Payment history tab
  - [ ] List of all payments
  - [ ] Filter by status
  - [ ] Invoice download
  - [ ] Payment breakdown

- [ ] Favorites/Saved painters
  - [ ] List of saved painters
  - [ ] Quick hire option
  - [ ] View painter reviews

**Estimate**: ~20-25 hours

### 4.2 Painter Dashboard Enhancement

**Current State**: Exists but basic

- [ ] Job opportunities tab
  - [ ] List available jobs in service area
  - [ ] Filter by type, budget, distance
  - [ ] View job details and customer info
  - [ ] Submit quote directly

- [ ] My quotes tab
  - [ ] List of quotes submitted
  - [ ] Filter by status (pending, accepted, rejected)
  - [ ] View customer communication
  - [ ] Withdraw quote (before expiry)

- [ ] My jobs tab
  - [ ] List of accepted jobs (current and past)
  - [ ] Filter by status (in-progress, completed)
  - [ ] View job details and messages
  - [ ] Submit completion evidence
  - [ ] View payment status

- [ ] Earnings & Payouts tab
  - [ ] Total earnings display
  - [ ] Payout history
  - [ ] Commission rate based on tier
  - [ ] Upcoming payouts
  - [ ] Withdrawal request (if applicable)

- [ ] Profile & Settings tab
  - [ ] Edit profile (skills, rates, availability)
  - [ ] View/upload portfolio
  - [ ] KYC status
  - [ ] Insurance status
  - [ ] 2FA setup
  - [ ] Account settings

- [ ] Reputation & Reviews tab
  - [ ] Current reputation score
  - [ ] Tier status (Starter/Pro/Premium)
  - [ ] Customer reviews
  - [ ] Reliability events
  - [ ] Job completion stats

**Estimate**: ~25-30 hours

### 4.3 Dispute Resolution UI (Customer & Painter)

- [ ] Open dispute modal
  - [ ] Select dispute reason
  - [ ] Add description
  - [ ] Upload evidence (photos)
  - Estimate: 4-5 hours

- [ ] Dispute detail view
  - [ ] View dispute status
  - [ ] View evidence from both parties
  - [ ] Messages with other party
  - [ ] Admin notes and resolution
  - Estimate: 4-5 hours

**Estimate**: ~8-10 hours

### 4.4 Notification Preferences Page

- [ ] User can customize which notifications they receive
  - [ ] Job alerts
  - [ ] Quote updates
  - [ ] Payment notifications
  - [ ] Message alerts
  - [ ] Platform announcements

- [ ] Choose notification channels
  - [ ] In-app only
  - [ ] Email
  - [ ] SMS (if available)

**Estimate**: ~4-5 hours

### 4.5 Help & FAQ Pages

- [ ] FAQ page
  - [ ] Organize by user type (customer/painter)
  - [ ] Searchable
  - [ ] Link to help center

- [ ] Help/Support page
  - [ ] Contact form
  - [ ] Email support
  - [ ] Link to knowledge base

- [ ] Knowledge base (optional)
  - [ ] How-to guides
  - [ ] Troubleshooting
  - [ ] Video tutorials

**Estimate**: ~8-10 hours

### 4.6 Performance & UX Improvements

- [ ] Image optimization
  - [ ] Lazy load images
  - [ ] Compress images
  - [ ] Responsive images
  - Estimate: 4-5 hours

- [ ] Loading skeletons
  - [ ] Replace spinners with skeletons
  - [ ] Better perceived performance
  - Estimate: 4-5 hours

- [ ] Search & filtering improvements
  - [ ] Better search UI
  - [ ] Advanced filters
  - [ ] Save search preferences
  - Estimate: 6-8 hours

- [ ] Form improvements
  - [ ] Better validation feedback
  - [ ] Auto-save drafts
  - [ ] Progress indicators
  - Estimate: 4-5 hours

**Total Frontend**: ~20-25 hours

---

## SECTION 5: TESTING & QUALITY ASSURANCE

### 5.1 Automated Testing

- [ ] Unit tests
  - [ ] Utility functions
  - [ ] Service layer (reputation, transpact, etc)
  - [ ] API endpoint logic
  - Estimate: 15-20 hours

- [ ] Integration tests
  - [ ] Database queries
  - [ ] API endpoints with DB
  - [ ] Payment flow end-to-end
  - Estimate: 15-20 hours

- [ ] E2E tests (with Cypress or Playwright)
  - [ ] Customer journey (post job → hire → payment)
  - [ ] Painter journey (register → quote → accept → complete)
  - [ ] Admin journey (verify KYC → manage disputes)
  - Estimate: 20-25 hours

**Total Automated Testing**: ~50-65 hours

### 5.2 Manual Testing & QA

- [ ] Functional testing
  - [ ] Test every feature
  - [ ] Test all edge cases
  - [ ] Test error scenarios
  - Estimate: 20-30 hours

- [ ] Cross-browser testing
  - [ ] Chrome, Firefox, Safari, Edge
  - [ ] Mobile browsers
  - [ ] Test responsive design
  - Estimate: 8-10 hours

- [ ] Performance testing
  - [ ] Load testing (100+ concurrent users)
  - [ ] Database query performance
  - [ ] API response times
  - Estimate: 8-10 hours

- [ ] Security testing
  - [ ] SQL injection attempts
  - [ ] XSS attempts
  - [ ] Authentication bypass
  - [ ] Authorization checks
  - Estimate: 10-15 hours

**Total QA**: ~46-65 hours

---

## SECTION 6: INFRASTRUCTURE & DEPLOYMENT

### 6.1 Database Setup

- [ ] Choose & set up PostgreSQL
  - [ ] Neon (PostgreSQL as a Service) - recommended
    - [ ] Create account
    - [ ] Create production database
    - [ ] Set up connection pooling
    - Estimate: 1-2 hours
  
  - [ ] AWS RDS (alternative)
  - [ ] Self-hosted (less recommended)

- [ ] Database configuration
  - [ ] Run migrations: `npm run db:push`
  - [ ] Set up automated backups
  - [ ] Test backup restore
  - [ ] Create indexes for performance (optional)
  - Estimate: 2-3 hours

**Total Database**: ~3-5 hours

### 6.2 File Storage Setup

- [ ] Choose cloud storage
  - [ ] AWS S3 (recommended)
    - [ ] Create bucket
    - [ ] Configure IAM roles
    - [ ] Enable encryption
    - [ ] Set CORS policy
    - [ ] Set up CloudFront CDN (optional)
    - Estimate: 2-3 hours
  
  - [ ] Google Cloud Storage
  - [ ] Azure Blob Storage

- [ ] Signed URL generation
  - [ ] Configure expiry (1 hour for KYC docs)
  - [ ] Test signed URL access
  - Estimate: 1-2 hours

**Total File Storage**: ~3-5 hours (once S3/etc configured, see Section 1.1)

### 6.3 Email Service Setup

- [ ] Choose & set up email provider
  - [ ] SendGrid (recommended)
    - [ ] Create account
    - [ ] Configure API key
    - [ ] Set up sender domain
    - [ ] Verify SPF/DKIM/DMARC
    - Estimate: 1-2 hours

- [ ] Email templates
  - [ ] Create in email provider
  - [ ] Test emails
  - Estimate: 2-3 hours

**Total Email Setup**: ~3-5 hours (once SendGrid configured, see Section 3.1)

### 6.4 Monitoring & Error Tracking

- [ ] Choose & set up error tracking
  - [ ] Sentry (recommended)
    - [ ] Create account
    - [ ] Add to frontend and backend
    - [ ] Configure alerts
    - Estimate: 2-3 hours

- [ ] Choose & set up logging
  - [ ] ELK Stack or CloudWatch
  - Estimate: 3-5 hours

- [ ] Choose & set up uptime monitoring
  - [ ] UptimeRobot
    - [ ] Monitor main URL every 5 minutes
    - [ ] Configure alerts
    - Estimate: 1 hour

- [ ] Google Analytics
  - [ ] Add tracking code
  - [ ] Track key events (job posted, quote, payment)
  - Estimate: 2-3 hours

**Total Monitoring**: ~8-12 hours

### 6.5 Domain & SSL

- [ ] Register domain
  - [ ] paintbookco.com (or your brand)
  - [ ] Estimate: 0.5 hours + $12/year

- [ ] Configure DNS
  - [ ] Point to Netlify/Vercel
  - [ ] Verify DNS propagation
  - Estimate: 1-2 hours

- [ ] SSL certificate
  - [ ] Auto-configured by Netlify/Vercel
  - [ ] Force HTTPS redirect
  - Estimate: 1 hour

**Total Domain & SSL**: ~2.5-3.5 hours

---

## SECTION 7: SECURITY & COMPLIANCE

### 7.1 Security Hardening

- [ ] API security
  - [ ] Rate limiting on endpoints
  - [ ] CORS configuration (allow only your domain)
  - [ ] Input validation (all endpoints)
  - [ ] CSRF protection tokens
  - Estimate: 6-8 hours

- [ ] Password security
  - [ ] Enforce strong passwords (12+ chars, uppercase, numbers, symbols)
  - [ ] Password reset workflow
  - [ ] Session timeout (1 hour inactivity)
  - [ ] Login from all devices option
  - Estimate: 4-5 hours

- [ ] Data protection
  - [ ] Encrypt sensitive data in DB (SSN, ID numbers)
  - [ ] Database encryption at rest
  - [ ] HTTPS everywhere (force redirect)
  - Estimate: 4-6 hours

- [ ] Webhook security
  - [ ] Signature verification (already implemented)
  - [ ] Rate limiting on webhook endpoint
  - [ ] Retry mechanism
  - Estimate: 2-3 hours

**Total Security**: ~16-22 hours

### 7.2 Legal & Compliance

- [ ] Privacy Policy
  - [ ] Legal review (hire lawyer or use template)
  - [ ] GDPR compliance
  - [ ] Data retention policy
  - [ ] Data deletion request handling
  - Estimate: 4-6 hours (+ legal time)

- [ ] Terms of Service
  - [ ] Legal review
  - [ ] Liability disclaimers
  - [ ] Payment terms
  - [ ] Dispute resolution clause
  - Estimate: 4-6 hours (+ legal time)

- [ ] Cookie Consent
  - [ ] Cookie banner
  - [ ] User can opt-out of non-essential cookies
  - Estimate: 2-3 hours

- [ ] Data processing agreement (if processing EU data)
  - [ ] For Transpact, SendGrid, etc
  - [ ] Ensure they have proper agreements
  - Estimate: 2-3 hours

**Total Legal**: ~12-18 hours (+ lawyer review)

---

## SECTION 8: MARKETING & LAUNCH PREPARATION

### 8.1 Website Content

- [ ] Homepage
  - [ ] Compelling headline
  - [ ] Value propositions (for customers and painters)
  - [ ] How it works (step-by-step)
  - [ ] Trust badges
  - [ ] CTA buttons
  - Estimate: 6-8 hours

- [ ] About Us page
  - [ ] Company story
  - [ ] Mission & vision
  - [ ] Team bios (if applicable)
  - Estimate: 3-4 hours

- [ ] Pricing page
  - [ ] Commission rates explained
  - [ ] Payment terms
  - [ ] FAQ about pricing
  - Estimate: 2-3 hours

- [ ] Contact Us page
  - [ ] Contact form
  - [ ] Email support address
  - [ ] Office address (if applicable)
  - Estimate: 2 hours

**Total Website Content**: ~13-17 hours

### 8.2 Marketing Materials

- [ ] Logo & branding
  - [ ] Logo design
  - [ ] Brand colors
  - [ ] Typography
  - Estimate: 4-8 hours (or hire designer)

- [ ] Social media setup
  - [ ] Facebook page
  - [ ] Instagram account
  - [ ] LinkedIn page
  - [ ] Twitter account
  - Estimate: 2-3 hours

- [ ] Marketing copy
  - [ ] Email campaign templates
  - [ ] Social media post templates
  - [ ] Ad copy (Google, Facebook)
  - Estimate: 6-8 hours

- [ ] Press release
  - [ ] Announce launch
  - [ ] Distribute to tech/local media
  - Estimate: 3-4 hours

**Total Marketing**: ~15-23 hours

---

## SECTION 9: LAUNCH PHASES & TIMELINE

### Phase 1: Soft Launch (2-4 weeks)

**Target**: 100 beta testers (customers + painters)

**Requirements**:
- [x] Critical code fixes (DONE)
- [ ] File storage with signed URLs (Section 1.1)
- [ ] Email service configured (Section 3.1)
- [ ] Admin dashboard basic features (Section 1.3: A-D)
- [ ] Error handling UI (Section 1.2)
- [ ] Database set up (Section 6.1)
- [ ] Sentry/monitoring (Section 6.4)
- [ ] Legal docs (privacy policy, terms)

**Activities**:
- Invite 50-100 beta testers
- Monitor for bugs daily
- Quick turnaround on fixes
- Gather feedback
- Iterate on issues

**Effort**: ~80-100 hours

### Phase 2: Public MVP Launch (Weeks 5-8)

**Target**: 1,000+ registered users

**Requirements**:
- Everything from Phase 1, plus:
- [ ] Full admin dashboard (Section 1.3: E-I)
- [ ] Customer dashboard (Section 4.1)
- [ ] Painter dashboard (Section 4.2)
- [ ] Feedback system (Section 2.2)
- [ ] Help & FAQ pages (Section 4.5)
- [ ] Performance testing (Section 5.2)
- [ ] Website with homepage (Section 8.1)
- [ ] Marketing materials (Section 8.2)

**Activities**:
- Press release
- Social media launch
- Email campaign to pre-registered users
- Community management
- Daily monitoring

**Effort**: ~60-80 hours

### Phase 3: Optimize & Scale (Weeks 9-16)

**Target**: 5,000+ users, profitable payments

**Requirements**:
- Everything from Phase 2, plus:
- [ ] Dispute resolution UI (Section 4.3)
- [ ] Notification preferences (Section 4.4)
- [ ] SMS service (Section 3.2 - optional)
- [ ] Advanced analytics (Section 1.3: G)
- [ ] Performance optimization
- [ ] Regional expansion (if UK-focused)

**Effort**: ~40-60 hours

---

## SECTION 10: TOTAL EFFORT SUMMARY

| Category | Effort (Hours) | Weeks (at 40h/week) |
|----------|---|---|
| **Critical Remaining Issues** | 60-70 | 1.5-2 |
| Admin Dashboard | 130-160 | 3-4 |
| Backend API Endpoints | 52-64 | 1.5-2 |
| Feedback System | 12-16 | 0.5 |
| Email Service | 28-35 | 1 |
| SMS Service (optional) | 10-15 | 0.5 |
| Frontend Features | 58-75 | 1.5-2 |
| Testing & QA | 96-130 | 2.5-3 |
| Infrastructure | 17-25 | 0.5-1 |
| Security & Compliance | 28-40 | 1 |
| Marketing & Launch | 28-40 | 1 |
| **TOTAL** | **519-670 hours** | **13-17 weeks** |

**With Full Team (3 developers, 1 QA, 1 DevOps)**: 6-8 weeks
**With Small Team (1 developer, 1 part-time QA)**: 16-20 weeks

---

## SECTION 11: DEPENDENCIES & CRITICAL PATH

### Must Complete Before MVP Launch:
1. File storage (Section 1.1) - blocks document uploads
2. Error handling (Section 1.2) - critical UX
3. Admin dashboard (Section 1.3) - blocks KYC approval workflow
4. Email service (Section 3.1) - blocks user notifications
5. Database (Section 6.1) - blocks everything
6. Legal docs - required to launch publicly
7. Security hardening (Section 7.1) - required for prod

### Can Complete During Soft Launch:
- Customer/painter dashboards (can use simpler views)
- Advanced features (reports, analytics)
- SMS service (use email instead)

### Can Complete After MVP Launch:
- Advanced search/filtering
- Mobile app
- AI recommendations
- International support

---

## SECTION 12: RISK FACTORS

### High Risk Items:
1. **Transpact integration issues** - Payment processing is critical
   - Mitigation: Test thoroughly in sandbox, have support contact ready
   
2. **Database scale** - As user volume grows
   - Mitigation: Use read replicas, indexing, monitoring
   
3. **Payment webhook failures** - Could cause money loss
   - Mitigation: Implement retry logic, monitoring, manual override
   
4. **KYC fraud** - Bad actors getting verified
   - Mitigation: Strict document review, insurance verification

### Medium Risk Items:
1. **Admin dashboard bugs** - Admins make mistakes
   - Mitigation: Thorough testing, audit logs, confirmation dialogs
   
2. **Email delivery failures** - Users don't get notifications
   - Mitigation: Implement fallback (in-app notifications), retry logic

---

## SECTION 13: QUICK START RECOMMENDATIONS

### Next 1 Week (Start Now):
1. Set up database (Neon) - 1 hour
2. Start file storage (AWS S3) - 3 hours
3. Begin admin dashboard - 4-5 hours
4. Set up Sentry monitoring - 2 hours

### Next 2 Weeks:
1. Complete file storage implementation - 8 hours
2. Complete admin dashboard (Phase A-D) - 20 hours
3. Email service setup - 5 hours
4. Error handling UI - 8 hours
5. Begin testing - 10 hours

### Next 4 Weeks:
1. Complete admin dashboard (Phase E-I) - 20 hours
2. Customer/painter dashboards - 15 hours
3. Payment flow testing - 10 hours
4. Security hardening - 10 hours
5. Complete testing - 20 hours
6. Soft launch prep - 10 hours

---

## APPENDIX: DETAILED COMPONENT CHECKLIST

### Frontend Components to Build/Enhance:
- [ ] AdminDashboard (exists, needs expansion)
- [ ] AdminUserManagement
- [ ] AdminPaintersManagement
- [ ] AdminJobsManagement
- [ ] AdminPaymentsManagement
- [ ] AdminDisputesManagement
- [ ] AdminFeedbackManagement
- [ ] AdminAnalytics
- [ ] AdminSettings
- [ ] CustomerDashboard (enhance)
- [ ] CustomerJobsList
- [ ] CustomerQuotesList
- [ ] CustomerMessagesList
- [ ] CustomerPaymentHistory
- [ ] PainterDashboard (enhance)
- [ ] PainterJobOpportunities
- [ ] PainterMyQuotes
- [ ] PainterMyJobs
- [ ] PainterEarnings
- [ ] PainterReputation
- [ ] DisputeModal
- [ ] NotificationPreferences
- [ ] FeedbackForm
- [ ] ErrorBoundary
- [ ] LoadingSkeletons
- [ ] AdvancedSearch
- [ ] HomePage
- [ ] AboutPage
- [ ] PricingPage
- [ ] ContactPage
- [ ] HelpPage
- [ ] FAQPage

### Backend Services to Build:
- [ ] AdminService
- [ ] UserService (enhanced)
- [ ] EmailService
- [ ] SMSService (optional)
- [ ] FeedbackService
- [ ] ReportService
- [ ] AuditLogService

---

**Document Version**: 1.0  
**Last Updated**: March 2026  
**Next Review**: After Phase 1 soft launch completion
