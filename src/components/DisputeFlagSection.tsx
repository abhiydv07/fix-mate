"use client";

import { useState } from "react";
import { Flag, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DisputeFlagSectionProps {
  bookingId: string;
}

export function DisputeFlagSection({ bookingId }: DisputeFlagSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 10) {
      setErrorMsg("Please provide at least 10 characters explaining the issue.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, reason: reason.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsSubmitted(true);
      } else {
        setErrorMsg(data.error || "Failed to submit dispute.");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1">
        <CheckCircle2 className="w-6 h-6 text-amber-400 mx-auto" />
        <h4 className="font-bold text-xs text-amber-300">Dispute Submitted</h4>
        <p className="text-[11px] text-slate-400">
          Our team will review this case. You&apos;ll be notified of updates.
        </p>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400"
      >
        <Flag className="w-3.5 h-3.5" /> Report an Issue with This Service
      </button>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400" />
        <h3 className="font-bold text-sm text-slate-100">Flag a Dispute</h3>
      </div>
      <p className="text-[11px] text-slate-400">
        Describe the issue — our admin team will investigate and may adjust pricing or reassign.
      </p>

      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-400">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Describe the problem in detail (min 10 chars) — e.g. work quality, no-show, overcharging..."
          className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)} className="text-xs">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || reason.trim().length < 10}
            size="sm"
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-5"
          >
            {isSubmitting ? "Submitting..." : "Submit Dispute"}
          </Button>
        </div>
      </form>
    </div>
  );
}
