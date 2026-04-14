# PaintBookCo Authentication System — SECTION 2

## Overview

The authentication system provides a complete user lifecycle from signup through KYC verification for both customers and painters. Built on **Supabase Auth** with role-based access control and comprehensive KYC workflows.

---

## Architecture

### 1. Auth Context (`code/client/contexts/AuthContext.tsx`)

Central state management for all authentication operations.

**Key Features:**
- User session management
- Role detection (painter vs customer)
- KYC status tracking
- Profile data management
- Auth method abstractions

**Usage:**
```tsx
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { user, role, authenticated, kycStatus } = useAuth();
  
  if (!authenticated) return <Navigate to="/login" />;
  if (kycStatus === "pending") return <Navigate to={`/kyc/${role}`} />;
  
  return <Dashboard />;
}
```

### 2. Auth Flows

#### Customer Flow
```
RegisterCustomer → Email Confirmation → KYCCustomer → Dashboard
         ↓              ↓
    Supabase           ConfirmPage redirects
    creates user       to /kyc/customer
```

#### Painter Flow
```
JoinPainter → Email Confirmation → KYCPainter → Dashboard
   ↓ (3 steps)      ↓
Personal info    ConfirmPage redirects
Account setup    to /kyc/painter
Specialisms
```

---

## Authentication Pages

### `/register/customer` — Customer Signup
- Email/password registration
- Password strength indicator
- Terms & privacy acceptance
- Email confirmation required
- **File:** `code/client/pages/RegisterCustomer.tsx`

**Features:**
- Real-time password strength feedback
- Inline validation
- Automatic redirect to email confirmation page
- Responsive design

### `/join-painter` — Painter Signup (3-step)
- **Step 1:** Personal information (name, email, phone)
- **Step 2:** Account setup (password, location/postcode)
- **Step 3:** Specialisms selection (from predefined list)
- Email confirmation required
- **File:** `code/client/pages/JoinPainter.tsx`

**Features:**
- Progress indicator
- Back/forward navigation
- Pre-defined specialisms (8 categories)
- UK postcode validation

### `/login` — Login Page
- Email + password authentication
- Password visibility toggle
- "Forgot password?" link
- Auto-detection of user role
- **File:** `code/client/pages/LoginPage.tsx`

**Features:**
- Supabase auth integration
- Role-based redirect to correct dashboard
- Email unconfirmed detection
- Resend confirmation email option

### `/reset-password` — Password Reset
- Email-based password recovery
- Confirmation email flow
- **File:** `code/client/pages/ResetPassword.tsx`

### `/confirm` — Email Confirmation Handler
- Automatically handles Supabase confirmation tokens
- Redirects to KYC pages (not directly to dashboard)
- **File:** `code/client/pages/ConfirmPage.tsx`

---

## KYC (Know Your Customer) Workflow

### For Painters: `/kyc/painter`
**File:** `code/client/pages/KYCPainter.tsx`

#### Document Requirements
Accepts the following document types:
- ✓ Passport or Driving License
- ✓ Business Registration (sole trader/limited company)
- ✓ Professional Insurance Certificate
- ✓ DBS Check (enhanced disclosure)

#### Document Upload
- **Formats:** PDF, JPG, PNG
- **Max size:** 5MB
- **Storage:** Supabase Storage (`documents` bucket)
- **Validation:** Client-side + server-side

#### Status States
```typescript
type KYCStatus = "pending" | "submitted" | "approved" | "rejected";
```

- **pending** → Show upload form
- **submitted** → Show "Verification pending" message
- **approved** → Unlock dashboard access
- **rejected** → Show rejection reason

### For Customers: `/kyc/customer`
**File:** `code/client/pages/KYCCustomer.tsx`

#### Verification Steps
1. ✓ Email Verification (automatic on signup)
2. □ Profile Information (shown as pending)
3. □ Address Verification (shown as pending)

#### Design
- Education-first approach
- Shows verification steps with completion status
- Requires acknowledgment before proceeding
- Explains why verification is needed

---

## Database Schema

### painters table
```sql
kyc_status            TEXT            -- "pending", "submitted", "approved", "rejected"
kyc_document_url      TEXT            -- URL to uploaded document in Storage
kyc_submitted_at      TIMESTAMP       -- When document was submitted
kyc_verified_at       TIMESTAMP       -- When verified (admin sets)
kyc_rejection_reason  TEXT            -- If rejected, why
```

### customers table
```sql
kyc_status            TEXT            -- "pending", "submitted", "approved", "rejected"
```

---

## Protected Routes

### `ProtectedRoute` Component
**File:** `code/client/components/auth/ProtectedRoute.tsx`

Wraps dashboard routes to enforce:
1. **Authentication:** User must be logged in
2. **Role validation:** User redirected to their correct dashboard
3. **KYC verification:** User redirected to KYC page if pending

```tsx
<Route path="/dashboard/customer" element={
  <ProtectedRoute requiredRole="customer">
    <CustomerDashboardPage />
  </ProtectedRoute>
} />

<Route path="/dashboard/painter" element={
  <ProtectedRoute requiredRole="painter">
    <PainterDashboardPage />
  </ProtectedRoute>
} />
```

### Redirect Logic
```
No user → /login
User → Role check → Wrong role → Correct dashboard
         → KYC check → KYC pending → /kyc/{role}
         → KYC approved → Dashboard
```

---

## Types & Interfaces

### AuthContextType
```typescript
interface AuthContextType {
  // State
  user: User | null
  role: "customer" | "painter" | null
  loading: boolean
  authenticated: boolean
  
  // Profiles
  customerProfile: CustomerProfile | null
  painterProfile: PainterProfile | null
  
  // Status
  kycStatus: KYCStatus | null
  
  // Methods
  signUp(email, password, role, metadata): Promise<{user, error}>
  signIn(email, password): Promise<{error}>
  signOut(): Promise<void>
  resetPassword(email): Promise<{error}>
  submitKYC(role, documentUrl): Promise<{error}>
  updateProfile(role, data): Promise<{error}>
}
```

### User Profiles
```typescript
interface CustomerProfile {
  id: string
  user_id: string
  full_name: string
  email: string
  phone: string | null
  avatar_url: string | null
  kyc_status: KYCStatus
  created_at: string
  updated_at: string
}

interface PainterProfile {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  postcode: string
  specialisms: string[]
  avatar_url: string | null
  kyc_status: KYCStatus
  kyc_document_url: string | null
  kyc_submitted_at: string | null
  kyc_verified_at: string | null
  kyc_rejection_reason: string | null
  commission_tier: number
  rating: number | null
  review_count: number
  verified_badge: boolean
  created_at: string
  updated_at: string
}
```

---

## Implementation Checklist

- [x] AuthContext created with full state management
- [x] Supabase client configured with env variables
- [x] Customer signup flow (/register/customer)
- [x] Painter signup flow (/join-painter with 3 steps)
- [x] Login page with role detection
- [x] Password reset flow
- [x] Email confirmation handler
- [x] Painter KYC with document upload
- [x] Customer KYC with email verification
- [x] ProtectedRoute with KYC gating
- [x] App wrapped with AuthProvider
- [x] Routes integrated for all auth pages
- [x] KYC status redirects in place
- [ ] Next: Supabase RLS policies for KYC tables
- [ ] Next: Admin KYC verification dashboard

---

## Session Management

### How It Works

1. **Supabase Auth Session**
   - Automatically persisted in browser
   - Token refreshed automatically
   - survives page reloads

2. **Role Detection**
   - On login: Check if user exists in `painters` table
   - If found: role = "painter"
   - Otherwise: role = "customer"
   - Re-checks on auth state changes

3. **Profile Caching**
   - AuthContext maintains local profile data
   - Updated on auth state changes
   - Available via `useAuth()` hook

### Security Notes

- All Supabase operations use client-side anon key
- Server-side RLS policies should restrict access
- Passwords never transmitted in plain text (Supabase handles)
- Document storage requires signed URLs (implement in admin panel)

---

## Environment Variables

```env
# Required for authentication
VITE_SUPABASE_URL="https://kvuidnkmxqftbmlyvlyl.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGc..."
```

---

## Related Files

- `code/client/contexts/AuthContext.tsx` — Main auth state management
- `code/client/pages/RegisterCustomer.tsx` — Customer signup
- `code/client/pages/JoinPainter.tsx` — Painter signup
- `code/client/pages/LoginPage.tsx` — Login
- `code/client/pages/ResetPassword.tsx` — Password recovery
- `code/client/pages/ConfirmPage.tsx` — Email confirmation handler
- `code/client/pages/KYCPainter.tsx` — Painter document upload
- `code/client/pages/KYCCustomer.tsx` — Customer email verification
- `code/client/components/auth/ProtectedRoute.tsx` — Route protection
- `code/client/lib/supabase.ts` — Supabase client

---

## Next Steps (Not Implemented Yet)

1. **KYC Admin Dashboard**
   - Review pending documents
   - Approve/reject with reasons
   - Email notifications to applicants

2. **Row Level Security (RLS)**
   - Lock down KYC data access
   - Ensure only admins can see documents
   - Painters can only see their own data

3. **Email Notifications**
   - Confirmation emails
   - KYC status change emails
   - Password reset emails

4. **Enhanced Verification**
   - ID verification API integration
   - Business registration lookup
   - DBS check automation

---

**Version:** 1.0  
**Last Updated:** April 2026  
**Status:** ✅ Complete — Ready for Section 3 (Customer Dashboard)
