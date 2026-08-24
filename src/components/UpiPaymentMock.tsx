"use client";

import { useState } from "react";
import { Smartphone, CheckCircle2, QrCode } from "lucide-react";

interface UpiPaymentMockProps {
  onPaymentComplete: (amount: number) => void;
}

export function UpiPaymentMock({ onPaymentComplete }: UpiPaymentMockProps) {
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

  async function handlePay() {
    const amt = parseInt(amount);
    if (!amt || amt < 10) return;
    setIsProcessing(true);

    // Simulate UPI payment processing
    await new Promise((r) => setTimeout(r, 2000));

    setIsProcessing(false);
    setSuccess(true);
    onPaymentComplete(amt);

    setTimeout(() => {
      setSuccess(false);
      setAmount("");
      setUpiId("");
    }, 3000);
  }

  if (success) {
    return (
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
        <p className="text-xs font-bold text-emerald-400">₹{amount} Added Successfully!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Add Money via UPI</h4>

      {/* Quick Amounts */}
      <div className="grid grid-cols-3 gap-2">
        {quickAmounts.map((amt) => (
          <button
            key={amt}
            onClick={() => setAmount(String(amt))}
            className={`py-2 rounded-xl border text-xs font-bold transition-all ${
              amount === String(amt)
                ? "bg-brand-500/10 border-brand-500/30 text-brand-400"
                : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
            }`}
          >
            ₹{amt}
          </button>
        ))}
      </div>

      {/* Custom Amount */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          min="10"
          className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
        />
      </div>

      {/* UPI ID */}
      <div className="flex items-center gap-2">
        <Smartphone className="w-4 h-4 text-slate-500 shrink-0" />
        <input
          type="text"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          placeholder="your@upi or phone@upi"
          className="flex-1 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
        />
      </div>

      {/* Pay Button */}
      <button
        onClick={handlePay}
        disabled={!amount || parseInt(amount) < 10 || isProcessing}
        className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          "Processing UPI Payment..."
        ) : (
          <>
            <QrCode className="w-4 h-4" /> Pay ₹{amount || "0"} via UPI
          </>
        )}
      </button>

      <p className="text-[9px] text-slate-500 text-center">
        This is a simulated UPI payment. In production, integrate Razorpay/Cashfree.
      </p>
    </div>
  );
}
