"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Camera, Paintbrush, Droplets, Zap } from "lucide-react";

interface GalleryItem {
  id: number;
  title: string;
  service: string;
  beforeColor: string;
  afterColor: string;
  icon: React.ElementType;
}

const items: GalleryItem[] = [
  { id: 1, title: "Living Room Deep Clean", service: "Cleaning", beforeColor: "from-amber-200 to-amber-300", afterColor: "from-emerald-100 to-emerald-200", icon: Droplets },
  { id: 2, title: "Kitchen Painting", service: "Painting", beforeColor: "from-slate-300 to-slate-400", afterColor: "from-blue-100 to-blue-200", icon: Paintbrush },
  { id: 3, title: "Wiring Fix", service: "Electrical", beforeColor: "from-rose-200 to-rose-300", afterColor: "from-amber-100 to-amber-200", icon: Zap },
  { id: 4, title: "Bathroom Retile", service: "Plumbing", beforeColor: "from-orange-200 to-orange-300", afterColor: "from-cyan-100 to-cyan-200", icon: Droplets },
];

export function BeforeAfterGallery() {
  const [active, setActive] = useState(0);
  const [sliderPos, setSliderPos] = useState(50);

  const item = items[active];

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-brand-500" />
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Before & After</h2>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setActive((prev) => (prev - 1 + items.length) % items.length)} className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
          <button onClick={() => setActive((prev) => (prev + 1) % items.length)} className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      {/* Before/After Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="relative h-48 overflow-hidden select-none"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setSliderPos(((e.clientX - rect.left) / rect.width) * 100);
          }}
        >
          {/* After */}
          <div className={`absolute inset-0 bg-gradient-to-br ${item.afterColor} flex items-center justify-center`}>
            <div className="text-center space-y-1">
              <item.icon className="w-8 h-8 text-white/60 mx-auto" />
              <span className="text-[10px] font-bold text-white/80 bg-white/20 px-2 py-0.5 rounded-full">AFTER</span>
            </div>
          </div>
          {/* Before */}
          <div className={`absolute inset-0 bg-gradient-to-br ${item.beforeColor}`}
            style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-1">
                <item.icon className="w-8 h-8 text-white/50 mx-auto" />
                <span className="text-[10px] font-bold text-white/80 bg-black/20 px-2 py-0.5 rounded-full">BEFORE</span>
              </div>
            </div>
          </div>
          {/* Slider line */}
          <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg" style={{ left: `${sliderPos}%` }}>
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white shadow-lg flex items-center justify-center">
              <div className="flex gap-0.5">
                <ChevronLeft className="w-2.5 h-2.5 text-slate-400" />
                <ChevronRight className="w-2.5 h-2.5 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
        <div className="p-3 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h4>
            <span className="text-[10px] text-slate-500">{item.service}</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Completed ✓</span>
        </div>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-1.5">
        {items.map((_, i) => (
          <button key={i} onClick={() => { setActive(i); setSliderPos(50); }} className={`w-1.5 h-1.5 rounded-full transition-all ${i === active ? "bg-brand-500 w-4" : "bg-slate-300 dark:bg-slate-600"}`} />
        ))}
      </div>
    </section>
  );
}
