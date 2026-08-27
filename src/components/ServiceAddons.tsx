"use client";

import { useState } from "react";
import { Plus, Check } from "lucide-react";

interface Addon {
  id: string;
  name: string;
  price: number;
  icon: string;
}

interface ServiceAddonsProps {
  serviceId: string;
  onAddonsChange?: (addons: Addon[], totalExtra: number) => void;
}

const DEFAULT_ADDONS: Addon[] = [
  { id: "window-clean", name: "Window Cleaning", price: 149, icon: "🪟" },
  { id: "balcony-clean", name: "Balcony Cleaning", price: 99, icon: "🌿" },
  { id: "kitchen-deep", name: "Kitchen Deep Clean", price: 199, icon: "🍳" },
  { id: "bathroom-sanitize", name: "Bathroom Sanitization", price: 149, icon: "🛁" },
  { id: "fan-clean", name: "Fan & Light Cleaning", price: 79, icon: "💡" },
  { id: "cobweb", name: "Cobweb Removal", price: 49, icon: "🕷️" },
];

export function ServiceAddons({ serviceId, onAddonsChange }: ServiceAddonsProps) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(addon: Addon) {
    setSelected((prev) => {
      const next = prev.includes(addon.id) ? prev.filter((id) => id !== addon.id) : [...prev, addon.id];
      const extras = DEFAULT_ADDONS.filter((a) => next.includes(a.id));
      const total = extras.reduce((sum, a) => sum + a.price, 0);
      onAddonsChange?.(extras, total);
      return next;
    });
  }

  const totalExtra = DEFAULT_ADDONS.filter((a) => selected.includes(a.id)).reduce((sum, a) => sum + a.price, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Add-ons</h3>
        {totalExtra > 0 && (
          <span className="text-xs font-bold text-brand-500">+₹{totalExtra}</span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {DEFAULT_ADDONS.map((addon) => {
          const isSelected = selected.includes(addon.id);
          return (
            <button
              key={addon.id}
              onClick={() => toggle(addon)}
              className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? "bg-brand-50 dark:bg-brand-500/10 border-brand-500/30"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <span className="text-lg">{addon.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200 truncate">{addon.name}</p>
                <p className="text-[10px] text-slate-400">+₹{addon.price}</p>
              </div>
              {isSelected ? (
                <Check className="w-4 h-4 text-brand-500 shrink-0" />
              ) : (
                <Plus className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
