import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

const locationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = locationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    const { lat, lng } = validation.data;

    // Admin client — bypasses RLS for location upsert
    const adminSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    // Upsert provider live GPS coordinates
    const { data, error } = await adminSupabase
      .from("provider_locations")
      .upsert(
        {
          provider_id: user.id,
          lat,
          lng,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "provider_id" }
      )
      .select()
      .single();

    if (error) {
      console.error("Provider location upsert error:", error.message);
      return NextResponse.json({ error: "Failed to update location" }, { status: 500 });
    }

    return NextResponse.json({ success: true, location: data });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
