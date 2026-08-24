"use client";

import { useState } from "react";
import { Shield, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface WarrantyClaimFormProps {
  bookingId: string;
  serviceName: string;
  serviceDate: string;
  warrantyDays: number;
  onSubmitted?: () => void;
}

export function WarrantyClaimForm({ bookingId, serviceName, serviceDate, warrantyDays, onSubmitted }: WarrantyClaimFormProps) {
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const warrantyEnd = new Date(serviceDate);
  warrantyEnd.setDate(warrantyEnd.getDate() + warrantyDays);
  const isExpired = new Date() > warrantyEnd;

  async function handleSubmit() {
    if (!description.trim()) {
      setError("Please describe the issue");
      return;
    }
    setIsSubmitting(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Please sign in"); setIsSubmitting(false); return; }

    const { error: insertError } = await supabase.from("disputes").insert({
      booking_id: bookingId,
      customer_id: user.id,
      reason: "warranty_claim",
      description: description.trim(),
      status: "open",
    });

    if (insertError) {
      setError("Failed to submit claim. Please try again.");
    } else {
      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "Warranty Claim Submitted 🛡️",
        body: `Your warranty claim for ${serviceName} has been submitted. Our team will review it within 24 hours.`,
      });
      setSubmitted(true);
      onSubmitted?.();
    }
    setIsSubmitting(false);
  }

  if (submitted) {
    return (
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
        <p className="text-xs font-bold text-emerald-400">Warranty claim submitted!</p>
        <p className="text-[10px] text-slate-400">Our team will review and contact you within 24 hours.</p>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
        <div>
          <p className="text-xs font-bold text-rose-400">Warranty Expired</p>
          <p className="text-[10px] text-slate-400">This service&apos;s {warrantyDays}-day warranty has ended.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <Shield className="w-4 h-4 text-emerald-400" />
        <div>
          <p className="text-[10px] font-bold text-emerald-400">Warranty Active</p>
          <p className="text-[9px] text-slate-400">Valid until {warrantyEnd.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
        </div>
      </div>
      <textarea
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe the issue you're experiencing with this service..."
        className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
      />
      {error && <p className="text-[10px] text-rose-400">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !description.trim()}
        className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[11px] font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Shield className="w-3.5 h-3.5" /> {isSubmitting ? "Submitting..." : "Submit Warranty Claim"}
      </button>
    </div>
  );
}
