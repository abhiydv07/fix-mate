"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, FileText, Star, User, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProviderRecord {
  id: string;
  bio: string | null;
  service_area_pincodes: string[] | null;
  kyc_doc_url: string | null;
  verified: boolean;
  avg_rating: number;
  is_available: boolean;
  profiles: {
    name: string;
    phone: string | null;
    avatar_url: string | null;
  };
}

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<ProviderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadProviders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/providers");
      if (res.ok) {
        const data = await res.json();
        setProviders(data.providers || []);
      }
    } catch {
      // Silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  const handleToggleVerification = async (providerId: string, newVerifiedStatus: boolean) => {
    setUpdatingId(providerId);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/providers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId, verified: newVerifiedStatus }),
      });

      if (res.ok) {
        setMessage({
          type: "success",
          text: newVerifiedStatus
            ? "Provider KYC approved! They can now receive job broadcasts."
            : "Provider verification revoked.",
        });
        loadProviders();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to update." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error." });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleViewKYCDoc = async (providerId: string, docUrl: string) => {
    // If it's a storage path, get a signed URL
    if (!docUrl.startsWith("http")) {
      try {
        const res = await fetch(`/api/admin/providers?providerId=${providerId}&action=signUrl`);
        if (res.ok) {
          const data = await res.json();
          if (data.signedUrl) {
            window.open(data.signedUrl, "_blank");
            return;
          }
        }
      } catch {
        // Fall through to direct open
      }
    }
    window.open(docUrl, "_blank");
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
        <span className="text-[10px] uppercase font-bold tracking-wider text-brand-400">
          Partner Compliance
        </span>
        <h1 className="text-xl font-extrabold text-white">Service Provider KYC Approval</h1>
        <p className="text-xs text-slate-400">
          Only approved providers (<code className="text-emerald-400">verified = true</code>) are eligible to receive customer job broadcasts.
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

      {/* Providers */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-500 animate-pulse">Loading provider KYC records...</div>
      ) : providers.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
          <User className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-xs font-semibold text-slate-300">No registered providers yet</p>
          <p className="text-[11px] text-slate-500">Providers who sign up as &quot;Service Pro&quot; appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {providers.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-base text-white">{p.profiles.name || "Service Partner"}</h3>
                  {p.verified ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Verified Partner
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      <ShieldAlert className="w-3 h-3" /> Unverified (Excluded)
                    </span>
                  )}
                </div>

                {p.profiles.phone && (
                  <p className="text-[11px] text-slate-400">📞 {p.profiles.phone}</p>
                )}

                <p className="text-xs text-slate-400 italic">{p.bio || "No bio provided."}</p>

                <div className="flex items-center gap-3 text-xs text-slate-300 pt-1">
                  <span>
                    Rating: <strong className="text-amber-400">{p.avg_rating} ★</strong>
                  </span>
                  <span>
                    Pincodes:{" "}
                    <strong className="text-slate-100">
                      {p.service_area_pincodes?.join(", ") || "N/A"}
                    </strong>
                  </span>
                </div>

                {/* KYC Document Link */}
                {p.kyc_doc_url ? (
                  <button
                    onClick={() => handleViewKYCDoc(p.id, p.kyc_doc_url!)}
                    className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 hover:underline pt-1 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    View Uploaded KYC Document
                    <ExternalLink className="w-3 h-3" />
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 pt-1">
                    <FileText className="w-3.5 h-3.5" /> No KYC document uploaded
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {p.verified ? (
                  <Button
                    onClick={() => handleToggleVerification(p.id, false)}
                    disabled={updatingId === p.id}
                    variant="outline"
                    size="sm"
                    className="border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" /> Revoke
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleToggleVerification(p.id, true)}
                    disabled={updatingId === p.id}
                    size="sm"
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-5 shadow-lg shadow-emerald-500/20"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve KYC
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
