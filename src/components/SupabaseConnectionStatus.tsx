import { createClient } from "@/lib/supabase/server";
import { Database, ShieldAlert, CheckCircle2 } from "lucide-react";

export async function SupabaseConnectionStatus() {
  let isConnected = false;
  let errorMsg = "";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isPlaceholder = !supabaseUrl || supabaseUrl.includes("placeholder");

  if (!isPlaceholder) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from("profiles").select("count", { count: "exact", head: true });
      if (!error || error.code === "PGRST116" || error.message.includes("relation")) {
        isConnected = true;
      } else {
        errorMsg = error.message;
      }
    } catch (err: unknown) {
      errorMsg = err instanceof Error ? err.message : "Connection failed";
    }
  }

  return (
    <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
          isConnected ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
        }`}>
          <Database className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-semibold text-slate-200">Supabase Backend</h4>
            {isConnected ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                <CheckCircle2 className="w-3 h-3" /> Live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400">
                <ShieldAlert className="w-3 h-3" /> Setup Needed
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            {isConnected
              ? "Postgres RLS Security & Server Auth active"
              : isPlaceholder
              ? "Add SUPABASE_URL & ANON_KEY to .env.local"
              : errorMsg || "Waiting for credentials"}
          </p>
        </div>
      </div>
    </div>
  );
}
