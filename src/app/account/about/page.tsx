"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, FileText, Lock, Scale, ExternalLink, Heart, Wrench, Globe, Code } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 bg-slate-950 text-slate-100 pb-20 md:pb-8">
      <header className="flex items-center justify-between py-2 border-b border-slate-800/80 mb-6">
        <Link href="/account" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200">
          <ArrowLeft className="w-4 h-4" /> Account
        </Link>
        <span className="font-bold text-sm text-white">About</span>
        <div />
      </header>

      <main className="max-w-lg mx-auto w-full flex-1 space-y-6">
        {/* App Info */}
        <div className="text-center space-y-3 py-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white mx-auto shadow-lg shadow-brand-500/20">
            <Wrench className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">Fix Mate</h1>
            <p className="text-xs text-slate-400">On-Demand Home Services Marketplace</p>
          </div>
          <span className="inline-block text-[10px] font-bold text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full">Version 1.0.0</span>
        </div>

        {/* About */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <h3 className="text-xs font-bold text-white">About Fix Mate</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Fix Mate is India&apos;s premier pay-on-work home services marketplace. We connect customers with verified local professionals for plumbing, electrical, cleaning, appliance repair, painting, carpentry, and more.
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Our zero-upfront payment model means you only pay after the work is completed and verified. Every professional is background-checked, skill-tested, and backed by our 30-day service guarantee.
          </p>
        </div>

        {/* Legal */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1">Legal</h3>
          <div className="rounded-2xl bg-slate-900 border border-slate-800 divide-y divide-slate-800/60 overflow-hidden">
            {[
              { icon: FileText, label: "Terms of Service", href: "#", desc: "User agreement and platform rules" },
              { icon: Lock, label: "Privacy Policy", href: "#", desc: "How we collect and protect your data" },
              { icon: Scale, label: "Refund Policy", href: "#", desc: "Cancellation and refund terms" },
              { icon: ShieldCheck, label: "Community Guidelines", href: "#", desc: "Expected behavior and content policy" },
            ].map((item) => (
              <a key={item.label} href={item.href} className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-800/50 transition-colors">
                <item.icon className="w-4 h-4 text-slate-400" />
                <div className="flex-1">
                  <span className="text-xs font-bold text-white block">{item.label}</span>
                  <span className="text-[10px] text-slate-400">{item.desc}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>
            ))}
          </div>
        </div>

        {/* Credits */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1">Credits & Open Source</h3>
          <div className="rounded-2xl bg-slate-900 border border-slate-800 divide-y divide-slate-800/60 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <Code className="w-4 h-4 text-slate-400" />
              <div className="flex-1">
                <span className="text-xs font-bold text-white block">Built with Next.js & Supabase</span>
                <span className="text-[10px] text-slate-400">Full-stack TypeScript</span>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3.5">
              <Globe className="w-4 h-4 text-slate-400" />
              <div className="flex-1">
                <span className="text-xs font-bold text-white block">OpenStreetMap</span>
                <span className="text-[10px] text-slate-400">Map data & tiles</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-2 pt-4">
          <p className="text-[10px] text-slate-500">© {new Date().getFullYear()} Fix Mate Inc.</p>
          <p className="text-[10px] text-slate-600 flex items-center justify-center gap-1">
            Built with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for seamless home maintenance
          </p>
        </div>
      </main>
    </div>
  );
}
