"use client";

import { Check, Crown, Sparkles } from "lucide-react";
import Link from "next/link";

const packages = [
  {
    name: "Basic",
    price: "₹299",
    tagline: "Standard service",
    features: ["Verified professional", "30-day warranty", "Pay after work"],
    color: "border-slate-200 dark:border-slate-700",
    bg: "bg-white dark:bg-slate-900",
    badge: null,
  },
  {
    name: "Standard",
    price: "₹599",
    tagline: "Most popular",
    features: ["Everything in Basic", "Express 30-min arrival", "Photo report", "Priority support"],
    color: "border-brand-300 dark:border-brand-500/40",
    bg: "bg-brand-50 dark:bg-brand-500/5",
    badge: "POPULAR",
  },
  {
    name: "Premium",
    price: "₹999",
    tagline: "Complete care",
    features: ["Everything in Standard", "15-min express arrival", "Free re-service", "Extended 90-day warranty"],
    color: "border-amber-300 dark:border-amber-500/40",
    bg: "bg-amber-50 dark:bg-amber-500/5",
    badge: "BEST VALUE",
  },
];

export function ServicePackagesPreview() {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Service Packages</h2>
        </div>
        <Link href="/account/plans" className="text-xs text-brand-500 dark:text-brand-400 font-semibold hover:underline">
          View All Plans →
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {packages.map((pkg) => (
          <div key={pkg.name} className={`relative p-4 rounded-2xl ${pkg.bg} border ${pkg.color} space-y-3`}>
            {pkg.badge && (
              <span className="absolute -top-2 left-3 text-[8px] font-black text-white bg-brand-500 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <Crown className="w-2.5 h-2.5" /> {pkg.badge}
              </span>
            )}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{pkg.name}</h3>
              <p className="text-[10px] text-slate-500">{pkg.tagline}</p>
            </div>
            <div>
              <span className="text-xl font-black text-slate-900 dark:text-white">{pkg.price}</span>
              <span className="text-[9px] text-slate-400">/service</span>
            </div>
            <ul className="space-y-1.5">
              {pkg.features.map((f) => (
                <li key={f} className="flex items-start gap-1.5 text-[10px] text-slate-600 dark:text-slate-400">
                  <Check className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
