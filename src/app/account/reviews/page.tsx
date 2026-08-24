"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Star, MessageSquare, Package } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { StarRating } from "@/components/StarRating";

interface UserReview {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  service_name: string;
  provider_name: string;
}

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => { loadReviews(); }, []);

  async function loadReviews() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsLoading(false); return; }

    const { data } = await supabase
      .from("reviews")
      .select("id, rating, comment, created_at, service_id, provider_id")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      const serviceIds = [...new Set(data.map((r) => r.service_id).filter(Boolean))];
      const providerIds = [...new Set(data.map((r) => r.provider_id).filter(Boolean))];

      const [svcRes, provRes] = await Promise.all([
        supabase.from("services").select("id, name").in("id", serviceIds),
        supabase.from("profiles").select("id, name").in("id", providerIds),
      ]);

      const svcMap = new Map(svcRes.data?.map((s) => [s.id, s.name]) || []);
      const provMap = new Map(provRes.data?.map((p) => [p.id, p.name]) || []);

      setReviews(
        data.map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          created_at: r.created_at,
          service_name: svcMap.get(r.service_id) || "Service",
          provider_name: provMap.get(r.provider_id) || "Professional",
        }))
      );
    }
    setIsLoading(false);
  }

  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 bg-slate-950 text-slate-100 pb-20 md:pb-8">
      <header className="flex items-center justify-between py-2 border-b border-slate-800/80 mb-6">
        <Link href="/account" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200">
          <ArrowLeft className="w-4 h-4" /> Account
        </Link>
        <span className="font-bold text-sm text-white">My Reviews</span>
        <span className="text-xs text-slate-500">{reviews.length} reviews</span>
      </header>

      <main className="max-w-lg mx-auto w-full flex-1 space-y-5">
        {/* Stats */}
        {reviews.length > 0 && (
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
            <div className="text-center">
              <span className="text-2xl font-black text-amber-400">{avgRating.toFixed(1)}</span>
              <StarRating rating={avgRating} size="sm" showNumber={false} />
              <span className="text-[9px] text-slate-400 block mt-1">Your avg rating</span>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-2">
              <div className="text-center p-2 rounded-lg bg-slate-800/50">
                <span className="text-sm font-bold text-white block">{reviews.length}</span>
                <span className="text-[9px] text-slate-400">Total Reviews</span>
              </div>
              <div className="text-center p-2 rounded-lg bg-slate-800/50">
                <span className="text-sm font-bold text-white block">{reviews.filter((r) => r.rating >= 4).length}</span>
                <span className="text-[9px] text-slate-400">5★ & 4★ Reviews</span>
              </div>
            </div>
          </div>
        )}

        {/* Reviews List */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-slate-900 animate-pulse" />)}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-300">No reviews yet</p>
            <p className="text-[11px] text-slate-400">Complete a service and leave a review</p>
          </div>
        ) : (
          <div className="space-y-2">
            {reviews.map((review) => (
              <div key={review.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{review.service_name}</h4>
                    <p className="text-[10px] text-slate-400">with {review.provider_name}</p>
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                </div>
                {review.comment && (
                  <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-800/30 p-2.5 rounded-xl">{review.comment}</p>
                )}
                <span className="text-[9px] text-slate-500">
                  {new Date(review.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
