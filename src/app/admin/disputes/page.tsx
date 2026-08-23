"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, CheckCircle2, Clock, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DisputeItem {
  id: string;
  booking_id: string;
  raised_by: string;
  reason: string;
  status: "open" | "investigating" | "resolved" | "closed";
  resolution: string | null;
  price_adjustment: number;
  created_at: string;
  bookings: {
    customer_id: string;
    provider_id: string | null;
    service_id: string;
    price: number;
    scheduled_at: string;
    status: string;
  };
  profiles?: { name: string | null } | null;
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "investigating" | "resolved">("all");
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState("");
  const [priceAdj, setPriceAdj] = useState(0);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadDisputes = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/disputes");
      if (res.ok) {
        const data = await res.json();
        setDisputes(data.disputes || []);
      }
    } catch {
      // Silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDisputes();
  }, [loadDisputes]);

  const handleResolve = async (disputeId: string, status: "resolved" | "closed") => {
    setResolvingId(disputeId);
    setMessage(null);

    try {
      const res = await fetch(`/api/disputes/${disputeId}/resolve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          resolution: resolutionText.trim() || undefined,
          priceAdjustment: priceAdj,
        }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: `Dispute ${status === "resolved" ? "resolved" : "closed"}.` });
        setResolutionText("");
        setPriceAdj(0);
        loadDisputes();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error." });
    } finally {
      setResolvingId(null);
    }
  };

  const handleSetInvestigating = async (disputeId: string) => {
    try {
      const res = await fetch(`/api/disputes/${disputeId}/resolve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "investigating" }),
      });
      if (res.ok) loadDisputes();
    } catch {
      // Silent
    }
  };

  const filtered = disputes.filter((d) => filter === "all" || d.status === filter);

  const statusColor = (s: string) => {
    switch (s) {
      case "open": return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      case "investigating": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "resolved": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      default: return "text-slate-400 bg-slate-800/50 border-slate-700";
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
        <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
          Dispute Resolution
        </span>
        <h1 className="text-xl font-extrabold text-white">Customer & Provider Disputes</h1>
        <p className="text-xs text-slate-400">
          Review flagged bookings. Adjust pricing, reassign, or close cases.
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(["all", "open", "investigating", "resolved"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filter === tab
                ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === "open" && (
              <span className="ml-1.5 text-[10px] bg-rose-500 text-white rounded-full px-1.5 py-0.5">
                {disputes.filter((d) => d.status === "open").length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Disputes List */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-500 animate-pulse">Loading disputes...</div>
      ) : filtered.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
          <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
          <p className="text-xs font-semibold text-slate-300">
            {filter === "all" ? "No disputes filed" : `No ${filter} disputes`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => (
            <div key={d.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      Dispute #{d.id.slice(0, 8)}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${statusColor(d.status)}`}>
                      {d.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Booking #{d.booking_id.slice(0, 8)} — ₹{d.bookings?.price}
                  </p>
                  {d.profiles?.name && (
                    <p className="text-[10px] text-slate-400">
                      Raised by: {d.profiles.name}
                    </p>
                  )}
                </div>
                <span className="text-[10px] text-slate-500">
                  {new Date(d.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* Reason */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <p className="text-xs text-slate-200 leading-relaxed">{d.reason}</p>
              </div>

              {/* Existing Resolution */}
              {d.resolution && (
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <p className="text-[11px] text-emerald-400 font-semibold">Resolution:</p>
                  <p className="text-xs text-slate-300 mt-0.5">{d.resolution}</p>
                  {d.price_adjustment !== 0 && (
                    <p className="text-[10px] text-amber-400 mt-1">
                      Price adjustment: {d.price_adjustment > 0 ? "+" : ""}₹{d.price_adjustment}
                    </p>
                  )}
                </div>
              )}

              {/* Admin Actions */}
              {(d.status === "open" || d.status === "investigating") && (
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-300">Admin Resolution Note</label>
                    <textarea
                      rows={2}
                      value={resolvingId === d.id ? resolutionText : ""}
                      onChange={(e) => {
                        setResolvingId(d.id);
                        setResolutionText(e.target.value);
                      }}
                      placeholder="Explain resolution — price adjustment, reassignment, or closure reason..."
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-400">Price Adjustment (₹)</label>
                      <input
                        type="number"
                        value={resolvingId === d.id ? priceAdj : 0}
                        onChange={(e) => {
                          setResolvingId(d.id);
                          setPriceAdj(Number(e.target.value));
                        }}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex items-end gap-1.5">
                      {d.status !== "investigating" && (
                        <Button
                          onClick={() => handleSetInvestigating(d.id)}
                          size="sm"
                          variant="outline"
                          className="text-xs border-amber-500/40 text-amber-300 flex-1"
                        >
                          <Clock className="w-3 h-3 mr-1" /> Investigating
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleResolve(d.id, "closed")}
                      disabled={resolvingId === d.id}
                      size="sm"
                      variant="outline"
                      className="text-xs flex-1"
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() => handleResolve(d.id, "resolved")}
                      disabled={resolvingId === d.id}
                      size="sm"
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark Resolved
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
