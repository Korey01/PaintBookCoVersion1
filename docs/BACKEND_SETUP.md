# Backend Setup & Deployment Guide

## Database Connection ✅

Your application is now connected to **Supabase PostgreSQL** with all 15 core tables initialized:

- **Database Host**: `db.kvuidnkmxqftbmlyvlyl.supabase.co`
- **Database**: `postgres`
- **Port**: 5432
- **Status**: Connected and synchronized

### Database Tables Created

- User
- CustomerProfile
- PainterProfile
- Job
- Quote
- JobCompletion
- EscrowTransaction
- Dispute
- EvidenceSubmission
- Message
- Notification
- ReliabilityEvent
- B2BCustomer
- B2BMilestone
- (+ junction tables for relationships)

## Development Environment

### Running During Development

**Option 1: Frontend Only** (API calls proxy to localhost:3000)

```bash
pnpm dev
```

Frontend runs on: `http://localhost:8080`

**Option 2: Backend Only** (Pure API server)

```bash
pnpm dev:server
```

Backend API runs on: `http://localhost:3000/api`

**Option 3: Both Together** (Recommended for full development)

```bash
pnpm dev:all
```

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:3000/api`
- Frontend automatically proxies API calls to backend

### Architecture

- **Frontend**: Vite dev server on port 8080 with React
- **Backend**: Express.js API server on port 3000
- **API Proxy**: Frontend automatically forwards `/api/*` requests to backend
- **Database**: Supabase PostgreSQL (remote)

## Production Build

### Building for Production

Create optimized bundles for deployment:

```bash
pnpm build
```

This creates:

1. **Frontend SPA**: `dist/spa/` (static HTML/CSS/JS)
2. **Backend Server**: `dist/server/node-build.mjs` (Node.js bundle)

### Production Deployment

**Option 1: Single-Process Deployment** (Frontend + Backend together)

```bash
pnpm start
```

Serves both frontend and API on the same port (default 3000).

**Option 2: Separate Deployment** (Recommended for scalability)

**Frontend**: Deploy `dist/spa/` to a CDN (Netlify, Vercel, AWS S3 + CloudFront)

**Backend**: Deploy on your server infrastructure:

```bash
node dist/server/node-build.mjs
```

Update frontend `vite.config.ts` to point to your backend URL:

```typescript
proxy: {
  "/api": {
    target: "https://api.yourdomain.com",  // Your backend URL
    changeOrigin: true,
  },
}
```

## Environment Configuration

### Development (`.env`)

```
DATABASE_URL="postgresql://postgres:January27$paintbookco@db.kvuidnkmxqftbmlyvlyl.supabase.co:5432/postgres"
JWT_SECRET="test-secret-key-12345-change-in-production"
STRIPE_SECRET_KEY="sk_test_placeholder"
TRANSPACT_API_KEY="test_transpact_key_placeholder"
NODE_ENV="development"
PORT="3000"
```

### Production (.env)

```
DATABASE_URL="[your-production-database-url]"
JWT_SECRET="[generate-a-long-random-secret]"
STRIPE_SECRET_KEY="[your-stripe-secret-key]"
TRANSPACT_API_KEY="[your-transpact-api-key]"
NODE_ENV="production"
PORT="3000"
```

## API Endpoints Reference

All API endpoints are available at `/api/*`

### Authentication

- `POST /api/auth/register` - Register new customer or painter
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Jobs

- `POST /api/jobs` - Create job (customers only)
- `GET /api/jobs/:jobId` - Get job details
- `GET /api/jobs` - List jobs (with pagination/filters)
- `PUT /api/jobs/:jobId` - Update job
- `DELETE /api/jobs/:jobId` - Cancel job

### Quotes

- `POST /api/quotes` - Submit quote (painters only)
- `GET /api/quotes/:quoteId` - Get quote details
- `GET /api/quotes/job/:jobId` - List quotes for job
- `PUT /api/quotes/:quoteId` - Accept/reject quote (customers)

### Payments & Escrow

- `POST /api/payments/initiate` - Initiate escrow payment
- `GET /api/payments/escrow/:transactionId` - Get escrow status
- `POST /api/payments/release/:jobId` - Release funds to painter
- `POST /api/payments/webhook/transpact` - Transpact webhook handler

See `docs/API_ENDPOINTS.md` for complete request/response examples.

## Database Management

### View Data (Prisma Studio)

```bash
pnpm db:studio
```

Opens web UI at `http://localhost:5555` to browse database.

### Push Schema Changes

```bash
pnpm db:push
```

Sync any changes to `prisma/schema.prisma` with the database.

### Create Migration

```bash
pnpm db:migrate
```

Create a timestamped migration file.

### Generate Prisma Client

```bash
pnpm db:generate
```

Regenerate TypeScript types from schema.

## Common Commands

| Command           | Purpose                            |
| ----------------- | ---------------------------------- |
| `pnpm dev`        | Start frontend only (port 8080)    |
| `pnpm dev:server` | Start backend API only (port 3000) |
| `pnpm dev:all`    | Start frontend + backend together  |
| `pnpm build`      | Production build                   |
| `pnpm start`      | Run production build               |
| `pnpm db:studio`  | Open Prisma Studio                 |
| `pnpm db:push`    | Sync schema with database          |
| `pnpm test`       | Run test suite                     |
| `pnpm typecheck`  | Check TypeScript types             |

## Testing

To test the API endpoints, see `docs/PHASE_1_TESTING.md` for:

- cURL examples for all endpoints
- Test suite running instructions
- Manual testing workflows

## Troubleshooting

### Database Connection Failed

- Verify `DATABASE_URL` in `.env` is correct
- Check Supabase dashboard → Settings → Database for connection string
- Ensure your IP is whitelisted in Supabase firewall settings
- Try connecting with Prisma Studio: `pnpm db:studio`

### API Not Responding

- Ensure backend is running: `pnpm dev:server`
- Check backend console for errors
- Verify port 3000 is not in use by another process
- Frontend should see API errors in browser console

### Frontend Can't Reach API

- If running frontend and backend separately, verify proxy is configured
- Frontend running on port 8080 proxies to `http://localhost:3000/api`
- Check `vite.config.ts` proxy configuration

## Next Steps

1. **Test the API**: Run the test suite to verify all endpoints

   ```bash
   pnpm test
   ```

2. **Implement Phase 2**: Build painter onboarding with KYC verification

3. **Connect Payment Providers**:
   - Add real Stripe keys
   - Add real Transpact API keys
   - Test payment flows

4. **Deploy**: Choose your deployment platform (Netlify, Vercel, AWS, etc.)
