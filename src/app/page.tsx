"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Clock, MapPin, Zap, Star, ArrowRight, TrendingUp, Gift, ChevronRight, Search, Percent, Wrench } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import dynamic from "next/dynamic";
import { StarRating } from "@/components/StarRating";
import { useI18n } from "@/lib/i18n";

const AiTriageWidget = dynamic(() => import("@/components/AiTriageWidget").then((m) => m.AiTriageWidget), { ssr: false, loading: () => <div className="h-40 rounded-2xl bg-slate-900 animate-pulse" /> });
import { BookingReminder } from "@/components/BookingReminder";

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

export default function Home() {
  const { t } = useI18n();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [sRes, cRes] = await Promise.all([
      supabase.from("services").select("*").order("name"),
      supabase.from("categories").select("*").order("name"),
    ]);
    setServices(sRes.data || []);
    setCategories(cRes.data || []);
  }

  const trendingServices = services.slice(0, 4);
  const filteredServices = searchQuery
    ? services.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="flex-1 flex flex-col pb-20 md:pb-8">
      <main className="flex-1 px-4 md:px-8 pt-6 space-y-6">
        {/* Location Banner */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-brand-400" />
            <span>Delivering to: <strong className="text-slate-200">Indiranagar, Bengaluru</strong></span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Active Service Zone
          </span>
        </div>

        {/* Hero Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="What do you need help with?"
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 shadow-lg"
          />
          {searchQuery && filteredServices.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 max-h-64 overflow-y-auto">
              {filteredServices.slice(0, 5).map((s) => {
                const cat = categories.find((c) => c.id === s.category_id);
                return (
                  <Link
                    key={s.id}
                    href={`/services/${cat?.name?.toLowerCase().replace(/\s+/g, "-") || "general"}/${s.id}`}
                    onClick={() => setSearchQuery("")}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
                      <Wrench className="w-4 h-4 text-brand-400" />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-bold text-white block">{s.name}</span>
                      <span className="text-[10px] text-slate-400">{cat?.name} • ₹{s.base_price}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Feature Highlight Cards */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col items-center text-center space-y-1">
            <ShieldCheck className="w-5 h-5 text-brand-400" />
            <span className="text-[11px] font-semibold text-slate-200">{t("hero.verifiedPros")}</span>
            <span className="text-[9px] text-slate-400">{t("hero.backgroundChecked")}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col items-center text-center space-y-1">
            <Zap className="w-5 h-5 text-amber-400" />
            <span className="text-[11px] font-semibold text-slate-200">{t("hero.arrival")}</span>
            <span className="text-[9px] text-slate-400">{t("hero.instantBooking")}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col items-center text-center space-y-1">
            <Clock className="w-5 h-5 text-emerald-400" />
            <span className="text-[11px] font-semibold text-slate-200">{t("hero.payAfter")}</span>
            <span className="text-[9px] text-slate-400">{t("hero.zeroUpfront")}</span>
          </div>
        </div>

        {/* Booking Reminders */}
        <BookingReminder />

        {/* Emergency Booking Banner */}
        <Link href="/services" className="block p-4 rounded-2xl bg-gradient-to-r from-rose-900/20 to-slate-900 border border-rose-500/20 hover:border-rose-500/30 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-rose-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-white">Need Urgent Help?</h4>
              <p className="text-[10px] text-slate-400">Get a professional at your doorstep in 30 minutes</p>
            </div>
            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
              Emergency →
            </span>
          </div>
        </Link>

        {/* AI Triage Widget */}
        <AiTriageWidget />

        {/* Category Quick Links - Urban Company Style */}
        {categories.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-white">Browse by Category</h2>
              <Link href="/services" className="text-[10px] text-brand-400 font-semibold hover:underline flex items-center gap-0.5">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/services/${cat.name.toLowerCase().replace(/\s+/g, "-")}`}
                  className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-brand-500/30 hover:bg-slate-800 transition-all flex flex-col items-center text-center space-y-1.5 group"
                >
                  <span className="text-2xl">{cat.icon || "🔧"}</span>
                  <span className="text-[10px] font-bold text-slate-300 group-hover:text-white transition-colors">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Offers & Coupons Banner - Urban Company Style */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-extrabold text-white">Offers for You</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            <div className="shrink-0 w-64 p-4 rounded-2xl bg-gradient-to-br from-brand-900/40 to-slate-900 border border-brand-500/30 space-y-2">
              <div className="flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-brand-400" />
                <span className="text-[10px] font-bold text-brand-400">FIRST TIME</span>
              </div>
              <h4 className="text-sm font-bold text-white">Flat ₹150 OFF</h4>
              <p className="text-[10px] text-slate-400">On your first service booking</p>
              <div className="flex items-center justify-between">
                <code className="text-[11px] font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded">FIXFIRST150</code>
                <button className="text-[10px] font-bold text-brand-400 hover:underline">Claim →</button>
              </div>
            </div>
            <div className="shrink-0 w-64 p-4 rounded-2xl bg-gradient-to-br from-emerald-900/30 to-slate-900 border border-emerald-500/20 space-y-2">
              <div className="flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400">REFER & EARN</span>
              </div>
              <h4 className="text-sm font-bold text-white">Invite Friends, Get ₹100</h4>
              <p className="text-[10px] text-slate-400">Both you and your friend get ₹100 credit</p>
              <button className="text-[10px] font-bold text-emerald-400 hover:underline">Share Link →</button>
            </div>
            <div className="shrink-0 w-64 p-4 rounded-2xl bg-gradient-to-br from-amber-900/30 to-slate-900 border border-amber-500/20 space-y-2">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] font-bold text-amber-400">WEEKEND DEAL</span>
              </div>
              <h4 className="text-sm font-bold text-white">20% OFF Cleaning</h4>
              <p className="text-[10px] text-slate-400">Valid on Sat & Sun only</p>
              <code className="text-[11px] font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded inline-block">CLEAN20</code>
            </div>
          </div>
        </div>

        {/* Trending Services - Urban Company Style */}
        {trendingServices.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-extrabold text-white">Trending Services</h2>
              </div>
              <Link href="/services" className="text-[10px] text-brand-400 font-semibold hover:underline flex items-center gap-0.5">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {trendingServices.map((s) => {
                const cat = categories.find((c) => c.id === s.category_id);
                return (
                  <Link
                    key={s.id}
                    href={`/services/${cat?.name?.toLowerCase().replace(/\s+/g, "-") || "general"}/${s.id}`}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-brand-500/30 transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-brand-400 uppercase">{cat?.name || "Service"}</span>
                      <StarRating rating={4.5} size="sm" showNumber={false} />
                    </div>
                    <h3 className="text-xs font-bold text-white group-hover:text-brand-400 transition-colors">{s.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">⏱ {s.est_duration_min || 45} min</span>
                      <span className="text-sm font-black text-emerald-400">₹{s.base_price}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Why Fix Mate - Trust Section */}
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold text-white text-center">Why Customers Trust Fix Mate</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: ShieldCheck, title: "Verified Professionals", desc: "Background checked & certified", color: "text-brand-400" },
              { icon: Clock, title: "Quick Response", desc: "30 min average arrival time", color: "text-amber-400" },
              { icon: Star, title: "Quality Guaranteed", desc: "30-day service warranty", color: "text-emerald-400" },
              { icon: Zap, title: "Transparent Pricing", desc: "No hidden charges ever", color: "text-rose-400" },
            ].map((item) => (
              <div key={item.title} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <item.icon className={`w-5 h-5 ${item.color}`} />
                <h4 className="text-[11px] font-bold text-white">{item.title}</h4>
                <p className="text-[9px] text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="space-y-4">
          <h2 className="text-sm font-extrabold text-white text-center">How It Works</h2>
          <div className="flex items-start gap-3">
            {[
              { step: "1", title: "Choose Service", desc: "Browse categories or search for what you need" },
              { step: "2", title: "Pick Time & Address", desc: "Select a convenient date, time, and location" },
              { step: "3", title: "Get a Pro", desc: "A verified professional is assigned instantly" },
              { step: "4", title: "Pay After Work", desc: "Cash or UPI after service completion" },
            ].map((item, idx) => (
              <div key={idx} className="flex-1 text-center space-y-2 relative">
                <div className="w-8 h-8 rounded-full bg-brand-500 text-white font-bold text-sm flex items-center justify-center mx-auto shadow-lg shadow-brand-500/20">
                  {item.step}
                </div>
                <h4 className="text-[11px] font-bold text-white">{item.title}</h4>
                <p className="text-[9px] text-slate-400 leading-relaxed">{item.desc}</p>
                {idx < 3 && <div className="absolute top-4 left-[60%] w-[80%] h-px bg-slate-800" />}
              </div>
            ))}
          </div>
        </div>

        {/* Service Catalog */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-white">All Services</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {services.map((s) => {
              const cat = categories.find((c) => c.id === s.category_id);
              return (
                <Link
                  key={s.id}
                  href={`/services/${cat?.name?.toLowerCase().replace(/\s+/g, "-") || "general"}/${s.id}`}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-brand-500/30 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-bold text-brand-400 uppercase">{cat?.name || "Service"}</span>
                    <span className="text-sm font-black text-emerald-400">₹{s.base_price}</span>
                  </div>
                  <h3 className="text-xs font-bold text-white group-hover:text-brand-400 transition-colors">{s.name}</h3>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{s.description}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Download App Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-900/40 to-slate-900 border border-brand-500/20 text-center space-y-2">
          <h3 className="text-sm font-extrabold text-white">Get the Fix Mate App</h3>
          <p className="text-[11px] text-slate-400">Book services faster, track orders in real-time, and get exclusive app-only offers</p>
          <div className="flex items-center justify-center gap-2">
            <button className="px-4 py-2 rounded-xl bg-white text-black text-[10px] font-bold">📱 App Store</button>
            <button className="px-4 py-2 rounded-xl bg-white text-black text-[10px] font-bold">▶️ Play Store</button>
          </div>
        </div>
      </main>
    </div>
  );
}


