"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search, SlidersHorizontal, Star, X, Wrench, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { StarRating } from "@/components/StarRating";
import { FALLBACK_CATEGORIES, FALLBACK_SERVICES } from "@/lib/services";

interface Service {
  id: string;
  name: string;
  description: string;
  base_price: number;
  category_id: string;
  est_duration_min: number | null;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"price_low" | "price_high" | "name">("name");
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [servicesRes, categoriesRes] = await Promise.all([
      supabase.from("services").select("*").order("name"),
      supabase.from("categories").select("*").order("name"),
    ]);
    setServices(servicesRes.data && servicesRes.data.length > 0 ? servicesRes.data : FALLBACK_SERVICES);
    setCategories(categoriesRes.data && categoriesRes.data.length > 0 ? categoriesRes.data : FALLBACK_CATEGORIES);
    setIsLoading(false);
  }

  let filtered = services;
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (s) => s.name.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)
    );
  }
  if (selectedCategory !== "all") {
    filtered = filtered.filter((s) => s.category_id === selectedCategory);
  }
  if (sortBy === "price_low") filtered = [...filtered].sort((a, b) => a.base_price - b.base_price);
  if (sortBy === "price_high") filtered = [...filtered].sort((a, b) => b.base_price - a.base_price);
  if (sortBy === "name") filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 md:p-8 bg-slate-950 text-slate-100 pb-20 md:pb-8">
      <header className="flex items-center justify-between py-2 border-b border-slate-800/80 mb-6">
        <Link href="/" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
        <span className="font-bold text-sm text-white">All Services</span>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Pay on Work
        </span>
      </header>

      <main className="max-w-4xl mx-auto w-full flex-1 space-y-5">
        <div className="space-y-1">
          <h1 className="text-xl font-extrabold text-white">Explore Home Services</h1>
          <p className="text-xs text-slate-400">Find verified professionals for all your home needs</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search services — e.g. 'AC repair', 'Plumbing'..."
            className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-800 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`shrink-0 px-4 py-2 rounded-xl text-[11px] font-bold transition-all ${
              selectedCategory === "all"
                ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700"
            }`}
          >
            All Services
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 px-4 py-2 rounded-xl text-[11px] font-bold transition-all ${
                selectedCategory === cat.id
                  ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700"
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Sort & Results Count */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400">{filtered.length} services found</span>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[10px] text-slate-300 focus:outline-none"
            >
              <option value="name">Sort: Name</option>
              <option value="price_low">Price: Low → High</option>
              <option value="price_high">Price: High → Low</option>
            </select>
          </div>
        </div>

        {/* Service Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-slate-900 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <Wrench className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">No services found</p>
            <button onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }} className="text-xs text-brand-400 hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((service) => {
              const cat = categories.find((c) => c.id === service.category_id);
              return (
                <Link
                  key={service.id}
                  href={`/services/${cat?.name?.toLowerCase().replace(/\s+/g, "-") || "general"}/${service.id}`}
                  className="group p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-brand-500/30 hover:shadow-lg hover:shadow-brand-500/5 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-brand-400">{cat?.name || "Service"}</span>
                      <h3 className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors">{service.name}</h3>
                    </div>
                    <span className="text-lg font-black text-emerald-400">₹{service.base_price}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{service.description}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      ⏱ {service.est_duration_min || 45} min
                    </span>
                    <span className="text-[10px] text-brand-400 font-semibold group-hover:translate-x-1 transition-transform">
                      Book Now →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
