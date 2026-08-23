import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all bookings for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: bookings } = await supabase
      .from("bookings")
      .select("id, service_id, status, price, created_at")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: true });

    // Fetch all services
    const { data: services } = await supabase
      .from("services")
      .select("id, name");

    // Fetch provider stats
    const { data: allProviders } = await supabase
      .from("provider_profiles")
      .select("id, verified, is_available, avg_rating");

    // --- Bookings per day (last 30 days) ---
    const bookingsPerDay: Record<string, number> = {};
    const revenuePerDay: Record<string, number> = {};
    const serviceCounts: Record<string, number> = {};

    // Initialize all 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      bookingsPerDay[key] = 0;
      revenuePerDay[key] = 0;
    }

    const serviceMap: Record<string, string> = {};
    services?.forEach((s) => { serviceMap[s.id] = s.name; });

    bookings?.forEach((b) => {
      const day = b.created_at.split("T")[0];
      if (bookingsPerDay[day] !== undefined) {
        bookingsPerDay[day] += 1;
        revenuePerDay[day] += Number(b.price);
      }
      const sName = serviceMap[b.service_id] || "Unknown";
      serviceCounts[sName] = (serviceCounts[sName] || 0) + 1;
    });

    const bookingsChart = Object.entries(bookingsPerDay).map(([date, count]) => ({
      date: date.slice(5), // MM-DD
      bookings: count,
      revenue: revenuePerDay[date],
    }));

    // --- Top 5 services ---
    const topServices = Object.entries(serviceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // --- Provider stats ---
    const totalProviders = allProviders?.length || 0;
    const verifiedProviders = allProviders?.filter((p) => p.verified).length || 0;
    const availableProviders = allProviders?.filter((p) => p.is_available).length || 0;
    const avgProviderRating = allProviders && allProviders.length > 0
      ? Math.round((allProviders.reduce((sum, p) => sum + Number(p.avg_rating), 0) / allProviders.length) * 10) / 10
      : 0;

    // --- Summary stats ---
    const totalBookings = bookings?.length || 0;
    const completedBookings = bookings?.filter((b) => b.status === "completed").length || 0;
    const totalRevenue = bookings?.filter((b) => b.status === "completed").reduce((sum, b) => sum + Number(b.price), 0) || 0;

    return NextResponse.json({
      bookingsChart,
      topServices,
      providerStats: {
        total: totalProviders,
        verified: verifiedProviders,
        available: availableProviders,
        avgRating: avgProviderRating,
      },
      summary: {
        totalBookings,
        completedBookings,
        totalRevenue,
        conversionRate: totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0,
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
