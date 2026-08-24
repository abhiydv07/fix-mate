import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const impersonateSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify requester is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const validation = impersonateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }

    // Get the target user's info
    const { data: targetUser } = await supabase
      .from("profiles")
      .select("id, name, role")
      .eq("id", validation.data.userId)
      .single();

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Log the impersonation
    await supabase.from("notifications").insert({
      user_id: validation.data.userId,
      title: "Admin Access",
      body: `An admin temporarily accessed your account for support purposes.`,
    });

    return NextResponse.json({
      success: true,
      impersonate: {
        userId: targetUser.id,
        name: targetUser.name,
        role: targetUser.role,
      },
      message: `In production, this would create a temporary admin session. Target: ${targetUser.name} (${targetUser.role})`,
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
