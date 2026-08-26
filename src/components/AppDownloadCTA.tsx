"use client";

import { Smartphone, Star } from "lucide-react";

export function AppDownloadCTA() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-brand-900 to-slate-900 dark:from-slate-900 dark:via-brand-900 dark:to-slate-900 p-6 space-y-4">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-5 -left-5 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 flex items-center gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-brand-400" />
            <h3 className="text-base font-extrabold text-white">{t_app("home.getApp")}</h3>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Book faster with the app. Get real-time tracking, exclusive app-only offers, and instant notifications.
          </p>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
            ))}
            <span className="text-[10px] text-slate-400 ml-1">4.8 on Play Store</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 rounded-xl bg-white text-slate-900 text-[10px] font-bold flex items-center gap-1.5 hover:bg-slate-100 transition-colors">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
              App Store
            </button>
            <button className="px-4 py-2 rounded-xl bg-white text-slate-900 text-[10px] font-bold flex items-center gap-1.5 hover:bg-slate-100 transition-colors">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M3.18 23.49c.34.3.79.49 1.27.51l14.61-6.26-3.61-3.61L3.18 23.49zm-.47-1.02L13.69 12 2.71 1.53c-.34.3-.56.72-.58 1.18-.02.46.12.89.4 1.22l.21.24v.01L12.35 12l-9.93 8.87-.23.24-.01.01v.01l-.42.36zm.78-.41L15.14 12 3.97 1.94l13.09 5.58-3.88 3.88-12.32 11.68zm1.85-.51l11.84-5.04 3.46 3.46-11.84 5.04-3.46-3.46z" /></svg>
              Play Store
            </button>
          </div>
        </div>

        {/* QR Code placeholder */}
        <div className="w-28 h-28 rounded-2xl bg-white p-2 shrink-0">
          <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center">
            <div className="text-center">
              <div className="grid grid-cols-5 gap-0.5 mx-auto w-16">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div key={i} className={`w-2.5 h-2.5 ${[0,1,2,3,4,5,9,10,14,15,19,20,21,22,23,24].includes(i) ? "bg-slate-900" : [6,8,12,16,18].includes(i) ? "bg-slate-900" : "bg-white"}`} />
                ))}
              </div>
              <span className="text-[7px] text-slate-400 mt-1 block">Scan to download</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Simple translation helper for this component
function t_app(key: string): string {
  const map: Record<string, string> = {
    "home.getApp": "Get the Fix Mate App",
    "home.getAppDesc": "Book services faster, track orders in real-time, and get exclusive app-only offers",
  };
  return map[key] || key;
}
