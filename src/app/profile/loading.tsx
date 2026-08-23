export default function ProfileLoading() {
  return (
    <div className="p-4 md:p-8 space-y-4 animate-pulse pb-20 md:pb-8">
      <div className="h-8 w-32 bg-slate-800 rounded-lg" />
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-800" />
        <div className="space-y-2">
          <div className="h-4 w-32 bg-slate-800 rounded" />
          <div className="h-3 w-48 bg-slate-800 rounded" />
        </div>
      </div>
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="h-4 w-36 bg-slate-800 rounded" />
        <div className="h-24 w-full bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}
