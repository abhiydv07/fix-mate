"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Briefcase, UserCheck, Settings, ShieldCheck, Wrench } from "lucide-react";

interface ProviderSidebarProps {
  role?: "provider" | "admin";
}

export function ProviderSidebar({ role = "provider" }: ProviderSidebarProps) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/jobs", label: "Active Jobs", icon: Briefcase },
    { href: "/dashboard/services", label: "My Services", icon: Wrench },
    { href: "/profile", label: "Account Profile", icon: UserCheck },
  ];

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 p-4 min-h-screen hidden lg:flex flex-col justify-between">
      <div className="space-y-6">
        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
              {role === "admin" ? "Admin Portal" : "Pro Workspace"}
            </h3>
            <span className="text-[10px] text-emerald-400 font-medium">Verified Partner</span>
          </div>
        </div>

        <nav className="space-y-1">
          {links.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1 text-slate-400 text-[11px]">
        <p className="font-bold text-slate-300">Pay on Work Guarantee</p>
        <p>Collect cash/UPI payments directly from customer upon job completion.</p>
      </div>
    </aside>
  );
}
