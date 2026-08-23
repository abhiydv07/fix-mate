export default function ServicesLoading() {
  return (
    <div className="p-4 md:p-8 space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-slate-800 rounded-lg" />
      <div className="h-10 w-full bg-slate-800 rounded-xl" />
      <div className="flex gap-2 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-24 bg-slate-800 rounded-xl shrink-0" />
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 w-full bg-slate-900 rounded-2xl border border-slate-800" />
        ))}
      </div>
    </div>
  );
}
