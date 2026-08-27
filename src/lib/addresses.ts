import { createClient } from "@/lib/supabase/client";

export interface AddressItem {
  id: string;
  user_id: string;
  label: string | null;
  line1: string;
  line2: string | null;
  city: string;
  pincode: string;
  lat: number | null;
  lng: number | null;
  is_default: boolean;
}

export const FALLBACK_ADDRESSES: AddressItem[] = [
  {
    id: "addr-1",
    user_id: "demo-user",
    label: "Home",
    line1: "Flat 402, Green Avenue, 10th Main",
    line2: "Near Metro Station",
    city: "Noida",
    pincode: "201301",
    lat: 28.5802,
    lng: 77.3340,
    is_default: true,
  },
];

export async function getUserAddresses(): Promise<AddressItem[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return FALLBACK_ADDRESSES;

    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false });

    if (error) {
      return FALLBACK_ADDRESSES;
    }
    // If user has real addresses, use those. Otherwise return empty (not fallback)
    if (!data || data.length === 0) {
      return [];
    }
    return data as AddressItem[];
  } catch {
    return FALLBACK_ADDRESSES;
  }
}

export async function createAddress(
  address: Omit<AddressItem, "id" | "user_id">
): Promise<AddressItem | null> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    if (address.is_default) {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);
    }

    const { data, error } = await supabase
      .from("addresses")
      .insert({
        user_id: user.id,
        ...address,
      })
      .select()
      .single();

    if (error) throw error;
    return data as AddressItem;
  } catch (err) {
    console.error("Create address error:", err);
    return null;
  }
}

export async function updateAddress(
  id: string,
  updates: Partial<Omit<AddressItem, "id" | "user_id">>
): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    if (updates.is_default) {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);
    }

    const { error } = await supabase
      .from("addresses")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id);

    return !error;
  } catch {
    return false;
  }
}

export async function deleteAddress(id: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    return !error;
  } catch {
    return false;
  }
}

export async function setDefaultAddress(id: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);

    const { error } = await supabase
      .from("addresses")
      .update({ is_default: true })
      .eq("id", id)
      .eq("user_id", user.id);

    return !error;
  } catch {
    return false;
  }
}
