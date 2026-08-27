import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

const statusSchema = z.object({
  status: z.enum(["assigned", "on_the_way", "in_progress", "completed", "cancelled"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: { bookingId: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = statusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const { status } = validation.data;
    const { bookingId } = params;

    // Admin client — bypasses RLS for status updates
    const adminSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    // Execute status update via admin client
    const { data: updatedBooking, error } = await adminSupabase
      .from("bookings")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)
      .select()
      .single();

    if (error || !updatedBooking) {
      return NextResponse.json({ error: "Failed to update booking status" }, { status: 500 });
    }

    // Fire Notification on Status Update (best-effort)
    if (updatedBooking.customer_id) {
      const statusTitle =
        status === "on_the_way"
          ? "Pro On The Way! 🚗"
          : status === "in_progress"
          ? "Work In Progress 🛠️"
          : status === "completed"
          ? "Service Completed! 🎉"
          : "Status Updated";

      const statusBody =
        status === "completed"
          ? `Your booking #${updatedBooking.id.slice(0, 8)} is complete. Thank you for choosing Fix Mate!`
          : `Booking #${updatedBooking.id.slice(0, 8)} status changed to ${status.replace(/_/g, " ")}.`;

      try {
        await adminSupabase.from("notifications").insert({
          user_id: updatedBooking.customer_id,
          title: statusTitle,
          body: statusBody,
        });
      } catch {
        // notification table may not exist
      }
    }

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
