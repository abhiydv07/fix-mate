"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, Smartphone, Banknote, Plus, Check, Trash2, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client"

interface PaymentMethod {
  id: string;
  type: "upi" | "card" | "cash";
  label: string;
  detail: string;
  isDefault: boolean;
}

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([
    { id: "cash", type: "cash", label: "Cash on Service", detail: "Pay cash after work is done", isDefault: true },
  ]);
  const [showAddUPI, setShowAddUPI] = useState(false);
  const [upiId, setUpiId] = useState("");
  const supabase = createClient();

  useEffect(() => { loadMethods(); }, []);

  async function loadMethods() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("payment_methods").select("*").eq("user_id", user.id);
    if (data && data.length > 0) {
      setMethods([
        { id: "cash", type: "cash", label: "Cash on Service", detail: "Pay cash after work is done", isDefault: data.every((m: any) => !m.is_default) },
        ...data.map((m: any) => ({ id: m.id, type: m.type as "upi" | "card", label: m.type.toUpperCase(), detail: m.upi_id || m.card_last4 || "", isDefault: m.is_default })),
      ]);
    }
  }

  async function addUPI() {
    if (!upiId) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from("payment_methods").insert({
      user_id: user.id, type: "upi", upi_id: upiId, is_default: true,
    }).select().single();
    if (!error && data) {
      setMethods((prev) => [
        ...prev.map((m) => ({ ...m, isDefault: false })),
        { id: data.id, type: "upi", label: "UPI", detail: upiId, isDefault: true },
      ]);
    }
    setUpiId("");
    setShowAddUPI(false);
  }

  async function setDefault(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("payment_methods").update({ is_default: false }).eq("user_id", user.id);
      await supabase.from("payment_methods").update({ is_default: true }).eq("id", id);
    }
    setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));
  }

  async function removeMethod(id: string) {
    await supabase.from("payment_methods").delete().eq("id", id);
    setMethods((prev) => prev.filter((m) => m.id !== id));
  }

  const iconMap = { upi: Smartphone, card: CreditCard, cash: Banknote };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 bg-slate-950 text-slate-100 pb-20 md:pb-8">
      <header className="flex items-center justify-between py-2 border-b border-slate-800/80 mb-6">
        <Link href="/account" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200">
          <ArrowLeft className="w-4 h-4" /> Account
        </Link>
        <span className="font-bold text-sm text-white">Payment Methods</span>
        <div />
      </header>

      <main className="max-w-lg mx-auto w-full flex-1 space-y-5">
        {/* Info */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
          <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-emerald-300">Pay After Work</h4>
            <p className="text-[10px] text-slate-400">You only pay after the service is completed. No upfront charges.</p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1">Your Payment Methods</h3>
          <div className="rounded-2xl bg-slate-900 border border-slate-800 divide-y divide-slate-800/60 overflow-hidden">
            {methods.map((method) => {
              const Icon = iconMap[method.type];
              return (
                <div key={method.id} className="flex items-center gap-3 px-4 py-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-brand-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{method.label}</span>
                      {method.isDefault && (
                        <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" /> Default
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">{method.detail}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {!method.isDefault && method.type !== "cash" && (
                      <button onClick={() => setDefault(method.id)} className="text-[9px] text-brand-400 hover:underline">Set Default</button>
                    )}
                    {method.type !== "cash" && (
                      <button onClick={() => removeMethod(method.id)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add UPI */}
        {!showAddUPI ? (
          <button onClick={() => setShowAddUPI(true)} className="w-full p-4 rounded-2xl border-2 border-dashed border-slate-700 hover:border-brand-500/30 text-xs font-bold text-slate-400 hover:text-brand-400 flex items-center justify-center gap-2 transition-all">
            <Plus className="w-4 h-4" /> Add UPI ID
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white">Add UPI ID</h4>
            <input
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="yourname@upi"
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
            />
            <div className="flex gap-2">
              <button onClick={addUPI} className="flex-1 py-2.5 rounded-xl bg-brand-500 text-white text-xs font-bold">Add</button>
              <button onClick={() => setShowAddUPI(false)} className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold">Cancel</button>
            </div>
          </div>
        )}

        {/* Supported Methods */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <h4 className="text-xs font-bold text-white">Supported Payment Methods</h4>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Smartphone, label: "UPI" },
              { icon: CreditCard, label: "Cards" },
              { icon: Banknote, label: "Cash" },
            ].map((m) => (
              <div key={m.label} className="p-2 rounded-lg bg-slate-800/50 flex flex-col items-center gap-1">
                <m.icon className="w-4 h-4 text-slate-400" />
                <span className="text-[9px] text-slate-400">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
