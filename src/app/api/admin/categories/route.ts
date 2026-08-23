import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  icon: z.string().max(10).optional(),
  active: z.boolean().optional(),
});

const updateCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50).optional(),
  icon: z.string().max(10).optional(),
  active: z.boolean().optional(),
});

const deleteCategorySchema = z.object({
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
      .from("categories")
      .select("*")
      .order("name");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ categories: data });
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
    const validation = categorySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid payload", details: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("categories")
      .insert({ name: validation.data.name, icon: validation.data.icon || "🔧", active: validation.data.active ?? true })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ category: data }, { status: 201 });
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
    const validation = updateCategorySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { id, ...updates } = validation.data;
    const { data, error } = await supabase
      .from("categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ category: data });
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
    const validation = deleteCategorySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { error } = await supabase.from("categories").delete().eq("id", validation.data.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
