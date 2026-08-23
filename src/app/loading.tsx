import { Wrench } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center animate-pulse border border-brand-500/30">
        <Wrench className="w-6 h-6" />
      </div>
      <div className="space-y-2 text-center">
        <h2 className="text-sm font-bold text-slate-200 animate-pulse">
          Loading Fix Mate
        </h2>
        <p className="text-xs text-slate-500 animate-pulse">
          Preparing your service marketplace...
        </p>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-brand-500 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
