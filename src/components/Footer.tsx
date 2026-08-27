import Link from "next/link";
import { ShieldCheck, Heart, Briefcase, MapPin, Phone, Mail, ExternalLink } from "lucide-react";
import { Logo } from "@/components/Logo";

const SERVICE_LINKS = [
  { label: "Plumbing", href: "/services/plumbing" },
  { label: "Electrical", href: "/services/electrical" },
  { label: "Cleaning", href: "/services/cleaning" },
  { label: "Appliances", href: "/services/appliances" },
  { label: "Painting", href: "/services/painting" },
  { label: "Carpentry", href: "/services/carpentry" },
];

const COMPANY_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Blog", href: "/blog" },
  { label: "Press", href: "/press" },
  { label: "Contact", href: "/help" },
];

const SUPPORT_LINKS = [
  { label: "Help & FAQ", href: "/help" },
  { label: "My Bookings", href: "/bookings" },
  { label: "My Account", href: "/account" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
];

const PROVIDER_LINKS = [
  { label: "Become a Pro", href: "/login", highlight: true },
  { label: "Provider Registration", href: "/provider/onboarding" },
  { label: "Provider Dashboard", href: "/provider/dashboard" },
  { label: "Manage Availability", href: "/provider/availability" },
];

export function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/80">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand + App download */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Logo size={32} />
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 max-w-[220px]">
              India&apos;s premier Pay-on-Work home services marketplace. Book verified professionals, pay after work is done.
            </p>
            {/* App store badges */}
            <div className="flex gap-2">
              <a
                href="#"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold hover:opacity-90 transition-opacity"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                App Store
              </a>
              <a
                href="#"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold hover:opacity-90 transition-opacity"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302-2.302 2.302L15.39 12l2.308-2.492zM5.864 3.455L16.8 9.788l-2.302 2.302L5.864 3.455z"/></svg>
                Google Play
              </a>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Services</h4>
            <ul className="space-y-2">
              {SERVICE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-xs text-slate-600 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Company</h4>
            <ul className="space-y-2">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-xs text-slate-600 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Support</h4>
            <ul className="space-y-2">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-xs text-slate-600 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Providers */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">For Providers</h4>
            <ul className="space-y-2">
              {PROVIDER_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={`text-xs transition-colors ${
                      link.highlight
                        ? "text-amber-500 dark:text-amber-400 font-semibold hover:text-amber-600"
                        : "text-slate-600 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400"
                    }`}
                  >
                    {link.highlight && <Briefcase className="w-3 h-3 inline mr-1" />}
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Trust bar */}
      <div className="border-t border-slate-100 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-wrap items-center justify-center gap-6 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            100% Pay on Work
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            30-Day Guarantee
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            Background Verified Pros
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
            Zero Cancellation Fee
          </span>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-100 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>© {new Date().getFullYear()} Fix Mate Inc. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="tel:+919999999999" className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-brand-500 transition-colors">
              <Phone className="w-3 h-3" /> +91 99999 99999
            </a>
            <a href="mailto:support@fixmate.in" className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-brand-500 transition-colors">
              <Mail className="w-3 h-3" /> support@fixmate.in
            </a>
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <MapPin className="w-3 h-3" /> Noida & Greater Noida
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
