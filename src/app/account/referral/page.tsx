"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Gift, Share2, Copy, CheckCircle2, Users, Wallet, TrendingUp, MessageCircle } from "lucide-react";

export default function ReferralPage() {
  const [copied, setCopied] = useState(false);
  const referralCode = "FIXMATE-ABHI2026";
  const referralLink = `https://fixmate.in/ref/${referralCode}`;
  const [referralStats] = useState({ totalReferrals: 2, totalEarned: 200, pendingRewards: 100 });

  function copyCode() {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 bg-slate-950 text-slate-100 pb-20 md:pb-8">
      <header className="flex items-center justify-between py-2 border-b border-slate-800/80 mb-6">
        <Link href="/account" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200">
          <ArrowLeft className="w-4 h-4" /> Account
        </Link>
        <span className="font-bold text-sm text-white">Refer & Earn</span>
        <div />
      </header>

      <main className="max-w-lg mx-auto w-full flex-1 space-y-5">
        {/* Hero Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-900/30 via-slate-900 to-slate-900 border border-emerald-500/20 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto">
            <Gift className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white">Invite Friends, Earn ₹100</h2>
            <p className="text-xs text-slate-400 mt-1">Both you and your friend get ₹100 wallet credit</p>
          </div>

          {/* Referral Code */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700 flex items-center justify-between">
            <span className="text-sm font-mono font-bold text-emerald-400">{referralCode}</span>
            <button onClick={copyCode} className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[10px] font-bold flex items-center gap-1 transition-colors">
              {copied ? <><CheckCircle2 className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
            </button>
          </div>

          {/* Share Buttons */}
          <div className="flex gap-2 justify-center">
            <a href={`https://wa.me/?text=${encodeURIComponent(`Join Fix Mate using my referral code and we both get ₹100! Code: ${referralCode}\nLink: ${referralLink}`)}`} target="_blank" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition-colors">
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </a>
            <button onClick={copyCode} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold transition-colors">
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>
        </div>

        {/* How It Works */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-white">How It Works</h3>
          <div className="space-y-2">
            {[
              { step: "1", title: "Share your code", desc: "Send your referral code to friends via WhatsApp, SMS, or any app" },
              { step: "2", title: "Friend signs up", desc: "They register on Fix Mate using your referral code" },
              { step: "3", title: "Both earn ₹100", desc: "₹100 credit added to both your wallets after their first booking" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-bold text-sm flex items-center justify-center shrink-0">
                  {item.step}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{item.title}</h4>
                  <p className="text-[10px] text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <Users className="w-4 h-4 text-brand-400 mx-auto mb-1" />
            <span className="text-sm font-bold text-white block">{referralStats.totalReferrals}</span>
            <span className="text-[9px] text-slate-400">Referred</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <Wallet className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <span className="text-sm font-bold text-amber-400 block">₹{referralStats.totalEarned}</span>
            <span className="text-[9px] text-slate-400">Earned</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <TrendingUp className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <span className="text-sm font-bold text-emerald-400 block">₹{referralStats.pendingRewards}</span>
            <span className="text-[9px] text-slate-400">Pending</span>
          </div>
        </div>

        {/* Referral History */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1">Referral History</h3>
          <div className="rounded-2xl bg-slate-900 border border-slate-800 divide-y divide-slate-800/60 overflow-hidden">
            {[
              { name: "Rahul K.", status: "completed", amount: 100, date: "Aug 20, 2026" },
              { name: "Priya S.", status: "pending", amount: 100, date: "Aug 22, 2026" },
            ].map((ref, idx) => (
              <div key={idx} className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-9 h-9 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-xs">
                  {ref.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold text-white block">{ref.name}</span>
                  <span className="text-[9px] text-slate-400">{ref.date}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-400">+₹{ref.amount}</span>
                  <span className={`text-[9px] block ${ref.status === "completed" ? "text-emerald-400" : "text-amber-400"}`}>
                    {ref.status === "completed" ? "Credited" : "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Terms */}
        <p className="text-[9px] text-slate-600 text-center">
          Referral credits are added after the referred user completes their first booking. Max 50 referrals per user.
        </p>
      </main>
    </div>
  );
}
