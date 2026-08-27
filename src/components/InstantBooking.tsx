"use client";

import { Zap, Clock, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface InstantBookingProps {
  serviceName?: string;
  serviceId?: string;
}

export function InstantBooking({ serviceName, serviceId }: InstantBookingProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 p-[1px]">
      <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Instant Booking</h3>
            <p className="text-[10px] text-slate-400">Priority matching • 30-min arrival</p>
          </div>
          <span className="ml-auto px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/20">
            +₹99
          </span>
        </div>

        <div className="flex items-center gap-4 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-emerald-500" /> 30-min arrival</span>
          <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-blue-500" /> Top-rated pro</span>
          <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500" /> Priority queue</span>
        </div>

        <Link
          href={`/book${serviceId ? `?service=${serviceId}` : ""}`}
          className="block w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-xs text-center hover:from-rose-600 hover:to-amber-600 transition-all shadow-lg shadow-rose-500/20"
        >
          Book Instantly →
        </Link>
      </div>
    </div>
  );
}
