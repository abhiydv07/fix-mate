"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, X, Check, Star, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Service {
  id: string;
  name: string;
  description: string;
  base_price: number;
  est_duration_min: number | null;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

export default function ServiceComparePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const [sRes, cRes] = await Promise.all([
        supabase.from("services").select("*").order("name"),
        supabase.from("categories").select("*").order("name"),
      ]);
      setServices(sRes.data || []);
      setCategories(cRes.data || []);
    }
    load();
  }, []);

  const compared = services.filter((s) => selectedIds.includes(s.id));

  function toggleCompare(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 bg-slate-950 text-slate-100 pb-20 md:pb-8">
      <header className="flex items-center justify-between py-2 border-b border-slate-800/80 mb-6">
        <Link href="/services" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200">
          <ArrowLeft className="w-4 h-4" /> Services
        </Link>
        <span className="font-bold text-sm text-white">Compare Services</span>
        <span className="text-[10px] font-bold text-brand-400">{selectedIds.length}/3 selected</span>
      </header>

      <main className="max-w-4xl mx-auto w-full flex-1 space-y-6">
        {/* Comparison Table */}
        {compared.length >= 2 && (
          <div className="overflow-x-auto">
            <div className="min-w-[500px] rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
              <div className={`grid grid-cols-${compared.length} divide-x divide-slate-800`}>
                {compared.map((s) => {
                  const cat = categories.find((c) => c.id === s.category_id);
                  return (
                    <div key={s.id} className="p-4 space-y-3 text-center">
                      <button onClick={() => toggleCompare(s.id)} className="absolute top-2 right-2 text-slate-500 hover:text-rose-400">
                        <X className="w-3 h-3" />
                      </button>
                      <span className="text-lg">{cat?.icon || "🔧"}</span>
                      <h4 className="text-xs font-bold text-white">{s.name}</h4>
                      <span className="text-[9px] text-slate-400">{cat?.name}</span>
                      <div className="text-lg font-black text-emerald-400">₹{s.base_price}</div>
                      <div className="space-y-2 text-[10px]">
                        <div className="flex items-center justify-center gap-1 text-slate-300">
                          <Clock className="w-3 h-3 text-brand-400" /> {s.est_duration_min || 45} min
                        </div>
                        <div className="flex items-center justify-center gap-1 text-slate-300">
                          <Star className="w-3 h-3 text-amber-400" /> 4.5+ rating
                        </div>
                        <div className="flex items-center justify-center gap-1 text-emerald-400">
                          <Check className="w-3 h-3" /> 30-day warranty
                        </div>
                        <div className="flex items-center justify-center gap-1 text-emerald-400">
                          <Check className="w-3 h-3" /> Pay after work
                        </div>
                      </div>
                      <Link href={`/services/general/${s.id}`}
                        className="block py-2 rounded-xl bg-brand-500 text-white text-[10px] font-bold">
                        Book Now
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {compared.length < 2 && (
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
            <Plus className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs font-bold text-slate-300">Select at least 2 services to compare</p>
            <p className="text-[10px] text-slate-500">You can select up to 3 services for side-by-side comparison</p>
          </div>
        )}

        {/* Service Selection Grid */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1">Select Services to Compare</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {services.map((s) => {
              const isSelected = selectedIds.includes(s.id);
              const cat = categories.find((c) => c.id === s.category_id);
              return (
                <button key={s.id} onClick={() => toggleCompare(s.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected ? "bg-brand-500/10 border-brand-500/30" : "bg-slate-900 border-slate-800 hover:border-slate-700"
                  }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-bold text-brand-400">{cat?.name}</span>
                    {isSelected && <span className="text-[9px] font-bold text-brand-400 bg-brand-500/20 px-1.5 py-0.5 rounded">#{selectedIds.indexOf(s.id) + 1}</span>}
                  </div>
                  <h4 className="text-[11px] font-bold text-white">{s.name}</h4>
                  <span className="text-xs font-black text-emerald-400">₹{s.base_price}</span>
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
