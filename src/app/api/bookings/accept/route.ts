import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const acceptSchema = z.object({
  bookingId: z.string().min(1, "bookingId is required"),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Sign in as provider." }, { status: 401 });
    }

    const body = await request.json();
    const validation = acceptSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid bookingId" }, { status: 400 });
    }

    const { bookingId } = validation.data;

    // Atomic race-condition safe update:
    // Only succeeds if provider_id IS NULL and status is 'pending'
    const { data: updatedBooking, error } = await supabase
      .from("bookings")
      .update({
        provider_id: user.id,
        status: "assigned",
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)
      .is("provider_id", null)
      .eq("status", "pending")
      .select()
      .single();

    if (error || !updatedBooking) {
      return NextResponse.json(
        {
          error: "Job already claimed by another provider or no longer pending.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (err: unknown) {
    console.error("Accept booking error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
