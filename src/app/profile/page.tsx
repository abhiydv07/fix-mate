import Link from "next/link";
import { User, MapPin, Calendar, ShieldCheck, LogOut, ArrowRight, Settings } from "lucide-react";
import { AddressManager } from "@/components/AddressManager";

export default function ProfilePage() {
  return (
    <div className="min-h-screen flex flex-col justify-between p-4 md:p-8 bg-slate-950 text-slate-100 pb-20 md:pb-8">
      {/* Header */}
      <header className="flex items-center justify-between py-2 border-b border-slate-800/80 mb-6">
        <Link href="/" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200">
          ← Home
        </Link>
        <span className="font-bold text-sm text-white">Customer Account</span>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Verified
        </span>
      </header>

      {/* Main Profile Layout */}
      <main className="max-w-3xl mx-auto w-full flex-1 space-y-6">
        {/* User Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center font-bold text-lg">
              A
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Abhishek</h2>
              <p className="text-xs text-slate-400">www.abhiydv07.co@gmail.com</p>
              <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-md">
                Customer Account
              </span>
            </div>
          </div>
        </div>

        {/* Saved Addresses Section */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <AddressManager />
        </div>
      </main>
    </div>
  );
}
