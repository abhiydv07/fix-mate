# Fix Mate — On-Demand Home Services Booking Marketplace

Fix Mate is a modern, high-performance home services marketplace app built with **Next.js 14 App Router**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

## 🛠️ Stack Overview

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), TypeScript (Strict), Tailwind CSS, Recharts |
| **Backend & Database** | Supabase (Postgres, Row Level Security, Auth, Realtime, Storage) |
| **Map & Geolocation** | Leaflet + OpenStreetMap (zero API key) |
| **AI Triage** | Gemini API (optional) |
| **Email** | Resend (optional) |
| **Payment Model** | Pay on Work — Cash/UPI upon service completion |

## 📁 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Fix Mate (Next.js 14)                    │
├──────────┬──────────────────────────────────────────────────────┤
│          │  ┌─────────────┐  ┌──────────┐  ┌────────────────┐  │
│  Pages   │  │  Customer   │  │ Provider │  │     Admin      │  │
│  (RSC +  │  │  • Home     │  │ • Dash   │  │ • Dashboard    │  │
│  Client) │  │  • Services │  │ • Jobs   │  │ • KYC Approve  │  │
│          │  │  • Book     │  │ • Accept │  │ • Categories   │  │
│          │  │  • Track    │  │ • GPS    │  │ • Services     │  │
│          │  │  • Chat     │  │          │  │ • Disputes     │  │
│          │  │  • Profile  │  │          │  │ • Analytics    │  │
│          │  └──────┬──────┘  └────┬─────┘  └───────┬────────┘  │
├──────────┼─────────┼──────────────┼────────────────┼────────────┤
│  API     │  /api/bookings  /api/payments/confirm  /api/chat    │
│  Routes  │  /api/disputes  /api/admin/*           /api/ai/*    │
├──────────┼──────────────────────────────────────────────────────┤
│  Auth    │  Supabase Auth (Email/Password + Google OAuth)       │
├──────────┼──────────────────────────────────────────────────────┤
│  DB      │  Supabase Postgres + RLS + Realtime Subscriptions   │
│          │  Tables: profiles, bookings, services, categories,   │
│          │  addresses, payments, reviews, chat_messages,        │
│          │  notifications, provider_profiles, provider_locations│
│          │  coupons, disputes                                   │
├──────────┼──────────────────────────────────────────────────────┤
│  Storage │  Supabase Storage (kyc-docs bucket, private RLS)    │
└──────────┴──────────────────────────────────────────────────────┘
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
```bash
cp .env.example .env.local
```
Add your Supabase credentials to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional
GEMINI_API_KEY=your-gemini-key
RESEND_API_KEY=your-resend-key
```

### 3. Run Database Migrations
In Supabase SQL Editor, run all files in `supabase/migrations/` in order.

### 4. Seed Data
```bash
npm run seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## 🧪 Testing

```bash
npm run test       # Run all tests
npm run test:watch # Watch mode
```

## 📋 Feature List

### Customer
- [x] Browse service catalog with search & category filter
- [x] AI-powered service triage (describe problem → get category)
- [x] 4-step booking wizard (schedule → address → notes → review)
- [x] Nominatim address search + Leaflet map pin placement
- [x] Real-time order tracking with provider GPS location
- [x] In-booking live chat with service professional
- [x] Cash/UPI payment confirmation with dual verification
- [x] Post-service review & rating
- [x] Tax invoice generation
- [x] Dispute flagging for service issues
- [x] Profile management with saved addresses
- [x] Push notifications via Supabase Realtime

### Provider
- [x] Dashboard with active job overview
- [x] Job broadcast queue (first-come-first-serve accept)
- [x] Job lifecycle: assigned → on_the_way → in_progress → completed
- [x] 30-second GPS location broadcasting during travel
- [x] Cash collection confirmation
- [x] KYC document upload to private Supabase Storage

### Admin
- [x] Analytics dashboard (recharts): bookings/day, revenue, top services, provider stats
- [x] Provider KYC approval/rejection
- [x] Service category CRUD
- [x] Service catalog CRUD
- [x] Dispute resolution with price adjustment
- [x] Role-based route protection (middleware + server-side checks)

### Platform
- [x] Supabase RLS on all 13 tables
- [x] Zod validation on all API inputs
- [x] Security headers (CSP, X-Frame-Options, X-Content-Type-Options)
- [x] Rate limiting on AI endpoint (10 req/min/IP)
- [x] PWA manifest + offline fallback
- [x] i18n (English / Hindi toggle)
- [x] Dark mode (Tailwind class-based)
- [x] Mobile-first responsive design (375px tested)
- [x] Loading skeletons + error boundaries

## 🏗️ Database Schema

13 tables with full RLS policies:

| Table | Purpose |
|-------|---------|
| `profiles` | User accounts (customer/provider/admin) |
| `categories` | Service categories |
| `services` | Individual service listings |
| `provider_profiles` | KYC, ratings, availability |
| `provider_services` | Provider ↔ service junction |
| `addresses` | Customer saved addresses |
| `bookings` | Service bookings with status tracking |
| `payments` | Cash/UPI payment confirmations |
| `reviews` | Customer ratings & feedback |
| `chat_messages` | Per-booking live chat |
| `notifications` | In-app notification feed |
| `coupons` | Promo code management |
| `disputes` | Service issue flagging |
| `provider_locations` | Real-time GPS coordinates |

## 🔒 Security

- **RLS**: Every table has explicit policies; deny by default
- **Auth**: Supabase Auth with email/password + Google OAuth
- **Server validation**: All API routes validate with Zod
- **Admin checks**: Server-side role verification on every admin endpoint
- **Storage**: Private KYC documents with owner-upload, admin-only read
- **Headers**: CSP, X-Frame-Options DENY, X-Content-Type-Options nosniff
- **Service role key**: Never exposed to client bundles

## 📱 i18n

Toggle between English and Hindi via the globe icon in the header. Language preference persists in a cookie.

## 🎮 Demo Script (5 min)

1. **Customer signup** → Go to `/login` → Enter email + password → Auto-signup
2. **Browse services** → See catalog, search "AC repair" → Click a service
3. **Book service** → Pick date/time → Select address → Add notes → Confirm
4. **Provider login** → Open incognito → `/login` → Sign up as Service Pro
5. **Accept job** → Go to `/provider/requests` → Click "Accept Job"
6. **Start travel** → Go to `/provider/jobs` → Click "Start Travel"
7. **Customer tracks** → Back in customer tab → See live GPS on order page
8. **Complete work** → Provider: Mark completed → Collect ₹ Cash
9. **Confirm payment** → Customer: Confirm paid → Provider: Confirm collected
10. **Rate** → Customer: 5 stars + review → See on profile

## 📄 License

Private — Fix Mate Inc. 2026
