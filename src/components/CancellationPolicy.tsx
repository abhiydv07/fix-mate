import { ShieldCheck, Clock, AlertTriangle, Ban } from "lucide-react";

export function CancellationPolicy() {
  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
      <h3 className="text-xs font-bold text-slate-900 dark:text-white">Cancellation Policy</h3>
      <div className="space-y-2">
        {[
          { icon: Clock, time: "Before 2 hours", action: "Free cancellation", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
          { icon: AlertTriangle, time: "Within 2 hours", action: "50% charge", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
          { icon: Ban, time: "After pro arrives", action: "Full charge", color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-500/10" },
        ].map((item) => (
          <div key={item.time} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center`}>
              <item.icon className={`w-4 h-4 ${item.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{item.time}</p>
              <p className="text-[10px] text-slate-400">{item.action}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
        <ShieldCheck className="w-3 h-3 text-emerald-500" />
        No cancellation fee for bookings cancelled before 2 hours
      </div>
    </div>
  );
}
