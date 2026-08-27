"use client";

import { Star, Award, Clock, MapPin, ChevronRight } from "lucide-react";
import Link from "next/link";

export function FeaturedPro() {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Award className="w-4 h-4 text-amber-500" />
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Pro of the Day</h2>
      </div>

      <Link href="/provider/dashboard" className="block group">
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-white dark:from-amber-500/10 dark:to-slate-900 border border-amber-200 dark:border-amber-500/20 hover:shadow-xl transition-all">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-lg font-black shadow-lg shadow-amber-500/20 shrink-0">
              RK
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Rajesh Kumar</h3>
                <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <Award className="w-2.5 h-2.5" /> TOP RATED
                </span>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                ))}
                <span className="text-[10px] font-bold text-slate-500 ml-1">4.9 (312 reviews)</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" /> Sector 62, Noida</span>
                <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> 8 yrs exp</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] font-bold text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded-full">Plumbing</span>
                <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">1,200+ Jobs</span>
                <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">99% On-time</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-brand-500 transition-colors shrink-0 mt-2" />
          </div>
        </div>
      </Link>
    </section>
  );
}
