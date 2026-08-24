"use client";

import { Download } from "lucide-react";

interface InvoiceData {
  bookingId: string;
  serviceName: string;
  serviceDate: string;
  amount: number;
  convenienceFee: number;
  gst: number;
  total: number;
  customerName: string;
  providerName?: string;
  address?: string;
}

interface InvoiceGeneratorProps {
  invoice: InvoiceData;
}

export function InvoiceGenerator({ invoice }: InvoiceGeneratorProps) {
  function generatePDF() {
    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 40px; color: #1a1a2e; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #0c8de9; padding-bottom: 20px; }
          .brand { font-size: 28px; font-weight: 800; color: #0c8de9; }
          .brand-sub { font-size: 12px; color: #666; margin-top: 4px; }
          .invoice-title { font-size: 24px; font-weight: 700; color: #333; }
          .invoice-meta { text-align: right; font-size: 12px; color: #666; }
          .meta-row { margin: 4px 0; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #0c8de9; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; }
          th { text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #999; border-bottom: 2px solid #eee; padding: 8px 0; }
          td { padding: 10px 0; border-bottom: 1px solid #f5f5f5; font-size: 13px; }
          .amount { text-align: right; font-weight: 600; }
          .total-row td { border-top: 2px solid #0c8de9; font-weight: 700; font-size: 16px; }
          .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
          .badge { display: inline-block; background: #e8f5e9; color: #2e7d32; font-size: 10px; font-weight: 700; padding: 4px 12px; border-radius: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">Fix Mate</div>
            <div class="brand-sub">Home Services Marketplace</div>
          </div>
          <div>
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-meta">
              <div class="meta-row"><strong>Invoice #:</strong> FM-${invoice.bookingId.slice(0, 8).toUpperCase()}</div>
              <div class="meta-row"><strong>Date:</strong> ${new Date(invoice.serviceDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
              <div class="meta-row"><span class="badge">PAID — Cash/UPI</span></div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Bill To</div>
          <div style="font-size: 14px; font-weight: 600;">${invoice.customerName}</div>
          ${invoice.address ? `<div style="font-size: 12px; color: #666; margin-top: 4px;">${invoice.address}</div>` : ""}
        </div>

        ${invoice.providerName ? `
        <div class="section">
          <div class="section-title">Service Provider</div>
          <div style="font-size: 14px; font-weight: 600;">${invoice.providerName}</div>
          <div style="font-size: 12px; color: #666; margin-top: 4px;">Verified Fix Mate Professional</div>
        </div>
        ` : ""}

        <div class="section">
          <table>
            <thead>
              <tr><th>Description</th><th class="amount">Amount</th></tr>
            </thead>
            <tbody>
              <tr><td>${invoice.serviceName}</td><td class="amount">₹${invoice.amount}</td></tr>
              <tr><td>Convenience Fee</td><td class="amount">₹${invoice.convenienceFee}</td></tr>
              <tr><td>GST (18%)</td><td class="amount">₹${invoice.gst}</td></tr>
              <tr class="total-row"><td>Total Amount</td><td class="amount">₹${invoice.total}</td></tr>
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>This is a computer-generated invoice from Fix Mate.</p>
          <p>For support, contact support@fixmate.in | www.fixmate.in</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([invoiceHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, "_blank");
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
        URL.revokeObjectURL(url);
      };
    }
  }

  return (
    <button
      onClick={generatePDF}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-bold text-brand-400 hover:border-brand-500/30 transition-all"
    >
      <Download className="w-3 h-3" /> Invoice
    </button>
  );
}
