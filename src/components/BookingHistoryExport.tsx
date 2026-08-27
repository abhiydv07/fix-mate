"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Download, FileText } from "lucide-react";

export function BookingHistoryExport() {
  const [exporting, setExporting] = useState(false);
  const supabase = createClient();

  async function handleExport() {
    setExporting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: bookings } = await supabase
      .from("bookings")
      .select("id, status, price, scheduled_at, created_at, cancel_reason")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false });

    if (!bookings) return;

    // Build CSV
    const headers = ["Order ID", "Status", "Price (₹)", "Scheduled Date", "Booked On", "Cancel Reason"];
    const rows = bookings.map((b) => [
      b.id.slice(0, 8),
      b.status,
      b.price,
      new Date(b.scheduled_at).toLocaleDateString("en-IN"),
      new Date(b.created_at).toLocaleDateString("en-IN"),
      b.cancel_reason || "",
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fixmate-bookings-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    setExporting(false);
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-500/30 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all"
    >
      {exporting ? <FileText className="w-4 h-4 animate-pulse" /> : <Download className="w-4 h-4" />}
      {exporting ? "Exporting..." : "Export History (CSV)"}
    </button>
  );
}
