"use client";

import { Star, ThumbsUp, Clock, MessageCircle, IndianRupee } from "lucide-react";

interface RatingBreakdownProps {
  overall: number;
  totalReviews: number;
  breakdown?: {
    punctuality: number;
    quality: number;
    communication: number;
    value: number;
  };
}

export function RatingBreakdown({ overall, totalReviews, breakdown }: RatingBreakdownProps) {
  const defaultBreakdown = breakdown || {
    punctuality: 4.8,
    quality: 4.7,
    communication: 4.6,
    value: 4.5,
  };

  const categories = [
    { label: "Punctuality", rating: defaultBreakdown.punctuality, icon: Clock, color: "bg-emerald-500" },
    { label: "Quality", rating: defaultBreakdown.quality, icon: ThumbsUp, color: "bg-blue-500" },
    { label: "Communication", rating: defaultBreakdown.communication, icon: MessageCircle, color: "bg-purple-500" },
    { label: "Value for Money", rating: defaultBreakdown.value, icon: IndianRupee, color: "bg-amber-500" },
  ];

  return (
    <div className="space-y-4">
      {/* Overall */}
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="text-3xl font-black text-slate-900 dark:text-white">{overall.toFixed(1)}</p>
          <div className="flex items-center gap-0.5 mt-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`w-3 h-3 ${s <= Math.round(overall) ? "text-amber-400 fill-amber-400" : "text-slate-200 dark:text-slate-700"}`} />
            ))}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">{totalReviews} reviews</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const pct = star === 5 ? 65 : star === 4 ? 25 : star === 3 ? 7 : star === 2 ? 2 : 1;
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 w-3">{star}</span>
                <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[10px] text-slate-400 w-8 text-right">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category breakdown */}
      <div className="grid grid-cols-2 gap-2">
        {categories.map((cat) => (
          <div key={cat.label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <cat.icon className="w-3 h-3 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-500">{cat.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900 dark:text-white">{cat.rating}</span>
              <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${(cat.rating / 5) * 100}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
