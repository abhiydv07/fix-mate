"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Wrench, MapPin, LogIn, LogOut, ShieldCheck, Bell, Search, ChevronDown, User } from "lucide-react";
import { LocaleToggle } from "@/components/LocaleToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getUserNotifications, markNotificationAsRead, NotificationItem } from "@/lib/notifications";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const LOCATIONS = [
  "Noida & Greater Noida",
  "Sector 62, Noida",
  "Sector 18, Noida",
  "Greater Noida West",
  "Knowledge Park, Greater Noida",
];

const NAV_LINKS = [
  { label: "Plumbing", href: "/services/plumbing" },
  { label: "Electrical", href: "/services/electrical" },
  { label: "Cleaning", href: "/services/cleaning" },
  { label: "Appliances", href: "/services/appliances" },
  { label: "Painting", href: "/services/painting" },
];

export function Header() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [locOpen, setLocOpen] = useState(false);
  const [location, setLocation] = useState("Noida & Greater Noida");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("customer");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const locRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);
      if (authUser) {
        const name = authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split("@")[0] || "";
        setUserName(name);
        setAvatarUrl(authUser.user_metadata?.avatar_url || "");
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", authUser.id).single();
        if (profile) setUserRole(profile.role || "customer");
      }
    }
    loadUser();
    loadNotifications();

    const channel = supabase
      .channel("header-notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
        setNotifications((prev) => [payload.new as NotificationItem, ...prev]);
      })
      .subscribe();

    // Close dropdowns on outside click
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchFocused(false);
      if (locRef.current && !locRef.current.contains(e.target as Node)) setLocOpen(false);
    }
    document.addEventListener("mousedown", handleClick);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  async function loadNotifications() {
    const data = await getUserNotifications();
    setNotifications(data);
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800/80">
        {/* Main header row */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-extrabold text-base leading-none text-slate-900 dark:text-white tracking-tight">Fix Mate</h1>
              <p className="text-[9px] text-slate-400 font-medium tracking-wide">HOME SERVICES</p>
            </div>
          </Link>

          {/* Location Selector */}
          <div ref={locRef} className="relative hidden md:block">
            <button
              onClick={() => setLocOpen(!locOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors text-sm"
            >
              <MapPin className="w-4 h-4 text-brand-500 shrink-0" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[180px]">{location}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${locOpen ? "rotate-180" : ""}`} />
            </button>
            {locOpen && (
              <div className="absolute top-full left-0 mt-1 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50">
                <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Location</p>
                {LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => { setLocation(loc); setLocOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm transition-colors ${
                      location === loc
                        ? "bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Bar (Desktop) */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-xl relative">
            <div className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
              searchFocused
                ? "border-brand-500 bg-white dark:bg-slate-900 shadow-lg shadow-brand-500/10 ring-2 ring-brand-500/20"
                : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700"
            }`}>
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder="Search for 'Kitchen cleaning'"
                className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
              />
            </div>
            {searchFocused && searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50">
                <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase">Suggestions</p>
                {["AC Repair", "Deep Cleaning", "Plumbing", "Electrical Work", "Painting"].filter(s => s.toLowerCase().includes(searchQuery.toLowerCase())).map((s) => (
                  <Link key={s} href={`/services`} onClick={() => { setSearchQuery(""); setSearchFocused(false); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <Search className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-sm text-slate-700 dark:text-slate-200">{s}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 ml-auto">
            {/* Mobile search toggle */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            <LocaleToggle />
            <ThemeToggle />

            <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Pay on Work
            </span>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl p-3 space-y-2 z-50">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-100">Notifications</span>
                    <span className="text-[10px] font-semibold text-brand-500 bg-brand-50 dark:bg-brand-500/10 px-2 py-0.5 rounded">{unreadCount} new</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-center text-slate-400 text-[11px]">No notifications yet</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className={`p-2.5 space-y-1 ${n.read ? "opacity-60" : "bg-brand-50/50 dark:bg-brand-500/5"}`}>
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">{n.title}</h4>
                            {!n.read && <button onClick={() => handleMarkAsRead(n.id)} className="text-[9px] text-brand-500 hover:underline">Read</button>}
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">{n.body}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User / Sign In */}
            {userName ? (
              <div className="flex items-center gap-1.5">
                <Link
                  href={userRole === "provider" || userRole === "admin" ? "/provider/dashboard" : "/account"}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                >
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt={userName} width={28} height={28} className="w-7 h-7 rounded-lg object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-brand-500 text-white flex items-center justify-center text-xs font-bold">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden lg:inline">{userName.split(" ")[0]}</span>
                </Link>
                <button
                  onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-rose-500 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs transition-all shadow-md shadow-brand-500/20 hover:shadow-lg"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile search bar (expandable) */}
        {mobileSearchOpen && (
          <div className="md:hidden px-4 pb-3">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for services..."
                className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Nav Links (Desktop) */}
        <div className="hidden md:block border-t border-slate-100 dark:border-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center gap-1 h-10 overflow-x-auto scrollbar-none">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/5 transition-colors whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </header>
    </>
  );
}
