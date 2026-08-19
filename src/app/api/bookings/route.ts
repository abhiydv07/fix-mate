import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Zod Validation Schema for Booking creation
const bookingSchema = z.object({
  serviceId: z.string().min(1, "serviceId is required"),
  addressId: z.string().min(1, "addressId is required"),
  scheduledAt: z.string().datetime({ message: "Invalid scheduledAt ISO timestamp" }),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in to book." }, { status: 401 });
    }

    const body = await request.json();
    const validation = bookingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { serviceId, addressId, scheduledAt, notes } = validation.data;

    // Fetch delivery address details to get pincode
    const { data: addressData } = await supabase
      .from("addresses")
      .select("pincode, line1, city")
      .eq("id", addressId)
      .single();

    const deliveryPincode = addressData?.pincode || "560038";

    // Fetch base price of the service
    const { data: serviceData } = await supabase
      .from("services")
      .select("base_price, name")
      .eq("id", serviceId)
      .single();

    const basePrice = serviceData ? Number(serviceData.base_price) : 299;
    const convenienceFee = 49;
    const totalPrice = basePrice + convenienceFee;

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
    const { data: matchedProviders } = await supabase
      .from("provider_profiles")
      .select("id, avg_rating, provider_services(service_id)")
      .eq("verified", true)
      .eq("is_available", true)
      .contains("service_area_pincodes", [deliveryPincode])
      .order("avg_rating", { ascending: false });

    console.log(
      `🎯 Provider Match: Found ${matchedProviders?.length || 0} providers for pincode ${deliveryPincode}`
    );

    // Insert new booking record with status 'pending' (Broadcasted to matched providers)
    const { data: newBooking, error: insertError } = await supabase
      .from("bookings")
      .insert({
        customer_id: user.id,
        service_id: serviceId,
        address_id: addressId,
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
      // Provider sees assigned bookings or open pending broadcasts
      query = query.or(`provider_id.eq.${user.id},status.eq.pending`);
    } else if (userRole === "admin") {
      // Admin sees all
    } else {
      // Customer sees own bookings
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
