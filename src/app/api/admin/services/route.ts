import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const serviceSchema = z.object({
  category_id: z.string().uuid(),
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  base_price: z.number().min(1, "Price must be positive"),
  est_duration_min: z.number().min(5).max(480).optional(),
});

const updateServiceSchema = z.object({
  id: z.string().uuid(),
  category_id: z.string().uuid().optional(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  base_price: z.number().min(1).optional(),
  est_duration_min: z.number().min(5).max(480).optional(),
});

const deleteServiceSchema = z.object({
  id: z.string().uuid(),
});

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { supabase };
}

export async function GET() {
  try {
    const result = await requireAdmin();
    if ("error" in result) return result.error;
    const { supabase } = result;

    const { data, error } = await supabase
      .from("services")
      .select("*, categories(name)")
      .order("name");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ services: data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const result = await requireAdmin();
    if ("error" in result) return result.error;
    const { supabase } = result;

    const body = await request.json();
    const validation = serviceSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid payload", details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("services")
      .insert(validation.data)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ service: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const result = await requireAdmin();
    if ("error" in result) return result.error;
    const { supabase } = result;

    const body = await request.json();
    const validation = updateServiceSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { id, ...updates } = validation.data;
    const { data, error } = await supabase
      .from("services")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ service: data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const result = await requireAdmin();
    if ("error" in result) return result.error;
    const { supabase } = result;

    const body = await request.json();
    const validation = deleteServiceSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { error } = await supabase.from("services").delete().eq("id", validation.data.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
