"use client";

import { useState } from "react";
import { Repeat, Calendar, Check } from "lucide-react";

interface RecurringBookingProps {
  onRecurringChange: (recurring: { enabled: boolean; frequency: string; count: number } | null) => void;
}

const FREQUENCIES = [
  { value: "weekly", label: "Weekly", desc: "Every week", icon: "📅" },
  { value: "biweekly", label: "Bi-weekly", desc: "Every 2 weeks", icon: "📆" },
  { value: "monthly", label: "Monthly", desc: "Every month", icon: "🗓️" },
];

export function RecurringBooking({ onRecurringChange }: RecurringBookingProps) {
  const [enabled, setEnabled] = useState(false);
  const [frequency, setFrequency] = useState("weekly");
  const [count, setCount] = useState(4);

  function toggleRecurring() {
    const next = !enabled;
    setEnabled(next);
    if (!next) {
      onRecurringChange(null);
    } else {
      onRecurringChange({ enabled: true, frequency, count });
    }
  }

  function updateFrequency(f: string) {
    setFrequency(f);
    if (enabled) onRecurringChange({ enabled: true, frequency: f, count });
  }

  function updateCount(c: number) {
    setCount(c);
    if (enabled) onRecurringChange({ enabled: true, frequency, count: c });
  }

  return (
    <div className="space-y-3">
      <button
        onClick={toggleRecurring}
        className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${
          enabled
            ? "bg-brand-50 dark:bg-brand-500/10 border-brand-500/30"
            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
        }`}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${enabled ? "bg-brand-500" : "bg-slate-100 dark:bg-slate-800"}`}>
          <Repeat className={`w-5 h-5 ${enabled ? "text-white" : "text-slate-400"}`} />
        </div>
        <div className="text-left flex-1">
          <p className="text-xs font-bold text-slate-900 dark:text-white">Make it Recurring</p>
          <p className="text-[10px] text-slate-400">Automatically rebook this service</p>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${enabled ? "border-brand-500 bg-brand-500" : "border-slate-300 dark:border-slate-600"}`}>
          {enabled && <Check className="w-3 h-3 text-white" />}
        </div>
      </button>

      {enabled && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          {/* Frequency */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Frequency</p>
            <div className="grid grid-cols-3 gap-2">
              {FREQUENCIES.map((f) => (
                <button
                  key={f.value}
                  onClick={() => updateFrequency(f.value)}
                  className={`p-3 rounded-xl text-center transition-all ${
                    frequency === f.value
                      ? "bg-brand-500 text-white"
                      : "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <span className="text-lg block">{f.icon}</span>
                  <span className={`text-[10px] font-bold ${frequency === f.value ? "text-white" : "text-slate-700 dark:text-slate-300"}`}>{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Repetitions */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Repeat for</p>
            <div className="flex gap-2">
              {[2, 4, 8, 12].map((n) => (
                <button
                  key={n}
                  onClick={() => updateCount(n)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    count === n
                      ? "bg-brand-500 text-white"
                      : "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {n}x
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              {frequency === "weekly" && `${count} weeks — total ${count} bookings`}
              {frequency === "biweekly" && `${count * 2} weeks — total ${count} bookings`}
              {frequency === "monthly" && `${count} months — total ${count} bookings`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
