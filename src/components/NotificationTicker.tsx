"use client";

import { useState, useEffect } from "react";
import { MapPin, Clock } from "lucide-react";

const notifications = [
  { name: "Rahul", area: "Indiranagar", service: "Plumbing", time: "2 min ago" },
  { name: "Priya", area: "Koramangala", service: "AC Repair", time: "5 min ago" },
  { name: "Vikram", area: "HSR Layout", service: "Deep Cleaning", time: "8 min ago" },
  { name: "Ananya", area: "Whitefield", service: "Electrical", time: "12 min ago" },
  { name: "Deepak", area: "JP Nagar", service: "Painting", time: "15 min ago" },
  { name: "Neha", area: "Electronic City", service: "Carpentry", time: "18 min ago" },
];

export function NotificationTicker() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % notifications.length);
        setVisible(true);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const n = notifications[index];

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-100 dark:border-slate-800 transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}`}>
      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
      <p className="text-[10px] text-slate-500 dark:text-slate-400">
        <span className="font-bold text-slate-700 dark:text-slate-300">{n.name}</span>
        {" "}from{" "}
        <span className="font-bold text-slate-700 dark:text-slate-300">{n.area}</span>
        {" "}just booked{" "}
        <span className="font-bold text-brand-500">{n.service}</span>
      </p>
      <span className="text-[9px] text-slate-400 shrink-0 flex items-center gap-0.5">
        <Clock className="w-2.5 h-2.5" /> {n.time}
      </span>
    </div>
  );
}
