import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const updateVerificationSchema = z.object({
  providerId: z.string().min(1, "providerId is required"),
  verified: z.boolean(),
});

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Admin role check
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = updateVerificationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { providerId, verified } = validation.data;

    // Update provider_profiles verified flag
    const { data: updatedProfile, error } = await supabase
      .from("provider_profiles")
      .update({ verified })
      .eq("id", providerId)
      .select()
      .single();

    if (error || !updatedProfile) {
      return NextResponse.json({ error: "Failed to update verification status" }, { status: 500 });
    }

    // Fire notification to provider
    await supabase.from("notifications").insert({
      user_id: providerId,
      title: verified ? "KYC Approved! 🎉" : "KYC Update ⚠️",
      body: verified
        ? "Your partner KYC document was verified! You are now eligible to receive local job broadcasts."
        : "Your KYC verification status was updated.",
    });

    return NextResponse.json({ success: true, provider: updatedProfile });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Admin role check
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch provider profiles with associated profile data
    const { data: providers, error } = await supabase
      .from("provider_profiles")
      .select("*, profiles!inner(name, phone, avatar_url)")
      .order("verified", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ providers: providers || [] });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
