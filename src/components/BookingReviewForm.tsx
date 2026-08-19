"use client";

import { useState } from "react";
import { Star, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookingReviewFormProps {
  bookingId: string;
  onSuccess?: () => void;
}

export function BookingReviewForm({ bookingId, onSuccess }: BookingReviewFormProps) {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          rating,
          comment,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsSubmitted(true);
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(data.error || "Failed to submit review.");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
        <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
        <h4 className="font-bold text-xs text-emerald-300">Thank You for Your Feedback!</h4>
        <p className="text-[11px] text-slate-400">Your review helps improve community service quality.</p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
      <div className="space-y-0.5">
        <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Rate Your Service Experience
        </h3>
        <p className="text-[11px] text-slate-400">Share rating and feedback for your verified pro.</p>
      </div>

      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-400">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Star Rating Picker */}
        <div className="flex items-center gap-1.5 justify-center py-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={`w-7 h-7 ${
                  star <= rating
                    ? "text-amber-400 fill-amber-400 drop-shadow-md shadow-amber-400/20"
                    : "text-slate-700"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Comment Text Area */}
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you like about the pro's work? (e.g. On-time, clean work, professional behaviour)"
          className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          size="sm"
          className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs py-2.5"
        >
          {isSubmitting ? "Submitting Review..." : "Submit Verified Review ★"}
        </Button>
      </form>
    </div>
  );
}
