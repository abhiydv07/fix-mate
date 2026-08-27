"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Layers,
  Wrench,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/providers", label: "Provider KYC", icon: Users },
    { href: "/admin/providers/assign", label: "Assign Services", icon: Wrench },
    { href: "/admin/categories", label: "Categories", icon: Layers },
    { href: "/admin/services", label: "Services", icon: Wrench },
    { href: "/admin/disputes", label: "Disputes", icon: AlertTriangle },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-slate-900/90 border-r border-slate-800 p-4 min-h-screen hidden lg:flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 px-2 py-1">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
                Admin Portal
              </h3>
              <span className="text-[10px] text-rose-400 font-medium">
                Super Admin
              </span>
            </div>
          </div>

          <nav className="space-y-1">
            {links.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
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

        <div className="space-y-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Main Site
          </Link>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1 text-slate-400 text-[11px]">
            <p className="font-bold text-slate-300">Admin Controls</p>
            <p>Approve providers, manage categories & service catalog.</p>
          </div>
        </div>
      </aside>

      {/* Mobile: Top Nav Bar */}
      <div className="flex-1 min-h-screen">
        <div className="lg:hidden sticky top-0 z-40 bg-slate-950/95 backdrop-blur-lg border-b border-slate-800 px-4 py-2 flex items-center gap-2 overflow-x-auto">
          {links.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-brand-500 text-white"
                    : "text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800"
                }`}
              >
                <Icon className="w-3 h-3" />
                {item.label}
              </Link>
            );
          })}
        </div>
        {children}
      </div>
    </div>
  );
}
