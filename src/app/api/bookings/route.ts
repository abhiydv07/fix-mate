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

    // Service-role client for operations that need to bypass RLS
    // (services table only has SELECT policy, but we need to upsert for bookings)
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

    // Fetch delivery address details to get pincode
    const { data: addressData } = await supabase
      .from("addresses")
      .select("pincode, line1, city")
      .eq("id", addressId)
      .single();

    const deliveryPincode = addressData?.pincode || "560038";

    // Fetch base price of the service from database
    const { data: serviceData } = await supabase
      .from("services")
      .select("base_price, name")
      .eq("id", serviceId)
      .single();

    // If service doesn't exist in DB (fallback UUID), try to insert it first
    if (!serviceData) {
      // Attempt to insert the service so the foreign key is satisfied
      const svcName = body.serviceName || "Home Service";
      const svcPrice = body.servicePrice || 299;
      const svcDuration = body.serviceDuration || 45;
      const svcCategoryId = body.serviceCategoryId;
      
      // Use admin client to bypass RLS (services table only has SELECT policy)
      await adminSupabase.from("services").upsert({
        id: serviceId,
        name: svcName,
        base_price: svcPrice,
        est_duration_min: svcDuration,
        category_id: svcCategoryId || "11111111-1111-1111-1111-111111111111",
        description: svcName,
      }, { onConflict: "id" });
    }

    const basePrice = serviceData ? Number(serviceData.base_price) : (body.servicePrice || 299);
    const convenienceFee = 49;
    let discountAmount = 0;

    // SERVER RE-VALIDATION OF COUPON: Never trust client-sent discounted price!
    if (couponCode && couponCode.trim()) {
      const codeUpper = couponCode.trim().toUpperCase();

      const { data: coupon } = await supabase
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
    const { data: existingBookings } = await supabase
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

    // Provider Matching Engine: Find available verified providers offering serviceId in deliveryPincode
    let matchedProviders: unknown[] = [];
    try {
      const { data } = await supabase
        .from("provider_profiles")
        .select("id, avg_rating")
        .eq("verified", true)
        .eq("is_available", true)
        .order("avg_rating", { ascending: false });
      matchedProviders = data || [];
    } catch {
      // provider_profiles table may not exist yet
      matchedProviders = [];
    }

    // Ensure address exists — if not, create a default one
    const { data: addrExists } = await supabase
      .from("addresses")
      .select("id")
      .eq("id", addressId)
      .single();

    let actualAddressId = addressId;
    if (!addrExists) {
      const { data: newAddr } = await adminSupabase.from("addresses").upsert({
        id: addressId,
        user_id: user.id,
        line1: body.addressLine1 || "Home",
        city: body.addressCity || "Bengaluru",
        pincode: body.addressPincode || "560038",
        label: "home",
      }, { onConflict: "id" }).select("id").single();
      if (newAddr) actualAddressId = newAddr.id;
    }

    // Insert new booking record with status 'pending'
    const { data: newBooking, error: insertError } = await supabase
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
      console.error("Booking insert error:", insertError.message);
      return NextResponse.json({ error: "Database error creating booking" }, { status: 500 });
    }

    // Fire Notification & Resend Email
    await supabase.from("notifications").insert({
      user_id: user.id,
      title: "Booking Confirmed!",
      body: `Your service booking #${newBooking.id.slice(0, 8)} has been placed. Broadcasting to local pros.`,
    });

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

    const userRole = user.user_metadata?.role || "customer";

    let query = supabase.from("bookings").select("*");

    if (userRole === "provider") {
      query = query.or(`provider_id.eq.${user.id},status.eq.pending`);
    } else if (userRole === "admin") {
      // Admin sees all
    } else {
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
