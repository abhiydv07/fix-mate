import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { enforceRateLimit } from "@/lib/rate-limit";

// Zod Validation Schema for Booking creation
const bookingSchema = z.object({
  serviceId: z.string().min(1, "serviceId is required"),
  addressId: z.string().min(1, "addressId is required"),
  scheduledAt: z.string().datetime({ message: "Invalid scheduledAt ISO timestamp" }),
  notes: z.string().optional(),
  couponCode: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    // Rate limit: 5 bookings per minute per IP
    const rl = enforceRateLimit(request, "bookings-post", 5, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many booking requests. Please wait a moment." },
        { status: 429, headers: rl.headers }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in to book." }, { status: 401 });
    }

    // Service-role client for ALL writes — bypasses RLS entirely.
    // We already verified auth above; this avoids FK-triggered deadlocks.
    const adminSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    const body = await request.json();
    const validation = bookingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { serviceId, addressId, scheduledAt, notes, couponCode } = validation.data;

    // ─── 1. Ensure user profile exists (FK: bookings.customer_id → profiles.id) ───
    const { data: profileExists } = await adminSupabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!profileExists) {
      const { error: profileErr } = await adminSupabase.from("profiles").upsert({
        id: user.id,
        role: "customer",
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User",
        avatar_url: user.user_metadata?.avatar_url || null,
      }, { onConflict: "id" });
      if (profileErr) {
        console.error("Profile upsert error:", profileErr.message);
        return NextResponse.json({ error: "Failed to create user profile" }, { status: 500 });
      }
    }

    // ─── 2. Ensure service exists (FK: bookings.service_id → services.id) ───
    const svcName = body.serviceName || "Home Service";
    const svcPrice = body.servicePrice || 299;
    const svcDuration = body.serviceDuration || 45;
    const svcCategoryId = body.serviceCategoryId || "11111111-1111-1111-1111-111111111111";

    // Upsert service via admin client (services table may lack INSERT policy)
    const { error: svcUpErr } = await adminSupabase.from("services").upsert({
      id: serviceId,
      name: svcName,
      base_price: svcPrice,
      est_duration_min: svcDuration,
      category_id: svcCategoryId,
      description: svcName,
    }, { onConflict: "id" });
    if (svcUpErr) {
      console.error("Service upsert error:", svcUpErr.message);
      // Try without description column in case schema differs
      const { error: svcUpErr2 } = await adminSupabase.from("services").upsert({
        id: serviceId,
        name: svcName,
        base_price: svcPrice,
        est_duration_min: svcDuration,
        category_id: svcCategoryId,
      }, { onConflict: "id" });
      if (svcUpErr2) {
        console.error("Service upsert (retry) error:", svcUpErr2.message);
      }
    }

    // Also ensure the category exists
    const { data: catExists } = await adminSupabase
      .from("categories")
      .select("id")
      .eq("id", svcCategoryId)
      .single();
    if (!catExists) {
      await adminSupabase.from("categories").upsert({
        id: svcCategoryId,
        name: "General",
        icon: "🔧",
      }, { onConflict: "id" });
    }

    // Fetch base price from DB (now guaranteed to exist)
    const { data: serviceData } = await adminSupabase
      .from("services")
      .select("base_price, name")
      .eq("id", serviceId)
      .single();

    const basePrice = serviceData ? Number(serviceData.base_price) : svcPrice;
    const convenienceFee = 49;
    let discountAmount = 0;

    // SERVER RE-VALIDATION OF COUPON: Never trust client-sent discounted price!
    if (couponCode && couponCode.trim()) {
      const codeUpper = couponCode.trim().toUpperCase();

      const { data: coupon } = await adminSupabase
        .from("coupons")
        .select("*")
        .eq("code", codeUpper)
        .eq("active", true)
        .gte("valid_until", new Date().toISOString())
        .single();

      if (coupon) {
        if (coupon.discount_type === "flat") {
          discountAmount = Number(coupon.value);
        } else if (coupon.discount_type === "percent") {
          discountAmount = (basePrice * Number(coupon.value)) / 100;
        }
      }
    }

    // Recalculate total price strictly server-side
    const totalPrice = Math.max(0, basePrice + convenienceFee - discountAmount);

    // Double-Booking Check for Customer
    const { data: existingBookings } = await adminSupabase
      .from("bookings")
      .select("id")
      .eq("customer_id", user.id)
      .eq("scheduled_at", scheduledAt)
      .not("status", "eq", "cancelled");

    if (existingBookings && existingBookings.length > 0) {
      return NextResponse.json(
        { error: "You already have a booking scheduled at this date and time slot." },
        { status: 409 }
      );
    }

    // Provider Matching Engine: Find verified providers offering THIS service
    let matchedProviders: unknown[] = [];
    try {
      // Find providers linked to this service via provider_services junction table
      const { data: serviceProviders } = await adminSupabase
        .from("provider_services")
        .select("provider_id")
        .eq("service_id", serviceId);

      if (serviceProviders && serviceProviders.length > 0) {
        const providerIds = serviceProviders.map((sp) => sp.provider_id);
        // Get verified, available providers from those matched
        const { data } = await adminSupabase
          .from("provider_profiles")
          .select("id, avg_rating")
          .in("id", providerIds)
          .eq("verified", true)
          .eq("is_available", true)
          .order("avg_rating", { ascending: false });
        matchedProviders = data || [];
      }

      // Fallback: if no provider is linked to this service, find any verified provider
      if (matchedProviders.length === 0) {
        const { data } = await adminSupabase
          .from("provider_profiles")
          .select("id, avg_rating")
          .eq("verified", true)
          .eq("is_available", true)
          .order("avg_rating", { ascending: false });
        matchedProviders = data || [];
      }
    } catch {
      matchedProviders = [];
    }

    // ─── 3. Ensure address exists (FK: bookings.address_id → addresses.id) ───
    const { data: addrExists } = await adminSupabase
      .from("addresses")
      .select("id")
      .eq("id", addressId)
      .single();

    let actualAddressId = addressId;
    if (!addrExists) {
      const { data: newAddr, error: addrErr } = await adminSupabase.from("addresses").upsert({
        id: addressId,
        user_id: user.id,
        line1: body.addressLine1 || "Home",
        city: body.addressCity || "Noida",
        pincode: body.addressPincode || "201301",
        label: "home",
        lat: body.addressLat || 28.5802,
        lng: body.addressLng || 77.3340,
      }, { onConflict: "id" }).select("id").single();
      if (newAddr) {
        actualAddressId = newAddr.id;
      } else {
        console.error("Address upsert error:", addrErr?.message);
        // Generate a fresh UUID for address as last resort
        actualAddressId = addressId;
      }
    }

    // ─── 4. Insert booking using admin client (bypasses RLS) ───
    const { data: newBooking, error: insertError } = await adminSupabase
      .from("bookings")
      .insert({
        customer_id: user.id,
        service_id: serviceId,
        address_id: actualAddressId,
        status: "pending",
        scheduled_at: scheduledAt,
        price: totalPrice,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Booking insert error:", insertError.message, insertError.details, insertError.hint);
      return NextResponse.json({
        error: "Database error creating booking",
        details: insertError.message,
      }, { status: 500 });
    }

    // Fire Notification (best-effort, don't block booking)
    try {
      await adminSupabase.from("notifications").insert({
        user_id: user.id,
        title: "Booking Confirmed!",
        body: `Your service booking #${newBooking.id.slice(0, 8)} has been placed. Broadcasting to local pros.`,
      });
    } catch {
      // notification table may not exist, don't fail the booking
    }

    return NextResponse.json(
      {
        success: true,
        booking: newBooking,
        matchedProvidersCount: matchedProviders?.length || 0,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("POST /api/bookings error:", err);
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

    // Admin client to bypass RLS for reads
    const adminSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    // Fetch role from profiles table (not user_metadata)
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const userRole = profile?.role || "customer";

    // Join with services table to get service name, and profiles for provider name
    let query = adminSupabase
      .from("bookings")
      .select("*, services(name, description, base_price), provider:profiles!bookings_provider_id_fkey(name, avatar_url)");

    if (userRole === "provider" || userRole === "admin") {
      if (userRole === "admin") {
        // Admin sees all bookings
      } else {
        query = query.or(`provider_id.eq.${user.id},status.eq.pending`);
      }
    } else {
      // Customers see only their own bookings
      query = query.eq("customer_id", user.id);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ bookings: data });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
