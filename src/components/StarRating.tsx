"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: "sm" | "md" | "lg";
  showNumber?: boolean;
  count?: number;
}

export function StarRating({
  rating,
  maxStars = 5,
  size = "sm",
  showNumber = true,
  count,
}: StarRatingProps) {
  const sizeMap = { sm: "w-3 h-3", md: "w-4 h-4", lg: "w-5 h-5" };
  const textMap = { sm: "text-[10px]", md: "text-xs", lg: "text-sm" };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxStars }).map((_, i) => (
          <Star
            key={i}
            className={`${sizeMap[size]} ${
              i < Math.floor(rating)
                ? "fill-amber-400 text-amber-400"
                : i < rating
                ? "fill-amber-400/50 text-amber-400/50"
                : "fill-slate-700 text-slate-700"
            }`}
          />
        ))}
      </div>
      {showNumber && (
        <span className={`${textMap[size]} font-bold text-amber-400`}>
          {rating.toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className={`${textMap[size]} text-slate-500`}>
          ({count})
        </span>
      )}
    </div>
  );
}
