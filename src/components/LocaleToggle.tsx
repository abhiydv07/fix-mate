"use client";

import { Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function LocaleToggle() {
  const { locale, setLocale } = useI18n();

  return (
    <button
      onClick={() => setLocale(locale === "en" ? "hi" : "en")}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
      title={locale === "en" ? "हिंदी में बदलें" : "Switch to English"}
    >
      <Globe className="w-3.5 h-3.5 text-brand-400" />
      {locale === "en" ? "हिंदी" : "EN"}
    </button>
  );
}
