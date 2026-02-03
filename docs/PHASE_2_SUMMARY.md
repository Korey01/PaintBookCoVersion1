# Phase 2: Painter Onboarding & KYC Verification

## Overview

Phase 2 implements the complete painter onboarding and KYC (Know Your Customer) verification flow. This includes personal information collection, document upload, verification status tracking, and admin review capabilities.

## What's Implemented

### Backend Routes

#### KYC Management (`/api/kyc`)

- **POST /api/kyc/submit** - Submit KYC information for verification
  - Requires: firstName, lastName, dateOfBirth, address, postcode
  - Optional: businessName, businessRegistration, businessType, insurance details
  - Updates verification status to "under_review"

- **GET /api/kyc/status** - Check current KYC verification status
  - Returns: verificationStatus, documentsUploaded, insurance info, completion date
  - Painter only endpoint

- **POST /api/kyc/documents/upload** - Upload KYC documents
  - Supports: id_document, insurance, address_proof
  - Stores documents as JSON with uploadedAt and expiresAt metadata
  - File size limit: 5MB per document

- **GET /api/kyc/documents** - List all uploaded documents
  - Returns: idDocuments, insuranceDocs, addressProofDocuments arrays
  - Shows document URLs and expiry dates

- **POST /api/kyc/verify** - Admin endpoint to approve/reject KYC
  - Status: "approved" or "denied"
  - Rejection reason (optional)
  - Creates notifications for painters

### Database Schema Updates

**PainterProfile Model - New Fields:**

```prisma
// Personal Information
firstName              String?
lastName               String?
dateOfBirth            DateTime?

// Business Information
businessName           String?
businessRegistration   String?
businessType           String?
address                String?
city                   String?
businessPhone          String?

// Documents (JSON arrays)
idDocuments            Json[] // {url, uploadedAt, expiresAt}
insuranceDocs          Json[] // {url, uploadedAt, expiresAt}
addressProofDocuments  Json[] // {url, uploadedAt}

// KYC Status
kycCompletedAt         DateTime?
kycRejectionReason     String?
```

### Frontend Components

#### KYCForm Component (`client/components/painter/KYCForm.tsx`)

- Multi-section form for painter information
- Sections: Personal Info, Business Info, Address, Insurance
- Conditional insurance fields
- Form validation with error messages
- Toast notifications for success/failure

**Key Features:**
- Date picker for date of birth
- Business type selector (sole trader, limited company, partnership, other)
- Optional insurance information with expiry date
- Responsive grid layout (1 column mobile, 2 columns desktop)

#### DocumentUpload Component (`client/components/painter/DocumentUpload.tsx`)

- Drag-and-drop file upload
- Document type selection (ID, Insurance, Address Proof)
- File size validation (max 5MB)
- Expiry date requirement for ID and insurance documents
- Display of previously uploaded documents
- Document requirements checklist

**Document Types:**
1. **ID Document** (Passport or Driving License) - Requires expiry
2. **Insurance Certificate** (Public Liability) - Requires expiry  
3. **Address Proof** (Utility bill, council tax) - No expiry required

#### KYCStatus Component (`client/components/painter/KYCStatus.tsx`)

- Visual status display with icons
- Status badges: Pending, Under Review, Approved, Denied
- Progress bar for document upload progress
- Rejection reason display (if applicable)
- Next steps guidance
- Color-coded for each status

#### PainterOnboarding Page (`client/pages/PainterOnboarding.tsx`)

- Main page for painter KYC process
- Tabbed interface: "Your Information" and "Documents"
- Auto-fetches KYC status on load
- Displays success message when approved
- Prevents form access after approval
- Handles token-based authentication

**Routes:**
- `/painter-onboarding` - Main onboarding page

### Type Definitions

**New Types in `shared/types.ts`:**

```typescript
interface KYCVerificationRequest {
  firstName: string
  lastName: string
  dateOfBirth: string
  phone?: string
  businessName?: string
  businessRegistration?: string
  businessType?: string
  address: string
  city?: string
  postcode: string
  businessPhone?: string
  hasInsurance?: boolean
  insuranceProvider?: string
  insurancePolicyNumber?: string
  insuranceExpiry?: string
}

interface KYCStatusResponse {
  verificationStatus: "pending" | "under_review" | "approved" | "denied"
  idDocuments: number
  insuranceDocs: number
  hasInsurance: boolean
  kycCompletedAt?: string
  kycRejectionReason?: string
}

interface DocumentListResponse {
  idDocuments: Document[]
  insuranceDocs: Document[]
  addressProofDocuments: Document[]
}
```

## API Integration Flow

### Painter Onboarding Flow

1. **Registration** → Painter signs up with email/password
2. **Redirect to Onboarding** → `/painter-onboarding`
3. **Submit Information** → POST `/api/kyc/submit`
   - Frontend validates form data
   - Backend updates PainterProfile
   - Sets status to "under_review"
   - Creates notification
4. **Upload Documents** → POST `/api/kyc/documents/upload` (multiple times)
   - Each document uploaded separately
   - Stored as JSON with metadata
   - Can upload multiple of each type
5. **Verification** → Admin reviews via dashboard
   - POST `/api/kyc/verify` with approval/rejection
   - Painter receives notification
6. **Approved** → Painter can accept jobs

## Database Changes

Run the following to sync schema:

```bash
pnpm db:push
```

The schema already includes all necessary fields. If data loss warning appears for document fields, accept it:

```bash
pnpm exec prisma db push --accept-data-loss
```

## Testing the KYC Flow

### Manual Testing Steps

1. **Register as Painter**
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "painter@test.com",
       "password": "SecurePass123!",
       "userType": "painter"
     }'
   ```

2. **Access Onboarding Page**
   - Navigate to: `/painter-onboarding`
   - Should fetch current KYC status

3. **Submit KYC Information**
   ```bash
   curl -X POST http://localhost:3000/api/kyc/submit \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <TOKEN>" \
     -d '{
       "firstName": "John",
       "lastName": "Smith",
       "dateOfBirth": "1990-01-15",
       "address": "123 Main St",
       "postcode": "SW1A 1AA"
     }'
   ```

4. **Upload Documents**
   ```bash
   curl -X POST http://localhost:3000/api/kyc/documents/upload \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <TOKEN>" \
     -d '{
       "documentType": "id_document",
       "documentUrl": "https://example.com/id.pdf",
       "documentExpiry": "2026-01-15"
     }'
   ```

5. **Check Status**
   ```bash
   curl http://localhost:3000/api/kyc/status \
     -H "Authorization: Bearer <TOKEN>"
   ```

## Verification Workflow (Admin)

### Approve KYC
```bash
curl -X POST http://localhost:3000/api/kyc/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "painterId": "painter_profile_id",
    "status": "approved"
  }'
```

### Reject KYC
```bash
curl -X POST http://localhost:3000/api/kyc/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "painterId": "painter_profile_id",
    "status": "denied",
    "rejectionReason": "ID document unclear, please resubmit"
  }'
```

## Notifications

When KYC status changes, painters receive notifications:

- **kyc_submitted** - When information is submitted for review
- **kyc_approved** - When verification is approved
- **kyc_rejected** - When verification is rejected with reason

## File Structure

```
Backend:
- server/routes/kyc.ts (409 lines)
- shared/types.ts (updated with KYC types)
- prisma/schema.prisma (updated with KYC fields)

Frontend:
- client/components/painter/KYCForm.tsx (305 lines)
- client/components/painter/DocumentUpload.tsx (249 lines)
- client/components/painter/KYCStatus.tsx (154 lines)
- client/pages/PainterOnboarding.tsx (277 lines)
- client/App.tsx (updated with route)
```

## What's Next (Phase 3)

### Planned Features

1. **2FA Setup** - Two-factor authentication for painters
2. **Job Notifications** - Real-time notifications when jobs match painter profile
3. **Painter Dashboard** - View and manage painter jobs, quotes, earnings
4. **Payment Integration** - Stripe/Transpact full integration
5. **Ratings & Reviews** - Customer ratings and painter reputation system

### Known Limitations

1. **File Storage** - Currently uses object URLs. Should integrate with:
   - AWS S3
   - Google Cloud Storage
   - Azure Blob Storage
   - Or any cloud file service

2. **Admin Dashboard** - KYC verification is API-only. Needs admin UI to:
   - View pending KYCs
   - Review documents
   - Approve/Reject with comments
   - Bulk operations

3. **Email Verification** - Should send verification email to painter during registration

## Performance Considerations

- Document upload limited to 5MB to avoid large payloads
- KYC status cached in frontend after fetch
- Document array queries use JSON indexing (recommend adding Prisma index)
- Consider pagination for painters with many documents

## Security Notes

- All endpoints require authentication
- Admin verification endpoint needs admin role checking (TODO)
- Document URLs should use signed/temporary URLs (not public)
- Consider encryption for sensitive personal data (name, DOB, ID numbers)
- Implement rate limiting for KYC submission (max 1 per 24 hours)

## Troubleshooting

### Documents Not Uploading
- Check file size (max 5MB)
- Ensure token is valid
- Check network console for error messages
- Verify documentType is one of: id_document, insurance, address_proof

### KYC Status Not Updating
- Clear browser cache
- Check network requests to `/api/kyc/status`
- Verify database has painter profile
- Check for errors in server logs

### Form Validation Errors
- Ensure all required fields are filled
- Date format should be YYYY-MM-DD
- Postcode format requirements may vary by region
