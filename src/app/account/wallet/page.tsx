"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft, Gift, TrendingUp, CreditCard, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Transaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  date: string;
}

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addAmount, setAddAmount] = useState("");
  const [showAddMoney, setShowAddMoney] = useState(false);
  const supabase = createClient();

  useEffect(() => { loadWallet(); }, []);

  async function loadWallet() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsLoading(false); return; }

    // Calculate from payments
    const { data: payments } = await supabase
      .from("payments")
      .select("id, amount, status, created_at")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false });

    const txns: Transaction[] = [];
    let bal = 50; // Signup bonus

    // Add signup bonus
    txns.push({ id: "bonus", type: "credit", amount: 50, description: "Signup bonus", date: user.created_at });

    if (payments) {
      payments.forEach((p) => {
        if (p.status === "completed") {
          txns.push({ id: p.id, type: "debit", amount: p.amount || 0, description: "Service payment", date: p.created_at });
          bal -= p.amount || 0;
        }
      });
    }

    // Add referral bonus
    txns.push({ id: "referral", type: "credit", amount: 50, description: "Referral bonus", date: new Date().toISOString() });
    bal += 50;

    setBalance(bal);
    setTransactions(txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setIsLoading(false);
  }

  const quickAmounts = [100, 200, 500, 1000];

  async function handleAddMoney() {
    const amt = parseInt(addAmount);
    if (!amt || amt < 10) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Record as a wallet credit
    await supabase.from("notifications").insert({
      user_id: user.id,
      title: `₹${amt} Added to Wallet`,
      body: `Your wallet has been credited with ₹${amt} via UPI.`,
    });

    // Add credit transaction to the list
    setTransactions((prev) => [
      { id: `wallet-${Date.now()}`, type: "credit" as const, amount: amt, description: "Wallet top-up via UPI", date: new Date().toISOString() },
      ...prev,
    ]);
    setBalance((prev) => prev + amt);
    setAddAmount("");
    setShowAddMoney(false);
  }

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 bg-slate-950 text-slate-100 pb-20 md:pb-8">
      <header className="flex items-center justify-between py-2 border-b border-slate-800/80 mb-6">
        <Link href="/account" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200">
          <ArrowLeft className="w-4 h-4" /> Account
        </Link>
        <span className="font-bold text-sm text-white">My Wallet</span>
        <div />
      </header>

      <main className="max-w-lg mx-auto w-full flex-1 space-y-5">
        {/* Balance Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-900/30 via-slate-900 to-slate-900 border border-amber-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400/80">Wallet Balance</span>
              <h1 className="text-3xl font-black text-white mt-1">₹{balance}</h1>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center">
              <WalletIcon className="w-6 h-6 text-amber-400" />
            </div>
          </div>

          <button
            onClick={() => setShowAddMoney(!showAddMoney)}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Money
          </button>

          {showAddMoney && (
            <div className="space-y-3 pt-2 border-t border-amber-500/20">
              <div className="flex gap-2">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAddAmount(amt.toString())}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${
                      addAmount === amt.toString() ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-300 border border-slate-700"
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  placeholder="Custom amount"
                  type="number"
                  className="flex-1 px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
                />
                <button onClick={handleAddMoney} className="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold">Add</button>
              </div>
              <p className="text-[9px] text-slate-500">UPI, Cards, Net Banking accepted</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <TrendingUp className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <span className="text-xs font-bold text-white block">₹100</span>
            <span className="text-[9px] text-slate-400">Total Earned</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <CreditCard className="w-4 h-4 text-brand-400 mx-auto mb-1" />
            <span className="text-xs font-bold text-white block">₹0</span>
            <span className="text-[9px] text-slate-400">Total Spent</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <Gift className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <span className="text-xs font-bold text-white block">₹50</span>
            <span className="text-[9px] text-slate-400">Referral</span>
          </div>
        </div>

        {/* Transactions */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1">Transaction History</h3>
          <div className="rounded-2xl bg-slate-900 border border-slate-800 divide-y divide-slate-800/60 overflow-hidden">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 animate-pulse bg-slate-800/50" />)
            ) : transactions.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-400">No transactions yet</p>
            ) : (
              transactions.map((txn) => (
                <div key={txn.id} className="flex items-center gap-3 px-4 py-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    txn.type === "credit" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                  }`}>
                    {txn.type === "credit" ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-white block">{txn.description}</span>
                    <span className="text-[9px] text-slate-400">{new Date(txn.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                  <span className={`text-xs font-bold ${txn.type === "credit" ? "text-emerald-400" : "text-rose-400"}`}>
                    {txn.type === "credit" ? "+" : "-"}₹{txn.amount}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Earn More */}
        <Link href="/account/referral" className="block p-4 rounded-2xl bg-gradient-to-r from-emerald-900/20 to-slate-900 border border-emerald-500/20 hover:border-emerald-500/30 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Gift className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-white">Earn More with Referrals</h4>
              <p className="text-[10px] text-slate-400">Invite friends and earn ₹100 per referral</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>
        </Link>
      </main>
    </div>
  );
}
