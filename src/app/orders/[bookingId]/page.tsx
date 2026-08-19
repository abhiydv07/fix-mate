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
        (payload: any) => {
          const newLoc = payload.new;
          if (newLoc && newLoc.lat && newLoc.lng) {
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
      }
    } catch (err) {
      console.error("Fetch order error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchInitialProviderLocation(providerId: string) {
    try {
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
      // Ignore fallback
    }
  }

  const steps = [
    { key: "pending", label: "Request Placed", desc: "Broadcasting to local pros" },
    { key: "assigned", label: "Pro Assigned", desc: "Service partner confirmed" },
    { key: "on_the_way", label: "On The Way", desc: "Pro is travelling to location" },
    { key: "in_progress", label: "Work In Progress", desc: "Service being performed" },
    { key: "completed", label: "Completed", desc: "Work verified & payment collected" },
  ];

  const getStepIndex = (status: string) => {
    const idx = steps.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  const currentStepIndex = order ? getStepIndex(order.status) : 0;

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 md:p-8 bg-slate-950 text-slate-100 pb-20 md:pb-8">
      {/* Header */}
      <header className="flex items-center justify-between py-2 border-b border-slate-800/80 mb-6">
        <Link href="/bookings" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200">
          <ArrowLeft className="w-4 h-4" /> My Bookings
        </Link>
        <span className="font-bold text-sm text-white">Live Tracking</span>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Realtime
        </span>
      </header>

      <main className="max-w-xl mx-auto w-full flex-1 space-y-6">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500 animate-pulse">
            Connecting to Realtime tracking...
          </div>
        ) : !order ? (
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
            <p className="text-xs font-semibold text-slate-300">Order not found</p>
            <Link href="/" className="text-xs text-brand-400 hover:underline">
              Return to Services
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Live Leaflet Realtime Tracking Map */}
            <TrackingMap
              destLat={12.9716}
              destLng={77.5946}
              providerLat={providerLat}
              providerLng={providerLng}
            />

            {/* Status Card */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">
                    Order #{order.id.slice(0, 8)}
                  </span>
                  <h1 className="text-lg font-extrabold text-white mt-0.5">
                    {steps[currentStepIndex].label}
                  </h1>
                  <p className="text-xs text-slate-400">{steps[currentStepIndex].desc}</p>
                </div>

                <div className="text-right">
                  <span className="text-xl font-black text-emerald-400">₹{order.price}</span>
                  <p className="text-[10px] text-slate-400">Pay on Work</p>
                </div>
              </div>

              {/* Realtime Progress Steps */}
              <div className="space-y-3 pt-2">
                {steps.map((st, i) => {
                  const isPassed = i <= currentStepIndex;
                  const isCurrent = i === currentStepIndex;

                  return (
                    <div key={st.key} className="flex items-start gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-all ${
                          isPassed
                            ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                            : "bg-slate-950 text-slate-600 border border-slate-800"
                        }`}
                      >
                        {isPassed ? "✓" : i + 1}
                      </div>
                      <div className="space-y-0.5">
                        <h4
                          className={`text-xs font-bold ${
                            isCurrent
                              ? "text-emerald-400"
                              : isPassed
                              ? "text-slate-200"
                              : "text-slate-500"
                          }`}
                        >
                          {st.label}
                        </h4>
                        <p className="text-[11px] text-slate-400">{st.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Provider Info Card */}
            {order.provider_id && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold">
                    P
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">Assigned Professional</h4>
                    <p className="text-[11px] text-emerald-400">Verified Service Partner</p>
                  </div>
                </div>

                <button className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors">
                  <PhoneCall className="w-3.5 h-3.5 text-brand-400" /> Call Pro
                </button>
              </div>
            )}

            {/* Per-Booking Realtime Live Chat Panel */}
            <BookingChatPanel bookingId={order.id} currentUserId={order.customer_id} />
          </div>
        )}
      </main>
    </div>
  );
}
