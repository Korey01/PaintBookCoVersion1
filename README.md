# PaintBook - Painter Marketplace Platform

A modern, full-stack marketplace platform connecting customers with verified painters and decorators. Built with React, Express, and TypeScript, featuring escrow-protected bookings and advanced paint estimation tools.

## 🎯 Features

### For Customers
- **Painter Discovery**: Search and filter painters by location, skills, ratings, and price
- **Advanced Paint Estimator**: Calculate paint needs with multi-room support, brand comparison, and price analysis
- **Job Posting**: Post painting jobs with detailed specifications and photo uploads
- **Escrow Protection**: Secure payment handling via Stripe until job completion
- **Job Management**: Track quotes, messages, and payment status in customer dashboard
- **Saved Estimates**: Store and reuse paint calculations across jobs

### For Painters
- **Profile Management**: Showcase portfolio, skills, rates, and availability
- **Job Browsing**: Discover and respond to painting requests in your area
- **Quotes System**: Submit competitive quotes for customer jobs
- **Dashboard**: Manage jobs, messages, and earnings
- **Geolocation Matching**: Distance-based painter discovery

### Platform Features
- **Multi-Room Estimation**: Add multiple rooms with individual coat counts for accurate paint calculations
- **Brand Comparison**: Compare coverage and pricing across major paint brands (Dulux, Johnstone's, Wilko, Leyland)
- **Real-time Validation**: Form validation with clear error messages
- **Responsive Design**: Mobile-first UI built with Tailwind CSS and Radix UI
- **Dark Mode Ready**: Complete theming support via CSS variables
- **Data Persistence**: LocalStorage for offline support and data continuity

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library with hooks
- **React Router 6** - SPA routing in mode
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **TailwindCSS 3** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library
- **React Query** - Data fetching and caching
- **Zod** - TypeScript-first schema validation

### Backend
- **Express.js** - Lightweight web framework
- **Node.js** - JavaScript runtime
- **TypeScript** - Type-safe backend code

### DevOps & Deployment
- **Vite Dev Server** - Single-port development (client + server)
- **Netlify Functions** - Serverless deployment ready
- **pnpm** - Fast, efficient package manager

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and pnpm

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open http://localhost:8080 in your browser
```

### Available Commands

```bash
pnpm dev          # Start dev server (client + server with hot reload)
pnpm build        # Production build
pnpm start        # Start production server
pnpm typecheck    # TypeScript validation
pnpm test         # Run Vitest tests
```

## 📁 Project Structure

```
client/                          # React SPA frontend
├── pages/                        # Route pages (Index.tsx = home)
│   ├── Index.tsx                # Home/landing page
│   ├── FindPainters.tsx          # Painter search & filtering
│   ├── PainterProfile.tsx        # Individual painter profile
│   ├── PostJob.tsx              # Job posting workflow
│   ├── Checkout.tsx             # Payment flow
│   ├── Estimator.tsx            # Paint estimator tool
│   └── Dashboard.tsx            # Customer/painter dashboards
├── components/
│   ├── site/                     # App-specific components
│   │   ├── Header.tsx           # Navigation
│   │   ├── Footer.tsx           # Footer
│   │   ├── PainterCard.tsx      # Painter preview card
│   │   └── RoomDimensions.tsx   # Multi-room input component
│   └── ui/                       # Radix UI primitives (card, button, input, etc.)
├── lib/
│   ├── auth.ts                  # Client-side auth & account management
│   ├── geo.ts                   # Geolocation & distance calculations
│   └── paint-estimator.ts       # Paint estimation logic & brand data
├── hooks/                        # Custom React hooks
├── data/                         # Static data (painters dataset)
└── App.tsx                       # SPA router configuration

server/                           # Express backend
├── index.ts                      # Server setup & routes
├── routes/                       # API endpoint handlers
└── node-build.ts                # Production server

shared/                           # Types shared between client & server
└── api.ts                        # API interfaces

netlify/
└── functions/api.ts             # Serverless deployment wrapper
```

## 🔄 Key Workflows

### Job Posting Flow
1. Customer fills job details (type, description, photos)
2. Sets budget range and location
3. **Adds multiple room dimensions** with coat counts for each room
4. Runs paint estimator for accurate material costs
5. Configures escrow protection (2.5% fee)
6. Submits job - nearby painters are notified
7. Receives quotes and can hire directly

### Painter Search Flow
1. Customer enters location (postcode/city)
2. Filters by job type, price, rating, availability
3. Views painter cards with skills, rates, reviews
4. Clicks to see full profile or request quote
5. Can save painters to favorites

### Paint Estimation Flow
1. **Add multiple rooms** with length, width, height, and coats per room
2. Select paint brand and type
3. Adjust coverage and price per litre
4. Fine-tune openings (doors/windows)
5. View real-time calculations
6. Compare brands and costs
7. Attach estimate to job posting

## 💾 Data Persistence

The platform uses localStorage for client-side data storage:
- `paintbook:user` - Currently logged in user
- `paintbook:accounts` - All registered accounts
- `paintbook:rooms` - Saved room dimensions
- `paintbook:jobs` - Posted jobs
- `paintbook:favs` - Favorite painters
- `paintbook:lastEstimate` - Recent paint estimate

**Note**: This is a demo implementation. Production should use a proper database (PostgreSQL, MongoDB, etc.)

## 🔐 Security Considerations

- Client-side auth is for demonstration only
- Implement proper backend authentication for production (JWT, OAuth)
- Move sensitive data (pricing, painter details) to secure API
- Add rate limiting and input validation on server
- Use environment variables for secrets
- Implement CORS properly before production

## 📋 Recent Updates

- **Room Dimensions in Paint Estimator**: Users can now add multiple rooms with individual coat counts
- **Unified Estimation**: Paint calculations now pull from room list instead of duplicate dimension inputs
- **Controlled Input Fixes**: Resolved React controlled/uncontrolled input warnings
- **Responsive Grid**: Room inputs adapt from mobile (stacked) to desktop (6 columns)

## 🛣 Development Roadmap

### Short Term
- [ ] Backend API for painter profiles & filtering
- [ ] Database implementation (PostgreSQL)
- [ ] Real payment integration (Stripe)
- [ ] Email notifications for job posts
- [ ] Messaging system between customers & painters

### Medium Term
- [ ] Painter dashboard with job management
- [ ] Review & rating system
- [ ] Calendar integration for availability
- [ ] Mobile app (React Native)
- [ ] Admin panel for platform management

### Long Term
- [ ] AI-powered painter recommendations
- [ ] Advanced scheduling with time slots
- [ ] Contract templates
- [ ] Insurance integration
- [ ] Multi-language support

## 🧪 Testing

Currently has basic unit tests. To expand test coverage:

```bash
pnpm test                  # Run tests
pnpm test --watch         # Watch mode
```

Tests are located in `*.spec.ts` files alongside source code.

## 📝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 📄 License

This project is part of the Builder.io Fusion Starter template. See individual file headers for specific licensing.

## 🤝 Support

For issues and questions:
- Check existing GitHub issues
- Review the [Fusion Starter documentation](https://www.builder.io/c/docs/projects)
- Examine the code comments and inline documentation

## 🎨 Design Inspiration

- Clean, modern interface with card-based layouts
- Accessible components from Radix UI
- Professional painter marketplace UX
- Mobile-first responsive design
- Smooth animations with Framer Motion

---

**Built with ❤️ on the Fusion Starter by Builder.io**
