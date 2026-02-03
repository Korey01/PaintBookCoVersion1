# PaintBook API Endpoints

## Authentication Endpoints

### Register
- **POST** `/api/auth/register`
- Create a new user account
- Body:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "userType": "customer" // or "painter"
  }
  ```
- Response: `{ success: true, token: "jwt_token", user: UserResponse }`

### Login
- **POST** `/api/auth/login`
- Authenticate user and get JWT token
- Body:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- Response: `{ success: true, token: "jwt_token", user: UserResponse }`

### Get Current User
- **GET** `/api/auth/me`
- Requires: Authorization header with Bearer token
- Response: `{ success: true, user: UserResponse }`

---

## Job Endpoints

### Create Job
- **POST** `/api/jobs`
- Requires: Customer auth
- Body:
  ```json
  {
    "jobType": "interior",
    "title": "Living room repaint",
    "description": "Walls and ceiling",
    "postcode": "SW1A 1AA",
    "budgetMin": 500,
    "budgetMax": 1000,
    "images": ["base64_encoded_image"],
    "paintBrand": "Dulux",
    "rooms": [
      {
        "id": "room_1",
        "name": "Living Room",
        "length": 5,
        "width": 4,
        "height": 2.4,
        "coats": 2
      }
    ],
    "useEscrow": true,
    "customerEmail": "customer@example.com",
    "customerPhone": "07700900000"
  }
  ```
- Response: `{ success: true, data: JobResponse }`

### Get Job
- **GET** `/api/jobs/:jobId`
- Requires: Auth (customer or assigned painter)
- Response: `{ success: true, data: JobResponse }`

### List Jobs
- **GET** `/api/jobs?status=open&page=1&pageSize=10`
- Requires: Auth
- For customers: shows their jobs
- For painters: shows open jobs in their area
- Response: `{ success: true, data: { jobs: JobResponse[], total: number, page: number, pageSize: number, totalPages: number } }`

### Update Job
- **PUT** `/api/jobs/:jobId`
- Requires: Customer auth, job in "open" status
- Body: Partial JobResponse fields
- Response: `{ success: true, data: JobResponse }`

### Cancel Job
- **DELETE** `/api/jobs/:jobId`
- Requires: Customer auth, no escrow funded
- Response: `{ success: true, data: { id: string, status: "cancelled" } }`

---

## Quote Endpoints

### Create Quote
- **POST** `/api/quotes`
- Requires: Painter auth
- Body:
  ```json
  {
    "jobId": "job_123",
    "jobPrice": 800,
    "consultationFee": 50
  }
  ```
- Response: `{ success: true, data: QuoteResponse }`

### Get Quote
- **GET** `/api/quotes/:quoteId`
- Requires: Auth (customer or painter who submitted quote)
- Response: `{ success: true, data: QuoteResponse }`

### List Quotes for Job
- **GET** `/api/quotes/job/:jobId`
- Requires: Auth (customer or assigned painter)
- Response: `{ success: true, data: { quotes: QuoteResponse[], total: number } }`

### Accept/Reject Quote
- **PUT** `/api/quotes/:quoteId`
- Requires: Customer auth
- Body:
  ```json
  {
    "status": "accepted", // or "rejected"
    "rejectionReason": "Price too high"
  }
  ```
- Response: `{ success: true, data: QuoteResponse }`

---

## Payment & Escrow Endpoints

### Initiate Payment
- **POST** `/api/payments/initiate`
- Requires: Customer auth, accepted quote
- Body:
  ```json
  {
    "jobId": "job_123",
    "amount": 850,
    "paymentMethod": "stripe"
  }
  ```
- Response:
  ```json
  {
    "success": true,
    "data": {
      "escrowTransactionId": "escrow_123",
      "transpactTransactionId": "TRANS_xxx",
      "amount": 850,
      "commission": 102,
      "escrowCost": 21.25,
      "painterAmount": 748,
      "commissionRate": 12,
      "paymentUrl": "https://escrow.transpact.com/pay/TRANS_xxx"
    }
  }
  ```

### Get Escrow Transaction
- **GET** `/api/payments/escrow/:transactionId`
- Requires: Auth (customer or painter in job)
- Response: `{ success: true, data: EscrowTransactionResponse }`

### Transpact Webhook
- **POST** `/api/payments/webhook/transpact`
- Called by Transpact when payment status changes
- Updates job and notifies parties

### Release Payment
- **POST** `/api/payments/release/:jobId`
- Requires: Customer auth
- Releases escrow funds to painter after job approval
- Response: `{ success: true, data: EscrowTransactionResponse }`

---

## Database Schema Overview

### Users
- `User` - Core user account (email, password, type)
- `CustomerProfile` - Customer-specific info
- `PainterProfile` - Painter-specific info with verification

### Jobs
- `Job` - Main job posting
- `Quote` - Painter's quote on a job
- `JobCompletion` - Job completion and approval

### Payments
- `EscrowTransaction` - Escrow payment record (Transpact integration)

### Messaging & Notifications
- `Message` - Direct messages between customer and painter
- `Notification` - System notifications

### Reputation & Disputes
- `ReliabilityEvent` - Painter reliability tracking
- `Dispute` - Dispute resolution
- `EvidenceSubmission` - Evidence for disputes

### B2B
- `B2BCustomer` - B2B customer records
- `B2BMilestone` - Milestone tracking for B2B projects

---

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "error": "Error message"
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad request
- `401` - Unauthorized (no token)
- `403` - Forbidden (not authorized for action)
- `404` - Not found
- `409` - Conflict (e.g., email already exists)
- `500` - Server error

---

## Authentication

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

The JWT token is obtained from `/api/auth/register` or `/api/auth/login`.

Token contains:
- `id` - User ID
- `email` - User email
- `userType` - "customer" or "painter"
- `iat` - Issued at
- `exp` - Expires at (7 days)

---

## Rate Limiting

Not yet implemented. Should be added for production.

---

## Pagination

List endpoints support:
- `page` (default: 1)
- `pageSize` (default: 10, max: 100)

Response includes:
- `data` - Array of items
- `total` - Total count
- `page` - Current page
- `pageSize` - Items per page
- `totalPages` - Total pages
