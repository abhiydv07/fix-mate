import Link from "next/link";
import { Wrench, ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-12 bg-slate-900 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 px-4 md:px-8 py-8 text-slate-400">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Brand Column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center text-white font-bold">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-white">Fix Mate</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              India&apos;s premier Pay-on-Work home services marketplace connecting customers with verified local professionals.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Services</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/" className="hover:text-brand-400 transition-colors">Plumbing & Pipe Leak</Link></li>
              <li><Link href="/" className="hover:text-brand-400 transition-colors">Electrical & Wiring</Link></li>
              <li><Link href="/" className="hover:text-brand-400 transition-colors">AC & Appliance Repair</Link></li>
              <li><Link href="/" className="hover:text-brand-400 transition-colors">Full Home Deep Clean</Link></li>
            </ul>
          </div>

          {/* Customer Trust */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Trust & Security</h4>
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4" /> 100% Pay on Work
              </li>
              <li>30-Day Service Guarantee</li>
              <li>Background Verified Pros</li>
              <li>Zero Cancellation Fee</li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Support</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/help" className="hover:text-brand-400 transition-colors">Help & FAQ</Link></li>
              <li><Link href="/bookings" className="hover:text-brand-400 transition-colors">My Bookings</Link></li>
              <li><Link href="/profile" className="hover:text-brand-400 transition-colors">My Account</Link></li>
              <li><a href="mailto:support@fixmate.in" className="hover:text-brand-400 transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} Fix Mate Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for seamless home maintenance
          </p>
        </div>
      </div>
    </footer>
  );
}
