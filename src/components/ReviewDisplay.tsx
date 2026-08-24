"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { StarRating } from "./StarRating";
import { createClient } from "@/lib/supabase/client";
import { MessageSquare } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  customer_name?: string;
  customer_avatar?: string;
}

interface ReviewDisplayProps {
  serviceId?: string;
  providerId?: string;
  limit?: number;
  showSummary?: boolean;
}

export function ReviewDisplay({ serviceId, providerId, limit = 10, showSummary = true }: ReviewDisplayProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState<Record<number, number>>({});
  const supabase = createClient();

  useEffect(() => {
    loadReviews();
  }, [serviceId, providerId]);

  async function loadReviews() {
    let query = supabase
      .from("reviews")
      .select("id, rating, comment, created_at, customer_id")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (serviceId) query = query.eq("service_id", serviceId);
    if (providerId) query = query.eq("provider_id", providerId);

    const { data } = await query;
    if (!data) return;

    // Fetch customer names
    const customerIds = [...new Set(data.map((r) => r.customer_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name, avatar_url")
      .in("id", customerIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    const enriched = data.map((r) => ({
      ...r,
      customer_name: profileMap.get(r.customer_id)?.name || "User",
      customer_avatar: profileMap.get(r.customer_id)?.avatar_url || null,
    }));

    setReviews(enriched);
    setTotalCount(data.length);
    setAvgRating(data.length > 0 ? data.reduce((sum, r) => sum + r.rating, 0) / data.length : 0);

    const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    data.forEach((r) => {
      const bucket = Math.round(r.rating) as number;
      if (dist[bucket] !== undefined) dist[bucket]++;
    });
    setRatingDistribution(dist);
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 space-y-2">
        <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
        <p className="text-xs text-slate-400">No reviews yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showSummary && (
        <div className="flex items-center gap-6 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
          <div className="text-center">
            <span className="text-3xl font-black text-white">{avgRating.toFixed(1)}</span>
            <StarRating rating={avgRating} size="sm" showNumber={false} />
            <span className="text-[10px] text-slate-400 block mt-1">{totalCount} reviews</span>
          </div>
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingDistribution[star] || 0;
              const pct = totalCount > 0 ? (count / totalCount) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 w-3">{star}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                    <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[9px] text-slate-500 w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {reviews.map((review) => (
          <div key={review.id} className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30 space-y-2">
            <div className="flex items-center gap-2.5">
              {review.customer_avatar ? (
                <Image src={review.customer_avatar} alt="" width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs font-bold">
                  {review.customer_name?.charAt(0) || "U"}
                </div>
              )}
              <div>
                <span className="text-xs font-bold text-white block">{review.customer_name}</span>
                <StarRating rating={review.rating} size="sm" showNumber={false} />
              </div>
              <span className="ml-auto text-[9px] text-slate-500">
                {new Date(review.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
            {review.comment && (
              <p className="text-[11px] text-slate-300 leading-relaxed">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
