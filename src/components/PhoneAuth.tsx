"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Phone, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";

interface PhoneAuthProps {
  onSuccess?: () => void;
}

export function PhoneAuth({ onSuccess }: PhoneAuthProps) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  const supabase = createClient();

  async function handleSendOTP() {
    if (!phone || phone.length < 10) {
      setError("Enter a valid 10-digit phone number");
      return;
    }
    setIsLoading(true);
    setError("");

    const formatted = phone.startsWith("+91") ? phone : `+91${phone}`;

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: formatted,
      });
      if (otpError) throw otpError;
      setStep("otp");
      setCountdown(30);
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) { clearInterval(timer); return 0; }
          return c - 1;
        });
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyOTP() {
    if (!otp || otp.length !== 6) {
      setError("Enter the 6-digit OTP");
      return;
    }
    setIsLoading(true);
    setError("");

    const formatted = phone.startsWith("+91") ? phone : `+91${phone}`;

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone: formatted,
        token: otp,
        type: "sms",
      });
      if (verifyError) throw verifyError;
      onSuccess?.();
      window.location.href = "/";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {step === "phone" ? (
        <>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Phone Number</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-semibold">+91</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setError(""); }}
                placeholder="98765 43210"
                className="w-full pl-14 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
            </div>
          </div>
          <button
            onClick={handleSendOTP}
            disabled={isLoading || phone.length < 10}
            className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Phone className="w-4 h-4" /> Send OTP</>}
          </button>
        </>
      ) : (
        <>
          <div className="text-center space-y-1">
            <p className="text-xs text-slate-400">OTP sent to <strong className="text-slate-200">+91 {phone}</strong></p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Enter 6-digit OTP</label>
            <input
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all text-center tracking-[0.5em] font-mono"
              autoFocus
            />
          </div>
          <button
            onClick={handleVerifyOTP}
            disabled={isLoading || otp.length !== 6}
            className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShieldCheck className="w-4 h-4" /> Verify & Sign In</>}
          </button>
          <button
            onClick={() => { setStep("phone"); setOtp(""); }}
            className="w-full text-center text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Change phone number
          </button>
          {countdown > 0 ? (
            <p className="text-center text-[11px] text-slate-500">Resend OTP in {countdown}s</p>
          ) : (
            <button onClick={handleSendOTP} className="w-full text-center text-xs text-brand-400 hover:text-brand-300 transition-colors">
              Resend OTP
            </button>
          )}
        </>
      )}
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 text-center">{error}</div>
      )}
    </div>
  );
}
