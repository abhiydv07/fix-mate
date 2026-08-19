PROJECT: Fix Mate — home services booking marketplace
STACK: Next.js 14 App Router, TypeScript strict, Tailwind, shadcn/ui, Supabase (Postgres+Auth+Storage+Realtime), Leaflet+OpenStreetMap, payment=cash offline
RULES:
- TypeScript strict, no `any`
- Every Supabase table: RLS on, explicit policies, deny by default
- Validate all input server-side w/ zod — never trust client
- Never put SUPABASE_SERVICE_ROLE_KEY or GEMINI_API_KEY in client code
- Mobile-first, test 375px width
- Small commits, clear messages
