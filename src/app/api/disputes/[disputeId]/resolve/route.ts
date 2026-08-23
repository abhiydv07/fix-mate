import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const resolveSchema = z.object({
  status: z.enum(["investigating", "resolved", "closed"]),
  resolution: z.string().min(1, "Resolution note required").max(500).optional(),
  priceAdjustment: z.number().min(-10000).max(10000).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { disputeId: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Admin only
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = resolveSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { status, resolution, priceAdjustment } = validation.data;

    const updateData: Record<string, unknown> = {
      status,
      resolved_by: user.id,
      updated_at: new Date().toISOString(),
    };
    if (resolution) updateData.resolution = resolution;
    if (priceAdjustment !== undefined) updateData.price_adjustment = priceAdjustment;

    const { data: dispute, error } = await supabase
      .from("disputes")
      .update(updateData)
      .eq("id", params.disputeId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Notify the person who raised the dispute
    if (dispute && dispute.raised_by) {
      await supabase.from("notifications").insert({
        user_id: dispute.raised_by,
        title: `Dispute ${status === "resolved" ? "Resolved ✅" : status === "investigating" ? "Under Investigation 🔍" : "Closed"}`,
        body: `Your dispute for booking #${dispute.booking_id.slice(0, 8)} has been updated.${resolution ? ` Resolution: "${resolution.slice(0, 80)}"` : ""}`,
      });
    }

    return NextResponse.json({ success: true, dispute });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
