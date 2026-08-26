"use client";

import { ShieldCheck, RotateCcw, BadgeCheck, BadgePercent } from "lucide-react";

const guarantees = [
  { icon: ShieldCheck, title: "100% Money Back", desc: "If not satisfied", color: "text-brand-500", bg: "bg-brand-500/10" },
  { icon: RotateCcw, title: "Free Re-service", desc: "Within 30 days", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { icon: BadgeCheck, title: "Verified Pros", desc: "Background checked", color: "text-amber-500", bg: "bg-amber-500/10" },
  { icon: BadgePercent, title: "No Hidden Fees", desc: "Price = Final price", color: "text-rose-500", bg: "bg-rose-500/10" },
];

export function GuaranteesBanner() {
  return (
    <section className="p-4 rounded-2xl bg-gradient-to-r from-brand-50 to-emerald-50 dark:from-brand-500/5 dark:to-emerald-500/5 border border-brand-100 dark:border-brand-500/10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {guarantees.map((g) => (
          <div key={g.title} className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-xl ${g.bg} flex items-center justify-center shrink-0`}>
              <g.icon className={`w-4 h-4 ${g.color}`} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-900 dark:text-white block leading-tight">{g.title}</span>
              <span className="text-[9px] text-slate-500">{g.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
