"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <div className="text-center space-y-1">
        <h2 className="text-lg font-extrabold text-white">
          Something went wrong
        </h2>
        <p className="text-xs text-slate-400 max-w-sm">
          An unexpected error occurred. Please try again or return to the
          homepage.
        </p>
        {error.digest && (
          <p className="text-[10px] text-slate-600 font-mono mt-2">
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={reset}
          variant="outline"
          size="sm"
          className="text-xs flex items-center gap-1.5"
        >
          <RefreshCcw className="w-3.5 h-3.5" /> Try Again
        </Button>
        <Button
          onClick={() => (window.location.href = "/")}
          size="sm"
          className="text-xs"
        >
          Go Home
        </Button>
      </div>
    </div>
  );
}
