"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Star, Users, Wrench } from "lucide-react";

interface CounterProps {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

function Counter({ end, suffix = "", prefix = "", duration = 2000 }: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{prefix}{count.toLocaleString("en-IN")}{suffix}</span>;
}

const stats = [
  { icon: Wrench, value: 12500, suffix: "+", label: "Services Done", color: "text-brand-500", bg: "bg-brand-500/10" },
  { icon: Users, value: 180, suffix: "+", label: "Verified Pros", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { icon: Star, value: 48, suffix: "", label: "Avg Rating", color: "text-amber-500", bg: "bg-amber-500/10", prefix: "", suffixLabel: "/5" },
  { icon: ShieldCheck, value: 98, suffix: "%", label: "Satisfaction", color: "text-rose-500", bg: "bg-rose-500/10" },
];

export function AnimatedStats() {
  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
            <s.icon className={`w-5 h-5 ${s.color}`} />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900 dark:text-white">
              <Counter end={s.value} suffix={s.suffix} prefix={s.prefix} />
              {s.suffixLabel && <span className="text-sm font-bold text-slate-400">{s.suffixLabel}</span>}
            </div>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{s.label}</span>
          </div>
        </div>
      ))}
    </section>
  );
}
