"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

interface Service {
  id: string;
  name: string;
  base_price: number;
  category_id: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [cRes, sRes] = await Promise.all([
      supabase.from("categories").select("*").order("name"),
      supabase.from("services").select("id, name, base_price, category_id"),
    ]);
    setCategories(cRes.data || []);
    setServices(sRes.data || []);
    setIsLoading(false);
  }

  function getServiceCount(catId: string) {
    return services.filter((s) => s.category_id === catId).length;
  }

  function getMinPrice(catId: string) {
    const catServices = services.filter((s) => s.category_id === catId);
    return catServices.length > 0 ? Math.min(...catServices.map((s) => s.base_price)) : 0;
  }

  const filtered = searchQuery
    ? categories.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : categories;

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 bg-slate-950 text-slate-100 pb-20 md:pb-8">
      <header className="flex items-center justify-between py-2 border-b border-slate-800/80 mb-6">
        <Link href="/" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
        <span className="font-bold text-sm text-white">All Categories</span>
        <div />
      </header>

      <main className="max-w-4xl mx-auto w-full flex-1 space-y-5">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Popular Services Quick Links */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1">Popular Right Now</h3>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {services.slice(0, 6).map((s) => {
              const cat = categories.find((c) => c.id === s.category_id);
              return (
                <Link
                  key={s.id}
                  href={`/services/${cat?.name?.toLowerCase().replace(/\s+/g, "-") || "general"}/${s.id}`}
                  className="shrink-0 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-brand-500/30 transition-all"
                >
                  <span className="text-[10px] font-bold text-white whitespace-nowrap">{s.name}</span>
                  <span className="text-[9px] text-slate-400 block">From ₹{s.base_price}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-slate-900 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map((cat) => (
              <Link
                key={cat.id}
                href={`/services/${cat.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-brand-500/30 hover:shadow-lg hover:shadow-brand-500/5 transition-all space-y-3 group"
              >
                <span className="text-3xl block">{cat.icon || "🔧"}</span>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors">{cat.name}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {getServiceCount(cat.id)} services • From ₹{getMinPrice(cat.id)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Service Guarantees */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 grid grid-cols-2 gap-3">
          {[
            { icon: "🛡️", title: "Verified Pros", desc: "Background checked" },
            { icon: "⚡", title: "30 Min Arrival", desc: "Quick response" },
            { icon: "💰", title: "Pay After Work", desc: "Zero upfront" },
            { icon: "🔄", title: "30-Day Guarantee", desc: "Free re-service" },
          ].map((g) => (
            <div key={g.title} className="flex items-center gap-2">
              <span className="text-lg">{g.icon}</span>
              <div>
                <span className="text-[10px] font-bold text-white block">{g.title}</span>
                <span className="text-[9px] text-slate-400">{g.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
