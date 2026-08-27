"use client";

import { FileDown, ShieldCheck } from "lucide-react";

interface WarrantyCertificateProps {
  bookingId: string;
  serviceName: string;
  serviceDate: string;
  providerName?: string;
  warrantyDays?: number;
}

export function WarrantyCertificate({
  bookingId,
  serviceName,
  serviceDate,
  providerName = "Verified Professional",
  warrantyDays = 30,
}: WarrantyCertificateProps) {
  const startDate = new Date(serviceDate);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + warrantyDays);

  function downloadPDF() {
    const html = `<!DOCTYPE html>
<html><head><style>
body{font-family:Arial,sans-serif;margin:40px;color:#0f172a;}
.header{text-align:center;border-bottom:3px solid #2563eb;padding-bottom:20px;margin-bottom:30px;}
.logo{font-size:28px;font-weight:900;color:#2563eb;}
.logo span{color:#f59e0b;}
.title{font-size:18px;font-weight:700;margin-top:10px;color:#0f172a;}
.detail-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0;}
.detail-label{color:#64748b;font-size:12px;}
.detail-value{font-weight:700;font-size:12px;}
.warranty-box{background:#f0fdf4;border:2px solid #bbf7d0;border-radius:12px;padding:20px;margin:20px 0;text-align:center;}
.warranty-box h3{color:#166534;font-size:14px;margin:0 0 5px;}
.warranty-box p{color:#15803d;font-size:12px;margin:0;}
.footer{text-align:center;margin-top:40px;color:#94a3b8;font-size:10px;border-top:1px solid #e2e8f0;padding-top:15px;}
.seal{font-size:40px;margin:10px 0;}
</style></head><body>
<div class="header">
  <div class="logo">Fix<span>Mate</span></div>
  <p style="color:#64748b;font-size:10px;letter-spacing:0.2em;">HOME SERVICES MARKETPLACE</p>
  <div class="title">WARRANTY CERTIFICATE</div>
</div>
<div class="seal">🛡️</div>
<div class="detail-row"><span class="detail-label">Certificate ID</span><span class="detail-value">FM-WTY-${bookingId.slice(0, 8).toUpperCase()}</span></div>
<div class="detail-row"><span class="detail-label">Service</span><span class="detail-value">${serviceName}</span></div>
<div class="detail-row"><span class="detail-label">Service Date</span><span class="detail-value">${startDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span></div>
<div class="detail-row"><span class="detail-label">Provider</span><span class="detail-value">${providerName}</span></div>
<div class="detail-row"><span class="detail-label">Booking Reference</span><span class="detail-value">#${bookingId.slice(0, 8).toUpperCase()}</span></div>
<div class="warranty-box">
  <h3>✅ ${warrantyDays}-Day Service Warranty</h3>
  <p>This service is covered under Fix Mate's ${warrantyDays}-day warranty.</p>
  <p style="margin-top:8px;font-weight:700;">Valid: ${startDate.toLocaleDateString("en-IN")} — ${endDate.toLocaleDateString("en-IN")}</p>
</div>
<div style="background:#f8fafc;border-radius:8px;padding:15px;margin:15px 0;">
  <p style="font-size:11px;font-weight:700;margin:0 0 5px;">Warranty Coverage:</p>
  <ul style="font-size:11px;color:#475569;margin:0;padding-left:15px;">
    <li>Free re-service for the same issue within ${warrantyDays} days</li>
    <li>No additional charges for warranty claims</li>
    <li>Covers workmanship defects only</li>
    <li>Does not cover normal wear and tear or misuse</li>
  </ul>
</div>
<div class="footer">
  <p>This is a computer-generated certificate. No signature required.</p>
  <p>Fix Mate Inc. · Noida & Greater Noida · support@fixmate.in</p>
</div>
</body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) {
      win.onload = () => { win.print(); };
    }
  }

  return (
    <button
      onClick={downloadPDF}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-500/30 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all w-full justify-center"
    >
      <FileDown className="w-4 h-4 text-brand-500" />
      Download Warranty Certificate
    </button>
  );
}
