"use client";

import { useState } from "react";
import { Plus, Minus, Zap, ShieldCheck } from "lucide-react";

export interface Addon {
  id: string;
  name: string;
  description: string;
  price: number;
  popular?: boolean;
}

interface ServiceAddonsProps {
  addons: Addon[];
  selectedAddons: string[];
  onToggle: (addonId: string) => void;
}

export function ServiceAddons({ addons, selectedAddons, onToggle }: ServiceAddonsProps) {
  if (addons.length === 0) return null;

  const totalPrice = addons
    .filter((a) => selectedAddons.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Add Extra Services</h4>
        {totalPrice > 0 && (
          <span className="text-[10px] font-bold text-brand-400">+₹{totalPrice}</span>
        )}
      </div>
      <div className="space-y-2">
        {addons.map((addon) => {
          const isSelected = selectedAddons.includes(addon.id);
          return (
            <button
              key={addon.id}
              onClick={() => onToggle(addon.id)}
              className={`w-full p-3 rounded-xl border transition-all flex items-center gap-3 text-left ${
                isSelected
                  ? "bg-brand-500/10 border-brand-500/30"
                  : "bg-slate-900 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isSelected ? "bg-brand-500 text-white" : "bg-slate-800 text-slate-400"
              }`}>
                {isSelected ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">{addon.name}</span>
                  {addon.popular && (
                    <span className="text-[8px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <Zap className="w-2 h-2" /> Popular
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400">{addon.description}</span>
              </div>
              <span className="text-xs font-bold text-emerald-400 shrink-0">+₹{addon.price}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Default addons per category
export const defaultAddons: Record<string, Addon[]> = {
  plumbing: [
    { id: "pipe-insulation", name: "Pipe Insulation", description: "Prevent future leaks with foam insulation", price: 150, popular: true },
    { id: "water-tank-clean", name: "Water Tank Cleaning", description: "Deep clean overhead/underground tank", price: 300 },
    { id: "filter-install", name: "Water Filter Install", description: "Install new water purifier/filter", price: 200 },
  ],
  electrical: [
    { id: "surge-protector", name: "Surge Protector", description: "Install whole-home surge protection", price: 250, popular: true },
    { id: "wiring-check", name: "Full Wiring Audit", description: "Complete home wiring safety check", price: 400 },
    { id: "led-install", name: "LED Upgrade", description: "Replace old bulbs with energy-saving LEDs", price: 100 },
  ],
  cleaning: [
    { id: "kitchen-deep", name: "Kitchen Deep Clean", description: "Extra focus on kitchen grease & grime", price: 200, popular: true },
    { id: "bathroom-sanitize", name: "Bathroom Sanitization", description: "Hospital-grade bathroom disinfection", price: 150 },
    { id: "balcony-clean", name: "Balcony Cleaning", description: "Include balcony in cleaning service", price: 100 },
  ],
  appliances: [
    { id: "gas-stove-clean", name: "Gas Stove Deep Clean", description: "Complete burner & jet cleaning", price: 200, popular: true },
    { id: "refrigerator-clean", name: "Refrigerator Service", description: "Deep clean + gas top-up", price: 350 },
    { id: "ac-chemical", name: "AC Chemical Wash", description: "Chemical deep cleaning for AC", price: 400 },
  ],
  painting: [
    { id: "wall-prep", name: "Wall Preparation", description: "Sanding, crack filling & priming", price: 500, popular: true },
    { id: "accent-wall", name: "Accent Wall", description: "One feature wall with premium paint", price: 800 },
    { id: "ceiling-paint", name: "Ceiling Painting", description: "Include ceiling in painting job", price: 600 },
  ],
  carpentry: [
    { id: "hinge-replace", name: "Hinge Replacement", description: "Replace worn door/window hinges", price: 100, popular: true },
    { id: "furniture-assembly", name: "Furniture Assembly", description: "Assemble flat-pack furniture", price: 300 },
    { id: "wood-polish", name: "Wood Polishing", description: "Polish wooden furniture & fixtures", price: 250 },
  ],
};
