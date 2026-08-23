"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategoryItem {
  id: string;
  name: string;
  icon: string | null;
}

interface ServiceItem {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  base_price: number;
  est_duration_min: number | null;
  categories?: { name: string } | null;
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState(399);
  const [estDurationMin, setEstDurationMin] = useState(45);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [sRes, cRes] = await Promise.all([
        fetch("/api/admin/services"),
        fetch("/api/admin/categories"),
      ]);

      if (sRes.ok) {
        const sData = await sRes.json();
        setServices(sData.services || []);
      }
      if (cRes.ok) {
        const cData = await cRes.json();
        setCategories(cData.categories || []);
        if (cData.categories?.length > 0 && !categoryId) {
          setCategoryId(cData.categories[0].id);
        }
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) return;
    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          category_id: categoryId,
          description: description.trim() || "Professional home service.",
          base_price: Number(basePrice),
          est_duration_min: Number(estDurationMin),
        }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: `Service "${name}" created.` });
        setName("");
        setDescription("");
        setBasePrice(399);
        setEstDurationMin(45);
        loadData();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to create service." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteService = async (id: string, svcName: string) => {
    if (!confirm(`Delete service "${svcName}"?`)) return;

    try {
      const res = await fetch("/api/admin/services", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setServices((prev) => prev.filter((s) => s.id !== id));
        setMessage({ type: "success", text: `Service "${svcName}" deleted.` });
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to delete." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error." });
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Message */}
      {message && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Add Service Form */}
      <form onSubmit={handleAddService} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
        <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
          <Plus className="w-4 h-4 text-brand-400" /> Add New Catalog Service
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">Service Title</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Inverter Repair"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">Target Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">Base Price (₹)</label>
            <input
              type="number"
              required
              min={1}
              value={basePrice}
              onChange={(e) => setBasePrice(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">Est. Duration (mins)</label>
            <input
              type="number"
              required
              min={5}
              max={480}
              value={estDurationMin}
              onChange={(e) => setEstDurationMin(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-300">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description of inclusions..."
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
          />
        </div>

        <Button type="submit" size="sm" disabled={isSubmitting} className="w-full text-xs font-bold py-2.5">
          {isSubmitting ? "Creating..." : "Create Service Item"}
        </Button>
      </form>

      {/* Existing Services List */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-500 animate-pulse">Loading services...</div>
      ) : services.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
          <p className="text-xs font-semibold text-slate-300">No services yet</p>
          <p className="text-[11px] text-slate-500">Create your first service above.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {services.map((s) => (
            <div key={s.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-slate-100">{s.name}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-1">{s.description}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-bold text-emerald-400">₹{s.base_price}</span>
                  {s.categories?.name && (
                    <span className="text-[10px] text-slate-500">in {s.categories.name}</span>
                  )}
                  <span className="text-[10px] text-slate-500">— Est. {s.est_duration_min || 45} mins</span>
                </div>
              </div>

              <button
                onClick={() => handleDeleteService(s.id, s.name)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
