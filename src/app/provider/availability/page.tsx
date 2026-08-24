"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Save, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface DaySchedule {
  day: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export default function ProviderAvailabilityPage() {
  const [schedule, setSchedule] = useState<DaySchedule[]>([
    { day: "Monday", enabled: true, startTime: "09:00", endTime: "18:00" },
    { day: "Tuesday", enabled: true, startTime: "09:00", endTime: "18:00" },
    { day: "Wednesday", enabled: true, startTime: "09:00", endTime: "18:00" },
    { day: "Thursday", enabled: true, startTime: "09:00", endTime: "18:00" },
    { day: "Friday", enabled: true, startTime: "09:00", endTime: "18:00" },
    { day: "Saturday", enabled: true, startTime: "10:00", endTime: "16:00" },
    { day: "Sunday", enabled: false, startTime: "10:00", endTime: "16:00" },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [radius, setRadius] = useState(10);
  const supabase = createClient();

  function toggleDay(day: string) {
    setSchedule((prev) => prev.map((d) => (d.day === day ? { ...d, enabled: !d.enabled } : d)));
  }

  function updateTime(day: string, field: "startTime" | "endTime", value: string) {
    setSchedule((prev) => prev.map((d) => (d.day === day ? { ...d, [field]: value } : d)));
  }

  async function handleSave() {
    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("provider_profiles").upsert({
        user_id: user.id,
        availability: schedule,
        service_radius_km: radius,
      }, { onConflict: "user_id" });
    }
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const activeDays = schedule.filter((d) => d.enabled).length;

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 bg-slate-950 text-slate-100 pb-20 md:pb-8">
      <header className="flex items-center justify-between py-2 border-b border-slate-800/80 mb-6">
        <Link href="/provider/dashboard" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
        <span className="font-bold text-sm text-white">Availability</span>
        <button onClick={handleSave} disabled={isSaving} className="text-[11px] font-bold text-brand-400 hover:text-brand-300 disabled:opacity-50">
          {isSaving ? "Saving..." : "Save"}
        </button>
      </header>

      <main className="max-w-lg mx-auto w-full flex-1 space-y-5">
        {saved && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Schedule saved successfully!
          </div>
        )}

        {/* Summary */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Working Days</h3>
            <p className="text-[10px] text-slate-400">{activeDays} days per week</p>
          </div>
          <div className="text-center px-4 py-2 rounded-xl bg-brand-500/10 border border-brand-500/20">
            <span className="text-lg font-black text-brand-400">{activeDays}</span>
            <span className="text-[9px] text-slate-400 block">/7 days</span>
          </div>
        </div>

        {/* Service Radius */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white">Service Radius</h3>
            <span className="text-sm font-bold text-brand-400">{radius} km</span>
          </div>
          <input
            type="range"
            min="1"
            max="50"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            className="w-full accent-brand-500"
          />
          <div className="flex justify-between text-[9px] text-slate-500">
            <span>1 km</span>
            <span>50 km</span>
          </div>
        </div>

        {/* Weekly Schedule */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1">Weekly Schedule</h3>
          <div className="rounded-2xl bg-slate-900 border border-slate-800 divide-y divide-slate-800/60 overflow-hidden">
            {schedule.map((day) => (
              <div key={day.day} className={`flex items-center gap-3 px-4 py-3.5 transition-colors ${!day.enabled ? "opacity-50" : ""}`}>
                <button
                  onClick={() => toggleDay(day.day)}
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                    day.enabled ? "bg-brand-500 border-brand-400 text-white" : "border-slate-700"
                  }`}
                >
                  {day.enabled && <span className="text-[10px]">✓</span>}
                </button>
                <span className="text-xs font-bold text-white w-24">{day.day}</span>
                {day.enabled ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      value={day.startTime}
                      onChange={(e) => updateTime(day.day, "startTime", e.target.value)}
                      className="px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-[10px] text-white focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-500">to</span>
                    <input
                      type="time"
                      value={day.endTime}
                      onChange={(e) => updateTime(day.day, "endTime", e.target.value)}
                      className="px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-[10px] text-white focus:outline-none"
                    />
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-500 flex-1">Day off</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Presets */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1">Quick Presets</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setSchedule((prev) => prev.map((d, i) => ({ ...d, enabled: i < 6, startTime: "09:00", endTime: "18:00" })))}
              className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-bold text-white hover:border-brand-500/30 transition-all"
            >
              Mon-Sat (9-6)
            </button>
            <button
              onClick={() => setSchedule((prev) => prev.map((d) => ({ ...d, enabled: true, startTime: "08:00", endTime: "20:00" })))}
              className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-bold text-white hover:border-brand-500/30 transition-all"
            >
              All Days (8-8)
            </button>
            <button
              onClick={() => setSchedule((prev) => prev.map((d, idx) => ({ ...d, enabled: idx >= 5 })))}
              className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-bold text-white hover:border-brand-500/30 transition-all"
            >
              Weekends Only
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button onClick={handleSave} disabled={isSaving} className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save Availability"}
        </button>
      </main>
    </div>
  );
}
