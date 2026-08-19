import { ShieldCheck, Clock, MapPin, Zap } from "lucide-react";
import { SupabaseConnectionStatus } from "@/components/SupabaseConnectionStatus";
import { ServiceCatalog } from "@/components/ServiceCatalog";
import { HowItWorks } from "@/components/HowItWorks";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col pb-20 md:pb-8">
      {/* Hero Section */}
      <main className="flex-1 px-4 md:px-8 pt-6 space-y-6">
        {/* Location Banner */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-brand-400" />
            <span>Delivering to: <strong className="text-slate-200">Indiranagar, Bengaluru</strong></span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Active Service Zone
          </span>
        </div>

        {/* Supabase Connection Status Badge */}
        <SupabaseConnectionStatus />

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

        {/* Interactive Dynamic Service Catalog */}
        <ServiceCatalog />

        {/* How It Works Section */}
        <HowItWorks />

        {/* First Time Promo Banner */}
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
    </div>
  );
}
