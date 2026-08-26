"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  text: string;
  service: string;
  avatar: string;
}

const testimonials: Testimonial[] = [
  { id: 1, name: "Priya Sharma", location: "Indiranagar, Bengaluru", rating: 5, text: "Booked a plumber at 10 PM for an emergency leak. He arrived in 20 minutes and fixed it perfectly. Paid after the work — zero hassle!", service: "Plumbing", avatar: "PS" },
  { id: 2, name: "Rahul Mehta", location: "Koramangala, Bengaluru", rating: 5, text: "The electrician was extremely professional. Fixed my wiring issue in 30 minutes. The fact that I pay only after work gives me so much confidence.", service: "Electrical", avatar: "RM" },
  { id: 3, name: "Ananya Reddy", location: "HSR Layout, Bengaluru", rating: 4, text: "Used Fix Mate for a deep clean. The team was punctual and thorough. My apartment looks brand new. Great value for money.", service: "Cleaning", avatar: "AR" },
  { id: 4, name: "Vikram Singh", location: "Whitefield, Bengaluru", rating: 5, text: "My AC stopped working in peak summer. Fix Mate connected me with a verified technician within 15 minutes. Fixed and cooling in under an hour!", service: "AC Repair", avatar: "VS" },
  { id: 5, name: "Deepa Nair", location: "JP Nagar, Bengaluru", rating: 5, text: "The painting service was outstanding. Clean work, no mess, and the color consultation was a nice touch. Will use again for sure.", service: "Painting", avatar: "DN" },
  { id: 6, name: "Arjun Patel", location: "Electronic City, Bengaluru", rating: 5, text: "Best home service app I've used. The transparency in pricing and pay-after-work model is a game changer. No more bad service experiences.", service: "Appliance Repair", avatar: "AP" },
];

export function TestimonialsCarousel() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const prev = () => { setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length); resetTimer(); };
  const next = () => { setCurrent((prev) => (prev + 1) % testimonials.length); resetTimer(); };
  const resetTimer = () => { if (timerRef.current) clearInterval(timerRef.current); timerRef.current = setInterval(() => setCurrent((p) => (p + 1) % testimonials.length), 5000); };

  const t = testimonials[current];

  return (
    <div className="relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">What Customers Say</h3>
        <div className="flex items-center gap-1">
          <button onClick={prev} className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
          <button onClick={next} className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      <div className="relative min-h-[120px]">
        <Quote className="absolute -top-1 -left-1 w-8 h-8 text-brand-500/10" />
        <div className="space-y-3 pt-4">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-3.5 h-3.5 ${i < t.rating ? "text-amber-400 fill-amber-400" : "text-slate-300 dark:text-slate-600"}`} />
            ))}
            <span className="text-[10px] font-bold text-slate-500 ml-1">{t.service}</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center text-[10px] font-bold">{t.avatar}</div>
            <div>
              <span className="text-[11px] font-bold text-slate-900 dark:text-white block">{t.name}</span>
              <span className="text-[9px] text-slate-500">{t.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-1.5">
        {testimonials.map((_, i) => (
          <button key={i} onClick={() => { setCurrent(i); resetTimer(); }} className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? "bg-brand-500 w-4" : "bg-slate-300 dark:bg-slate-600"}`} />
        ))}
      </div>
    </div>
  );
}
