"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Save, Clock, Check } from "lucide-react";

interface DaySchedule {
  enabled: boolean;
  start: string;
  end: string;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const FULL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const defaultSchedule: Record<string, DaySchedule> = {
  Mon: { enabled: true, start: "09:00", end: "18:00" },
  Tue: { enabled: true, start: "09:00", end: "18:00" },
  Wed: { enabled: true, start: "09:00", end: "18:00" },
  Thu: { enabled: true, start: "09:00", end: "18:00" },
  Fri: { enabled: true, start: "09:00", end: "18:00" },
  Sat: { enabled: true, start: "09:00", end: "16:00" },
  Sun: { enabled: false, start: "10:00", end: "14:00" },
};

export function AvailabilityCalendar() {
  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>(defaultSchedule);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => { loadSchedule(); }, []);

  async function loadSchedule() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("provider_profiles")
      .select("availability")
      .eq("id", user.id)
      .single();

    if (data?.availability && Array.isArray(data.availability) && data.availability.length > 0) {
      const loaded: Record<string, DaySchedule> = {};
      data.availability.forEach((item: { day: string; enabled: boolean; start: string; end: string }) => {
        loaded[item.day] = { enabled: item.enabled, start: item.start, end: item.end };
      });
      setSchedule(loaded);
    }
    setLoading(false);
  }

  async function handleSave() {
    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const availability = DAYS.map((day) => ({
      day,
      ...schedule[day],
    }));

    await supabase
      .from("provider_profiles")
      .update({ availability })
      .eq("id", user.id);

    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function toggleDay(day: string) {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }));
  }

  function updateDay(day: string, field: "start" | "end", value: string) {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  }

  if (loading) {
    return <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse h-64" />;
  }

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Weekly Availability</h3>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors disabled:opacity-50"
        >
          {saved ? <><Check className="w-3.5 h-3.5" /> Saved!</> : isSaving ? "Saving..." : <><Save className="w-3.5 h-3.5" /> Save</>}
        </button>
      </div>

      <div className="space-y-2">
        {DAYS.map((day, i) => (
          <div key={day} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${schedule[day].enabled ? "bg-slate-50 dark:bg-slate-800/50" : "bg-slate-100 dark:bg-slate-800/30 opacity-60"}`}>
            <button
              onClick={() => toggleDay(day)}
              className={`w-10 h-6 rounded-full transition-colors relative ${schedule[day].enabled ? "bg-brand-500" : "bg-slate-300 dark:bg-slate-700"}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${schedule[day].enabled ? "left-[18px]" : "left-0.5"}`} />
            </button>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-8">{day}</span>
            <span className="text-[10px] text-slate-400 hidden sm:inline w-20">{FULL_DAYS[i]}</span>
            {schedule[day].enabled ? (
              <div className="flex items-center gap-2 ml-auto">
                <input
                  type="time"
                  value={schedule[day].start}
                  onChange={(e) => updateDay(day, "start", e.target.value)}
                  className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                />
                <span className="text-[10px] text-slate-400">to</span>
                <input
                  type="time"
                  value={schedule[day].end}
                  onChange={(e) => updateDay(day, "end", e.target.value)}
                  className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>
            ) : (
              <span className="text-[10px] text-slate-400 ml-auto">Day off</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
