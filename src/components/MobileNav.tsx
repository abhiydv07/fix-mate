"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3X3, Calendar, User } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/services", label: "Categories", icon: Grid3X3 },
    { href: "/bookings", label: "Bookings", icon: Calendar },
    { href: "/account", label: "Account", icon: User },
  ];

  return (
    <nav aria-label="Main navigation" className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800/80 px-4 py-2 max-w-md mx-auto flex items-center justify-around md:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
              isActive ? "text-brand-500" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? "text-brand-400" : ""}`} />
            <span className={`text-[9px] font-semibold ${isActive ? "text-brand-400" : ""}`}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
