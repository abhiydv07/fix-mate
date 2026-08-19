"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Clock, ArrowRight, Star, Sparkles, Filter } from "lucide-react";
import { fetchCategories, fetchServices, ServiceCategoryItem, ServiceItem } from "@/lib/services";

export function ServiceCatalog() {
  const [categories, setCategories] = useState<ServiceCategoryItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadCatalog() {
      setIsLoading(true);
      const [catData, servData] = await Promise.all([fetchCategories(), fetchServices()]);
      setCategories(catData);
      setServices(servData);
      setIsLoading(false);
    }
    loadCatalog();
  }, []);

  const filteredServices = services.filter((service) => {
    const matchesCategory = selectedCategory === "all" || service.category_id === selectedCategory;
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.description && service.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-5">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search 'AC repair', 'Plumber', 'Tap leak'..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
          >
            Clear
          </button>
        )}
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCategory === "all"
              ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
              : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          All Services
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <span>{cat.icon || "🔧"}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Services List Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Available Services ({filteredServices.length})
          </h3>
          <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Pay After Completion
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500 animate-pulse">
            Loading service catalog...
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-1">
            <p className="text-xs font-semibold text-slate-300">No matching services found</p>
            <p className="text-[11px] text-slate-500">Try adjusting your search query or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredServices.map((service) => (
              <Link
                key={service.id}
                href={`/services/${service.id}`}
                className="group p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-brand-500/40 transition-all flex flex-col justify-between space-y-3 hover:bg-slate-900"
              >
                <div className="space-y-1">
                  <div className="flex items-start justify-between">
                    <h4 className="font-bold text-sm text-slate-100 group-hover:text-brand-300 transition-colors">
                      {service.name}
                    </h4>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-xs border border-emerald-500/20">
                      ₹{service.base_price}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{service.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-slate-400 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-brand-400" />
                    {service.est_duration_min || 45} mins
                  </span>
                  <span className="flex items-center gap-1 text-slate-200 font-medium group-hover:translate-x-0.5 transition-transform">
                    Book Service <ArrowRight className="w-3.5 h-3.5 text-brand-400" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
