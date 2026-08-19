"use client";

import Image from "next/image";
import Link from "next/link";
import { Wrench, MapPin, User, LogIn, ShieldCheck } from "lucide-react";

interface HeaderProps {
  userRole?: string;
  userName?: string;
  avatarUrl?: string;
}

export function Header({ userRole = "customer", userName, avatarUrl }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/90 border-b border-slate-800/80 px-4 md:px-8 py-3.5 flex items-center justify-between">
      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-2.5 group">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
          <Wrench className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-none bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Fix Mate
          </h1>
          <p className="text-[10px] text-slate-400 font-medium">Home Services Marketplace</p>
        </div>
      </Link>

      {/* Center Location Selector (Desktop/Tablet) */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
        <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
        <span>Location: <strong className="text-slate-100">Indiranagar, Bengaluru</strong></span>
      </div>

      {/* Right Navigation & Auth Actions */}
      <div className="flex items-center gap-3">
        <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          Pay on Work
        </span>

        {userName ? (
          <Link
            href={userRole === "provider" || userRole === "admin" ? "/dashboard" : "/profile"}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            {avatarUrl ? (
              <Image src={avatarUrl} alt={userName} width={24} height={24} className="w-6 h-6 rounded-lg object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-xs font-semibold text-slate-200 hidden sm:inline">{userName}</span>
          </Link>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs transition-colors shadow-md shadow-brand-500/20"
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
