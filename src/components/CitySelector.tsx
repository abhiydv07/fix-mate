"use client";

import { useState } from "react";
import { MapPin, ChevronDown, Check, Clock } from "lucide-react";

const cities = [
  { name: "Bengaluru", status: "active" as const },
  { name: "Mumbai", status: "coming" as const },
  { name: "Delhi NCR", status: "coming" as const },
  { name: "Hyderabad", status: "coming" as const },
  { name: "Chennai", status: "coming" as const },
  { name: "Pune", status: "coming" as const },
];

export function CitySelector() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("Bengaluru");

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-500/30 transition-colors"
      >
        <MapPin className="w-3.5 h-3.5 text-brand-500" />
        <span className="text-xs font-bold text-slate-900 dark:text-white">{selected}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl z-50 p-2 overflow-hidden">
          <p className="text-[10px] font-bold text-slate-500 px-2 py-1 uppercase tracking-wider">Select City</p>
          {cities.map((city) => (
            <button
              key={city.name}
              onClick={() => { setSelected(city.name); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors ${
                city.status === "active"
                  ? "hover:bg-brand-50 dark:hover:bg-brand-500/10"
                  : "opacity-50 cursor-not-allowed"
              }`}
              disabled={city.status !== "active"}
            >
              {city.status === "active" ? (
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )}
              <div className="flex-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white">{city.name}</span>
                {city.status === "coming" && (
                  <span className="text-[9px] text-slate-400 block">Coming Soon</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
