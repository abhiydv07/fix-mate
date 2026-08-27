"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  ShieldCheck, Mail, Lock, ArrowRight,
  Eye, EyeOff, Zap, Clock, Star, Wrench,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { PhoneAuth } from "@/components/PhoneAuth";

function FloatingOrb({ delay, size, x, y }: { delay: string; size: string; x: string; y: string }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl opacity-20 animate-float`}
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        background: "linear-gradient(135deg, #f59e0b, #3b82f6)",
        animationDelay: delay,
        animationDuration: "8s",
      }}
    />
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  const supabase = createClient();

  // Read redirectTo from URL query params (e.g. /login?redirectTo=/book/abc)
  const getRedirectTo = () => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("redirectTo") || "/";
    }
    return "/";
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const redirectTo = getRedirectTo();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}` },
      });
      if (error) throw error;
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Google login failed. Try again.",
      });
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setMessage(null);

    try {
      const redirectTo = getRedirectTo();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        setMessage({ type: "success", text: "Account created! Check your email to confirm." });
      } else {
        window.location.href = redirectTo;
      }
    } catch (err: unknown) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Authentication failed." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Global animation keyframes */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.3); }
          50% { box-shadow: 0 0 40px rgba(245, 158, 11, 0.6), 0 0 60px rgba(59, 130, 246, 0.2); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-float { animation: float 8s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 12s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .animate-shimmer {
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%);
          background-size: 200% 100%;
          animation: shimmer 3s ease-in-out infinite;
        }
        .animate-slide-up { animation: slide-up 0.6s ease-out both; }
        .animate-slide-up-1 { animation: slide-up 0.6s ease-out 0.1s both; }
        .animate-slide-up-2 { animation: slide-up 0.6s ease-out 0.2s both; }
        .animate-slide-up-3 { animation: slide-up 0.6s ease-out 0.3s both; }
        .animate-slide-up-4 { animation: slide-up 0.6s ease-out 0.4s both; }
        .animate-slide-up-5 { animation: slide-up 0.6s ease-out 0.5s both; }
        .animate-slide-in-right { animation: slide-in-right 0.8s ease-out 0.3s both; }
        .animate-scale-in { animation: scale-in 0.5s ease-out 0.2s both; }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 6s ease infinite;
        }
      `}</style>

      <div className="min-h-screen flex bg-slate-950 overflow-hidden">
        {/* ═══ LEFT SIDE — Animated Branding ═══ */}
        <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden items-center justify-center p-12">
          {/* Animated gradient background */}
          <div
            className="absolute inset-0 animate-gradient"
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 25%, #1e40af 50%, #3b82f6 75%, #1e3a5f 100%)",
              backgroundSize: "200% 200%",
            }}
          />

          {/* Hero image */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=1200&q=80&auto=format&fit=crop"
              alt="Professional technician at work"
              className="w-full h-full object-cover opacity-30"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/60" />
          </div>

          {/* Floating orbs */}
          <FloatingOrb delay="0s" size="200px" x="10%" y="15%" />
          <FloatingOrb delay="2s" size="150px" x="70%" y="60%" />
          <FloatingOrb delay="4s" size="180px" x="40%" y="80%" />
          <FloatingOrb delay="1s" size="120px" x="80%" y="20%" />

          {/* Floating icons */}
          <div className="absolute top-[15%] left-[10%] animate-float" style={{ animationDelay: "0s" }}>
            <div className="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center rotate-12">
              <Wrench className="w-7 h-7 text-amber-400" />
            </div>
          </div>
          <div className="absolute top-[25%] right-[15%] animate-float-slow" style={{ animationDelay: "1s" }}>
            <div className="w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center -rotate-6">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div className="absolute bottom-[25%] left-[15%] animate-float" style={{ animationDelay: "2s" }}>
            <div className="w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center rotate-6">
              <Star className="w-5 h-5 text-amber-300" />
            </div>
          </div>
          <div className="absolute bottom-[35%] right-[10%] animate-float-slow" style={{ animationDelay: "3s" }}>
            <div className="w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center -rotate-12">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
          </div>

          {/* Main content */}
          <div className="relative z-10 max-w-lg space-y-10">
            {/* Logo */}
            <div className={`${mounted ? "animate-slide-up" : "opacity-0"}`}>
              <Logo size={48} />
            </div>

            {/* Headline */}
            <div className={`space-y-3 ${mounted ? "animate-slide-up-1" : "opacity-0"}`}>
              <h2 className="text-5xl font-black text-white leading-[1.1] tracking-tight">
                Book Trusted
                <br />
                <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                  Home Professionals.
                </span>
              </h2>
              <p className="text-base text-white/50 max-w-md leading-relaxed">
                Zero upfront payment. Verified pros. 30-day guarantee.
                <br />
                Noida & Greater Noida&apos;s most trusted service platform.
              </p>
            </div>

            {/* Trust points */}
            <div className={`space-y-4 ${mounted ? "animate-slide-up-2" : "opacity-0"}`}>
              {[
                { icon: ShieldCheck, text: "Pay only after work is done", color: "text-emerald-400" },
                { icon: Zap, text: "Verified & background-checked pros", color: "text-amber-400" },
                { icon: Clock, text: "30-minute average response time", color: "text-blue-400" },
                { icon: Star, text: "30-day service guarantee", color: "text-purple-400" },
              ].map((item, i) => (
                <div
                  key={item.text}
                  className={`flex items-center gap-4 group ${mounted ? `animate-slide-up-${i + 2}` : "opacity-0"}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-white/10 border border-white/10 flex items-center justify-center shrink-0 transition-all duration-300">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <span className="text-sm text-white/70 font-medium group-hover:text-white/90 transition-colors">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className={`flex items-center gap-8 pt-4 ${mounted ? "animate-slide-up-3" : "opacity-0"}`}>
              {[
                { num: "12,500+", label: "Bookings" },
                { num: "180+", label: "Verified Pros" },
                { num: "4.8★", label: "Rating" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-xl font-black text-white">{s.num}</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ RIGHT SIDE — Auth Form ═══ */}
        <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-14 relative">
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative z-10 max-w-sm w-full mx-auto space-y-7">
            {/* Mobile-only logo */}
            <div className={`lg:hidden mb-4 ${mounted ? "animate-scale-in" : "opacity-0"}`}>
              <Link href="/">
                <Logo size={36} />
              </Link>
            </div>

            {/* Back to home */}
            <div className={`${mounted ? "animate-slide-up" : "opacity-0"}`}>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                ← Back to home
              </Link>
            </div>

            {/* Heading */}
            <div className={`space-y-2 ${mounted ? "animate-slide-up-1" : "opacity-0"}`}>
              <h2 className="text-3xl font-extrabold tracking-tight text-white">
                Welcome back
              </h2>
              <p className="text-sm text-slate-400">
                Sign in to book services or manage your account
              </p>
            </div>

            {/* Google OAuth */}
            <div className={`${mounted ? "animate-slide-up-2" : "opacity-0"}`}>
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 text-slate-200 text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/50 active:scale-[0.98]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
            </div>

          {/* Phone OTP */}
          <div className={`${mounted ? "animate-slide-up-2" : "opacity-0"}`}>
            <PhoneAuth />
          </div>

          {/* Divider */}
          <div className={`relative flex items-center justify-center ${mounted ? "animate-slide-up-2" : "opacity-0"}`}>
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-950 px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              or sign in with email
            </span>
          </div>

            {/* Message */}
            {message && (
              <div
                className={`p-3 rounded-xl text-xs font-medium animate-slide-up ${
                  message.type === "success"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className={`space-y-1.5 ${mounted ? "animate-slide-up-3" : "opacity-0"}`}>
                <label className="text-xs font-semibold text-slate-300">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all duration-300"
                  />
                </div>
              </div>

              <div className={`space-y-1.5 ${mounted ? "animate-slide-up-4" : "opacity-0"}`}>
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className={`${mounted ? "animate-slide-up-5" : "opacity-0"}`}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 disabled:opacity-50 active:scale-[0.98] animate-pulse-glow"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Footer */}
            <p className={`text-center text-[11px] text-slate-500 pt-1 ${mounted ? "animate-slide-up-5" : "opacity-0"}`}>
              By continuing, you agree to our{" "}
              <Link href="/terms" className="text-slate-400 hover:text-brand-400 underline transition-colors">
                Terms
              </Link>{" "}
              &{" "}
              <Link href="/privacy" className="text-slate-400 hover:text-brand-400 underline transition-colors">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
