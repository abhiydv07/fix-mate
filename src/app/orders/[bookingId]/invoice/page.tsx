import Link from "next/link";
import { ArrowLeft, Printer, CheckCircle2, ShieldCheck, Wrench, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function InvoicePage({
  params,
}: {
  params: { bookingId: string };
}) {
  const supabase = await createClient();

  // Fetch booking details
  const { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", params.bookingId)
    .single();

  // Fetch payment confirmation state
  const { data: payment } = await supabase
    .from("payments")
    .select("*")
    .eq("booking_id", params.bookingId)
    .single();

  const servicePrice = booking ? Number(booking.price) - 49 : 299;
  const fee = 49;
  const totalAmount = booking ? Number(booking.price) : 348;

  const isConfirmedByCustomer = payment?.confirmed_by_customer || false;
  const isConfirmedByProvider = payment?.confirmed_by_provider || false;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col justify-between">
      {/* Header Actions */}
      <header className="max-w-2xl mx-auto w-full flex items-center justify-between py-2 border-b border-slate-800 mb-6 print:hidden">
        <Link href={`/orders/${params.bookingId}`} className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200">
          <ArrowLeft className="w-4 h-4" /> Back to Order
        </Link>
        <span className="font-bold text-sm text-white">Tax Invoice</span>
        <button
          onClick={() => {}}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-200"
        >
          <Printer className="w-3.5 h-3.5 text-brand-400" /> Print Invoice
        </button>
      </header>

      {/* Invoice Document Card */}
      <main className="max-w-2xl mx-auto w-full flex-1 space-y-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl print:bg-white print:text-slate-900 print:shadow-none print:border-none">
        {/* Brand Header */}
        <div className="flex items-start justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white print:text-slate-900">Fix Mate Services</h1>
              <p className="text-xs text-slate-400 print:text-slate-600">GSTIN: 29AABCU9603R1ZM</p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-extrabold">
              PAID IN CASH
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Invoice #{params.bookingId.slice(0, 8)}</p>
          </div>
        </div>

        {/* Customer & Booking Details */}
        <div className="grid grid-cols-2 gap-4 text-xs text-slate-300 print:text-slate-700">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Billed To</span>
            <p className="font-bold text-slate-100 print:text-slate-900">Valued Customer</p>
            <p>Delivery Address: Indiranagar, Bengaluru</p>
            <p>Pincode: 560038</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400">Invoice Date</span>
            <p className="font-bold text-slate-100 print:text-slate-900">{new Date().toLocaleDateString()}</p>
            <p>Payment Method: Cash / UPI (Pay on Work)</p>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="rounded-xl border border-slate-800 overflow-hidden print:border-slate-300">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 print:bg-slate-100 print:text-slate-700">
              <tr>
                <th className="p-3">Service Description</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 print:divide-slate-200 text-slate-200 print:text-slate-800">
              <tr>
                <td className="p-3">
                  <p className="font-bold">On-Demand Professional Home Service</p>
                  <p className="text-[10px] text-slate-400">Standard labor & service charges</p>
                </td>
                <td className="p-3 text-center">1</td>
                <td className="p-3 text-right">₹{servicePrice}</td>
              </tr>
              <tr>
                <td className="p-3">
                  <p className="font-bold">Safety & Convenience Fee</p>
                  <p className="text-[10px] text-slate-400">Background-checked pro insurance & platform warranty</p>
                </td>
                <td className="p-3 text-center">1</td>
                <td className="p-3 text-right">₹{fee}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary Breakdown */}
        <div className="flex justify-end pt-2 border-t border-slate-800/80 text-xs">
          <div className="w-64 space-y-1.5 text-slate-300 print:text-slate-800">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{servicePrice + fee}</span>
            </div>
            <div className="flex justify-between text-emerald-400">
              <span>Discount Applied:</span>
              <span>-₹0</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-white print:text-slate-900 pt-1 border-t border-slate-800">
              <span>Total Paid:</span>
              <span className="text-emerald-400 print:text-emerald-600">₹{totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Dual Confirmation Status Badges */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs print:bg-slate-50 print:border-slate-300">
          <h4 className="font-bold text-slate-200 print:text-slate-900">Payment Settlement Verification</h4>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className={`w-4 h-4 ${isConfirmedByCustomer ? "text-emerald-400" : "text-slate-600"}`} />
              <span>Customer Confirmed Payment</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className={`w-4 h-4 ${isConfirmedByProvider ? "text-emerald-400" : "text-slate-600"}`} />
              <span>Provider Confirmed Cash Collected</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
