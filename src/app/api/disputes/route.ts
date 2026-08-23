import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { enforceRateLimit } from "@/lib/rate-limit";

const flagDisputeSchema = z.object({
  bookingId: z.string().uuid(),
  reason: z.string().min(10, "Reason must be at least 10 characters").max(500),
});

export async function POST(request: Request) {
  try {
    // Rate limit: 5 disputes per minute per IP
    const rl = enforceRateLimit(request, "disputes-post", 5, 60_000);
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
    const validation = flagDisputeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid payload", details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { bookingId, reason } = validation.data;

    // Verify user is customer or provider of this booking
    const { data: booking } = await supabase
      .from("bookings")
      .select("customer_id, provider_id, status")
      .eq("id", bookingId)
      .single();

    if (!booking || (booking.customer_id !== user.id && booking.provider_id !== user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (booking.status === "cancelled") {
      return NextResponse.json({ error: "Cannot dispute a cancelled booking" }, { status: 400 });
    }

    // Check for existing open dispute on this booking
    const { data: existing } = await supabase
      .from("disputes")
      .select("id")
      .eq("booking_id", bookingId)
      .eq("status", "open")
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "This booking already has an open dispute" }, { status: 409 });
    }

    const { data: dispute, error: insertError } = await supabase
      .from("disputes")
      .insert({
        booking_id: bookingId,
        raised_by: user.id,
        reason,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: "Failed to create dispute" }, { status: 500 });
    }

    // Notify admin
    const { data: admins } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "admin");

    if (admins && admins.length > 0) {
      await supabase.from("notifications").insert(
        admins.map((admin) => ({
          user_id: admin.id,
          title: "New Dispute Flagged ⚠️",
          body: `Booking #${bookingId.slice(0, 8)} has been flagged: "${reason.slice(0, 60)}"`,
        }))
      );
    }

    return NextResponse.json({ success: true, dispute }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    let query = supabase
      .from("disputes")
      .select("*, bookings!inner(customer_id, provider_id, service_id, price, scheduled_at, status), profiles!disputes_raised_by_fkey(name)")
      .order("created_at", { ascending: false });

    if (profile?.role !== "admin") {
      query = query.or(`raised_by.eq.${user.id},bookings.customer_id.eq.${user.id},bookings.provider_id.eq.${user.id}`);
    }

    const { data, error } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ disputes: data || [] });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
