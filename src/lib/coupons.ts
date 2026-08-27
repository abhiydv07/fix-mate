import { createClient } from "@/lib/supabase/client";

export interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order: number;
  max_discount: number;
  valid_from: string;
  valid_until: string;
  usage_limit: number;
  used_count: number;
  active: boolean;
}

export async function validateCoupon(code: string, orderAmount: number): Promise<{ valid: boolean; discount: number; error?: string }> {
  const supabase = createClient();

  const { data: coupon, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("active", true)
    .single();

  if (error || !coupon) {
    return { valid: false, discount: 0, error: "Invalid coupon code" };
  }

  const now = new Date();
  if (new Date(coupon.valid_until) < now) {
    return { valid: false, discount: 0, error: "Coupon has expired" };
  }
  if (new Date(coupon.valid_from) > now) {
    return { valid: false, discount: 0, error: "Coupon is not active yet" };
  }
  if (coupon.usage_limit > 0 && coupon.used_count >= coupon.usage_limit) {
    return { valid: false, discount: 0, error: "Coupon usage limit reached" };
  }
  if (orderAmount < coupon.min_order) {
    return { valid: false, discount: 0, error: `Minimum order ₹${coupon.min_order} required` };
  }

  let discount = 0;
  if (coupon.discount_type === "percentage") {
    discount = Math.round((orderAmount * coupon.discount_value) / 100);
    discount = Math.min(discount, coupon.max_discount);
  } else {
    discount = coupon.discount_value;
  }

  return { valid: true, discount };
}

export async function applyCoupon(code: string): Promise<boolean> {
  const supabase = createClient();
  // Fetch current count and increment
  const { data } = await supabase.from("coupons").select("used_count").eq("code", code.toUpperCase()).single();
  if (!data) return false;

  const { error } = await supabase
    .from("coupons")
    .update({ used_count: (data.used_count || 0) + 1 })
    .eq("code", code.toUpperCase());

  return !error;
}
