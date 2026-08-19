"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Clock, MapPin, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { getUserBookings, BookingItem } from "@/lib/bookings";

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    setIsLoading(true);
    const data = await getUserBookings();
    setBookings(data);
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 md:p-8 bg-slate-950 text-slate-100 pb-20 md:pb-8">
      {/* Header */}
      <header className="flex items-center justify-between py-2 border-b border-slate-800/80 mb-6">
        <Link href="/" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200">
          ← Home
        </Link>
        <span className="font-bold text-sm text-white">My Service Orders</span>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Pay on Work
        </span>
      </header>

      <main className="max-w-3xl mx-auto w-full flex-1 space-y-6">
        <div className="space-y-1">
          <h1 className="text-xl font-extrabold text-white">Your Bookings & Trackings</h1>
          <p className="text-xs text-slate-400">View live status updates and booking history</p>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500 animate-pulse">
            Loading your bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
            <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-300">No active bookings found</h3>
              <p className="text-xs text-slate-500">Book trusted local professionals for home repairs.</p>
            </div>
            <Link href="/">
              <span className="inline-block px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20">
                Explore Services
              </span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((item) => (
              <Link
                key={item.id}
                href={`/orders/${item.id}`}
                className="group p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-brand-500/40 transition-all flex flex-col space-y-3 shadow-md hover:bg-slate-900"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">
                      Booking #{item.id.slice(0, 8)}
                    </span>
                    <h3 className="font-bold text-sm text-white group-hover:text-brand-300 transition-colors mt-0.5">
                      On-Demand Home Service
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-emerald-400">₹{item.price}</span>
                    <p className="text-[10px] text-slate-400">Pay on Work</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-brand-400" />
                    {new Date(item.scheduled_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })} @ {new Date(item.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>

                  <span className="flex items-center gap-1 font-semibold text-slate-200 group-hover:translate-x-0.5 transition-transform">
                    Live Tracking <ArrowRight className="w-3.5 h-3.5 text-brand-400" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
