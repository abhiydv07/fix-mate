"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Crown, Zap, ShieldCheck, Star, Clock, Percent, Headphones, ChevronRight } from "lucide-react";

const plans = [
  {
    id: "free",
    name: "Basic",
    price: 0,
    period: "Free forever",
    description: "Standard access to all services",
    features: [
      "Book all services",
      "Pay after work",
      "30-day service guarantee",
      "Standard customer support",
      "Basic coupons & offers",
    ],
    notIncluded: [
      "Priority booking",
      "Express 15-min arrival",
      "Dedicated relationship manager",
      "Exclusive discounts",
      "Free annual deep clean",
    ],
    color: "slate",
    popular: false,
  },
  {
    id: "plus",
    name: "Fix Mate Plus",
    price: 299,
    period: "/month",
    description: "Premium access with priority everything",
    features: [
      "Everything in Basic",
      "Priority booking — skip the queue",
      "Express 15-min arrival guarantee",
      "Dedicated relationship manager",
      "20% off on all services",
      "Free annual deep clean worth ₹999",
      "Exclusive Plus-only offers",
      "24/7 priority support",
    ],
    notIncluded: [],
    color: "amber",
    popular: true,
  },
  {
    id: "annual",
    name: "Fix Mate Plus Annual",
    price: 1999,
    period: "/year",
    description: "Best value — save ₹1,589",
    features: [
      "Everything in Plus",
      "₹1,589 savings vs monthly",
      "2 months free",
      "Priority for 12 months",
      "Free quarterly deep clean (4x)",
      "VIP customer support",
      "Early access to new services",
      "Exclusive annual member rewards",
    ],
    notIncluded: [],
    color: "emerald",
    popular: false,
  },
];

export default function PlansPage() {
  const [currentPlan] = useState("free");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 bg-slate-950 text-slate-100 pb-20 md:pb-8">
      <header className="flex items-center justify-between py-2 border-b border-slate-800/80 mb-6">
        <Link href="/account" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200">
          <ArrowLeft className="w-4 h-4" /> Account
        </Link>
        <span className="font-bold text-sm text-white">My Plans</span>
        <div />
      </header>

      <main className="max-w-2xl mx-auto w-full flex-1 space-y-5">
        {/* Current Plan */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <span className="text-[9px] text-slate-500 uppercase font-bold">Current Plan</span>
              <h3 className="text-sm font-bold text-white">Basic (Free)</h3>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded-full">Active</span>
        </div>

        {/* Plans */}
        <div className="space-y-4">
          <h2 className="text-sm font-extrabold text-white">Upgrade Your Experience</h2>

          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative p-5 rounded-2xl border transition-all ${
                plan.popular
                  ? "bg-gradient-to-br from-amber-900/20 to-slate-900 border-amber-500/30 shadow-lg shadow-amber-500/10"
                  : "bg-slate-900 border-slate-800 hover:border-slate-700"
              } ${selectedPlan === plan.id ? "ring-2 ring-brand-500" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-4 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black flex items-center gap-1">
                  <Crown className="w-3 h-3" /> MOST POPULAR
                </div>
              )}

              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">{plan.name}</h3>
                  <p className="text-[10px] text-slate-400">{plan.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-white">₹{plan.price}</span>
                  <span className="text-[10px] text-slate-400 block">{plan.period}</span>
                </div>
              </div>

              <div className="space-y-1.5 mb-4">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-[11px] text-slate-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    {f}
                  </div>
                ))}
                {plan.notIncluded.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="w-3.5 h-3.5 flex items-center justify-center text-slate-600">—</span>
                    {f}
                  </div>
                ))}
              </div>

              {plan.id === currentPlan ? (
                <div className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold text-center">
                  Current Plan
                </div>
              ) : plan.id === "free" ? null : (
                <button
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                    plan.popular
                      ? "bg-amber-500 hover:bg-amber-600 text-slate-950"
                      : "bg-brand-500 hover:bg-brand-600 text-white"
                  }`}
                >
                  Get {plan.name} →
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Plan Benefits */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-white">Why Upgrade?</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Zap, title: "Express Arrival", desc: "15 min average", color: "text-amber-400" },
              { icon: Percent, title: "20% Off All Services", desc: "Save on every booking", color: "text-brand-400" },
              { icon: Headphones, title: "24/7 Priority Support", desc: "Skip the queue", color: "text-emerald-400" },
              { icon: Star, title: "Exclusive Rewards", desc: "Member-only deals", color: "text-rose-400" },
            ].map((b) => (
              <div key={b.title} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <b.icon className={`w-4 h-4 ${b.color}`} />
                <h4 className="text-[10px] font-bold text-white">{b.title}</h4>
                <p className="text-[9px] text-slate-400">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-white">Plan FAQs</h3>
          {[
            { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription anytime. Your plan benefits continue until the end of the billing period." },
            { q: "How do discounts work?", a: "Plus members get 20% off on the base price of all services. Discount is applied automatically at checkout." },
            { q: "Is there a refund policy?", a: "If you're not satisfied within 7 days, we'll refund your subscription — no questions asked." },
          ].map((faq) => (
            <details key={faq.q} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 group">
              <summary className="text-xs font-bold text-white cursor-pointer list-none flex items-center justify-between">
                {faq.q}
                <ChevronRight className="w-4 h-4 text-slate-500 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </main>
    </div>
  );
}
