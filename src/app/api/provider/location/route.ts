import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

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

    // Upsert provider live GPS coordinates into provider_locations
    const { data, error } = await supabase
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
