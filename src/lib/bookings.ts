import { createClient } from "@/lib/supabase/client";

export interface BookingPayload {
  service_id: string;
  address_id: string;
  scheduled_at: string;
  price: number;
  notes?: string;
  couponCode?: string;
  serviceName?: string;
  servicePrice?: number;
  serviceDuration?: number;
  serviceCategoryId?: string;
  addressLine1?: string;
  addressCity?: string;
  addressPincode?: string;
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

export async function createBooking(payload: BookingPayload): Promise<{ success: boolean; booking?: BookingItem; error?: string }> {
  try {
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        serviceId: payload.service_id,
        addressId: payload.address_id,
        scheduledAt: payload.scheduled_at,
        notes: payload.notes,
        couponCode: payload.couponCode,
        serviceName: payload.serviceName,
        servicePrice: payload.servicePrice,
        serviceDuration: payload.serviceDuration,
        serviceCategoryId: payload.serviceCategoryId,
        addressLine1: payload.addressLine1,
        addressCity: payload.addressCity,
        addressPincode: payload.addressPincode,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error || "Booking failed" };
    }

    return { success: true, booking: data.booking };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

export async function getUserBookings(): Promise<BookingItem[]> {
  try {
    const res = await fetch("/api/bookings");
    if (!res.ok) return [];
    const data = await res.json();
    return data.bookings || [];
  } catch {
    return [];
  }
}
