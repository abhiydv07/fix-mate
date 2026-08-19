import Link from "next/link";
import { Wrench, ShieldCheck, Clock, MapPin, Search, User, Calendar, Zap } from "lucide-react";
import { SupabaseConnectionStatus } from "@/components/SupabaseConnectionStatus";

export default function Home() {
  const categories = [
    { id: "plumbing", name: "Plumbing", icon: "🚰", desc: "Leaks, pipes, fittings", count: "124 Pro's" },
    { id: "electrical", name: "Electrical", icon: "⚡", desc: "Wiring, fixtures, breaker", count: "98 Pro's" },
    { id: "cleaning", name: "Cleaning", icon: "🧹", desc: "Deep clean, sofa, kitchen", count: "210 Pro's" },
    { id: "appliances", name: "Appliances", icon: "🔌", desc: "AC repair, fridge, washer", count: "85 Pro's" },
    { id: "painting", name: "Painting", icon: "🎨", desc: "Wall touchup, full home", count: "64 Pro's" },
    { id: "carpentry", name: "Carpentry", icon: "🪚", desc: "Furniture, doors, locks", count: "72 Pro's" },
  ];

  return (
    <div className="flex-1 flex flex-col pb-20 md:pb-8">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/60 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Fix Mate
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Home Services Marketplace</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Pay on Work
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 px-4 pt-6 space-y-6">
        {/* Search Bar & Location Banner */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 px-1">
            <MapPin className="w-3.5 h-3.5 text-brand-400" />
            <span>Delivering to: <strong className="text-slate-200">Indiranagar, Bengaluru</strong></span>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search 'AC repair', 'Plumber', 'Sofa cleaning'..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/40 transition-all shadow-inner"
            />
          </div>

          {/* Supabase Server Connection Verification */}
          <SupabaseConnectionStatus />
        </div>

        {/* Feature Highlight Cards */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col items-center text-center space-y-1">
            <ShieldCheck className="w-5 h-5 text-brand-400" />
            <span className="text-[11px] font-semibold text-slate-200">Verified Pros</span>
            <span className="text-[9px] text-slate-400">Background Checked</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col items-center text-center space-y-1">
            <Zap className="w-5 h-5 text-amber-400" />
            <span className="text-[11px] font-semibold text-slate-200">30 Min Arrival</span>
            <span className="text-[9px] text-slate-400">Instant Booking</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col items-center text-center space-y-1">
            <Clock className="w-5 h-5 text-emerald-400" />
            <span className="text-[11px] font-semibold text-slate-200">Pay After Work</span>
            <span className="text-[9px] text-slate-400">Zero Upfront Cash</span>
          </div>
        </div>

        {/* Service Categories Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-100">Popular Services</h2>
            <span className="text-xs text-brand-400 hover:underline cursor-pointer">View all</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="group relative p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/40 hover:bg-slate-900 transition-all cursor-pointer shadow-sm hover:shadow-brand-500/5"
              >
                <div className="flex items-start justify-between">
                  <span className="text-2xl p-2 rounded-xl bg-slate-800/70 border border-slate-700/50 group-hover:scale-110 transition-transform">
                    {cat.icon}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    {cat.count}
                  </span>
                </div>
                <div className="mt-3">
                  <h3 className="text-sm font-semibold text-slate-100 group-hover:text-brand-300 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{cat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Promo / Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-900/40 to-slate-900 border border-brand-500/30 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-brand-400">First Time Special</span>
            <h4 className="text-sm font-bold text-white">Flat ₹150 OFF on first service</h4>
            <p className="text-xs text-slate-400">Use code: <code className="text-amber-300 font-mono font-bold">FIXFIRST150</code></p>
          </div>
          <button className="px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs transition-colors shadow-md shadow-brand-500/30">
            Claim
          </button>
        </div>
      </main>

      {/* Mobile Sticky Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-6 py-2.5 max-w-md mx-auto flex items-center justify-around text-slate-400">
        <Link href="/" className="flex flex-col items-center gap-1 text-brand-400">
          <Wrench className="w-5 h-5" />
          <span className="text-[10px] font-medium">Services</span>
        </Link>
        <Link href="/bookings" className="flex flex-col items-center gap-1 hover:text-slate-200 transition-colors">
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] font-medium">Bookings</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center gap-1 hover:text-slate-200 transition-colors">
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
