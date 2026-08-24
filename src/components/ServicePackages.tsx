"use client";

import { Check, Star, Zap, ShieldCheck } from "lucide-react";

export interface ServicePackage {
  id: string;
  name: string;
  tagline: string;
  price: number;
  originalPrice?: number;
  features: string[];
  popular?: boolean;
  icon: "basic" | "standard" | "premium";
}

interface ServicePackagesProps {
  packages: ServicePackage[];
  selectedPackageId: string;
  onSelect: (packageId: string) => void;
}

const iconMap = {
  basic: { icon: ShieldCheck, color: "text-slate-400", bg: "bg-slate-500/10" },
  standard: { icon: Star, color: "text-brand-400", bg: "bg-brand-500/10" },
  premium: { icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10" },
};

export function ServicePackages({ packages, selectedPackageId, onSelect }: ServicePackagesProps) {
  if (packages.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Choose a Package</h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {packages.map((pkg) => {
          const isSelected = selectedPackageId === pkg.id;
          const { icon: IconComponent, color, bg } = iconMap[pkg.icon];
          return (
            <button
              key={pkg.id}
              onClick={() => onSelect(pkg.id)}
              className={`relative p-4 rounded-2xl border-2 transition-all text-left space-y-3 ${
                isSelected
                  ? "bg-brand-500/5 border-brand-500 shadow-lg shadow-brand-500/10"
                  : "bg-slate-900 border-slate-800 hover:border-slate-700"
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white bg-brand-500 px-2.5 py-0.5 rounded-full shadow-md">
                  Most Popular
                </span>
              )}

              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                  <IconComponent className={`w-4 h-4 ${color}`} />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">{pkg.name}</h5>
                  <p className="text-[9px] text-slate-400">{pkg.tagline}</p>
                </div>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black text-white">₹{pkg.price}</span>
                {pkg.originalPrice && (
                  <span className="text-[10px] text-slate-500 line-through">₹{pkg.originalPrice}</span>
                )}
              </div>

              <ul className="space-y-1.5">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-[10px] text-slate-300">
                    <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div
                className={`w-full py-2 rounded-xl text-[10px] font-bold text-center transition-all ${
                  isSelected
                    ? "bg-brand-500 text-white"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                {isSelected ? "Selected" : "Select Package"}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Default packages per category
export const defaultPackages: Record<string, ServicePackage[]> = {
  plumbing: [
    { id: "plumb-basic", name: "Basic Fix", tagline: "Quick repair", price: 299, features: ["Single fixture repair", "30-day warranty", "Standard parts"], icon: "basic" },
    { id: "plumb-standard", name: "Standard Service", tagline: "Most chosen", price: 599, originalPrice: 699, features: ["Multi-fixture repair", "60-day warranty", "Quality parts included", "Pipe inspection"], icon: "standard", popular: true },
    { id: "plumb-premium", name: "Premium Care", tagline: "Full coverage", price: 999, features: ["Full plumbing audit", "90-day warranty", "Premium parts", "Emergency support", "Free follow-up"], icon: "premium" },
  ],
  electrical: [
    { id: "elec-basic", name: "Quick Fix", tagline: "Single issue", price: 249, features: ["Single point repair", "30-day warranty", "Basic check"], icon: "basic" },
    { id: "elec-standard", name: "Standard Service", tagline: "Best value", price: 549, originalPrice: 649, features: ["Multi-point repair", "60-day warranty", "Safety inspection", "Quality parts"], icon: "standard", popular: true },
    { id: "elec-premium", name: "Home Safety Audit", tagline: "Complete check", price: 1299, features: ["Full wiring audit", "90-day warranty", "Surge protection", "Earthing check", "Certificate"], icon: "premium" },
  ],
  cleaning: [
    { id: "clean-basic", name: "Quick Clean", tagline: "Basic tidy", price: 399, features: ["1 BHK cleaning", "Floor & dusting", "Basic supplies"], icon: "basic" },
    { id: "clean-standard", name: "Deep Clean", tagline: "Thorough", price: 799, originalPrice: 999, features: ["2 BHK deep clean", "Kitchen & bathroom", "Eco-friendly supplies", "2 professionals"], icon: "standard", popular: true },
    { id: "clean-premium", name: "Premium Sanitize", tagline: "Hospital grade", price: 1499, features: ["3 BHK deep clean", "Full sanitization", "Anti-bacterial treatment", "3 professionals", "Same-day service"], icon: "premium" },
  ],
  appliances: [
    { id: "appl-basic", name: "Basic Service", tagline: "Quick fix", price: 349, features: ["Single appliance", "Cleaning & check", "30-day warranty"], icon: "basic" },
    { id: "appl-standard", name: "Standard Service", tagline: "Recommended", price: 699, originalPrice: 849, features: ["Deep cleaning", "Gas top-up (if applicable)", "60-day warranty", "Performance test"], icon: "standard", popular: true },
    { id: "appl-premium", name: "Annual Care", tagline: "Full year coverage", price: 1599, features: ["Full overhaul", "All consumables replaced", "1-year warranty", "Priority support", "2 free services"], icon: "premium" },
  ],
  painting: [
    { id: "paint-basic", name: "Basic Coat", tagline: "Single room", price: 1499, features: ["1 room painting", "Standard paint", "1 coat application"], icon: "basic" },
    { id: "paint-standard", name: "Standard Package", tagline: "Best finish", price: 3499, originalPrice: 4299, features: ["2 rooms painting", "Premium paint", "2 coat application", "Primer included", "Wall prep"], icon: "standard", popular: true },
    { id: "paint-premium", name: "Premium Transform", tagline: "Full home", price: 8999, features: ["Full home painting", "Asian Royale paint", "Texture work", "Accent walls", "30-day touch-up", "Clean-up included"], icon: "premium" },
  ],
  carpentry: [
    { id: "carp-basic", name: "Quick Fix", tagline: "Minor repairs", price: 299, features: ["Single item repair", "Basic hardware", "30-day warranty"], icon: "basic" },
    { id: "carp-standard", name: "Standard Service", tagline: "Comprehensive", price: 699, originalPrice: 849, features: ["Multi-item repair", "Quality hardware", "Furniture assembly", "60-day warranty"], icon: "standard", popular: true },
    { id: "carp-premium", name: "Custom Work", tagline: "Bespoke", price: 1999, features: ["Custom installations", "Premium hardware", "Wood polishing", "90-day warranty", "Design consultation"], icon: "premium" },
  ],
};
