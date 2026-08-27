"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Wrench, CheckCircle2, Save, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ProviderItem {
  id: string;
  name: string;
  role: string;
  avatar_url: string | null;
}

interface CategoryItem {
  id: string;
  name: string;
  icon: string | null;
}

interface ServiceItem {
  id: string;
  category_id: string;
  name: string;
  base_price: number;
}

interface ProviderService {
  provider_id: string;
  service_id: string;
}

export default function AdminAssignPage() {
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [providerServices, setProviderServices] = useState<ProviderService[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const { data: provs } = await supabase.from("profiles").select("id, name, role, avatar_url").eq("role", "provider");
    setProviders(provs || []);

    const { data: cats } = await supabase.from("categories").select("id, name, icon");
    setCategories(cats || []);

    const { data: svcs } = await supabase.from("services").select("id, category_id, name, base_price");
    setServices(svcs || []);

    const { data: ps } = await supabase.from("provider_services").select("provider_id, service_id");
    setProviderServices(ps || []);

    setIsLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Load selected provider's services when provider changes
  useEffect(() => {
    if (!selectedProviderId) {
      setSelectedServiceIds(new Set());
      return;
    }
    const svcIds = providerServices
      .filter((ps) => ps.provider_id === selectedProviderId)
      .map((ps) => ps.service_id);
    setSelectedServiceIds(new Set(svcIds));
  }, [selectedProviderId, providerServices]);

  function toggleService(serviceId: string) {
    setSelectedServiceIds((prev) => {
      const next = new Set(prev);
      if (next.has(serviceId)) {
        next.delete(serviceId);
      } else {
        next.add(serviceId);
      }
      return next;
    });
  }

  function toggleCategory(catId: string) {
    const catServices = services.filter((s) => s.category_id === catId).map((s) => s.id);
    const allSelected = catServices.every((s) => selectedServiceIds.has(s));

    setSelectedServiceIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        catServices.forEach((s) => next.delete(s));
      } else {
        catServices.forEach((s) => next.add(s));
      }
      return next;
    });
  }

  async function handleSave() {
    if (!selectedProviderId) return;
    setIsSaving(true);

    // Delete existing and re-insert
    await supabase.from("provider_services").delete().eq("provider_id", selectedProviderId);

    if (selectedServiceIds.size > 0) {
      const rows = Array.from(selectedServiceIds).map((serviceId) => ({
        provider_id: selectedProviderId,
        service_id: serviceId,
      }));
      await supabase.from("provider_services").insert(rows);
    }

    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    loadData();
  }

  const filteredProviders = providers.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedProvider = providers.find((p) => p.id === selectedProviderId);

  const filteredCategories = categories.filter((c) => {
    if (!searchQuery) return true;
    return c.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 bg-slate-950 text-slate-100 pb-20 md:pb-8">
      <header className="flex items-center justify-between py-2 border-b border-slate-800/80 mb-6">
        <Link href="/admin/providers" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200">
          <ArrowLeft className="w-4 h-4" /> Providers
        </Link>
        <span className="font-bold text-sm text-white">Assign Services</span>
        <span className="text-[10px] font-bold text-brand-400">Admin</span>
      </header>

      <main className="max-w-4xl mx-auto w-full flex-1 space-y-6">
        {/* Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-900/30 to-slate-900 border border-brand-500/20 space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-brand-400">
            Provider-Category Management
          </span>
          <h1 className="text-xl font-extrabold text-white">Assign Service Departments</h1>
          <p className="text-xs text-slate-400">
            Select a provider, then assign the categories and services they can handle.
            Only assigned services will show up in their job request queue.
          </p>
        </div>

        {saved && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Services assigned successfully!
          </div>
        )}

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500 animate-pulse">Loading providers and services...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Provider List */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Providers ({filteredProviders.length})
              </h3>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search providers..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div className="space-y-1.5 max-h-96 overflow-y-auto">
                {filteredProviders.map((prov) => {
                  const svcCount = providerServices.filter((ps) => ps.provider_id === prov.id).length;
                  const isSelected = selectedProviderId === prov.id;
                  return (
                    <button
                      key={prov.id}
                      onClick={() => setSelectedProviderId(prov.id)}
                      className={`w-full p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "bg-brand-500/10 border-brand-500/30"
                          : "bg-slate-900 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs font-bold shrink-0">
                          {prov.name?.charAt(0) || "P"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`text-xs font-bold block truncate ${isSelected ? "text-brand-400" : "text-white"}`}>
                            {prov.name}
                          </span>
                          <span className="text-[9px] text-slate-400">{svcCount} services</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Categories + Services */}
            <div className="md:col-span-2 space-y-4">
              {selectedProviderId ? (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">
                      Services for {selectedProvider?.name}
                    </h3>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                  </div>

                  {/* Category Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    {filteredCategories.map((cat) => {
                      const catServices = services.filter((s) => s.category_id === cat.id);
                      const selectedCount = catServices.filter((s) => selectedServiceIds.has(s.id)).length;
                      const allSelected = catServices.length > 0 && selectedCount === catServices.length;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => toggleCategory(cat.id)}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            allSelected
                              ? "bg-brand-500/10 border-brand-500/30 text-brand-400"
                              : selectedCount > 0
                              ? "bg-brand-500/5 border-brand-500/20 text-brand-300"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                          }`}
                        >
                          <span className="text-lg block mb-1">{cat.icon}</span>
                          <span className="text-[10px] font-bold block">{cat.name}</span>
                          <span className="text-[8px] opacity-60">{selectedCount}/{catServices.length}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Services List */}
                  <div className="space-y-1.5 max-h-80 overflow-y-auto">
                    {services.map((svc) => {
                      const cat = categories.find((c) => c.id === svc.category_id);
                      const isSelected = selectedServiceIds.has(svc.id);
                      return (
                        <button
                          key={svc.id}
                          onClick={() => toggleService(svc.id)}
                          className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                            isSelected
                              ? "bg-brand-500/10 border-brand-500/30"
                              : "bg-slate-900 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{cat?.icon}</span>
                            <div>
                              <span className={`text-xs font-bold ${isSelected ? "text-brand-400" : "text-slate-300"}`}>
                                {svc.name}
                              </span>
                              <span className="text-[9px] text-slate-500 block">
                                {cat?.name} • ₹{svc.base_price}
                              </span>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? "bg-brand-500 border-brand-400 text-white" : "border-slate-700"
                          }`}>
                            {isSelected && <span className="text-[10px]">✓</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-[9px] text-slate-500">
                    {selectedServiceIds.size} service(s) assigned to this provider
                  </p>
                </>
              ) : (
                <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                  <Wrench className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs font-semibold text-slate-300">Select a provider from the left</p>
                  <p className="text-[11px] text-slate-500">Then assign the categories and services they can handle.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
