"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Send, ArrowRight, Loader2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuggestionResult {
  category: string;
  confidence: number;
  suggestion: string;
  source: string;
}

export function AiTriageWidget() {
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<SuggestionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim().length < 5) return;

    setIsLoading(true);
    setErrorMsg("");
    setResult(null);

    try {
      const res = await fetch("/api/ai/suggest-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
      } else {
        setErrorMsg(data.error || "Failed to analyze your request.");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const confidenceColor =
    result && result.confidence >= 0.7
      ? "text-emerald-400"
      : result && result.confidence >= 0.4
      ? "text-amber-400"
      : "text-slate-400";

  const confidenceLabel =
    result && result.confidence >= 0.7
      ? "High Match"
      : result && result.confidence >= 0.4
      ? "Likely Match"
      : "Low Match";

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/80 border border-brand-500/20 space-y-4 shadow-xl shadow-brand-500/5">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-slate-100">Describe Your Problem</h3>
          <p className="text-[10px] text-slate-400">AI-powered service matching</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. My kitchen tap is leaking badly..."
          className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
        />
        <Button
          type="submit"
          disabled={isLoading || description.trim().length < 5}
          size="sm"
          className="shrink-0 px-4"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
        </Button>
      </form>

      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-400">
          {errorMsg}
        </div>
      )}

      {result && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-brand-400" />
              <span className="font-bold text-sm text-slate-100">{result.category}</span>
            </div>
            <span className={`text-[10px] font-bold ${confidenceColor} bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800`}>
              {confidenceLabel} · {Math.round(result.confidence * 100)}%
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">{result.suggestion}</p>

          <Link href={`/services/${encodeURIComponent(result.category.toLowerCase())}`}>
            <Button size="sm" className="w-full text-xs font-bold py-2.5 flex items-center justify-center gap-1.5">
              Browse {result.category} Services <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
