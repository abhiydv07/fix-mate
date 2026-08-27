"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  MapPin,
  CheckCircle2,
  Navigation,
  Play,
  ShieldCheck,
  Zap,
  PhoneCall,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { BookingChatPanel } from "@/components/BookingChatPanel";
import { BookingReviewForm } from "@/components/BookingReviewForm";
import { DisputeFlagSection } from "@/components/DisputeFlagSection";
import { BookingActions } from "@/components/BookingActions";
import { InvoiceGenerator } from "@/components/InvoiceGenerator";
import { WarrantyClaimForm } from "@/components/WarrantyClaimForm";

// Dynamic import TrackingMap with ssr: false to prevent window errors during build
const TrackingMap = dynamic(() => import("@/components/TrackingMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-56 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xs text-slate-500 animate-pulse">
      Loading OpenStreetMap Realtime Canvas...
    </div>
  ),
});

interface OrderDetail {
  id: string;
  customer_id: string;
  provider_id: string | null;
  service_id: string;
  address_id: string;
  status: "pending" | "assigned" | "on_the_way" | "in_progress" | "completed" | "cancelled";
  scheduled_at: string;
  price: number;
  created_at: string;
  updated_at?: string;
  cancel_reason?: string | null;
  address_lat?: number | null;
  address_lng?: number | null;
}

export default function OrderTrackingPage({
  params,
}: {
  params: { bookingId: string };
}) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [providerLat, setProviderLat] = useState<number | null>(null);
  const [providerLng, setProviderLng] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const supabase = createClient();

  useEffect(() => {
    fetchOrder();

    // 1. Subscribe to Supabase Realtime updates on this specific booking row
    const bookingChannel = supabase
      .channel(`booking-${params.bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookings",
          filter: `id=eq.${params.bookingId}`,
        },
        (payload) => {
          console.log("⚡ Realtime Status Update received:", payload.new);
          setOrder(payload.new as OrderDetail);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bookingChannel);
    };
  }, [params.bookingId]);

  // Fetch address coordinates for the map destination
  useEffect(() => {
    if (!order?.address_id) return;
    fetchAddressCoords(order.address_id);
  }, [order?.address_id]);

  // 2. Subscribe to Supabase Realtime updates on provider_locations table when provider is assigned
  useEffect(() => {
    if (!order?.provider_id) return;

    fetchInitialProviderLocation(order.provider_id);

    const locationChannel = supabase
      .channel(`provider-location-${order.provider_id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "provider_locations",
          filter: `provider_id=eq.${order.provider_id}`,
        },
        (payload: { new: Record<string, unknown> }) => {
          const newLoc = payload.new;
          if (newLoc && typeof newLoc.lat === 'number' && typeof newLoc.lng === 'number') {
            console.log("⚡ Realtime Provider GPS Update:", newLoc.lat, newLoc.lng);
            setProviderLat(newLoc.lat);
            setProviderLng(newLoc.lng);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(locationChannel);
    };
  }, [order?.provider_id]);

  async function fetchOrder() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", params.bookingId)
        .single();

      if (!error && data) {
        setOrder(data as OrderDetail);
        // If booking has address_id, fetch coordinates
        if (data.address_id) {
          fetchAddressCoords(data.address_id);
        }
      }
    } catch (err) {
      console.error("Fetch order error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchAddressCoords(addressId: string) {
    try {
      const { data } = await supabase
        .from("addresses")
        .select("lat, lng")
        .eq("id", addressId)
        .single();

      if (data?.lat && data?.lng) {
        // Use address coordinates for the map
        setOrder((prev) => prev ? { ...prev, address_lat: data.lat, address_lng: data.lng } : prev);
      }
    } catch {
      // Fallback: use Noida coordinates
    }
  }

  async function fetchInitialProviderLocation(providerId: string) {
    try {
      // Use user-scoped client — RLS allows reading provider_locations
      const { data } = await supabase
        .from("provider_locations")
        .select("lat, lng")
        .eq("provider_id", providerId)
        .single();

      if (data) {
        setProviderLat(data.lat);
        setProviderLng(data.lng);
      }
    } catch {
      // Fallback: no location yet
    }
  }

  const steps = [
    { key: "pending", label: "Request Placed", desc: "Broadcasting to local pros" },
    { key: "assigned", label: "Pro Assigned", desc: "Service partner confirmed" },
    { key: "on_the_way", label: "On The Way", desc: "Pro is travelling to location" },
    { key: "in_progress", label: "Work In Progress", desc: "Service being performed" },
    { key: "completed", label: "Completed", desc: "Work verified & payment collected" },
  ];

  const isCancelled = order?.status === "cancelled";

  const getStepIndex = (status: string) => {
    const idx = steps.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  const currentStepIndex = order ? getStepIndex(order.status) : 0;

  const statusConfig: Record<string, { color: string; bg: string; icon: string; label: string }> = {
    pending: { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: "⏳", label: "Pending" },
    assigned: { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: "👨‍🔧", label: "Assigned" },
    on_the_way: { color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", icon: "🚗", label: "On The Way" },
    in_progress: { color: "text-brand-400", bg: "bg-brand-500/10 border-brand-500/20", icon: "🛠️", label: "In Progress" },
    completed: { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: "✅", label: "Completed" },
    cancelled: { color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20", icon: "🚫", label: "Cancelled" },
  };

  const currentStatus = order ? statusConfig[order.status] || statusConfig.pending : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 md:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-2xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          <Link href="/bookings" className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-500 transition-colors">
            <ArrowLeft className="w-4 h-4" /> My Bookings
          </Link>
          <span className="font-bold text-sm text-slate-900 dark:text-white">Live Tracking</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold">LIVE</span>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 md:px-8 pt-6 space-y-5">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-56 rounded-3xl bg-slate-200 dark:bg-slate-900 animate-pulse" />
            <div className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-900 animate-pulse" />
            <div className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-900 animate-pulse" />
          </div>
        ) : !order ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-slate-200 dark:bg-slate-900 flex items-center justify-center mx-auto text-4xl">📭</div>
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">Order not found</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">This booking doesn&apos;t exist or was removed.</p>
            </div>
            <Link href="/services" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm transition-colors shadow-lg shadow-brand-500/20">
              Browse Services →
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {/* ═══ STATUS HERO ═══ */}
            <div className={`relative overflow-hidden rounded-3xl p-6 border ${currentStatus?.bg} transition-all`}>              
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{currentStatus?.icon}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Order #{order.id.slice(0, 8)}
                    </span>
                  </div>
                  <h1 className={`text-2xl font-black ${isCancelled ? "text-rose-500 dark:text-rose-400" : "text-slate-900 dark:text-white"}`}>
                    {isCancelled ? "Booking Cancelled" : steps[currentStepIndex]?.label}
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {isCancelled ? "This booking is no longer active." : steps[currentStepIndex]?.desc}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-black ${isCancelled ? "text-slate-400 line-through" : "text-emerald-600 dark:text-emerald-400"}`}>
                    ₹{order.price}
                  </p>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                    {isCancelled ? "Cancelled" : "Pay on Work"}
                  </p>
                </div>
              </div>
            </div>

            {/* ═══ MAP ═══ */}
            {!isCancelled && (
              <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg">
                <TrackingMap
                  destLat={order.address_lat || 28.5802}
                  destLng={order.address_lng || 77.3340}
                  providerLat={providerLat}
                  providerLng={providerLng}
                />
              </div>
            )}

            {/* ═══ PROGRESS STEPS ═══ */}
            {!isCancelled && (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Order Progress</h3>
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-slate-200 dark:bg-slate-800" />
                  <div className="absolute left-[11px] top-3 w-0.5 bg-emerald-500 transition-all duration-500" style={{ height: `${(currentStepIndex / (steps.length - 1)) * 100}%` }} />
                  
                  <div className="space-y-4">
                    {steps.map((st, i) => {
                      const isPassed = i <= currentStepIndex;
                      const isCurrent = i === currentStepIndex;
                      return (
                        <div key={st.key} className="flex items-start gap-3 relative">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 z-10 transition-all duration-300 ${
                            isCurrent
                              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-110"
                              : isPassed
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-2 border-slate-300 dark:border-slate-700"
                          }`}>
                            {isPassed ? "✓" : i + 1}
                          </div>
                          <div className="flex-1 pb-1">
                            <h4 className={`text-sm font-bold ${
                              isCurrent ? "text-emerald-600 dark:text-emerald-400" 
                              : isPassed ? "text-slate-700 dark:text-slate-200" 
                              : "text-slate-400 dark:text-slate-500"
                            }`}>{st.label}</h4>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{st.desc}</p>
                          </div>
                          {isCurrent && !isCancelled && (
                            <span className="shrink-0 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold border border-emerald-500/20">
                              CURRENT
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ═══ CANCELLED REASON ═══ */}
            {isCancelled && order.cancel_reason && (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📝</span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cancellation Reason</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">{order.cancel_reason}</p>
              </div>
            )}

            {/* ═══ PROVIDER CARD ═══ */}
            {order.provider_id && !isCancelled && (
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-brand-500/20">
                    P
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Assigned Professional</h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Verified & Background Checked</p>
                    </div>
                  </div>
                </div>
                <a href="tel:+919999999999" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors shadow-md shadow-brand-500/20">
                  <PhoneCall className="w-3.5 h-3.5" /> Call
                </a>
              </div>
            )}

            {/* ═══ SCHEDULE INFO ═══ */}
            {!isCancelled && (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">📅</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Date</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {new Date(order.scheduled_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">⏰</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Time</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {new Date(order.scheduled_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            )}

            {/* ═══ PAYMENT ═══ */}
            {!isCancelled && (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💳</span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Payment</h3>
                  </div>
                  <Link href={`/orders/${order.id}/invoice`} className="text-xs text-brand-500 dark:text-brand-400 font-semibold hover:underline">
                    View Invoice →
                  </Link>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-sm text-slate-600 dark:text-slate-300">Total Amount</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">₹{order.price}</span>
                </div>
                {order.status === "completed" && (
                  <button
                    onClick={async () => {
                      await fetch("/api/payments/confirm", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ bookingId: order.id, role: "customer" }),
                      });
                      alert("Payment confirmed!");
                    }}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Confirm Payment ₹{order.price}
                  </button>
                )}
              </div>
            )}

            {/* ═══ CHAT ═══ */}
            {!isCancelled && <BookingChatPanel bookingId={order.id} currentUserId={order.customer_id} />}

            {/* ═══ ACTIONS ═══ */}
            {!isCancelled && (
              <BookingActions
                bookingId={order.id}
                status={order.status}
                scheduledAt={order.scheduled_at}
              />
            )}

            {/* ═══ DISPUTE ═══ */}
            {!isCancelled && (order.status === "in_progress" || order.status === "completed") && (
              <DisputeFlagSection bookingId={order.id} />
            )}

            {/* ═══ INVOICE ═══ */}
            {!isCancelled && order.status === "completed" && (
              <InvoiceGenerator
                invoice={{
                  bookingId: order.id,
                  serviceName: "Service Booking",
                  serviceDate: order.scheduled_at,
                  amount: order.price - 49,
                  convenienceFee: 49,
                  gst: Math.round((order.price - 49) * 0.18),
                  total: order.price + Math.round((order.price - 49) * 0.18),
                  customerName: "Customer",
                }}
              />
            )}

            {/* ═══ WARRANTY ═══ */}
            {!isCancelled && order.status === "completed" && (
              <WarrantyClaimForm
                bookingId={order.id}
                serviceName="Service Booking"
                serviceDate={order.scheduled_at}
                warrantyDays={30}
              />
            )}

            {/* ═══ REVIEW ═══ */}
            {!isCancelled && order.status === "completed" && (
              <BookingReviewForm bookingId={order.id} />
            )}

            {/* ═══ REBOOK CTA ═══ */}
            {isCancelled && (
              <Link href="/services" className="block p-5 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 text-white text-center shadow-lg shadow-brand-500/20 hover:shadow-xl transition-all">
                <p className="text-lg font-black mb-1">Need this service again?</p>
                <p className="text-sm text-white/80">Rebook in seconds — zero upfront payment</p>
                <div className="mt-3 inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-white text-brand-600 font-bold text-sm">
                  Rebook a Service →
                </div>
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
