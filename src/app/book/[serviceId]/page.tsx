import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { fetchServices } from "@/lib/services";
import { BookingWizard } from "@/components/BookingWizard";

export default async function BookServicePage({
  params,
}: {
  params: { serviceId: string };
}) {
  const allServices = await fetchServices();
  const service =
    allServices.find((s) => s.id === params.serviceId) || allServices[0];

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 md:p-8 bg-slate-950 text-slate-100 pb-20 md:pb-8">
      {/* Header */}
      <header className="flex items-center justify-between py-2 border-b border-slate-800/80 mb-6">
        <Link
          href={`/services`}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Services
        </Link>
        <span className="font-bold text-sm text-white">Service Booking</span>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Pay on Work
        </span>
      </header>

      <main className="flex-1 flex flex-col justify-center">
        <BookingWizard service={service} />
      </main>
    </div>
  );
}
