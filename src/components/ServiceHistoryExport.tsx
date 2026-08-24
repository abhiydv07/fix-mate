"use client";

import { Download, FileText } from "lucide-react";

interface BookingRecord {
  id: string;
  service_name: string;
  scheduled_at: string;
  price: number;
  status: string;
}

interface ServiceHistoryExportProps {
  bookings: BookingRecord[];
}

export function ServiceHistoryExport({ bookings }: ServiceHistoryExportProps) {
  function exportCSV() {
    const headers = ["Booking ID", "Service", "Date", "Price (₹)", "Status"];
    const rows = bookings.map((b) => [
      b.id.slice(0, 8),
      b.service_name,
      new Date(b.scheduled_at).toLocaleDateString("en-IN"),
      String(b.price),
      b.status,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fix-mate-history-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    const html = `
      <!DOCTYPE html>
      <html><head><style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { font-size: 20px; color: #0c8de9; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background: #f5f5f5; text-align: left; padding: 8px; font-size: 12px; border-bottom: 2px solid #ddd; }
        td { padding: 8px; font-size: 12px; border-bottom: 1px solid #eee; }
        .total { font-weight: bold; text-align: right; margin-top: 10px; }
      </style></head><body>
        <h1>Fix Mate — Service History</h1>
        <p>Generated on ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
        <table>
          <thead><tr><th>Booking</th><th>Service</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            ${bookings.map((b) => `<tr><td>#${b.id.slice(0, 8)}</td><td>${b.service_name}</td><td>${new Date(b.scheduled_at).toLocaleDateString("en-IN")}</td><td>₹${b.price}</td><td>${b.status}</td></tr>`).join("")}
          </tbody>
        </table>
        <p class="total">Total Spent: ₹${bookings.filter((b) => b.status === "completed").reduce((s, b) => s + b.price, 0)}</p>
      </body></html>
    `;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, "_blank");
    if (w) w.onload = () => { w.print(); URL.revokeObjectURL(url); };
  }

  return (
    <div className="flex gap-2">
      <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-bold text-brand-400 hover:border-brand-500/30 transition-all">
        <Download className="w-3 h-3" /> CSV
      </button>
      <button onClick={exportPDF} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-bold text-brand-400 hover:border-brand-500/30 transition-all">
        <FileText className="w-3 h-3" /> PDF
      </button>
    </div>
  );
}
