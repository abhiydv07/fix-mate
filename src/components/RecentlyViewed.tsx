"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History, ArrowUpRight, Wrench } from "lucide-react";

interface ViewedService {
  id: string;
  name: string;
  category: string;
  price: number;
}

export function RecentlyViewed() {
  const [viewed, setViewed] = useState<ViewedService[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("fixmate-recently-viewed");
      if (stored) {
        setViewed(JSON.parse(stored));
      }
    } catch {}
  }, []);

  if (viewed.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <History className="w-4 h-4 text-slate-400" />
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Recently Viewed</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
        {viewed.map((s) => (
          <Link
            key={s.id}
            href={`/services/${s.category.toLowerCase().replace(/\s+/g, "-")}/${s.id}`}
            className="shrink-0 flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
              <Wrench className="w-4 h-4 text-brand-500" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-500">{s.category}</span>
              <h4 className="text-[11px] font-bold text-slate-900 dark:text-white truncate">{s.name}</h4>
              <span className="text-[10px] font-bold text-emerald-500">₹{s.price}</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-brand-500 shrink-0" />
          </Link>
        ))}
      </div>
    </section>
  );
}
