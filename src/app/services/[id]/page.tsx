import Link from "next/link";
import { ArrowLeft, Clock, ShieldCheck, CheckCircle2, Wrench, Calendar, MapPin, Zap } from "lucide-react";
import { fetchServices } from "@/lib/services";
import { Button } from "@/components/ui/button";

export default async function ServiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const allServices = await fetchServices();
  const service = allServices.find((s) => s.id === params.id) || allServices[0];

  const includesList = [
    "Certified & background-verified professional",
    "Pre-service inspection & transparent pricing",
    "Post-service cleaning & hygiene check",
    "30-Day Fix Mate Service Guarantee",
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 md:p-8 bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="flex items-center justify-between py-2 border-b border-slate-800/80">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Services
        </Link>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Pay on Work
        </span>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto w-full my-6 space-y-6">
        {/* Title Banner */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">
                Service Overview
              </span>
              <h1 className="text-xl font-extrabold text-white mt-0.5">{service.name}</h1>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-400">₹{service.base_price}</span>
              <p className="text-[10px] text-slate-400">Fixed Base Price</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">{service.description}</p>

          <div className="flex items-center gap-4 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-brand-400" />
              Est. {service.est_duration_min || 45} Minutes
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" /> 30-Day Guarantee
            </span>
          </div>
        </div>

        {/* What's Included Checklist */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            What&apos;s Included
          </h3>
          <ul className="space-y-2.5">
            {includesList.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Payment Policy Card */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
          <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-amber-300">Zero Upfront Payment Required</h4>
            <p className="text-[11px] text-slate-400">
              Pay cash or UPI directly to your service professional only after the work is completed and verified.
            </p>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Booking Bar */}
      <div className="sticky bottom-0 z-40 p-4 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 max-w-xl mx-auto w-full flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400">Total payable</span>
          <p className="text-lg font-black text-white">₹{service.base_price}</p>
        </div>

        <Link href={`/login?redirectTo=/bookings`}>
          <Button className="px-6 py-3 text-xs font-bold shadow-lg shadow-brand-500/20 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Book Professional Now
          </Button>
        </Link>
      </div>
    </div>
  );
}
