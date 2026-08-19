import { createClient } from "@/lib/supabase/client";

export interface ServiceCategoryItem {
  id: string;
  name: string;
  icon: string | null;
  active: boolean;
}

export interface ServiceItem {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  base_price: number;
  est_duration_min: number | null;
}

export const FALLBACK_CATEGORIES: ServiceCategoryItem[] = [
  { id: "11111111-1111-1111-1111-111111111111", name: "Plumbing", icon: "🚰", active: true },
  { id: "22222222-2222-2222-2222-222222222222", name: "Electrical", icon: "⚡", active: true },
  { id: "33333333-3333-3333-3333-333333333333", name: "Cleaning", icon: "🧹", active: true },
  { id: "44444444-4444-4444-4444-444444444444", name: "Appliances", icon: "🔌", active: true },
  { id: "55555555-5555-5555-5555-555555555555", name: "Painting", icon: "🎨", active: true },
  { id: "66666666-6666-6666-6666-666666666666", name: "Carpentry", icon: "🪚", active: true },
];

export const FALLBACK_SERVICES: ServiceItem[] = [
  {
    id: "a1111111-1111-1111-1111-111111111111",
    category_id: "11111111-1111-1111-1111-111111111111",
    name: "Tap Leak Repair",
    description: "Fix leaking faucets, main valves, and pipe joint connections with 30-day warranty.",
    base_price: 299,
    est_duration_min: 45,
  },
  {
    id: "a2222222-2222-2222-2222-222222222222",
    category_id: "11111111-1111-1111-1111-111111111111",
    name: "Drainage Unblocking",
    description: "Clear clogged kitchen sinks, washbasins, or bathroom drains using pressure jet snake.",
    base_price: 499,
    est_duration_min: 60,
  },
  {
    id: "b1111111-1111-1111-1111-111111111111",
    category_id: "22222222-2222-2222-2222-222222222222",
    name: "Ceiling Fan Installation",
    description: "Assembly, regulator check, and secure ceiling hook mounting.",
    base_price: 349,
    est_duration_min: 45,
  },
  {
    id: "b2222222-2222-2222-2222-222222222222",
    category_id: "22222222-2222-2222-2222-222222222222",
    name: "Switchboard & Socket Replacement",
    description: "Diagnose tripping circuit breakers, fix burnt modular sockets.",
    base_price: 249,
    est_duration_min: 30,
  },
  {
    id: "c1111111-1111-1111-1111-111111111111",
    category_id: "33333333-3333-3333-3333-333333333333",
    name: "Full Home Deep Cleaning",
    description: "Comprehensive deep cleaning of 2BHK/3BHK rooms, kitchen, and balcony with eco-shampoo.",
    base_price: 1999,
    est_duration_min: 240,
  },
  {
    id: "c2222222-2222-2222-2222-222222222222",
    category_id: "33333333-3333-3333-3333-333333333333",
    name: "Sofa & Cushion Shampooing",
    description: "Deep foam extraction and sanitization for 3 to 5 seater sofa sets.",
    base_price: 799,
    est_duration_min: 90,
  },
  {
    id: "d1111111-1111-1111-1111-111111111111",
    category_id: "44444444-4444-4444-4444-444444444444",
    name: "AC Foam & Power Jet Wash",
    description: "Split or window AC filter, cooling coil, and drain tray high-pressure wash.",
    base_price: 599,
    est_duration_min: 60,
  },
];

export async function fetchCategories(): Promise<ServiceCategoryItem[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("active", true);

    if (error || !data || data.length === 0) {
      return FALLBACK_CATEGORIES;
    }
    return data;
  } catch {
    return FALLBACK_CATEGORIES;
  }
}

export async function fetchServices(): Promise<ServiceItem[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("services").select("*");

    if (error || !data || data.length === 0) {
      return FALLBACK_SERVICES;
    }
    return data as ServiceItem[];
  } catch {
    return FALLBACK_SERVICES;
  }
}

export async function getCategoryBySlug(slug: string): Promise<ServiceCategoryItem | undefined> {
  const categories = await fetchCategories();
  return categories.find(
    (c) => c.name.toLowerCase() === slug.toLowerCase() || c.id === slug
  );
}

export async function getServicesByCategory(categoryId: string): Promise<ServiceItem[]> {
  const allServices = await fetchServices();
  return allServices.filter((s) => s.category_id === categoryId);
}

/**
 * Filter services by name and provider pincode availability
 * Joins services -> provider_services -> provider_profiles.service_area_pincodes
 */
export async function searchServicesWithPincode(
  nameQuery: string,
  pincodeQuery: string
): Promise<ServiceItem[]> {
  const allServices = await fetchServices();

  let results = allServices;

  if (nameQuery.trim()) {
    const q = nameQuery.toLowerCase();
    results = results.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q))
    );
  }

  if (pincodeQuery.trim()) {
    try {
      const supabase = createClient();
      // Join provider_services and provider_profiles matching pincode
      const { data: matchedProviders } = await supabase
        .from("provider_profiles")
        .select("id, provider_services(service_id)")
        .contains("service_area_pincodes", [pincodeQuery.trim()]);

      if (matchedProviders && matchedProviders.length > 0) {
        const allowedServiceIds = new Set<string>();
        matchedProviders.forEach((p: any) => {
          if (p.provider_services && Array.isArray(p.provider_services)) {
            p.provider_services.forEach((ps: any) => allowedServiceIds.add(ps.service_id));
          }
        });

        if (allowedServiceIds.size > 0) {
          results = results.filter((s) => allowedServiceIds.has(s.id));
        }
      }
    } catch {
      // Fallback: keep query results if DB is pending
    }
  }

  return results;
}
