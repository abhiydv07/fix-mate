"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Wrench, MapPin, User, LogIn, ShieldCheck, Bell, Check, X } from "lucide-react";
import { LocaleToggle } from "@/components/LocaleToggle";
import { getUserNotifications, markNotificationAsRead, NotificationItem } from "@/lib/notifications";
import { createClient } from "@/lib/supabase/client";

interface HeaderProps {
  userRole?: string;
  userName?: string;
  avatarUrl?: string;
}

export function Header({ userRole = "customer", userName, avatarUrl }: HeaderProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const supabase = createClient();

  useEffect(() => {
    loadNotifications();

    // Subscribe to Supabase Realtime updates on notifications table
    const channel = supabase
      .channel("header-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          setNotifications((prev) => [payload.new as NotificationItem, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadNotifications() {
    const data = await getUserNotifications();
    setNotifications(data);
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/90 border-b border-slate-800/80 px-4 md:px-8 py-3.5 flex items-center justify-between">
      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-2.5 group">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
          <Wrench className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-none bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Fix Mate
          </h1>
          <p className="text-[10px] text-slate-400 font-medium">Home Services Marketplace</p>
        </div>
      </Link>

      {/* Center Location Selector (Desktop/Tablet) */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
        <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
        <span>Location: <strong className="text-slate-100">Indiranagar, Bengaluru</strong></span>
      </div>

      {/* Right Navigation & Auth Actions */}
      <div className="flex items-center gap-2">
        <LocaleToggle />
        <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          Pay on Work
        </span>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-3 space-y-2 z-50">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-xs text-slate-100">Notifications</span>
                <span className="text-[10px] font-semibold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded">
                  {unreadCount} unread
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/60 text-xs">
                {notifications.length === 0 ? (
                  <p className="p-4 text-center text-slate-500 text-[11px]">No notifications yet</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 space-y-1 transition-colors ${
                        n.read ? "opacity-60" : "bg-slate-900/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-200 text-[11px]">{n.title}</h4>
                        {!n.read && (
                          <button
                            onClick={() => handleMarkAsRead(n.id)}
                            className="text-[9px] text-brand-400 hover:underline"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-snug">{n.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {userName ? (
          <Link
            href={userRole === "provider" || userRole === "admin" ? "/dashboard" : "/profile"}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            {avatarUrl ? (
              <Image src={avatarUrl} alt={userName} width={24} height={24} className="w-6 h-6 rounded-lg object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-xs font-semibold text-slate-200 hidden sm:inline">{userName}</span>
          </Link>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs transition-colors shadow-md shadow-brand-500/20"
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
