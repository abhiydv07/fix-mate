"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { TrendingUp, Calendar, Wallet, ArrowUpRight } from "lucide-react";

interface EarningsData {
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
  completedJobs: number;
  pendingPayout: number;
}

export function ProviderEarnings() {
  const [earnings, setEarnings] = useState<EarningsData>({ today: 0, thisWeek: 0, thisMonth: 0, total: 0, completedJobs: 0, pendingPayout: 0 });
  const [period, setPeriod] = useState<"today" | "week" | "month">("today");
  const supabase = createClient();

  useEffect(() => { loadEarnings(); }, []);

  async function loadEarnings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: bookings } = await supabase
      .from("bookings")
      .select("price, status, created_at")
      .eq("provider_id", user.id)
      .eq("status", "completed");

    if (!bookings) return;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let today = 0, thisWeek = 0, thisMonth = 0, total = 0;

    bookings.forEach((b) => {
      const d = new Date(b.created_at);
      const amount = b.price * 0.8; // 80% provider share
      total += amount;
      if (d >= todayStart) today += amount;
      if (d >= weekStart) thisWeek += amount;
      if (d >= monthStart) thisMonth += amount;
    });

    setEarnings({
      today, thisWeek, thisMonth, total,
      completedJobs: bookings.length,
      pendingPayout: total * 0.1, // simplified
    });
  }

  const displayAmount = period === "today" ? earnings.today : period === "week" ? earnings.thisWeek : earnings.thisMonth;

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Today", amount: earnings.today, icon: "💰", color: "from-emerald-500 to-emerald-600" },
          { label: "This Week", amount: earnings.thisWeek, icon: "📊", color: "from-blue-500 to-blue-600" },
          { label: "This Month", amount: earnings.thisMonth, icon: "📈", color: "from-purple-500 to-purple-600" },
        ].map((item) => (
          <div key={item.label} className={`p-4 rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg`}>
            <span className="text-lg">{item.icon}</span>
            <p className="text-xl font-black mt-1">₹{Math.round(item.amount)}</p>
            <p className="text-[10px] font-semibold text-white/80">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-brand-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Completed Jobs</span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{earnings.completedJobs}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Pending Payout</span>
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">₹{Math.round(earnings.pendingPayout)}</p>
        </div>
      </div>
    </div>
  );
}
