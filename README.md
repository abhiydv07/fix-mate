# Fix Mate — On-Demand Home Services Booking Marketplace

Fix Mate is a modern, high-performance home services marketplace app built with **Next.js 14 App Router**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

## 🛠️ Stack Overview
- **Frontend**: Next.js 14 (App Router), TypeScript (Strict), Tailwind CSS, shadcn/ui base
- **Backend & Database**: Supabase (Postgres, Row Level Security, Auth, Realtime, Storage)
- **Map & Geolocation**: Leaflet + OpenStreetMap (100% Free, zero API key)
- **Payment Method**: Pay on Work (Cash/UPI upon service completion)
- **AI Triage**: Gemini API (Optional)

## 📁 Repository Structure
```
├── src/
│   ├── app/              # Next.js App Router pages & layouts
│   ├── components/       # UI components & design system
│   │   └── ui/           # Custom reusable UI controls (Button, Inputs, Cards)
│   ├── lib/              # Client utilities & Supabase clients (SSR & Browser)
│   └── types/            # TypeScript interfaces & Supabase DB types
├── supabase/
│   └── migrations/       # SQL migration scripts & RLS security policies
├── .agents/
│   └── rules/            # Antigravity project rules & guidelines
├── .env.example          # Environment variable template
```

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local` and add your Supabase credentials:
   ```bash
   cp .env.example .env.local
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛡️ Security Baseline
- **Row Level Security (RLS)** enabled on all Postgres tables.
- **Server Validation**: All mutation payloads validated with Zod.
- **Strict TypeScript**: `noImplicitAny` enabled, zero `any` usage.
