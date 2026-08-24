import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { enforceRateLimit } from "@/lib/rate-limit";

const reviewSchema = z.object({
  bookingId: z.string().min(1, "bookingId is required"),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const rl = enforceRateLimit(request, "reviews-post", 10, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: rl.headers });
    }
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const body = await request.json();
    const validation = reviewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid review input" }, { status: 400 });
    }

    const { bookingId, rating, comment } = validation.data;

    // Verify user is customer of completed booking
    const { data: booking } = await supabase
      .from("bookings")
      .select("customer_id, provider_id, status")
      .eq("id", bookingId)
      .single();

    if (!booking || booking.customer_id !== user.id) {
      return NextResponse.json({ error: "Forbidden. Only booking customer can submit review." }, { status: 403 });
    }

    if (booking.status !== "completed") {
      return NextResponse.json({ error: "Reviews can only be submitted for completed bookings." }, { status: 400 });
    }

    // Insert review record (Enforces UNIQUE booking_id)
    const { data: newReview, error: insertError } = await supabase
      .from("reviews")
      .insert({
        booking_id: bookingId,
        rating,
        comment: comment || "",
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json({ error: "You have already submitted a review for this booking." }, { status: 409 });
      }
      return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
    }

    // Recalculate provider avg_rating in application fallback
    if (booking.provider_id) {
      const { data: allReviews } = await supabase
        .from("reviews")
        .select("rating, bookings!inner(provider_id)")
        .eq("bookings.provider_id", booking.provider_id);

      if (allReviews && allReviews.length > 0) {
        const sum = allReviews.reduce((acc, r) => acc + r.rating, 0);
        const avg = Math.round((sum / allReviews.length) * 10) / 10;

        await supabase
          .from("provider_profiles")
          .update({ avg_rating: avg })
          .eq("id", booking.provider_id);
      }
    }

    return NextResponse.json({ success: true, review: newReview }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
