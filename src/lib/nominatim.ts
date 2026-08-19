export interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

const NOMINATIM_HEADERS = {
  "User-Agent": "FixMate-App/1.0 (support@fixmate.in)",
  "Accept-Language": "en",
};

let lastCallTimestamp = 0;

/**
 * Enforce Nominatim 1 request / second rate limit policy
 */
async function enforceRateLimit() {
  const now = Date.now();
  const timeSinceLastCall = now - lastCallTimestamp;
  if (timeSinceLastCall < 1000) {
    await new Promise((resolve) => setTimeout(resolve, 1000 - timeSinceLastCall));
  }
  lastCallTimestamp = Date.now();
}

/**
 * Search location by address text query via OpenStreetMap Nominatim
 */
export async function searchAddressNominatim(query: string): Promise<NominatimResult[]> {
  if (!query || query.trim().length < 3) return [];

  await enforceRateLimit();

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(
      query
    )}`;

    const res = await fetch(url, { headers: NOMINATIM_HEADERS });
    if (!res.ok) return [];

    const data: NominatimResult[] = await res.json();
    return data;
  } catch (error) {
    console.error("Nominatim search error:", error);
    return [];
  }
}

/**
 * Reverse geocode lat/lng to human readable address via OpenStreetMap Nominatim
 */
export async function reverseGeocodeNominatim(
  lat: number,
  lng: number
): Promise<NominatimResult | null> {
  await enforceRateLimit();

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${lat}&lon=${lng}`;

    const res = await fetch(url, { headers: NOMINATIM_HEADERS });
    if (!res.ok) return null;

    const data: NominatimResult = await res.json();
    return data;
  } catch (error) {
    console.error("Nominatim reverse geocode error:", error);
    return null;
  }
}
