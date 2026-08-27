interface PriceBreakdownProps {
  basePrice: number;
  convenienceFee?: number;
  gstRate?: number;
  discount?: number;
  showInline?: boolean;
}

export function PriceBreakdown({
  basePrice,
  convenienceFee = 49,
  gstRate = 0.18,
  discount = 0,
  showInline = false,
}: PriceBreakdownProps) {
  const subtotal = basePrice - discount;
  const gst = Math.round(subtotal * gstRate);
  const total = subtotal + convenienceFee + gst;

  if (showInline) {
    return (
      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">₹{total}</span>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400">Service Price</span>
        <span className="font-semibold text-slate-700 dark:text-slate-200">₹{basePrice}</span>
      </div>
      {discount > 0 && (
        <div className="flex justify-between text-xs">
          <span className="text-emerald-500">Discount</span>
          <span className="font-semibold text-emerald-500">-₹{discount}</span>
        </div>
      )}
      <div className="flex justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400">Convenience Fee</span>
        <span className="font-semibold text-slate-700 dark:text-slate-200">₹{convenienceFee}</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400">GST ({Math.round(gstRate * 100)}%)</span>
        <span className="font-semibold text-slate-700 dark:text-slate-200">₹{gst}</span>
      </div>
      <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between">
        <span className="text-xs font-bold text-slate-900 dark:text-white">Total</span>
        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">₹{total}</span>
      </div>
    </div>
  );
}
