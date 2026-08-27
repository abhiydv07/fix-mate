"use client";

import { useState, useEffect } from "react";
import { Navigation, Clock } from "lucide-react";

interface ETAWidgetProps {
  status: string;
  providerLat?: number | null;
  providerLng?: number | null;
  destLat?: number;
  destLng?: number;
}

export function ETAWidget({ status, providerLat, providerLng, destLat = 28.5802, destLng = 77.3340 }: ETAWidgetProps) {
  const [eta, setEta] = useState<number | null>(null);

  useEffect(() => {
    if (status !== "on_the_way" || !providerLat || !providerLng) {
      setEta(null);
      return;
    }

    // Haversine formula — rough estimate
    function calcDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    const dist = calcDistance(providerLat, providerLng, destLat, destLng);
    const speedKmH = 25; // avg city speed
    const etaMin = Math.max(5, Math.round((dist / speedKmH) * 60));
    setEta(etaMin);
  }, [status, providerLat, providerLng, destLat, destLng]);

  if (status !== "on_the_way" || eta === null) return null;

  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
      <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
        <Navigation className="w-5 h-5 text-purple-500 animate-pulse" />
      </div>
      <div>
        <p className="text-xs font-bold text-purple-600 dark:text-purple-400">Pro is on the way</p>
        <p className="text-lg font-black text-slate-900 dark:text-white">
          ~{eta} min <span className="text-xs font-normal text-slate-400">estimated</span>
        </p>
      </div>
      <div className="ml-auto flex items-center gap-1 text-[10px] text-slate-400">
        <Clock className="w-3 h-3" />
        Live
      </div>
    </div>
  );
}
