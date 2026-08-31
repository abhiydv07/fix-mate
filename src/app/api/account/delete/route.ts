import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    // Authenticate the user
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const confirmEmail = body.confirmEmail;

    if (!confirmEmail || confirmEmail !== user.email) {
      return NextResponse.json({ error: "Email confirmation required" }, { status: 400 });
    }

    // Service-role client for data cleanup
    const admin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    const userId = user.id;

    // Delete user data from all related tables
    const tables = [
      "reviews",
      "notifications",
      "wallet_transactions",
      "payment_methods",
      "addresses",
      "bookings",
      "provider_profiles",
      "profiles",
    ];

    for (const table of tables) {
      await admin.from(table).delete().eq("user_id", userId);
    }

    // Also delete bookings where user is provider
    await admin.from("bookings").delete().eq("provider_id", userId);

    // Delete KYC documents from storage
    try {
      const { data: files } = await admin.storage
        .from("kyc-docs")
        .list(userId);
      if (files && files.length > 0) {
        const filePaths = files.map((f) => `${userId}/${f.name}`);
        await admin.storage.from("kyc-docs").remove(filePaths);
      }
    } catch {
      // Storage deletion is best-effort
    }

    // Delete the auth user
    const { error: deleteError } = await admin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error("Failed to delete auth user:", deleteError);
      return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
    }

    // Sign out
    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
