"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bell, Globe, Moon, Shield, ChevronRight, Eye, EyeOff, Smartphone, Mail, MessageSquare } from "lucide-react";
import { PushNotificationManager } from "@/components/PushNotificationManager";
import { ThemeToggle } from "@/components/ThemeToggle";

interface SettingToggle {
  id: string;
  label: string;
  desc: string;
  enabled: boolean;
}

export default function SettingsPage() {
  const [notifications, setNotifications] = useState<SettingToggle[]>([
    { id: "push_orders", label: "Order Updates", desc: "Status changes, pro assigned, on the way", enabled: true },
    { id: "push_promo", label: "Promotions & Offers", desc: "Deals, coupons, seasonal offers", enabled: true },
    { id: "push_wallet", label: "Wallet & Payments", desc: "Balance updates, payment confirmations", enabled: true },
    { id: "email_orders", label: "Email Order Updates", desc: "Receive order summaries via email", enabled: false },
    { id: "email_promo", label: "Email Promotions", desc: "Weekly deals and new services", enabled: false },
    { id: "sms_orders", label: "SMS Alerts", desc: "Critical order updates via SMS", enabled: true },
  ]);

  const [language, setLanguage] = useState("en");
  const [darkMode, setDarkMode] = useState(true);
  const [locationServices, setLocationServices] = useState(true);

  function toggleNotification(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n)));
  }

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 bg-slate-950 text-slate-100 pb-20 md:pb-8">
      <header className="flex items-center justify-between py-2 border-b border-slate-800/80 mb-6">
        <Link href="/account" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200">
          <ArrowLeft className="w-4 h-4" /> Account
        </Link>
        <span className="font-bold text-sm text-white">Settings</span>
        <div />
      </header>

      <main className="max-w-lg mx-auto w-full flex-1 space-y-5">
        {/* Push Notifications */}
        <PushNotificationManager />

        {/* Notifications */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Bell className="w-4 h-4 text-brand-400" />
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Notifications</h3>
          </div>
          <div className="rounded-2xl bg-slate-900 border border-slate-800 divide-y divide-slate-800/60 overflow-hidden">
            {notifications.map((n) => (
              <div key={n.id} className="flex items-center gap-3 px-4 py-3.5">
                <div className="flex-1">
                  <span className="text-xs font-bold text-white block">{n.label}</span>
                  <span className="text-[10px] text-slate-400">{n.desc}</span>
                </div>
                <button
                  onClick={() => toggleNotification(n.id)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${n.enabled ? "bg-brand-500" : "bg-slate-700"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${n.enabled ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Globe className="w-4 h-4 text-amber-400" />
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Language</h3>
          </div>
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
            {[
              { id: "en", label: "English", native: "English" },
              { id: "hi", label: "Hindi", native: "हिन्दी" },
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => setLanguage(lang.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-slate-800/60 last:border-0"
              >
                <span className="flex-1 text-left text-xs font-bold text-white">{lang.label}</span>
                <span className="text-[10px] text-slate-400">{lang.native}</span>
                {language === lang.id && (
                  <span className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center text-white text-[10px]">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Display */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Moon className="w-4 h-4 text-slate-400" />
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Display</h3>
          </div>
          <div className="rounded-2xl bg-slate-900 border border-slate-800 divide-y divide-slate-800/60 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="flex-1">
                <span className="text-xs font-bold text-white block">Theme</span>
                <span className="text-[10px] text-slate-400">Toggle dark/light mode</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Privacy & Location */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Privacy & Location</h3>
          </div>
          <div className="rounded-2xl bg-slate-900 border border-slate-800 divide-y divide-slate-800/60 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="flex-1">
                <span className="text-xs font-bold text-white block">Location Services</span>
                <span className="text-[10px] text-slate-400">Auto-detect your location for faster booking</span>
              </div>
              <button
                onClick={() => setLocationServices(!locationServices)}
                className={`w-11 h-6 rounded-full transition-colors relative ${locationServices ? "bg-brand-500" : "bg-slate-700"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${locationServices ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>
            <Link href="/profile/addresses" className="flex items-center gap-3 px-4 py-3.5">
              <div className="flex-1">
                <span className="text-xs font-bold text-white block">Manage Addresses</span>
                <span className="text-[10px] text-slate-400">Add, edit, or remove saved locations</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </Link>
          </div>
        </div>

        {/* Data & Storage */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Smartphone className="w-4 h-4 text-brand-400" />
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Data & Storage</h3>
          </div>
          <div className="rounded-2xl bg-slate-900 border border-slate-800 divide-y divide-slate-800/60 overflow-hidden">
            <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
              <div className="flex-1">
                <span className="text-xs font-bold text-white block">Clear Cache</span>
                <span className="text-[10px] text-slate-400">Free up storage space</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
              <div className="flex-1">
                <span className="text-xs font-bold text-white block">Download My Data</span>
                <span className="text-[10px] text-slate-400">Export all your account data</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
