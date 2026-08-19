import Link from "next/link";
import { ArrowLeft, Clock, ArrowRight, ShieldCheck, Wrench } from "lucide-react";
import { getCategoryBySlug, getServicesByCategory, fetchServices } from "@/lib/services";

export default async function CategoryServicesPage({
  params,
}: {
  params: { category: string };
}) {
  const categoryItem = await getCategoryBySlug(params.category);
  const categoryName = categoryItem ? categoryItem.name : params.category;
  const categoryIcon = categoryItem ? categoryItem.icon : "🔧";

  const allServices = await fetchServices();
  const categoryServices = categoryItem
    ? allServices.filter((s) => s.category_id === categoryItem.id)
    : allServices;

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 md:p-8 bg-slate-950 text-slate-100 pb-20 md:pb-8">
      {/* Header */}
      <header className="flex items-center justify-between py-2 border-b border-slate-800/80 mb-6">
        <Link
          href="/services"
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> All Categories
        </Link>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Pay on Work
        </span>
      </header>

      {/* Main Category View */}
      <main className="max-w-3xl mx-auto w-full flex-1 space-y-6">
        {/* Banner */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <span className="text-3xl p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60">
            {categoryIcon}
          </span>
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-brand-400">
              Service Category
            </span>
            <h1 className="text-xl font-extrabold text-white">{categoryName} Services</h1>
            <p className="text-xs text-slate-400">
              Select a service to inspect fixed pricing, inclusions, and book a verified professional.
            </p>
          </div>
        </div>

        {/* Services List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Available {categoryName} Packages ({categoryServices.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categoryServices.map((service) => (
              <Link
                key={service.id}
                href={`/services/${params.category}/${service.id}`}
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
        </div>
      </main>
    </div>
  );
}
