"use client";

import { useState } from "react";
import Link from "next/link";
import {
  XCircle, Clock, RotateCcw, AlertTriangle, Calendar, MessageSquare,
  ChevronRight, CheckCircle2
} from "lucide-react";

interface BookingActionsProps {
  bookingId: string;
  status: string;
  serviceName?: string;
  scheduledAt: string;
}

const cancelReasons = [
  "Change of plans",
  "Found a better option",
  "Issue resolved",
  "Scheduling conflict",
  "Too expensive",
  "Other",
];

export function BookingActions({ bookingId, status, serviceName, scheduledAt }: BookingActionsProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  const isActive = ["pending", "assigned", "on_the_way", "in_progress"].includes(status);
  const canCancel = ["pending", "assigned"].includes(status);
  const canReschedule = ["pending", "assigned"].includes(status);
  const isCompleted = status === "completed";

  // Generate next 7 days for reschedule
  const availableDates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d.toISOString().split("T")[0];
  });

  const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];

  async function handleCancel() {
    if (!cancelReason) return;
    setIsCancelling(true);
    await fetch(`/api/bookings/${bookingId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled", reason: cancelReason }),
    });
    setIsCancelling(false);
    setIsCancelled(true);
    setShowCancelModal(false);
  }

  async function handleReschedule() {
    if (!rescheduleDate || !rescheduleTime) return;
    // Convert time to 24h
    const [time, modifier] = rescheduleTime.split(" ");
    let [hours, minutes] = time.split(":");
    if (hours === "12") hours = modifier === "PM" ? "12" : "00";
    else if (modifier === "PM") hours = String(parseInt(hours) + 12);
    const scheduled = `${rescheduleDate}T${hours.padStart(2, "0")}:00:00Z`;

    await fetch(`/api/bookings/${bookingId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduled_at: scheduled }),
    });
    setShowRescheduleModal(false);
    window.location.reload();
  }

  if (isCancelled) {
    return (
      <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center space-y-2">
        <XCircle className="w-6 h-6 text-rose-400 mx-auto" />
        <p className="text-xs font-bold text-rose-400">Booking Cancelled</p>
        <Link href="/services" className="text-[10px] text-brand-400 hover:underline">Book Another Service →</Link>
      </div>
    );
  }

  return (
    <>
      {/* Action Buttons */}
      {isActive && (
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Booking Actions</h3>
          <div className="rounded-2xl bg-slate-900 border border-slate-800 divide-y divide-slate-800/60 overflow-hidden">
            {canReschedule && (
              <button onClick={() => setShowRescheduleModal(true)} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-800/50 transition-colors text-left">
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <div className="flex-1">
                  <span className="text-xs font-bold text-white block">Reschedule</span>
                  <span className="text-[10px] text-slate-400">Change date or time slot</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            )}
            {canCancel && (
              <button onClick={() => setShowCancelModal(true)} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-800/50 transition-colors text-left">
                <XCircle className="w-4 h-4 text-rose-400" />
                <div className="flex-1">
                  <span className="text-xs font-bold text-rose-400 block">Cancel Booking</span>
                  <span className="text-[10px] text-slate-400">No cancellation fee</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Rebook for completed */}
      {isCompleted && (
        <Link href="/services" className="block p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 hover:border-brand-500/30 transition-all text-center">
          <RotateCcw className="w-5 h-5 text-brand-400 mx-auto mb-1" />
          <span className="text-xs font-bold text-brand-400">Book Again</span>
          <p className="text-[10px] text-slate-400">Book {serviceName || "this service"} again</p>
        </Link>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center p-4" onClick={() => setShowCancelModal(false)}>
          <div className="w-full max-w-lg rounded-t-2xl bg-slate-900 border border-slate-800 p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Cancel Booking</h3>
              <button onClick={() => setShowCancelModal(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400">Please select a reason for cancellation:</p>

            <div className="space-y-2">
              {cancelReasons.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setCancelReason(reason)}
                  className={`w-full p-3 rounded-xl border text-left text-xs transition-all ${
                    cancelReason === reason
                      ? "bg-brand-500/10 border-brand-500/30 text-white"
                      : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600"
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowCancelModal(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold">
                Keep Booking
              </button>
              <button
                onClick={handleCancel}
                disabled={!cancelReason || isCancelling}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-bold disabled:opacity-50"
              >
                {isCancelling ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center p-4" onClick={() => setShowRescheduleModal(false)}>
          <div className="w-full max-w-lg rounded-t-2xl bg-slate-900 border border-slate-800 p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Reschedule Booking</h3>
              <button onClick={() => setShowRescheduleModal(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1.5">New Date</label>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {availableDates.map((d) => (
                    <button
                      key={d}
                      onClick={() => setRescheduleDate(d)}
                      className={`shrink-0 px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${
                        rescheduleDate === d ? "bg-brand-500 text-white" : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1.5">New Time</label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((t) => (
                    <button
                      key={t}
                      onClick={() => setRescheduleTime(t)}
                      className={`py-2 rounded-lg text-[10px] font-bold transition-all ${
                        rescheduleTime === t ? "bg-brand-500 text-white" : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowRescheduleModal(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold">
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                disabled={!rescheduleDate || !rescheduleTime}
                className="flex-1 py-2.5 rounded-xl bg-brand-500 text-white text-xs font-bold disabled:opacity-50"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
