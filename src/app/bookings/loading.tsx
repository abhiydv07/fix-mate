export default function BookingsLoading() {
  return (
    <div className="p-4 md:p-8 space-y-4 animate-pulse pb-20 md:pb-8">
      <div className="h-8 w-40 bg-slate-800 rounded-lg" />
      <div className="h-5 w-64 bg-slate-800 rounded" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex justify-between">
              <div className="space-y-1.5">
                <div className="h-3 w-24 bg-slate-800 rounded" />
                <div className="h-4 w-40 bg-slate-800 rounded" />
              </div>
              <div className="h-6 w-16 bg-slate-800 rounded" />
            </div>
            <div className="h-3 w-full bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
