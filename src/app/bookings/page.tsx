"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  Navigation,
  Play,
  XCircle,
} from "lucide-react";

interface BookingWithService {
  id: string;
  customer_id: string;
  provider_id: string | null;
  service_id: string;
  address_id: string;
  status: "pending" | "assigned" | "on_the_way" | "in_progress" | "completed" | "cancelled";
  scheduled_at: string;
  price: number;
  created_at: string;
  services?: { name: string; description: string; base_price: number } | null;
  provider?: { name: string; avatar_url: string | null } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  pending: {
    label: "Pending",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    icon: <AlertCircle className="w-3 h-3" />,
  },
  assigned: {
    label: "Pro Assigned",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  on_the_way: {
    label: "On The Way",
    color: "text-brand-400",
    bg: "bg-brand-500/10",
    border: "border-brand-500/20",
    icon: <Navigation className="w-3 h-3" />,
  },
  in_progress: {
    label: "In Progress",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    icon: <Play className="w-3 h-3" />,
  },
  completed: {
    label: "Completed",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
    icon: <XCircle className="w-3 h-3" />,
  },
};

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<BookingWithService[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"active" | "completed" | "cancelled">("active");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/bookings");
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error("Load bookings error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setCancellingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (res.ok) {
        loadBookings();
      }
    } catch (err) {
      console.error("Cancel error:", err);
    } finally {
      setCancellingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "active") return ["pending", "assigned", "on_the_way", "in_progress"].includes(b.status);
    if (activeTab === "completed") return b.status === "completed";
    return b.status === "cancelled";
  });

  const activeCount = bookings.filter((b) => ["pending", "assigned", "on_the_way", "in_progress"].includes(b.status)).length;
  const completedCount = bookings.filter((b) => b.status === "completed").length;

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

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-slate-900 border border-slate-800">
          {[
            { key: "active", label: "Active", count: activeCount },
            { key: "completed", label: "Completed", count: completedCount },
            { key: "cancelled", label: "Cancelled", count: bookings.filter((b) => b.status === "cancelled").length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as "active" | "completed" | "cancelled")}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === tab.key
                  ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key ? "bg-white/20" : "bg-slate-800"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse h-28" />
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
            <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-300">
                No {activeTab} bookings
              </h3>
              <p className="text-xs text-slate-500">
                {activeTab === "active"
                  ? "Book trusted local professionals for home repairs."
                  : "Your completed bookings will appear here."}
              </p>
            </div>
            {activeTab === "active" && (
              <Link href="/">
                <span className="inline-block px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20">
                  Explore Services
                </span>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBookings.map((item) => {
              const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
              const serviceName = item.services?.name || "Home Service";
              const providerName = item.provider?.name || null;
              const canCancel = ["pending", "assigned"].includes(item.status);

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-brand-500/30 transition-all space-y-3 shadow-md"
                >
                  {/* Top: Booking ID + Status + Price */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">
                          Booking #{item.id.slice(0, 8)}
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.color} border ${statusCfg.border} flex items-center gap-1`}>
                          {statusCfg.icon}
                          {statusCfg.label}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-white">{serviceName}</h3>
                      {providerName && (
                        <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          {providerName}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-emerald-400">₹{item.price}</span>
                      <p className="text-[10px] text-slate-400">Pay on Work</p>
                    </div>
                  </div>

                  {/* Date + Time */}
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-brand-400" />
                    {new Date(item.scheduled_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })} @{" "}
                    {new Date(item.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <div className="flex items-center gap-2">
                      {canCancel && (
                        <button
                          onClick={() => handleCancel(item.id)}
                          disabled={cancellingId === item.id}
                          className="px-3 py-1.5 rounded-xl text-[11px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-colors disabled:opacity-50"
                        >
                          {cancellingId === item.id ? "Cancelling..." : "Cancel"}
                        </button>
                      )}
                    </div>

                    <Link
                      href={`/orders/${item.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-semibold text-brand-400 bg-brand-500/10 border border-brand-500/20 hover:bg-brand-500/20 transition-colors"
                    >
                      Live Tracking <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
