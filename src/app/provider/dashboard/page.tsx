import Link from "next/link";
import { Briefcase, Calendar, CheckCircle2, Clock, MapPin, Wrench, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProviderDashboardPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between p-4 md:p-8 bg-slate-950 text-slate-100 pb-20 md:pb-8">
      <header className="flex items-center justify-between py-2 border-b border-slate-800/80 mb-6">
        <Link href="/" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200">
          ← Main Site
        </Link>
        <span className="font-bold text-sm text-white">Provider Workspace</span>
        <Link href="/provider/requests">
          <Button size="sm" variant="outline" className="text-xs border-amber-500/40 text-amber-300">
            View Job Broadcasts
          </Button>
        </Link>
      </header>

      <main className="max-w-4xl mx-auto w-full flex-1 space-y-6">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Verified Partner
            </span>
            <h1 className="text-xl font-extrabold text-white">Active Service Jobs</h1>
            <p className="text-xs text-slate-400">Manage your assigned customer bookings and earnings</p>
          </div>
          <div className="text-right px-4 py-2 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400">Rating</span>
            <p className="text-base font-extrabold text-amber-400">4.9 ★</p>
          </div>
        </div>

        <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
          <Briefcase className="w-8 h-8 text-brand-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-200">No active assigned jobs right now</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Check the broadcast queue to accept open service requests in your area.
            </p>
          </div>
          <Link href="/provider/requests">
            <Button size="sm" className="text-xs font-bold px-5">
              Check Job Requests <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
