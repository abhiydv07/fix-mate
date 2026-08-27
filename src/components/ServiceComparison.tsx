"use client";

import { useState } from "react";
import { Check, X, ArrowRight, BarChart3 } from "lucide-react";
import Link from "next/link";

interface ServiceItem {
  id: string;
  name: string;
  base_price: number;
  est_duration_min: number;
  category_name: string;
}

interface ServiceComparisonProps {
  services: ServiceItem[];
}

export function ServiceComparison({ services }: ServiceComparisonProps) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  }

  const compared = services.filter((s) => selected.includes(s.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-brand-500" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Compare Services</h3>
        <span className="text-[10px] text-slate-400">{selected.length}/3 selected</span>
      </div>

      {/* Service selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {services.map((s) => (
          <button
            key={s.id}
            onClick={() => toggle(s.id)}
            className={`shrink-0 px-3 py-2 rounded-xl text-[10px] font-bold border transition-all ${
              selected.includes(s.id)
                ? "bg-brand-500 text-white border-brand-500"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Comparison table */}
      {compared.length >= 2 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="p-3 text-left font-bold text-slate-500">Feature</th>
                {compared.map((s) => (
                  <th key={s.id} className="p-3 text-center font-bold text-slate-900 dark:text-white">{s.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="p-3 text-slate-500">Price</td>
                {compared.map((s) => (
                  <td key={s.id} className="p-3 text-center font-bold text-emerald-600 dark:text-emerald-400">₹{s.base_price}</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 text-slate-500">Duration</td>
                {compared.map((s) => (
                  <td key={s.id} className="p-3 text-center text-slate-700 dark:text-slate-200">{s.est_duration_min || 45} min</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 text-slate-500">Category</td>
                {compared.map((s) => (
                  <td key={s.id} className="p-3 text-center text-slate-700 dark:text-slate-200">{s.category_name}</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 text-slate-500">Pay on Work</td>
                {compared.map(() => (
                  <td key={Math.random()} className="p-3 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                ))}
              </tr>
              <tr>
                <td className="p-3 text-slate-500">Warranty</td>
                {compared.map(() => (
                  <td key={Math.random()} className="p-3 text-center"><Check className="w-4 h-4 text-emerald-500 mx-auto" /></td>
                ))}
              </tr>
            </tbody>
          </table>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/30">
            <div className="flex gap-2">
              {compared.map((s) => (
                <Link
                  key={s.id}
                  href={`/services`}
                  className="flex-1 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-[10px] font-bold text-center transition-colors"
                >
                  Book {s.name.split(" ")[0]} →
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
