import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

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

    // Admin client — bypass RLS because the provider ISN'T provider_id yet
    const adminSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    // Ensure the provider has a profile with role 'provider'
    await adminSupabase.from("profiles").upsert({
      id: user.id,
      role: "provider",
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Provider",
      avatar_url: user.user_metadata?.avatar_url || null,
    }, { onConflict: "id" });

    // Atomic race-condition safe update via admin client:
    // Only succeeds if provider_id IS NULL and status is 'pending'
    const { data: updatedBooking, error } = await adminSupabase
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

    // Fire Notification to Customer (best-effort)
    if (updatedBooking.customer_id) {
      try {
        await adminSupabase.from("notifications").insert({
          user_id: updatedBooking.customer_id,
          title: "Service Pro Assigned! 🛠️",
          body: `A verified service partner accepted your booking #${updatedBooking.id.slice(0, 8)}.`,
        });
      } catch {
        // notification table may not exist
      }
    }

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (err: unknown) {
    console.error("Accept booking error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
