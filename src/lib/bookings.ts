import { createClient } from "@/lib/supabase/client";

export interface BookingPayload {
  service_id: string;
  address_id: string;
  scheduled_at: string;
  price: number;
  notes?: string;
}

export interface BookingItem {
  id: string;
  customer_id: string;
  provider_id: string | null;
  service_id: string;
  address_id: string;
  status: "pending" | "assigned" | "on_the_way" | "in_progress" | "completed" | "cancelled";
  scheduled_at: string;
  price: number;
  created_at: string;
}

export async function createBooking(payload: BookingPayload): Promise<BookingItem | null> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.warn("User must be logged in to create a booking.");
      return null;
    }

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        customer_id: user.id,
        service_id: payload.service_id,
        address_id: payload.address_id,
        status: "pending",
        scheduled_at: payload.scheduled_at,
        price: payload.price,
      })
      .select()
      .single();

    if (error) {
      console.error("Booking creation error:", error.message);
      return null;
    }

    return data as BookingItem;
  } catch (err) {
    console.error("Supabase booking error:", err);
    return null;
  }
}

export async function getUserBookings(): Promise<BookingItem[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data as BookingItem[];
  } catch {
    return [];
  }
}
