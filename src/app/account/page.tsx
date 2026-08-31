"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, User, Package, CreditCard, Wallet, ShieldCheck, Settings,
  Gift, HelpCircle, Star, ChevronRight, LogOut, MapPin, Bell, Moon,
  Globe, Phone, Mail, Edit3, Camera, ChevronDown, FileText, AlertTriangle,
  Briefcase, BadgeCheck
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatarUrl: string | null;
  created_at: string;
}

interface Stats {
  totalOrders: number;
  completedOrders: number;
  walletBalance: number;
  referralEarnings: number;
}

export default function AccountPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, completedOrders: 0, walletBalance: 0, referralEarnings: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [showRoleSwitch, setShowRoleSwitch] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const supabase = createClient();

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsLoading(false); return; }

    const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    const { count: totalOrders } = await supabase.from("bookings").select("*", { count: "exact", head: true }).eq("customer_id", user.id);
    const { count: completedOrders } = await supabase.from("bookings").select("*", { count: "exact", head: true }).eq("customer_id", user.id).eq("status", "completed");

    setProfile({
      id: user.id,
      name: p?.name || user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
      email: user.email || "",
      phone: p?.phone || "",
      role: p?.role || "customer",
      avatarUrl: p?.avatar_url || user.user_metadata?.avatar_url || null,
      created_at: p?.created_at || user.created_at,
    });
    setStats({ totalOrders: totalOrders || 0, completedOrders: completedOrders || 0, walletBalance: 50, referralEarnings: 50 });
    setIsLoading(false);
  }

  const handleSignOut = async () => { await supabase.auth.signOut(); window.location.href = "/"; };

  const handleDeleteAccount = async () => {
    setDeleteError("");
    if (!profile?.email || deleteEmail !== profile.email) {
      setDeleteError("Please type your email exactly to confirm");
      return;
    }
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmEmail: deleteEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        window.location.href = "/";
      } else {
        setDeleteError(data.error || "Failed to delete account");
      }
    } catch {
      setDeleteError("Network error. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const menuSections = [
    {
      title: "My Activity",
      items: [
        { icon: Package, label: "My Bookings", desc: "View all your orders", href: "/account/bookings", color: "text-brand-400" },
        { icon: Star, label: "My Reviews", desc: "Ratings you've given", href: "/account/reviews", color: "text-amber-400" },
        { icon: MapPin, label: "Saved Addresses", desc: "Manage delivery locations", href: "/profile/addresses", color: "text-emerald-400" },
        { icon: Gift, label: "Refer & Earn", desc: "Invite friends, earn credits", href: "/account/referral", color: "text-rose-400" },
      ],
    },
    {
      title: "Payments",
      items: [
        { icon: Wallet, label: "My Wallet", desc: "Balance & transaction history", href: "/account/wallet", color: "text-amber-400" },
        { icon: CreditCard, label: "Payment Methods", desc: "UPI, cards & cash settings", href: "/account/payments", color: "text-brand-400" },
        { icon: ShieldCheck, label: "My Plans", desc: "Fix Mate Plus subscription", href: "/account/plans", color: "text-emerald-400" },
      ],
    },
    {
      title: "Provider",
      items: [
        { icon: Briefcase, label: "Provider Dashboard", desc: "Manage jobs & earnings", href: "/provider/dashboard", color: "text-brand-400", showIf: profile?.role === "provider" || profile?.role === "admin" },
        { icon: BadgeCheck, label: "KYC Verification", desc: "Verify your identity", href: "/account/kyc", color: "text-emerald-400" },
      ],
    },
    {
      title: "Account & Settings",
      items: [
        { icon: Bell, label: "Notifications", desc: "Push & email preferences", href: "/account/settings", color: "text-brand-400" },
        { icon: Settings, label: "Settings", desc: "Language, privacy, display", href: "/account/settings", color: "text-slate-400" },
        { icon: HelpCircle, label: "Help & Support", desc: "FAQs, contact, emergency", href: "/help", color: "text-amber-400" },
        { icon: FileText, label: "About Fix Mate", desc: "App info, terms, licenses", href: "/account/about", color: "text-slate-400" },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 bg-slate-950 text-slate-100 pb-20 md:pb-8">
      <header className="flex items-center justify-between py-2 border-b border-slate-800/80 mb-6">
        <Link href="/" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
        <span className="font-bold text-sm text-white">My Account</span>
        <button onClick={handleSignOut} className="text-[10px] text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1">
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </header>

      <main className="max-w-2xl mx-auto w-full flex-1 space-y-5">
        {/* Profile Card */}
        {isLoading ? (
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse h-28" />
        ) : profile ? (
          <Link href="/account/edit-profile" className="block p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="flex items-center gap-4">
              <div className="relative group">
                {profile.avatarUrl ? (
                  <Image src={profile.avatarUrl} alt={profile.name} width={64} height={64} className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-500/30" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-brand-500/20 text-brand-400 border-2 border-brand-500/30 flex items-center justify-center font-bold text-2xl">
                    {profile.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center">
                  <Camera className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-white">{profile.name}</h2>
                <p className="text-[11px] text-slate-400">{profile.email}</p>
                {profile.phone && <p className="text-[11px] text-slate-400">{profile.phone}</p>}
                <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-md">
                  {profile.role === "provider" ? "Service Provider" : profile.role === "admin" ? "Admin" : "Customer"}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-800">
              <div className="text-center">
                <span className="text-sm font-bold text-white block">{stats.totalOrders}</span>
                <span className="text-[9px] text-slate-400">Orders</span>
              </div>
              <div className="text-center">
                <span className="text-sm font-bold text-white block">{stats.completedOrders}</span>
                <span className="text-[9px] text-slate-400">Completed</span>
              </div>
              <div className="text-center">
                <span className="text-sm font-bold text-amber-400 block">₹{stats.walletBalance}</span>
                <span className="text-[9px] text-slate-400">Wallet</span>
              </div>
              <div className="text-center">
                <span className="text-sm font-bold text-emerald-400 block">₹{stats.referralEarnings}</span>
                <span className="text-[9px] text-slate-400">Earned</span>
              </div>
            </div>
          </Link>
        ) : (
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
            <p className="text-xs text-slate-400">Not signed in</p>
            <Link href="/login" className="text-xs text-brand-400 hover:underline">Sign In</Link>
          </div>
        )}

        {/* Role Switch Banner */}
        {profile && profile.role === "customer" && (
          <Link href="/login" className="block p-4 rounded-2xl bg-gradient-to-r from-amber-900/20 to-slate-900 border border-amber-500/20 hover:border-amber-500/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-white">Become a Service Pro</h4>
                <p className="text-[10px] text-slate-400">Earn money by providing home services</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>
          </Link>
        )}

        {/* Menu Sections */}
        {menuSections.map((section) => (
          <div key={section.title} className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1">{section.title}</h3>
            <div className="rounded-2xl bg-slate-900 border border-slate-800 divide-y divide-slate-800/60 overflow-hidden">
              {section.items
                .filter((item) => !('showIf' in item) || item.showIf)
                .map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-800/50 transition-colors"
                  >
                    <div className={`w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center ${item.color}`}>
                      <item.icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-white block">{item.label}</span>
                      <span className="text-[10px] text-slate-400">{item.desc}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </Link>
                ))}
            </div>
          </div>
        ))}

        {/* Danger Zone */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1">Account</h3>
          <div className="rounded-2xl bg-slate-900 border border-slate-800 divide-y divide-slate-800/60 overflow-hidden">
            <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-800/50 transition-colors text-left">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
                <LogOut className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-rose-400 block">Sign Out</span>
                <span className="text-[10px] text-slate-400">Sign out of your account</span>
              </div>
            </button>
            <button onClick={() => { setShowDeleteModal(true); setDeleteEmail(""); setDeleteError(""); }} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-800/50 transition-colors text-left">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-rose-400 block">Delete Account</span>
                <span className="text-[10px] text-slate-400">Permanently delete your account and data</span>
              </div>
            </button>
          </div>
        </div>

        {/* App Version */}
        <p className="text-center text-[10px] text-slate-600">Fix Mate v1.0.0 • Built with 💙</p>
      </main>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !deleteLoading && setShowDeleteModal(false)} />
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Delete Account</h3>
                <p className="text-[10px] text-slate-400">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This will permanently delete your account, all bookings, addresses, payment methods, reviews, and wallet data. You will be signed out immediately.
            </p>

            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
              <p className="text-[10px] font-bold text-rose-400 mb-2">Type your email to confirm:</p>
              <p className="text-[10px] text-slate-400 mb-2 font-mono">{profile?.email}</p>
              <input
                type="email"
                value={deleteEmail}
                onChange={(e) => setDeleteEmail(e.target.value)}
                placeholder="Type your email here"
                className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                disabled={deleteLoading}
              />
            </div>

            {deleteError && (
              <p className="text-[10px] text-rose-400 bg-rose-500/10 px-3 py-2 rounded-lg">{deleteError}</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-slate-300 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading || !deleteEmail}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deleting...
                  </span>
                ) : (
                  "Delete Forever"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
