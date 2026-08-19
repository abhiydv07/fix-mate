import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AddressManager } from "@/components/AddressManager";

export default function ProfileAddressesPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between p-4 md:p-8 bg-slate-950 text-slate-100 pb-20 md:pb-8">
      <header className="flex items-center justify-between py-2 border-b border-slate-800/80 mb-6">
        <Link href="/profile" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200">
          <ArrowLeft className="w-4 h-4" /> Back to Profile
        </Link>
        <span className="font-bold text-sm text-white">Address Book</span>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Pay on Work
        </span>
      </header>

      <main className="max-w-3xl mx-auto w-full flex-1 space-y-6">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <AddressManager />
        </div>
      </main>
    </div>
  );
}
