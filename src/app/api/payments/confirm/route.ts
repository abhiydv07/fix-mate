import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { enforceRateLimit } from "@/lib/rate-limit";

const confirmSchema = z.object({
  bookingId: z.string().min(1, "bookingId is required"),
  role: z.enum(["customer", "provider"]),
});

export async function POST(request: Request) {
  try {
    // Rate limit: 10 per minute per IP
    const rl = enforceRateLimit(request, "payment-confirm", 10, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429, headers: rl.headers });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = confirmSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { bookingId, role } = validation.data;

    // Check if payment row exists for bookingId
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("*")
      .eq("booking_id", bookingId)
      .single();

    let updatedPayment;

    if (!existingPayment) {
      // Create initial payment record
      const { data: booking } = await supabase
        .from("bookings")
        .select("price")
        .eq("id", bookingId)
        .single();

      const amount = booking ? Number(booking.price) : 348;

      const { data: inserted, error: insertErr } = await supabase
        .from("payments")
        .insert({
          booking_id: bookingId,
          amount,
          method: "cash",
          status: "collected",
          confirmed_by_provider: role === "provider",
          confirmed_by_customer: role === "customer",
        })
        .select()
        .single();

      if (insertErr) {
        return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
      }
      updatedPayment = inserted;
    } else {
      // Update existing payment record
      const updates: { confirmed_by_provider?: boolean; confirmed_by_customer?: boolean; status?: string } = {};
      if (role === "provider") updates.confirmed_by_provider = true;
      if (role === "customer") updates.confirmed_by_customer = true;

      // If both confirmed -> status = 'collected'
      const bothConfirmed =
        (role === "provider" || existingPayment.confirmed_by_provider) &&
        (role === "customer" || existingPayment.confirmed_by_customer);

      if (bothConfirmed) {
        updates.status = "collected";
      }

      const { data: updated, error: updateErr } = await supabase
        .from("payments")
        .update(updates)
        .eq("id", existingPayment.id)
        .select()
        .single();

      if (updateErr) {
        return NextResponse.json({ error: "Failed to update payment confirmation" }, { status: 500 });
      }
      updatedPayment = updated;
    }

    return NextResponse.json({ success: true, payment: updatedPayment });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
