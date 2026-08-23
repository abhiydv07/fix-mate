import Link from "next/link";
import { Wrench, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
        <Wrench className="w-7 h-7" />
      </div>
      <div className="text-center space-y-1">
        <h2 className="text-lg font-extrabold text-white">
          Page Not Found
        </h2>
        <p className="text-xs text-slate-400 max-w-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <Link href="/">
        <Button size="sm" className="text-xs flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Button>
      </Link>
    </div>
  );
}
