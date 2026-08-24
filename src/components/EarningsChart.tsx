"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface EarningRecord {
  id: string;
  service_name: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "paid_out";
}

interface EarningsChartProps {
  earnings: EarningRecord[];
}

export function EarningsChart({ earnings }: EarningsChartProps) {
  // Group earnings by date
  const dailyData = earnings
    .filter((e) => e.status === "completed")
    .reduce<Record<string, number>>((acc, e) => {
      const date = new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      acc[date] = (acc[date] || 0) + e.amount;
      return acc;
    }, {});

  const chartData = Object.entries(dailyData)
    .map(([date, amount]) => ({ date, amount }))
    .slice(-7); // Last 7 entries

  if (chartData.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
        <p className="text-xs text-slate-400">No earnings data to chart yet</p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-white">Earnings Trend</h3>
        <span className="text-[9px] text-slate-400">Last {chartData.length} periods</span>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 9, fill: "#94a3b8" }}
              axisLine={{ stroke: "#1e293b" }}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "#94a3b8" }}
              axisLine={{ stroke: "#1e293b" }}
              tickFormatter={(v: number) => `₹${v}`}
            />
            <Tooltip
              contentStyle={{
                background: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: "12px",
                fontSize: "11px",
                color: "#f1f5f9",
              }}
              formatter={(value) => [`₹${value}`, "Earnings"]}
              labelStyle={{ color: "#94a3b8" }}
            />
            <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={40}>
              {chartData.map((_, index) => (
                <Cell key={index} fill={index === chartData.length - 1 ? "#0c8de9" : "#1e40af"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
