"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategoryItem {
  id: string;
  name: string;
  icon: string | null;
  active: boolean;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🔧");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), icon: icon.trim() || "🔧" }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: `Category "${name}" created.` });
        setName("");
        setIcon("🔧");
        loadCategories();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to create category." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string, catName: string) => {
    if (!confirm(`Delete category "${catName}"? Services in this category will be orphaned.`)) return;

    try {
      const res = await fetch("/api/admin/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        setMessage({ type: "success", text: `Category "${catName}" deleted.` });
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to delete." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error." });
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !currentActive }),
      });

      if (res.ok) {
        setCategories((prev) =>
          prev.map((c) => (c.id === id ? { ...c, active: !currentActive } : c))
        );
      }
    } catch {
      // Silent
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

      {/* Add Category Form */}
      <form onSubmit={handleAddCategory} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
        <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
          <Plus className="w-4 h-4 text-brand-400" /> Create New Service Category
        </h3>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">Category Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Appliance Repair"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">Icon Emoji</label>
            <input
              type="text"
              required
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 text-center focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <Button type="submit" size="sm" disabled={isSubmitting} className="w-full text-xs font-bold py-2.5">
          {isSubmitting ? "Creating..." : "Add Category"}
        </Button>
      </form>

      {/* Existing Categories List */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-500 animate-pulse">Loading categories...</div>
      ) : categories.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
          <p className="text-xs font-semibold text-slate-300">No categories yet</p>
          <p className="text-[11px] text-slate-500">Create your first service category above.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((c) => (
            <div
              key={c.id}
              className={`p-3.5 rounded-xl bg-slate-900 border flex items-center justify-between transition-all ${
                c.active ? "border-slate-800" : "border-slate-800 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{c.icon}</span>
                <div>
                  <h4 className="font-bold text-xs text-slate-100">{c.name}</h4>
                  <span className={`text-[10px] font-medium ${c.active ? "text-emerald-400" : "text-slate-500"}`}>
                    {c.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleToggleActive(c.id, c.active)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                    c.active
                      ? "text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                      : "text-slate-400 border-slate-700 hover:bg-slate-800"
                  }`}
                >
                  {c.active ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => handleDeleteCategory(c.id, c.name)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
