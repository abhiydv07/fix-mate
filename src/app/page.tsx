"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShieldCheck, Clock, MapPin, Zap, Star, ArrowRight, TrendingUp,
  Gift, ChevronRight, Search, Percent, Wrench, Phone, MessageCircle,
  Share2, Copy, CheckCheck, Sparkles, Users, Award, Headphones,
  CalendarCheck, CreditCard, ChevronDown, ArrowUpRight
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import dynamic from "next/dynamic";
import { StarRating } from "@/components/StarRating";
import { useI18n } from "@/lib/i18n";
import { CitySelector } from "@/components/CitySelector";
import { FALLBACK_CATEGORIES, FALLBACK_SERVICES } from "@/lib/services";

const AiTriageWidget = dynamic(
  () => import("@/components/AiTriageWidget").then((m) => m.AiTriageWidget),
  { ssr: false, loading: () => <div className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-900 animate-pulse" /> }
);
import { BookingReminder } from "@/components/BookingReminder";
import { AnimatedStats } from "@/components/AnimatedStats";
import { TestimonialsCarousel } from "@/components/TestimonialsCarousel";
import { BeforeAfterGallery } from "@/components/BeforeAfterGallery";
import { NotificationTicker } from "@/components/NotificationTicker";
import { GuaranteesBanner } from "@/components/GuaranteesBanner";
import { ServicePackagesPreview } from "@/components/ServicePackagesPreview";
import { FeaturedPro } from "@/components/FeaturedPro";
import { BlogArticles } from "@/components/BlogArticles";
import { AppDownloadCTA } from "@/components/AppDownloadCTA";
import { RecentlyViewed } from "@/components/RecentlyViewed";

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

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  plumbing: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20" },
  electrical: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20" },
  cleaning: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20" },
  appliance: { bg: "bg-rose-500/10", text: "text-rose-500", border: "border-rose-500/20" },
  painting: { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/20" },
  carpentry: { bg: "bg-orange-500/10", text: "text-orange-500", border: "border-orange-500/20" },
};

function getCategoryColor(name: string) {
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(categoryColors)) {
    if (key.includes(k)) return v;
  }
  return { bg: "bg-brand-500/10", text: "text-brand-500", border: "border-brand-500/20" };
}

export default function Home() {
  const { t } = useI18n();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [sRes, cRes] = await Promise.all([
      supabase.from("services").select("*").order("name"),
      supabase.from("categories").select("*").order("name"),
    ]);
    setServices(sRes.data && sRes.data.length > 0 ? sRes.data : FALLBACK_SERVICES);
    setCategories(cRes.data && cRes.data.length > 0 ? cRes.data : FALLBACK_CATEGORIES);
  }

  const trendingServices = services.slice(0, 6);
  const filteredServices = searchQuery
    ? services.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const copyCoupon = useCallback((code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  }, []);

  const shareReferral = useCallback(() => {
    const url = window.location.origin;
    const text = "Check out Fix Mate — book home services with zero upfront payment! Use my link:";
    if (navigator.share) {
      navigator.share({ title: "Fix Mate", text, url }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, "_blank");
    }
  }, []);

  // Track recently viewed
  const trackView = useCallback((s: Service, catName: string) => {
    try {
      const stored = JSON.parse(localStorage.getItem("fixmate-recently-viewed") || "[]");
      const entry = { id: s.id, name: s.name, category: catName, price: s.base_price };
      const filtered = stored.filter((v: {id: string}) => v.id !== s.id);
      localStorage.setItem("fixmate-recently-viewed", JSON.stringify([entry, ...filtered].slice(0, 10)));
    } catch {}
  }, []);

  return (
    <div className="flex-1 flex flex-col pb-20 md:pb-8">
      <main className="flex-1 px-4 md:px-8 pt-4 space-y-8">

        {/* ═══════════════════════════════════════════
            HERO SECTION — Bold gradient with search
           ═══════════════════════════════════════════ */}
        <section className="relative -mx-4 md:-mx-8 px-4 md:px-8 pt-8 pb-10 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 dark:from-brand-600 dark:via-brand-700 dark:to-brand-900 rounded-b-3xl overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-brand-400/10 rounded-full blur-2xl" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-5">
            <div className="inline-flex items-center gap-2">
              <CitySelector />
            </div>

            <h1 className="text-2xl md:text-4xl font-black text-white leading-tight tracking-tight">
              Home Services,
              <br />
              <span className="text-amber-300">Zero Upfront.</span>
            </h1>
            <p className="text-xs md:text-sm text-white/70 max-w-md mx-auto leading-relaxed">
              Book verified professionals. Pay only after the work is done. Plumbing, electrical, cleaning, and 50+ services.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("home.searchPlaceholder")}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-xl shadow-black/10"
              />
              {searchQuery && filteredServices.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl z-50 max-h-72 overflow-y-auto">
                  {filteredServices.slice(0, 6).map((s) => {
                    const cat = categories.find((c) => c.id === s.category_id);
                    return (
                      <Link
                        key={s.id}
                        href={`/services/${cat?.name?.toLowerCase().replace(/\s+/g, "-") || "general"}/${s.id}`}
                    onClick={() => { setSearchQuery(""); }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center">
                          <Wrench className="w-4 h-4 text-brand-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">{s.name}</span>
                          <span className="text-[10px] text-slate-500">{cat?.name} • ₹{s.base_price}</span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              )}
              {searchQuery && filteredServices.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl z-50 text-center">
                  <p className="text-xs text-slate-400">{t("catalog.noResults")}</p>
                </div>
              )}
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 pt-2">
              {[
                { icon: ShieldCheck, label: t("hero.verifiedPros") },
                { icon: Zap, label: t("hero.arrival") },
                { icon: CreditCard, label: t("hero.payAfter") },
              ].map((b) => (
                <div key={b.label} className="flex items-center gap-1 text-white/60">
                  <b.icon className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-medium">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════
            SOCIAL PROOF TICKER
           ═══════════════════════════════ */}
        <NotificationTicker />

        {/* ═══════════════════════════════
            BOOKING REMINDERS
           ═══════════════════════════════ */}
        <BookingReminder />

        {/* ═══════════════════════════════
            GUARANTEES BANNER
           ═══════════════════════════════ */}
        <GuaranteesBanner />

        {/* ═══════════════════════════════
            ANIMATED STATS
           ═══════════════════════════════ */}
        <AnimatedStats />

        {/* ═══════════════════════════════
            CATEGORIES — 2-row scrollable grid
           ═══════════════════════════════ */}
        {categories.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">{t("home.browseCategory")}</h2>
              <Link href="/services" className="text-xs text-brand-500 dark:text-brand-400 font-semibold hover:underline flex items-center gap-0.5">
                {t("home.viewAll")} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
              {categories.map((cat) => {
                const colors = getCategoryColor(cat.name);
                return (
                  <Link
                    key={cat.id}
                    href={`/services/${cat.name.toLowerCase().replace(/\s+/g, "-")}`}
                    className="flex flex-col items-center text-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-lg hover:border-brand-300 dark:hover:border-brand-500/30 transition-all group"
                  >
                    <div className={`w-12 h-12 rounded-2xl ${colors.bg} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                      <span className="text-xl">{cat.icon || "🔧"}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-brand-500 dark:group-hover:text-white transition-colors leading-tight">{cat.name}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════
            URGENT BOOKING — red gradient CTA
           ═══════════════════════════════ */}
        <Link href="/services" className="block group">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 dark:from-rose-600 dark:to-rose-700 text-white shadow-xl shadow-rose-500/20 group-hover:shadow-2xl group-hover:shadow-rose-500/30 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold">{t("home.urgentHelp")}</h3>
                <p className="text-[11px] text-white/80 mt-0.5">{t("home.urgentDesc")}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <ArrowRight className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </Link>

        {/* ═══════════════════════════════
            AI TRIAGE WIDGET
           ═══════════════════════════════ */}
        <AiTriageWidget />

        {/* ═══════════════════════════════
            OFFERS — horizontal scroll cards
           ═══════════════════════════════ */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-amber-500" />
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">{t("home.offersForYou")}</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
            {/* First-time offer */}
            <div className="shrink-0 w-72 p-5 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white space-y-3 shadow-lg shadow-brand-500/20">
              <div className="flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-white/80" />
                <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">{t("home.firstTime")}</span>
              </div>
              <h4 className="text-lg font-black">{t("home.flat150Off")}</h4>
              <p className="text-[11px] text-white/70">{t("home.firstBookingDesc")}</p>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono font-bold bg-white/20 px-3 py-1 rounded-lg">FIXFIRST150</code>
                <button
                  onClick={() => copyCoupon("FIXFIRST150")}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-[10px] font-bold transition-colors"
                >
                  {copiedCoupon === "FIXFIRST150" ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCoupon === "FIXFIRST150" ? "Copied!" : t("home.claim")}
                </button>
              </div>
            </div>

            {/* Referral offer */}
            <div className="shrink-0 w-72 p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white space-y-3 shadow-lg shadow-emerald-500/20">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-white/80" />
                <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">{t("home.referEarn")}</span>
              </div>
              <h4 className="text-lg font-black">{t("home.inviteFriends")}</h4>
              <p className="text-[11px] text-white/70">{t("home.referralDesc")}</p>
              <button
                onClick={shareReferral}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-[11px] font-bold transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" /> {t("home.shareLink")}
              </button>
            </div>

            {/* Weekend deal */}
            <div className="shrink-0 w-72 p-5 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white space-y-3 shadow-lg shadow-amber-500/20">
              <div className="flex items-center gap-1.5">
                <CalendarCheck className="w-4 h-4 text-white/80" />
                <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">{t("home.weekendDeal")}</span>
              </div>
              <h4 className="text-lg font-black">{t("home.cleaning20Off")}</h4>
              <p className="text-[11px] text-white/70">{t("home.weekendDesc")}</p>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono font-bold bg-white/20 px-3 py-1 rounded-lg">CLEAN20</code>
                <button
                  onClick={() => copyCoupon("CLEAN20")}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-[10px] font-bold transition-colors"
                >
                  {copiedCoupon === "CLEAN20" ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCoupon === "CLEAN20" ? "Copied!" : t("home.claim")}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════
            TRENDING SERVICES — premium cards
           ═══════════════════════════════ */}
        {trendingServices.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">{t("home.trending")}</h2>
              </div>
              <Link href="/services" className="text-xs text-brand-500 dark:text-brand-400 font-semibold hover:underline flex items-center gap-0.5">
                {t("home.viewAll")} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {trendingServices.map((s) => {
                const cat = categories.find((c) => c.id === s.category_id);
                const colors = cat ? getCategoryColor(cat.name) : { bg: "bg-brand-500/10", text: "text-brand-500", border: "border-brand-500/20" };
                return (
                  <Link
                    key={s.id}
                    href={`/services/${cat?.name?.toLowerCase().replace(/\s+/g, "-") || "general"}/${s.id}`}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:border-brand-300 dark:hover:border-brand-500/30 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-bold ${colors.text} ${colors.bg} px-2 py-0.5 rounded-full`}>{cat?.name || "Service"}</span>
                      <StarRating rating={4.5} size="sm" showNumber={false} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors mb-2">{s.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">⏱ {s.est_duration_min || 45} min</span>
                      <div className="flex items-center gap-1">
                        <span className="text-base font-black text-emerald-600 dark:text-emerald-400">₹{s.base_price}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-500 transition-colors" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════
            FEATURED PRO OF THE DAY
           ═══════════════════════════════ */}
        <FeaturedPro />

        {/* ═══════════════════════════════
            SERVICE PACKAGES PREVIEW
           ═══════════════════════════════ */}
        <ServicePackagesPreview />

        {/* ═══════════════════════════════
            WHY FIX MATE — trust indicators
           ═══════════════════════════════ */}
        <section className="space-y-3">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white text-center">{t("home.whyTrust")}</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: ShieldCheck, title: t("home.verifiedProsTitle"), desc: t("home.verifiedProsDesc"), color: "text-brand-500", bg: "bg-brand-500/10" },
              { icon: Clock, title: t("home.quickResponse"), desc: t("home.quickResponseDesc"), color: "text-amber-500", bg: "bg-amber-500/10" },
              { icon: Award, title: t("home.qualityGuarantee"), desc: t("home.qualityGuaranteeDesc"), color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { icon: Headphones, title: t("home.transparentPricing"), desc: t("home.transparentPricingDesc"), color: "text-rose-500", bg: "bg-rose-500/10" },
            ].map((item) => (
              <div key={item.title} className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-2">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════
            BEFORE & AFTER GALLERY
           ═══════════════════════════════ */}
        <BeforeAfterGallery />

        {/* ═══════════════════════════════
            TESTIMONIALS CAROUSEL
           ═══════════════════════════════ */}
        <TestimonialsCarousel />

        {/* ═══════════════════════════════
            BLOG ARTICLES
           ═══════════════════════════════ */}
        <BlogArticles />

        {/* ═══════════════════════════════
            HOW IT WORKS — numbered steps
           ═══════════════════════════════ */}
        <section className="space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white text-center">{t("home.howItWorks")}</h2>
          <div className="relative">
            <div className="grid grid-cols-4 gap-2">
              {[
                { step: "1", title: t("home.step1Title"), desc: t("home.step1Desc"), icon: Search, color: "bg-brand-500" },
                { step: "2", title: t("home.step2Title"), desc: t("home.step2Desc"), icon: CalendarCheck, color: "bg-amber-500" },
                { step: "3", title: t("home.step3Title"), desc: t("home.step3Desc"), icon: Wrench, color: "bg-emerald-500" },
                { step: "4", title: t("home.step4Title"), desc: t("home.step4Desc"), icon: CreditCard, color: "bg-rose-500" },
              ].map((item, idx) => (
                <div key={idx} className="text-center space-y-2 relative">
                  <div className={`w-12 h-12 rounded-2xl ${item.color} text-white font-bold flex items-center justify-center mx-auto shadow-lg`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-[11px] font-bold text-slate-900 dark:text-white">{item.title}</h4>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════
            ALL SERVICES — full list
           ═══════════════════════════════ */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">{t("home.allServices")}</h2>
            <Link href="/services" className="text-xs text-brand-500 dark:text-brand-400 font-semibold hover:underline flex items-center gap-0.5">
              {t("home.viewAll")} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {services.slice(0, 9).map((s) => {
              const cat = categories.find((c) => c.id === s.category_id);
              const colors = cat ? getCategoryColor(cat.name) : { bg: "bg-brand-500/10", text: "text-brand-500", border: "border-brand-500/20" };
              return (
                <Link
                  key={s.id}
                  href={`/services/${cat?.name?.toLowerCase().replace(/\s+/g, "-") || "general"}/${s.id}`}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-lg hover:border-brand-300 dark:hover:border-brand-500/30 transition-all group"
                >
                  <div className={`w-11 h-11 rounded-xl ${colors.bg} flex items-center justify-center shrink-0`}>
                    <Wrench className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{cat?.name || "Service"}</span>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors truncate">{s.name}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{s.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">₹{s.base_price}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-brand-500 transition-colors ml-auto" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ═══════════════════════════════
            FAQ SECTION — accordion
           ═══════════════════════════════ */}
        <section className="space-y-3">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white text-center">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {[
              { q: "How does Pay After Work work?", a: "You don't pay anything upfront. After the service professional completes the job, you inspect the work and pay via cash or UPI. Zero risk." },
              { q: "Are the professionals verified?", a: "Yes. Every professional goes through Aadhaar verification, background checks, and skill certification before they can accept jobs on Fix Mate." },
              { q: "What if I'm not satisfied with the service?", a: "You can flag a dispute directly from your order page. Our support team will resolve it within 24 hours — re-do the work, offer a refund, or reassign a new professional." },
              { q: "Is there a cancellation fee?", a: "No. You can cancel any booking before the professional arrives at your doorstep with zero charges." },
            ].map((faq, idx) => (
              <div key={idx} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${expandedFaq === idx ? "rotate-180" : ""}`} />
                </button>
                {expandedFaq === idx && (
                  <div className="px-4 pb-4">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════
            RECENTLY VIEWED
           ═══════════════════════════════ */}
        <RecentlyViewed />

        {/* ═══════════════════════════════
            APP DOWNLOAD CTA
           ═══════════════════════════════ */}
        <AppDownloadCTA />

        {/* ═══════════════════════════════
            CONTACT — CTA card
           ═══════════════════════════════ */}
        <section className="grid grid-cols-2 gap-3">
          <a href="tel:+919999999999" className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Phone className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">Call Us</span>
              <span className="text-[10px] text-slate-500">24/7 Support</span>
            </div>
          </a>
          <Link href="/help" className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all group">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-brand-500" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">Chat Support</span>
              <span className="text-[10px] text-slate-500">Get help fast</span>
            </div>
          </Link>
        </section>
      </main>
    </div>
  );
}
