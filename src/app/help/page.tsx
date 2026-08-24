"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, HelpCircle, Phone, Mail, MessageSquare, ChevronRight, Search, Shield, Clock, CreditCard, Wrench, AlertTriangle } from "lucide-react";

const faqs = [
  {
    category: "Booking",
    icon: Wrench,
    questions: [
      { q: "How do I book a service?", a: "Browse services, select a category, choose a service, pick a date/time slot, select your address, and confirm. You'll get a confirmation instantly." },
      { q: "Can I reschedule my booking?", a: "Yes, go to My Bookings → select the order → reschedule. You can reschedule up to 2 hours before the appointment." },
      { q: "What if the professional doesn't show up?", a: "Contact us immediately via the chat or call. We'll assign a new professional or reschedule at no extra cost." },
      { q: "How do I cancel a booking?", a: "Go to My Bookings → select the order → Cancel. No cancellation fee if cancelled 1+ hours before." },
    ],
  },
  {
    category: "Payment",
    icon: CreditCard,
    questions: [
      { q: "When do I pay?", a: "You pay only after the service is completed and verified. Cash or UPI directly to the professional." },
      { q: "Is there any advance payment?", a: "No. Fix Mate follows a zero-upfront payment model. Pay only after work is done." },
      { q: "What if I'm overcharged?", a: "The price shown during booking is the final price. If charged more, raise a dispute from the order page and we'll resolve it within 24 hours." },
      { q: "Do you accept UPI/cards?", a: "Currently we support cash and UPI payments directly to the professional." },
    ],
  },
  {
    category: "Service Quality",
    icon: Shield,
    questions: [
      { q: "Are professionals verified?", a: "Yes, all professionals undergo background verification, KYC, and skill testing before being onboarded." },
      { q: "What if I'm not satisfied with the work?", a: "We offer a 30-day service guarantee. If the issue recurs, we'll send a professional at no extra cost." },
      { q: "How do I rate a service?", a: "After completion, you'll be prompted to rate and review. You can also rate from My Bookings → Completed." },
      { q: "Can I request the same professional again?", a: "Yes! From your order history, tap on a completed order and select 'Book Again' with the same professional." },
    ],
  },
  {
    category: "Account",
    icon: HelpCircle,
    questions: [
      { q: "How do I update my profile?", a: "Go to Profile → tap the edit icon next to your name. You can update name, phone, and avatar." },
      { q: "How do I add/change my address?", a: "Go to Profile → Addresses → Add New Address. You can save multiple addresses and pick one during booking." },
      { q: "How do I become a service provider?", a: "Sign up as 'Service Pro' on the login page. Complete your KYC verification and wait for admin approval." },
      { q: "How do I delete my account?", a: "Contact support at support@fixmate.com with your registered email." },
    ],
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedQ, setExpandedQ] = useState<string | null>(null);

  const allQuestions = faqs.flatMap((cat) =>
    cat.questions.map((q) => ({ ...q, category: cat.category }))
  );

  const filtered = searchQuery
    ? allQuestions.filter(
        (q) =>
          q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 bg-slate-950 text-slate-100 pb-20 md:pb-8">
      <header className="flex items-center justify-between py-2 border-b border-slate-800/80 mb-6">
        <Link href="/" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
        <span className="font-bold text-sm text-white">Help & Support</span>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
          24/7
        </span>
      </header>

      <main className="max-w-2xl mx-auto w-full flex-1 space-y-6">
        <div className="space-y-1">
          <h1 className="text-xl font-extrabold text-white">How can we help?</h1>
          <p className="text-xs text-slate-400">Search FAQs or contact our support team</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for help..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-3 gap-2">
          <a href="tel:+911234567890" className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center text-center space-y-1.5 hover:border-brand-500/30 transition-colors">
            <Phone className="w-5 h-5 text-brand-400" />
            <span className="text-[10px] font-bold text-white">Call Us</span>
            <span className="text-[9px] text-slate-400">24/7 Support</span>
          </a>
          <a href="mailto:support@fixmate.com" className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center text-center space-y-1.5 hover:border-brand-500/30 transition-colors">
            <Mail className="w-5 h-5 text-amber-400" />
            <span className="text-[10px] font-bold text-white">Email</span>
            <span className="text-[9px] text-slate-400">support@fixmate.com</span>
          </a>
          <Link href="/bookings" className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center text-center space-y-1.5 hover:border-brand-500/30 transition-colors">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] font-bold text-white">Chat</span>
            <span className="text-[9px] text-slate-400">In-Order Chat</span>
          </Link>
        </div>

        {/* Search Results */}
        {filtered && (
          <div className="space-y-2">
            <span className="text-[11px] text-slate-400">{filtered.length} results found</span>
            {filtered.map((faq, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <button
                  onClick={() => setExpandedQ(expandedQ === faq.q ? null : faq.q)}
                  className="w-full text-left flex items-center justify-between"
                >
                  <span className="text-xs font-bold text-white pr-2">{faq.q}</span>
                  <ChevronRight className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${expandedQ === faq.q ? "rotate-90" : ""}`} />
                </button>
                {expandedQ === faq.q && (
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* FAQ Categories */}
        {!filtered && faqs.map((cat) => (
          <div key={cat.category} className="space-y-2">
            <div className="flex items-center gap-2">
              <cat.icon className="w-4 h-4 text-brand-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">{cat.category}</h3>
            </div>
            <div className="space-y-1.5">
              {cat.questions.map((faq) => (
                <div key={faq.q} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <button
                    onClick={() => setExpandedQ(expandedQ === faq.q ? null : faq.q)}
                    className="w-full text-left flex items-center justify-between"
                  >
                    <span className="text-xs font-bold text-white pr-2">{faq.q}</span>
                    <ChevronRight className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${expandedQ === faq.q ? "rotate-90" : ""}`} />
                  </button>
                  {expandedQ === faq.q && (
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{faq.a}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Emergency Banner */}
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-rose-300">Safety Emergency?</h4>
            <p className="text-[11px] text-slate-400">
              If you feel unsafe or need immediate help, call <strong className="text-white">112</strong> (Emergency) or our 24/7 helpline.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
