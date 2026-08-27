"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { MapPin, Plus, Check, Home, Building, Briefcase } from "lucide-react";

interface Address {
  id: string;
  label: string;
  address_line1: string;
  city: string;
  pincode: string;
}

interface MultiAddressSelectorProps {
  onSelect: (addresses: Address[]) => void;
  maxAddresses?: number;
}

const ICONS: Record<string, typeof Home> = { home: Home, work: Briefcase, other: Building };

export function MultiAddressSelector({ onSelect, maxAddresses = 3 }: MultiAddressSelectorProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => { loadAddresses(); }, []);

  async function loadAddresses() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("addresses")
      .select("id, label, address_line1, city, pincode")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false });

    if (data) {
      setAddresses(data as Address[]);
      // Auto-select default
      if (data.length > 0) {
        setSelected([data[0].id]);
        onSelect([data[0] as Address]);
      }
    }
    setLoading(false);
  }

  function toggle(id: string) {
    setSelected((prev) => {
      let next: string[];
      if (prev.includes(id)) {
        next = prev.filter((a) => a !== id);
      } else if (prev.length < maxAddresses) {
        next = [...prev, id];
      } else {
        return prev;
      }
      const selectedAddresses = addresses.filter((a) => next.includes(a.id));
      onSelect(selectedAddresses);
      return next;
    });
  }

  if (loading) return <div className="h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Address</h3>
        <span className="text-[10px] text-slate-400">{selected.length}/{maxAddresses} selected</span>
      </div>
      {addresses.map((addr) => {
        const isSelected = selected.includes(addr.id);
        const Icon = ICONS[addr.label?.toLowerCase()] || MapPin;
        return (
          <button
            key={addr.id}
            onClick={() => toggle(addr.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
              isSelected
                ? "bg-brand-50 dark:bg-brand-500/10 border-brand-500/30"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? "bg-brand-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white capitalize">{addr.label || "Address"}</p>
              <p className="text-[10px] text-slate-400 truncate">{addr.address_line1}, {addr.city} — {addr.pincode}</p>
            </div>
            {isSelected && <Check className="w-4 h-4 text-brand-500 shrink-0" />}
          </button>
        );
      })}
      <a href="/profile/addresses" className="flex items-center gap-2 p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-400 hover:border-brand-500 hover:text-brand-500 transition-colors justify-center">
        <Plus className="w-3.5 h-3.5" /> Add New Address
      </a>
    </div>
  );
}
