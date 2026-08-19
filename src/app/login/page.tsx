"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Wrench, ShieldCheck, Mail, Lock, ArrowRight, Chrome, UserCheck, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"customer" | "provider">("customer");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Google login failed. Ensure Supabase credentials are set.",
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
      // Try signing in first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // If user does not exist, attempt signup
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: role,
            },
          },
        });

        if (signUpError) throw signUpError;

        setMessage({
          type: "success",
          text: "Account created! Check your email to confirm your account.",
        });
      } else {
        window.location.href = "/";
      }
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Authentication failed.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 md:p-8 bg-slate-950">
      {/* Top Header */}
      <header className="flex items-center justify-between py-2">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
            <Wrench className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-white">Fix Mate</span>
        </Link>
        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Secure SSL
        </span>
      </header>

      {/* Center Auth Card */}
      <div className="max-w-sm mx-auto w-full space-y-6 my-auto">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-100">
            Welcome to Fix Mate
          </h2>
          <p className="text-xs text-slate-400">
            Sign in to book services or manage local service requests
          </p>
        </div>

        {/* Role Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            type="button"
            onClick={() => setRole("customer")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              role === "customer"
                ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Book Services
          </button>
          <button
            type="button"
            onClick={() => setRole("provider")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              role === "provider"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Service Pro
          </button>
        </div>

        {/* Google OAuth Button */}
        <Button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          variant="outline"
          className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200 text-xs"
        >
          <Chrome className="w-4 h-4 text-emerald-400" />
          Continue with Google
        </Button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full"></div>
          <span className="bg-slate-950 px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            OR
          </span>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`p-3 rounded-xl text-xs ${
              message.type === "success"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 text-xs flex items-center justify-center gap-2"
          >
            {isLoading ? "Authenticating..." : "Sign In / Register"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-[11px] text-slate-500">
        By continuing, you agree to Fix Mate Terms of Service & Privacy Policy.
      </footer>
    </div>
  );
}
