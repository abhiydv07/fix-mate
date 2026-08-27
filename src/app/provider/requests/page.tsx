"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Wrench, Calendar, MapPin, Clock, Check, X, ShieldAlert, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface BroadcastRequest {
  id: string;
  customer_id: string;
  service_id: string;
  address_id: string;
  status: string;
  scheduled_at: string;
  price: number;
  created_at: string;
  services?: { name: string; description: string } | null;
}

export default function ProviderRequestsPage() {
  const [requests, setRequests] = useState<BroadcastRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [myServiceIds, setMyServiceIds] = useState<Set<string>>(new Set());
  const supabase = createClient();

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    setIsLoading(true);
    try {
      // First, get the current provider's service assignments
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: myServices } = await supabase
          .from("provider_services")
          .select("service_id")
          .eq("provider_id", user.id);
        
        const serviceIds = new Set(myServices?.map((s) => s.service_id) || []);
        setMyServiceIds(serviceIds);
      }

      // Then fetch all pending bookings
      const res = await fetch("/api/bookings");
      if (res.ok) {
        const data = await res.json();
        // Filter pending broadcasts — show all if provider has no service assignments
        const pending = (data.bookings || []).filter(
          (b: BroadcastRequest) => b.status === "pending"
        );
        setRequests(pending);
      }
    } catch (err) {
      console.error("Fetch requests error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleAccept = async (bookingId: string) => {
    setActionMessage(null);
    try {
      const res = await fetch("/api/bookings/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setActionMessage({
          type: "success",
          text: "🎉 Service Job Accepted! Check active jobs in your dashboard.",
        });
        loadRequests();
      } else {
        setActionMessage({
          type: "error",
          text: data.error || "Job was already claimed by another provider.",
        });
      }
    } catch {
      setActionMessage({
        type: "error",
        text: "Failed to accept job. Network error.",
      });
    }
  };

  const handleDecline = (bookingId: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== bookingId));
  };

  // Check if a request matches this provider's services
  const isMatchingService = (req: BroadcastRequest) => {
    if (myServiceIds.size === 0) return true; // Show all if no services assigned
    return myServiceIds.has(req.service_id);
  };

  const matchingRequests = requests.filter(isMatchingService);
  const otherRequests = requests.filter((r) => !isMatchingService(r));

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 md:p-8 bg-slate-950 text-slate-100 pb-20 md:pb-8">
      {/* Header */}
      <header className="flex items-center justify-between py-2 border-b border-slate-800/80 mb-6">
        <Link href="/" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200">
          ← Main Site
        </Link>
        <span className="font-bold text-sm text-white">Provider Request Queue</span>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
          {matchingRequests.length} Matched
        </span>
      </header>

      <main className="max-w-3xl mx-auto w-full flex-1 space-y-6">
        {/* Banner */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-brand-400">
            Instant Broadcast Engine
          </span>
          <h1 className="text-xl font-extrabold text-white">Pending Job Requests</h1>
          <p className="text-xs text-slate-400">
            {myServiceIds.size > 0
              ? `Showing bookings matching your ${myServiceIds.size} assigned services.`
              : "No services assigned yet — showing all broadcasts."}
          </p>
        </div>

        {/* Action Alert Banner */}
        {actionMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold ${
              actionMessage.type === "success"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
            }`}
          >
            {actionMessage.text}
          </div>
        )}

        {/* Matching Requests */}
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500 animate-pulse">
            Checking for pending job broadcasts...
          </div>
        ) : matchingRequests.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
            <Zap className="w-8 h-8 text-amber-400 mx-auto" />
            <p className="text-xs font-semibold text-slate-300">No matching job broadcasts</p>
            <p className="text-[11px] text-slate-500">New bookings for your services will appear here instantly.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1">
              Matching Your Services ({matchingRequests.length})
            </h3>
            {matchingRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-brand-500/40 transition-all space-y-3 shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      Broadcast Request
                    </span>
                    <h3 className="font-bold text-sm text-slate-100 mt-1">
                      {req.services?.name || "Service Booking"}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-emerald-400">₹{req.price}</span>
                    <p className="text-[10px] text-slate-400">Collect Cash / UPI</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-brand-400" />
                    <span>Slot: {new Date(req.scheduled_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })} @ {new Date(req.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Location: Service Zone</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/80">
                  <Button
                    onClick={() => handleDecline(req.id)}
                    variant="outline"
                    size="sm"
                    className="text-slate-400 hover:text-slate-200 border-slate-800 text-xs"
                  >
                    <X className="w-3.5 h-3.5 mr-1" /> Decline
                  </Button>
                  <Button
                    onClick={() => handleAccept(req.id)}
                    size="sm"
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-5 shadow-lg shadow-emerald-500/20"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" /> Accept Job
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Other Requests (not matching) */}
        {otherRequests.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1">
              Other Services ({otherRequests.length})
            </h3>
            {otherRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/60 space-y-2 opacity-60"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400">Broadcast Request</span>
                    <h3 className="font-bold text-xs text-slate-300 mt-0.5">
                      {req.services?.name || "Service Booking"}
                    </h3>
                  </div>
                  <span className="text-sm font-bold text-slate-400">₹{req.price}</span>
                </div>
                <p className="text-[9px] text-slate-500">
                  This service is not in your assigned departments.
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
