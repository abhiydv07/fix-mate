"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Briefcase, Bell, Wallet, User } from "lucide-react";

export function ProviderMobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/provider/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/provider/jobs", label: "Jobs", icon: Briefcase },
    { href: "/provider/requests", label: "Requests", icon: Bell },
    { href: "/provider/earnings", label: "Earnings", icon: Wallet },
    { href: "/account", label: "Profile", icon: User },
  ];

  return (
    <nav aria-label="Provider navigation" className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800/80 px-2 py-2 max-w-md mx-auto flex items-center justify-around md:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
              isActive ? "text-brand-400" : "text-slate-500 hover:text-slate-300"
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
