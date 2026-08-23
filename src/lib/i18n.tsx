"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

type Locale = "en" | "hi";

const translations: Record<Locale, Record<string, string>> = {
  en: {
    "nav.home": "Home",
    "nav.bookings": "Bookings",
    "nav.profile": "Profile",
    "nav.signIn": "Sign In",
    "nav.services": "Services",
    "hero.location": "Delivering to",
    "hero.activeZone": "Active Service Zone",
    "hero.verifiedPros": "Verified Pros",
    "hero.backgroundChecked": "Background Checked",
    "hero.arrival": "30 Min Arrival",
    "hero.instantBooking": "Instant Booking",
    "hero.payAfter": "Pay After Work",
    "hero.zeroUpfront": "Zero Upfront Cash",
    "catalog.searchPlaceholder": "Search 'AC repair', 'Plumber', 'Tap leak'...",
    "catalog.allServices": "All Services",
    "catalog.available": "Available Services",
    "catalog.bookService": "Book Service",
    "catalog.mins": "mins",
    "catalog.payAfterCompletion": "Pay After Completion",
    "catalog.noResults": "No matching services found",
    "catalog.adjustSearch": "Try adjusting your search query or category filter.",
    "howItWorks.title": "How Fix Mate Works",
    "howItWorks.subtitle": "Book trusted home services in 3 simple steps with zero advance fees",
    "howItWorks.selectService": "Select Service",
    "howItWorks.selectServiceDesc": "Pick from 50+ verified home repair, plumbing, electrical & cleaning services.",
    "howItWorks.proArrives": "Professional Arrives",
    "howItWorks.proArrivesDesc": "Background-checked local service partner arrives at your address within 30 minutes.",
    "howItWorks.payAfterWork": "Pay After Completion",
    "howItWorks.payAfterWorkDesc": "Inspect the finished work and pay cash or UPI directly. Zero upfront charges.",
    "promo.firstTime": "First Time Special",
    "promo.flatOff": "Flat ₹150 OFF on first service",
    "promo.code": "Use code:",
    "promo.claim": "Claim",
    "ai.title": "Describe Your Problem",
    "ai.subtitle": "AI-powered service matching",
    "ai.placeholder": "e.g. My kitchen tap is leaking badly...",
    "ai.highMatch": "High Match",
    "ai.likelyMatch": "Likely Match",
    "ai.lowMatch": "Low Match",
    "ai.browseServices": "Browse {category} Services",
    "footer.services": "Services",
    "footer.trust": "Trust & Security",
    "footer.support": "Support",
    "footer.builtWith": "Built with",
    "footer.rights": "All rights reserved.",
    "booking.title": "Service Booking",
    "booking.schedule": "Schedule",
    "booking.address": "Address",
    "booking.notes": "Notes",
    "booking.review": "Review",
    "booking.continue": "Continue",
    "booking.back": "Back",
    "booking.confirm": "Confirm & Book Professional",
    "booking.confirmed": "Booking Confirmed!",
    "booking.payableOnWork": "Payable on Work",
    "disputes.title": "Report an Issue",
    "disputes.flag": "Flag a Dispute",
    "disputes.describe": "Describe the problem in detail",
    "disputes.submit": "Submit Dispute",
  },
  hi: {
    "nav.home": "होम",
    "nav.bookings": "बुकिंग",
    "nav.profile": "प्रोफ़ाइल",
    "nav.signIn": "साइन इन",
    "nav.services": "सेवाएँ",
    "hero.location": "डिलीवरी स्थान",
    "hero.activeZone": "सक्रिय सेवा क्षेत्र",
    "hero.verifiedPros": "सत्यापित प्रो",
    "hero.backgroundChecked": "बैकग्राउंड चेक",
    "hero.arrival": "30 मिनट में आगमन",
    "hero.instantBooking": "तत्काल बुकिंग",
    "hero.payAfter": "काम के बाद भुगतान",
    "hero.zeroUpfront": "कोई अग्रिम नहीं",
    "catalog.searchPlaceholder": "खोजें — 'AC मरम्मत', 'प्लंबर', 'टैप लीक'...",
    "catalog.allServices": "सभी सेवाएँ",
    "catalog.available": "उपलब्ध सेवाएँ",
    "catalog.bookService": "सेवा बुक करें",
    "catalog.mins": "मिनट",
    "catalog.payAfterCompletion": "पूर्णता के बाद भुगतान",
    "catalog.noResults": "कोई मेल खाती सेवा नहीं मिली",
    "catalog.adjustSearch": "अपनी खोज या श्रेणी फ़िल्टर बदलकर देखें।",
    "howItWorks.title": "Fix Mate कैसे काम करता है",
    "howItWorks.subtitle": "3 आसान चरणों में भरोसेमंद घर सेवाएँ बुक करें — बिना किसी अग्रिम शुल्क के",
    "howItWorks.selectService": "सेवा चुनें",
    "howItWorks.selectServiceDesc": "50+ सत्यापित होम रिपेयर, प्लंबिंग, इलेक्ट्रिकल और क्लीनिंग सेवाओं में से चुनें।",
    "howItWorks.proArrives": "प्रोफेशनल आता है",
    "howItWorks.proArrivesDesc": "बैकग्राउंड चेक किया हुआ स्थानीय सेवा पार्टनर 30 मिनट में आपके पते पर पहुँचता है।",
    "howItWorks.payAfterWork": "काम के बाद भुगतान",
    "howItWorks.payAfterWorkDesc": "पूरा काम निरीक्षित करें और सीधे कैश या UPI से भुगतान करें।",
    "promo.firstTime": "पहली बार विशेष",
    "promo.flatOff": "पहली सेवा पर ₹150 की छूट",
    "promo.code": "कोड का उपयोग करें:",
    "promo.claim": "प्राप्त करें",
    "ai.title": "अपनी समस्या बताएं",
    "ai.subtitle": "AI-संचालित सेवा मिलान",
    "ai.placeholder": "जैसे — मेरे किचन का टैप बहुत लीक हो रहा है...",
    "ai.highMatch": "उच्च मिलान",
    "ai.likelyMatch": "संभावित मिलान",
    "ai.lowMatch": "कम मिलान",
    "ai.browseServices": "{category} सेवाएँ देखें",
    "footer.services": "सेवाएँ",
    "footer.trust": "विश्वास और सुरक्षा",
    "footer.support": "सहायता",
    "footer.builtWith": "बनाया गया",
    "footer.rights": "सर्वाधिकार सुरक्षित।",
    "booking.title": "सेवा बुकिंग",
    "booking.schedule": "शेड्यूल",
    "booking.address": "पता",
    "booking.notes": "नोट्स",
    "booking.review": "समीक्षा",
    "booking.continue": "जारी रखें",
    "booking.back": "वापस",
    "booking.confirm": "पुष्टि करें और प्रो बुक करें",
    "booking.confirmed": "बुकिंग पक्की!",
    "booking.payableOnWork": "काम पर भुगतान",
    "disputes.title": "समस्या की रिपोर्ट करें",
    "disputes.flag": "विवाद दर्ज करें",
    "disputes.describe": "समस्या विस्तार से बताएं",
    "disputes.submit": "विवाद सबमिट करें",
  },
};

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "en",
  setLocale: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    // Read from cookie
    const match = document.cookie.match(/fixmate-locale=(en|hi)/);
    if (match) {
      setLocaleState(match[1] as Locale);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    document.cookie = `fixmate-locale=${newLocale};path=/;max-age=31536000`;
    document.documentElement.lang = newLocale;
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string>) => {
      let value = translations[locale][key] || translations.en[key] || key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          value = value.replace(`{${k}}`, v);
        });
      }
      return value;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
