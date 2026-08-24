import Link from "next/link";
import { ArrowLeft, Clock, ShieldCheck, CheckCircle2, Calendar, Zap, Star, Users, ChevronRight, HelpCircle, MessageSquare } from "lucide-react";
import { fetchServices } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/StarRating";
import { createClient } from "@/lib/supabase/server";
import { ReviewDisplay } from "@/components/ReviewDisplay";

export default async function CategoryServiceDetailPage({
  params,
}: {
  params: { category: string; serviceId: string };
}) {
  const allServices = await fetchServices();
  const service = allServices.find((s) => s.id === params.serviceId) || allServices[0];
  const relatedServices = allServices.filter((s) => s.id !== service.id && s.category_id === service.category_id).slice(0, 3);

  // Fetch providers for this service
  const supabase = await createClient();
  const { data: providerLinks } = await supabase
    .from("provider_services")
    .select("provider_id, price")
    .eq("service_id", service.id);

  let providers: { id: string; name: string; avatar_url: string | null; verified: boolean; price: number | null }[] = [];
  if (providerLinks && providerLinks.length > 0) {
    const providerIds = providerLinks.map((pl) => pl.provider_id);
    const priceMap = new Map(providerLinks.map((pl) => [pl.provider_id, pl.price]));
    const { data: providerProfiles } = await supabase
      .from("profiles")
      .select("id, name, avatar_url, role")
      .in("id", providerIds);

    if (providerProfiles) {
      // Get verification status from provider_profiles
      const { data: ppData } = await supabase
        .from("provider_profiles")
        .select("user_id, verified")
        .in("user_id", providerIds);

      const verifiedMap = new Map(ppData?.map((p) => [p.user_id, p.verified]) || []);

      providers = providerProfiles.map((p) => ({
        id: p.id,
        name: p.name,
        avatar_url: p.avatar_url,
        verified: verifiedMap.get(p.id) || false,
        price: priceMap.get(p.id) || null,
      }));
    }
  }

  // Fetch rating for this service
  const { data: reviewsData } = await supabase
    .from("reviews")
    .select("rating")
    .eq("service_id", service.id);

  const avgRating = reviewsData && reviewsData.length > 0
    ? reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length
    : 0;
  const reviewCount = reviewsData?.length || 0;

  const includesList = [
    "Certified & background-verified professional",
    "Pre-service inspection & transparent pricing",
    "Post-service cleaning & hygiene check",
    "30-Day Fix Mate Service Guarantee",
  ];

  const faqs = [
    { q: "How long does the service take?", a: `Typically ${service.est_duration_min || 45} minutes. Our professional will give you an exact estimate on arrival.` },
    { q: "What if I'm not satisfied?", a: "We offer a 30-day service guarantee. If the issue recurs, we'll send a professional at no extra cost." },
    { q: "Can I reschedule?", a: "Yes, you can reschedule up to 2 hours before the scheduled time from your orders page." },
    { q: "Is there a cancellation fee?", a: "No cancellation fee if you cancel more than 1 hour before the appointment." },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 md:p-8 bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="flex items-center justify-between py-2 border-b border-slate-800/80">
        <Link
          href={`/services/${params.category}`}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Pay on Work
        </span>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto w-full my-6 space-y-6">
        {/* Title Banner */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">
                Service Package
              </span>
              <h1 className="text-xl font-extrabold text-white mt-0.5">{service.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={avgRating} count={reviewCount} size="sm" />
                <span className="text-[10px] text-slate-500">•</span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1"><Users className="w-3 h-3" /> {providers.length || 50}+ pros available</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-400">₹{service.base_price}</span>
              <p className="text-[10px] text-slate-400">Fixed Base Price</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">{service.description}</p>

          <div className="flex items-center gap-4 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-brand-400" />
              Est. {service.est_duration_min || 45} min
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" /> 30-Day Guarantee
            </span>
          </div>
        </div>

        {/* What's Included */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">What&apos;s Included</h3>
          <ul className="space-y-2.5">
            {includesList.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Available Providers */}
        {providers.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Available Professionals</h3>
              <span className="text-[10px] text-brand-400 font-semibold">{providers.length} verified</span>
            </div>
            <div className="space-y-2">
              {providers.map((provider) => (
                <div key={provider.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-brand-500/30 transition-all">
                  <div className="w-10 h-10 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-sm">
                    {provider.name?.charAt(0) || "P"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate">{provider.name}</span>
                      {provider.verified && <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">✓ Verified</span>}
                    </div>
                    <StarRating rating={4.5} count={Math.floor(Math.random() * 30 + 5)} size="sm" />
                  </div>
                  <Link
                    href={`/book/${service.id}?provider=${provider.id}`}
                    className="px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-[10px] font-bold transition-colors"
                  >
                    Book
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Policy */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
          <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-amber-300">Zero Upfront Payment Required</h4>
            <p className="text-[11px] text-slate-400">
              Pay cash or UPI directly to your service professional only after the work is completed and verified.
            </p>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Customer Reviews</h3>
          </div>
          <ReviewDisplay serviceId={service.id} />
        </div>

        {/* FAQs */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-brand-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Frequently Asked Questions</h3>
          </div>
          <div className="space-y-2">
            {faqs.map((faq, idx) => (
              <details key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 group">
                <summary className="text-xs font-bold text-white cursor-pointer list-none flex items-center justify-between">
                  {faq.q}
                  <ChevronRight className="w-4 h-4 text-slate-500 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Related Services */}
        {relatedServices.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Similar Services</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {relatedServices.map((s) => (
                <Link
                  key={s.id}
                  href={`/services/${params.category}/${s.id}`}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-brand-500/30 transition-all"
                >
                  <span className="text-xs font-bold text-white block">{s.name}</span>
                  <span className="text-[10px] text-slate-400">From ₹{s.base_price}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Sticky Bottom Booking Bar */}
      <div className="sticky bottom-0 z-40 p-4 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 max-w-2xl mx-auto w-full flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400">Total payable</span>
          <p className="text-lg font-black text-white">₹{service.base_price}</p>
        </div>
        <Link href={`/book/${service.id}`}>
          <Button className="px-6 py-3 text-xs font-bold shadow-lg shadow-brand-500/20 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Book Professional Now
          </Button>
        </Link>
      </div>
    </div>
  );
}
