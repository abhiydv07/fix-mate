"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Layers,
  Wrench,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Briefcase,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

interface AnalyticsData {
  bookingsChart: Array<{ date: string; bookings: number; revenue: number }>;
  topServices: Array<{ name: string; count: number }>;
  providerStats: {
    total: number;
    verified: number;
    available: number;
    avgRating: number;
  };
  summary: {
    totalBookings: number;
    completedBookings: number;
    totalRevenue: number;
    conversionRate: number;
  };
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/analytics");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // Silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const summaryCards = [
    {
      label: "Total Bookings",
      value: data?.summary.totalBookings || 0,
      icon: Briefcase,
      color: "text-brand-400 bg-brand-500/10 border-brand-500/20",
    },
    {
      label: "Completed",
      value: data?.summary.completedBookings || 0,
      icon: ShieldCheck,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Total Revenue",
      value: `₹${data?.summary.totalRevenue || 0}`,
      icon: DollarSign,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Conversion",
      value: `${data?.summary.conversionRate || 0}%`,
      icon: TrendingUp,
      color: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
        <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400">
          Admin Control Center
        </span>
        <h1 className="text-xl font-extrabold text-white">Fix Mate Analytics</h1>
        <p className="text-xs text-slate-400">
          Last 30 days overview — bookings, revenue, services, and provider health.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            {summaryCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${card.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-white">{card.value}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{card.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bookings & Revenue Chart */}
          {data?.bookingsChart && data.bookingsChart.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand-400" />
                <h3 className="font-bold text-sm text-slate-100">Bookings & Revenue (30 Days)</h3>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.bookingsChart} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <defs>
                      <linearGradient id="bookingsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0c8de9" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0c8de9" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#232d3f" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "#64748b" }}
                      tickLine={false}
                      axisLine={{ stroke: "#232d3f" }}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#64748b" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#151c28",
                        border: "1px solid #232d3f",
                        borderRadius: "12px",
                        fontSize: "11px",
                        color: "#e2e8f0",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="bookings"
                      stroke="#0c8de9"
                      strokeWidth={2}
                      fill="url(#bookingsGrad)"
                      name="Bookings"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.bookingsChart} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#232d3f" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "#64748b" }}
                      tickLine={false}
                      axisLine={{ stroke: "#232d3f" }}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#64748b" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#151c28",
                        border: "1px solid #232d3f",
                        borderRadius: "12px",
                        fontSize: "11px",
                        color: "#e2e8f0",
                      }}
                      formatter={(value) => [`\u20B9${value}`, "Revenue"]}
                    />
                    <Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} name="Revenue (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Top 5 Services + Provider Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Services */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-slate-100">Top 5 Services</h3>
              </div>

              {data?.topServices && data.topServices.length > 0 ? (
                <div className="space-y-2">
                  {data.topServices.map((svc, i) => (
                    <div key={svc.name} className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center text-[10px] font-bold">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-200">{svc.name}</span>
                          <span className="text-[10px] font-bold text-emerald-400">{svc.count} bookings</span>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-brand-500"
                            style={{
                              width: `${Math.round((svc.count / (data.topServices[0]?.count || 1)) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">No booking data yet</p>
              )}
            </div>

            {/* Provider Stats */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-slate-100">Provider Health</h3>
              </div>

              <div className="space-y-3">
                {[
                  {
                    label: "Total Registered",
                    value: data?.providerStats.total || 0,
                    color: "bg-brand-500",
                  },
                  {
                    label: "KYC Verified",
                    value: data?.providerStats.verified || 0,
                    color: "bg-emerald-500",
                  },
                  {
                    label: "Currently Available",
                    value: data?.providerStats.available || 0,
                    color: "bg-amber-500",
                  },
                ].map((stat) => (
                  <div key={stat.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{stat.label}</span>
                      <span className="font-bold text-slate-200">{stat.value}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${stat.color}`}
                        style={{
                          width: `${data?.providerStats.total ? Math.round((stat.value / data.providerStats.total) * 100) : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Avg Provider Rating</span>
                  <span className="font-bold text-amber-400">{data?.providerStats.avgRating || 0} ★</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { href: "/admin/providers", label: "Provider KYC", icon: ShieldCheck, color: "text-brand-400 bg-brand-500/10" },
                { href: "/admin/categories", label: "Categories", icon: Layers, color: "text-amber-400 bg-amber-500/10" },
                { href: "/admin/services", label: "Services", icon: Wrench, color: "text-emerald-400 bg-emerald-500/10" },
                { href: "/admin/disputes", label: "Disputes", icon: AlertTriangle, color: "text-rose-400 bg-rose-500/10" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-center space-y-2"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mx-auto ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-300">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
