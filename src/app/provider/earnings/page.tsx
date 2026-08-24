"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Wallet, TrendingUp, Calendar, ArrowUpRight, ArrowDownLeft, Download, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import dynamic from "next/dynamic";

const EarningsChart = dynamic(() => import("@/components/EarningsChart").then((m) => m.EarningsChart), { ssr: false, loading: () => <div className="h-48 rounded-2xl bg-slate-900 animate-pulse" /> });

interface EarningRecord {
  id: string;
  service_name: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "paid_out";
}

export default function ProviderEarningsPage() {
  const [earnings, setEarnings] = useState<EarningRecord[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [paidOut, setPaidOut] = useState(0);
  const [period, setPeriod] = useState<"week" | "month" | "all">("week");
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => { loadEarnings(); }, [period]);

  async function loadEarnings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsLoading(false); return; }

    const { data: payments } = await supabase
      .from("payments")
      .select("id, amount, status, created_at, booking_id")
      .eq("provider_id", user.id)
      .order("created_at", { ascending: false });

    if (payments) {
      const bookingIds = [...new Set(payments.map((p) => p.booking_id).filter(Boolean))];
      const { data: bookings } = await supabase.from("bookings").select("id, service_id").in("id", bookingIds);
      const serviceIds = [...new Set(bookings?.map((b) => b.service_id).filter(Boolean) || [])];
      const { data: svcs } = await supabase.from("services").select("id, name").in("id", serviceIds);
      const svcMap = new Map(svcs?.map((s) => [s.id, s.name]) || []);
      const bookingServiceMap = new Map(bookings?.map((b) => [b.id, b.service_id]) || []);

      const total = payments.filter((p) => p.status === "completed").reduce((sum, p) => sum + (p.amount || 0), 0);
      const pend = payments.filter((p) => p.status === "pending").reduce((sum, p) => sum + (p.amount || 0), 0);
      const paid = total * 0.85; // 85% payout after platform fee

      setTotalEarned(total);
      setPendingAmount(pend);
      setPaidOut(Math.round(paid));

      setEarnings(payments.map((p) => ({
        id: p.id,
        service_name: svcMap.get(bookingServiceMap.get(p.booking_id) || "") || "Service",
        amount: p.amount || 0,
        date: p.created_at,
        status: p.status === "completed" ? "completed" : p.status === "pending" ? "pending" : "paid_out",
      })));
    }
    setIsLoading(false);
  }

  const filteredEarnings = earnings.filter((e) => {
    if (period === "all") return true;
    const d = new Date(e.date);
    const now = new Date();
    if (period === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return d >= weekAgo;
    }
    if (period === "month") {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const filteredTotal = filteredEarnings.filter((e) => e.status === "completed").reduce((sum, e) => sum + e.amount, 0);

  const statusColors: Record<string, string> = {
    completed: "text-emerald-400",
    pending: "text-amber-400",
    paid_out: "text-brand-400",
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 bg-slate-950 text-slate-100 pb-20 md:pb-8">
      <header className="flex items-center justify-between py-2 border-b border-slate-800/80 mb-6">
        <Link href="/provider/dashboard" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
        <span className="font-bold text-sm text-white">Earnings</span>
        <button className="text-[10px] font-bold text-brand-400 flex items-center gap-1">
          <Download className="w-3 h-3" /> Export
        </button>
      </header>

      <main className="max-w-lg mx-auto w-full flex-1 space-y-5">
        {/* Earnings Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-900/30 via-slate-900 to-slate-900 border border-amber-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400/80">Total Earned</span>
              <h1 className="text-3xl font-black text-white mt-1">₹{totalEarned}</h1>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800">
              <span className="text-[9px] text-slate-400 block">Pending Payout</span>
              <span className="text-sm font-bold text-amber-400">₹{pendingAmount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800">
              <span className="text-[9px] text-slate-400 block">Paid Out</span>
              <span className="text-sm font-bold text-emerald-400">₹{paidOut}</span>
            </div>
          </div>
        </div>

        {/* Earnings Chart */}
        <EarningsChart earnings={filteredEarnings} />

        {/* Period Filter */}
        <div className="flex gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
          {(["week", "month", "all"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2 rounded-lg text-[10px] font-bold capitalize transition-all ${
                period === p ? "bg-brand-500 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {p === "all" ? "All Time" : `This ${p.charAt(0).toUpperCase() + p.slice(1)}`}
            </button>
          ))}
        </div>

        {/* Period Summary */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block">Earnings this {period === "all" ? "period" : period}</span>
            <span className="text-lg font-black text-white">₹{filteredTotal}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">{filteredEarnings.length} jobs</span>
            <span className="text-[10px] text-slate-400 block">Avg ₹{filteredEarnings.length > 0 ? Math.round(filteredTotal / filteredEarnings.length) : 0}/job</span>
          </div>
        </div>

        {/* Earnings History */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1">Transaction History</h3>
          <div className="rounded-2xl bg-slate-900 border border-slate-800 divide-y divide-slate-800/60 overflow-hidden">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 animate-pulse bg-slate-800/50" />)
            ) : filteredEarnings.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-400">No earnings in this period</p>
            ) : (
              filteredEarnings.map((e) => (
                <div key={e.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-white block">{e.service_name}</span>
                    <span className="text-[9px] text-slate-400">{new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-400">+₹{e.amount}</span>
                    <span className={`text-[9px] block capitalize ${statusColors[e.status]}`}>{e.status.replace("_", " ")}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payout Info */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <h4 className="text-xs font-bold text-white">Payout Schedule</h4>
          <div className="space-y-1.5 text-[10px] text-slate-400">
            <p>• Earnings are settled weekly every Monday</p>
            <p>• Platform fee: 15% of service charge</p>
            <p>• Minimum payout: ₹100</p>
            <p>• Payouts via UPI/bank transfer</p>
          </div>
        </div>
      </main>
    </div>
  );
}
