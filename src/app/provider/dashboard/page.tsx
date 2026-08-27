"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase, Calendar, CheckCircle2, Clock, MapPin, Wrench, ArrowRight,
  Star, TrendingUp, Wallet, ChevronRight, Phone, Navigation, AlertCircle, Users
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import dynamic from "next/dynamic";

const EarningsChart = dynamic(() => import("@/components/EarningsChart").then((m) => m.EarningsChart), { ssr: false, loading: () => <div className="h-48 rounded-2xl bg-slate-900 animate-pulse" /> });

interface DashboardStats {
  activeJobs: number;
  completedToday: number;
  completedWeek: number;
  totalEarnings: number;
  weekEarnings: number;
  avgRating: number;
  totalReviews: number;
  acceptanceRate: number;
  responseTime: string;
}

interface ActiveJob {
  id: string;
  service_name: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  scheduled_at: string;
  status: string;
  price: number;
}

export default function ProviderDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    activeJobs: 0, completedToday: 0, completedWeek: 0,
    totalEarnings: 0, weekEarnings: 0, avgRating: 0, totalReviews: 0,
    acceptanceRate: 95, responseTime: "2 min",
  });
  const [activeJobs, setActiveJobs] = useState<ActiveJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [providerName, setProviderName] = useState("");
  const supabase = createClient();

  useEffect(() => { loadDashboard(); }, []);

  async function loadDashboard() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsLoading(false); return; }

    const { data: profile } = await supabase.from("profiles").select("name").eq("id", user.id).single();
    setProviderName(profile?.name || "Pro");

    // Active jobs
    const { data: jobs } = await supabase
      .from("bookings")
      .select("id, status, price, scheduled_at, customer_id, address_id, service_id")
      .eq("provider_id", user.id)
      .in("status", ["assigned", "on_the_way", "in_progress"])
      .order("scheduled_at", { ascending: true });

    if (jobs) {
      const customerIds = [...new Set(jobs.map((j) => j.customer_id).filter(Boolean))];
      const { data: customers } = await supabase.from("profiles").select("id, name").in("id", customerIds);
      const custMap = new Map(customers?.map((c) => [c.id, c.name]) || []);

      const serviceIds = [...new Set(jobs.map((j) => j.service_id).filter(Boolean))];
      const { data: svcs } = await supabase.from("services").select("id, name").in("id", serviceIds);
      const svcMap = new Map(svcs?.map((s) => [s.id, s.name]) || []);

      setActiveJobs(jobs.map((j) => ({
        id: j.id,
        service_name: svcMap.get(j.service_id) || "Service",
        customer_name: custMap.get(j.customer_id) || "Customer",
        customer_phone: "",
        address: "Address on file",
        scheduled_at: j.scheduled_at,
        status: j.status,
        price: j.price || 0,
      })));
    }

    // Completed stats
    const { count: completedWeek } = await supabase
      .from("bookings").select("*", { count: "exact", head: true })
      .eq("provider_id", user.id).eq("status", "completed");

    // Earnings
    const { data: payments } = await supabase
      .from("payments").select("amount, status")
      .eq("provider_id", user.id).eq("status", "completed");

    const totalEarnings = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    // Reviews
    const { data: reviews } = await supabase
      .from("reviews").select("rating")
      .eq("provider_id", user.id);

    const avgRating = reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 4.8;

    setStats({
      activeJobs: jobs?.length || 0,
      completedToday: 0,
      completedWeek: completedWeek || 0,
      totalEarnings,
      weekEarnings: Math.round(totalEarnings * 0.3),
      avgRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews?.length || 0,
      acceptanceRate: 95,
      responseTime: "2 min",
    });
    setIsLoading(false);
  }

  const statusColors: Record<string, string> = {
    assigned: "text-blue-400 bg-blue-500/10",
    on_the_way: "text-amber-400 bg-amber-500/10",
    in_progress: "text-brand-400 bg-brand-500/10",
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 bg-slate-950 text-slate-100 pb-20 md:pb-8">
      <header className="flex items-center justify-between py-2 border-b border-slate-800/80 mb-6">
        <Link href="/" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200">
          ← Home
        </Link>
        <span className="font-bold text-sm text-white">Provider Dashboard</span>
        <Link href="/provider/requests" className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
          Job Requests
        </Link>
      </header>

      <main className="max-w-4xl mx-auto w-full flex-1 space-y-5">
        {/* Welcome Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-900/30 to-slate-900 border border-brand-500/20">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">Welcome back</span>
              <h1 className="text-lg font-extrabold text-white mt-0.5">{providerName}</h1>
              <p className="text-[10px] text-slate-400 mt-0.5">Here&apos;s your business overview</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <Star className="w-5 h-5 text-amber-400 mx-auto mb-0.5" />
              <span className="text-lg font-black text-amber-400 block">{stats.avgRating}</span>
              <span className="text-[8px] text-slate-400">Rating</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { icon: Briefcase, label: "Active Jobs", value: stats.activeJobs, color: "text-brand-400", href: "/provider/jobs" },
            { icon: CheckCircle2, label: "This Week", value: stats.completedWeek, color: "text-emerald-400", href: "/provider/jobs" },
            { icon: Wallet, label: "Total Earned", value: `₹${stats.totalEarnings}`, color: "text-amber-400", href: "/provider/earnings" },
            { icon: TrendingUp, label: "Acceptance", value: `${stats.acceptanceRate}%`, color: "text-emerald-400", href: "/provider/jobs" },
          ].map((stat) => (
            <Link key={stat.label} href={stat.href} className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-center space-y-1">
              <stat.icon className={`w-4 h-4 ${stat.color} mx-auto`} />
              <span className="text-sm font-bold text-white block">{stat.value}</span>
              <span className="text-[9px] text-slate-400">{stat.label}</span>
            </Link>
          ))}
        </div>

        {/* Earnings Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-900/20 to-slate-900 border border-amber-500/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-amber-400" /> Earnings Summary
            </h3>
            <Link href="/provider/earnings" className="text-[10px] text-amber-400 hover:underline">View Details →</Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <span className="text-lg font-black text-white block">₹{stats.weekEarnings}</span>
              <span className="text-[9px] text-slate-400">This Week</span>
            </div>
            <div className="text-center">
              <span className="text-lg font-black text-amber-400 block">₹{stats.totalEarnings}</span>
              <span className="text-[9px] text-slate-400">Total</span>
            </div>
            <div className="text-center">
              <span className="text-lg font-black text-emerald-400 block">₹{Math.round(stats.totalEarnings * 0.1)}</span>
              <span className="text-[9px] text-slate-400">Pending</span>
            </div>
          </div>
        </div>

        {/* Earnings Chart */}
        <EarningsChart earnings={[]} />

        {/* Active Jobs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Jobs</h3>
            <Link href="/provider/jobs" className="text-[10px] text-brand-400 hover:underline">View All →</Link>
          </div>

          {activeJobs.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
              <Briefcase className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-bold text-slate-300">No active jobs right now</p>
              <p className="text-[10px] text-slate-400">Check job requests to accept new bookings</p>
              <Link href="/provider/requests" className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-brand-500 text-white text-[10px] font-bold">
                Browse Requests <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {activeJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/orders/${job.id}`}
                  className="block p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
                      <Wrench className="w-5 h-5 text-brand-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{job.service_name}</span>
                        <span className="text-xs font-bold text-emerald-400">₹{job.price}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Customer: {job.customer_name}</span>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${statusColors[job.status] || "text-slate-400 bg-slate-800"}`}>
                          {job.status.replace("_", " ")}
                        </span>
                        <span className="text-[9px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(job.scheduled_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-800/60">
                    <a href={`tel:${job.customer_phone}`} className="flex-1 py-2 rounded-lg bg-slate-800 text-center text-[10px] font-bold text-white flex items-center justify-center gap-1 hover:bg-slate-700">
                      <Phone className="w-3 h-3" /> Call
                    </a>
                    <button className="flex-1 py-2 rounded-lg bg-brand-500 text-center text-[10px] font-bold text-white flex items-center justify-center gap-1 hover:bg-brand-600">
                      <Navigation className="w-3 h-3" /> Directions
                    </button>
                    {job.status === "assigned" && (
                      <Link href={`/orders/${job.id}`} className="flex-1 py-2 rounded-lg bg-emerald-500 text-center text-[10px] font-bold text-white flex items-center justify-center gap-1 hover:bg-emerald-600">
                        Start Job
                      </Link>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Performance Metrics */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1">Performance</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] font-bold text-white">Rating Breakdown</span>
              </div>
              <div className="space-y-1">
                {[5, 4, 3, 2, 1].map((star) => {
                  const pct = star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 8 : 2;
                  return (
                    <div key={star} className="flex items-center gap-1.5">
                      <span className="text-[9px] text-slate-400 w-2">{star}</span>
                      <div className="flex-1 h-1 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[8px] text-slate-500 w-6 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-bold text-white">Quick Stats</span>
              </div>
              {[
                { label: "Acceptance Rate", value: `${stats.acceptanceRate}%`, color: "text-emerald-400" },
                { label: "Avg Response", value: stats.responseTime, color: "text-brand-400" },
                { label: "Total Reviews", value: stats.totalReviews, color: "text-amber-400" },
                { label: "Completion Rate", value: "98%", color: "text-emerald-400" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-[9px] text-slate-400">{item.label}</span>
                  <span className={`text-[10px] font-bold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: Calendar, label: "My Schedule", href: "/provider/jobs", color: "text-brand-400" },
            { icon: Wallet, label: "Earnings", href: "/provider/earnings", color: "text-amber-400" },
            { icon: Users, label: "Availability", href: "/provider/availability", color: "text-emerald-400" },
            { icon: AlertCircle, label: "Issues", href: "/provider/jobs", color: "text-rose-400" },
          ].map((link) => (
            <Link key={link.label} href={link.href} className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center gap-2 transition-all">
              <link.icon className={`w-4 h-4 ${link.color}`} />
              <span className="text-xs font-bold text-white">{link.label}</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
