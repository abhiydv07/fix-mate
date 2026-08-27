"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Package, Clock, CheckCircle2, XCircle, Filter, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Booking {
  id: string;
  service_name: string;
  status: string;
  price: number;
  scheduled_at: string;
  created_at: string;
  provider_name?: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Package }> = {
  pending: { label: "Pending", color: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: Clock },
  accepted: { label: "Accepted", color: "text-blue-400 bg-blue-500/10 border-blue-500/20", icon: CheckCircle2 },
  on_the_way: { label: "On The Way", color: "text-brand-400 bg-brand-500/10 border-brand-500/20", icon: Package },
  in_progress: { label: "In Progress", color: "text-brand-400 bg-brand-500/10 border-brand-500/20", icon: Package },
  completed: { label: "Completed", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "text-rose-400 bg-rose-500/10 border-rose-500/20", icon: XCircle },
};

type FilterType = "all" | "active" | "completed" | "cancelled";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => { loadBookings(); }, []);

  async function loadBookings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsLoading(false); return; }

    const { data } = await supabase
      .from("bookings")
      .select("id, status, price, scheduled_at, created_at, provider_id")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      const serviceIds = [...new Set(data.map(() => data.find(() => true)?.id))];
      // Get service names via service_id
      const { data: bookingsWithService } = await supabase
        .from("bookings")
        .select("id, service_id, status, price, scheduled_at, created_at, provider_id")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      const svcIds = [...new Set((bookingsWithService || []).map(b => b.service_id).filter(Boolean))];
      const providerIds = [...new Set((bookingsWithService || []).map(b => b.provider_id).filter(Boolean))];

      const [svcRes, provRes] = await Promise.all([
        supabase.from("services").select("id, name").in("id", svcIds),
        supabase.from("profiles").select("id, name").in("id", providerIds),
      ]);

      const svcMap = new Map(svcRes.data?.map(s => [s.id, s.name]) || []);
      const provMap = new Map(provRes.data?.map(p => [p.id, p.name]) || []);

      setBookings((bookingsWithService || []).map(b => ({
        id: b.id,
        service_name: svcMap.get(b.service_id) || "Service",
        status: b.status,
        price: b.price || 0,
        scheduled_at: b.scheduled_at,
        created_at: b.created_at,
        provider_name: provMap.get(b.provider_id) || undefined,
      })));
    }
    setIsLoading(false);
  }

  const filtered = bookings.filter((b) => {
    if (filter === "active") return ["pending", "assigned", "on_the_way", "in_progress"].includes(b.status);
    if (filter === "completed") return b.status === "completed";
    if (filter === "cancelled") return b.status === "cancelled";
    return true;
  });

  const filterCounts = {
    all: bookings.length,
    active: bookings.filter((b) => ["pending", "assigned", "on_the_way", "in_progress"].includes(b.status)).length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 bg-slate-950 text-slate-100 pb-20 md:pb-8">
      <header className="flex items-center justify-between py-2 border-b border-slate-800/80 mb-6">
        <Link href="/account" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200">
          <ArrowLeft className="w-4 h-4" /> Account
        </Link>
        <span className="font-bold text-sm text-white">My Bookings</span>
        <span className="text-xs text-slate-500">{bookings.length} total</span>
      </header>

      <main className="max-w-2xl mx-auto w-full flex-1 space-y-5">
        {/* Filter Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
          {(["all", "active", "completed", "cancelled"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all capitalize ${
                filter === f ? "bg-brand-500 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {f} ({filterCounts[f]})
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-slate-900 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Package className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-300">No {filter === "all" ? "" : filter} bookings</p>
            <Link href="/services" className="text-xs text-brand-400 hover:underline">Browse Services</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((booking) => {
              const cfg = statusConfig[booking.status] || statusConfig.pending;
              const StatusIcon = cfg.icon;
              return (
                <Link
                  key={booking.id}
                  href={`/orders/${booking.id}`}
                  className="block p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-brand-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{booking.service_name}</span>
                        <span className="text-xs font-bold text-white">₹{booking.price}</span>
                      </div>
                      {booking.provider_name && (
                        <p className="text-[10px] text-slate-400 mt-0.5">Pro: {booking.provider_name}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${cfg.color} flex items-center gap-1`}>
                          <StatusIcon className="w-2.5 h-2.5" /> {cfg.label}
                        </span>
                        <span className="text-[9px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(booking.scheduled_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 shrink-0 mt-2" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
