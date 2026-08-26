"use client";

import { ArrowRight, BookOpen, Clock } from "lucide-react";

const articles = [
  {
    title: "5 Signs Your AC Needs Immediate Servicing",
    excerpt: "Don't wait for a breakdown. Here are the warning signs your AC is telling you it needs professional attention.",
    readTime: "3 min",
    category: "AC & Appliance",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Monsoon-Proof Your Home: Plumbing Checklist",
    excerpt: "Heavy rains can cause serious water damage. Use this checklist to prepare your plumbing before the monsoon hits.",
    readTime: "4 min",
    category: "Plumbing",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    title: "How to Choose the Right Paint for Indian Homes",
    excerpt: "Climate, moisture, and VOC levels matter. Here's a complete guide to picking paint that lasts.",
    readTime: "5 min",
    category: "Painting",
    gradient: "from-purple-500 to-pink-500",
  },
];

export function BlogArticles() {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-brand-500" />
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Helpful Reads</h2>
        </div>
        <span className="text-xs text-brand-500 dark:text-brand-400 font-semibold hover:underline cursor-pointer flex items-center gap-0.5">
          View All <ArrowRight className="w-3 h-3" />
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
        {articles.map((a, i) => (
          <div key={i} className="shrink-0 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all cursor-pointer group">
            <div className={`h-24 bg-gradient-to-br ${a.gradient} flex items-center justify-center`}>
              <span className="text-[10px] font-bold text-white/80 bg-white/20 px-2 py-0.5 rounded-full">{a.category}</span>
            </div>
            <div className="p-4 space-y-2">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors leading-snug">{a.title}</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{a.excerpt}</p>
              <div className="flex items-center gap-1 text-[9px] text-slate-400">
                <Clock className="w-2.5 h-2.5" /> {a.readTime} read
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
