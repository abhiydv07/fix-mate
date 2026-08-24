"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { User, MapPin, LogOut, ShieldCheck, Package, Wallet, Phone, Mail, Edit3, Camera, Star, Clock, ChevronRight, HelpCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AddressManager } from "@/components/AddressManager";
import { Button } from "@/components/ui/button";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatarUrl: string | null;
  created_at: string;
}

interface OrderSummary {
  id: string;
  service_name: string;
  status: string;
  price: number;
  scheduled_at: string;
}

interface WalletInfo {
  balance: number;
  total_earned: number;
  total_spent: number;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderSummary[]>([]);
  const [wallet, setWallet] = useState<WalletInfo>({ balance: 0, total_earned: 0, total_spent: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "addresses" | "settings">("overview");
  const supabase = createClient();

  useEffect(() => {
    loadProfile();
    loadRecentOrders();
    loadWallet();
  }, []);

  async function loadProfile() {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Fetch from profiles table for phone
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const p: UserProfile = {
        id: user.id,
        name: profileData?.name || user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        email: user.email || "",
        phone: profileData?.phone || "",
        role: profileData?.role || "customer",
        avatarUrl: profileData?.avatar_url || user.user_metadata?.avatar_url || null,
        created_at: profileData?.created_at || user.created_at,
      };
      setProfile(p);
      setEditName(p.name);
      setEditPhone(p.phone);
    }
    setIsLoading(false);
  }

  async function loadRecentOrders() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: bookings } = await supabase
      .from("bookings")
      .select("id, status, price, scheduled_at, service_id")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (bookings) {
      const serviceIds = [...new Set(bookings.map((b) => b.service_id).filter(Boolean))];
      const { data: services } = await supabase
        .from("services")
        .select("id, name")
        .in("id", serviceIds);

      const serviceMap = new Map(services?.map((s) => [s.id, s.name]) || []);
      setRecentOrders(
        bookings.map((b) => ({
          id: b.id,
          service_name: serviceMap.get(b.service_id) || "Service",
          status: b.status,
          price: b.price || 0,
          scheduled_at: b.scheduled_at,
        }))
      );
    }
  }

  async function loadWallet() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // Calculate from payments
    const { data: payments } = await supabase
      .from("payments")
      .select("amount, status")
      .eq("customer_id", user.id);

    if (payments) {
      const totalSpent = payments
        .filter((p) => p.status === "completed")
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      setWallet({ balance: 50, total_earned: 50, total_spent: totalSpent });
    }
  }

  async function handleSaveProfile() {
    if (!profile) return;
    const { error } = await supabase
      .from("profiles")
      .update({ name: editName, phone: editPhone })
      .eq("id", profile.id);

    if (!error) {
      setProfile({ ...profile, name: editName, phone: editPhone });
      setIsEditing(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setIsUploading(true);

    const fileExt = file.name.split(".").pop();
    const filePath = `avatars/${profile.id}.${fileExt}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (!error) {
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      await supabase.from("profiles").update({ avatar_url: urlData.publicUrl }).eq("id", profile.id);
      setProfile({ ...profile, avatarUrl: urlData.publicUrl });
    }
    setIsUploading(false);
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const initials = profile?.name?.charAt(0).toUpperCase() || "U";
  const statusColors: Record<string, string> = {
    pending: "text-amber-400 bg-amber-500/10",
    accepted: "text-blue-400 bg-blue-500/10",
    in_progress: "text-brand-400 bg-brand-500/10",
    completed: "text-emerald-400 bg-emerald-500/10",
    cancelled: "text-rose-400 bg-rose-500/10",
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 bg-slate-950 text-slate-100 pb-20 md:pb-8">
      {/* Header */}
      <header className="flex items-center justify-between py-2 border-b border-slate-800/80 mb-6">
        <Link href="/" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200">
          ← Home
        </Link>
        <span className="font-bold text-sm text-white">My Account</span>
        <button onClick={handleSignOut} className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1">
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </header>

      <main className="max-w-3xl mx-auto w-full flex-1 space-y-6">
        {/* Profile Card */}
        {isLoading ? (
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse h-24" />
        ) : profile ? (
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-4">
              {/* Avatar with upload */}
              <label className="relative cursor-pointer group">
                {profile.avatarUrl ? (
                  <Image src={profile.avatarUrl} alt={profile.name} width={72} height={72} className="w-[72px] h-[72px] rounded-2xl object-cover border-2 border-brand-500/30" />
                ) : (
                  <div className="w-[72px] h-[72px] rounded-2xl bg-brand-500/20 text-brand-400 border-2 border-brand-500/30 flex items-center justify-center font-bold text-2xl">
                    {initials}
                  </div>
                )}
                <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                {isUploading && <div className="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center"><span className="text-[10px] text-white">Uploading...</span></div>}
              </label>

              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white" placeholder="Name" />
                    <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white" placeholder="Phone number" />
                    <div className="flex gap-2">
                      <button onClick={handleSaveProfile} className="px-3 py-1 rounded-lg bg-brand-500 text-white text-[10px] font-bold">Save</button>
                      <button onClick={() => setIsEditing(false)} className="px-3 py-1 rounded-lg bg-slate-800 text-slate-400 text-[10px] font-bold">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-white">{profile.name}</h2>
                      <button onClick={() => setIsEditing(true)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-400">{profile.email}</p>
                    {profile.phone && <p className="text-xs text-slate-400">{profile.phone}</p>}
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-md">
                      {profile.role === "provider" ? "Service Provider" : profile.role === "admin" ? "Admin" : "Customer"}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
              <div className="text-center">
                <Package className="w-4 h-4 text-brand-400 mx-auto mb-1" />
                <span className="text-sm font-bold text-white block">{recentOrders.length}</span>
                <span className="text-[9px] text-slate-400">Orders</span>
              </div>
              <div className="text-center">
                <Wallet className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <span className="text-sm font-bold text-white block">₹{wallet.balance}</span>
                <span className="text-[9px] text-slate-400">Wallet</span>
              </div>
              <div className="text-center">
                <Star className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <span className="text-sm font-bold text-white block">4.8</span>
                <span className="text-[9px] text-slate-400">Rating</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
            <p className="text-xs text-slate-400">Not signed in.</p>
            <Link href="/login" className="text-xs text-brand-400 hover:underline">Sign In</Link>
          </div>
        )}

        {/* Tabs */}
        {profile && (
          <div className="flex gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
            {(["overview", "orders", "addresses", "settings"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-lg text-[11px] font-semibold transition-all capitalize ${
                  activeTab === tab ? "bg-brand-500 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Wallet Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-900/20 to-slate-900 border border-amber-500/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-amber-400" /> Wallet Balance
                </h3>
                <span className="text-lg font-black text-amber-400">₹{wallet.balance}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 rounded-lg bg-slate-900/50">
                  <span className="text-[9px] text-slate-400 block">Total Spent</span>
                  <span className="text-xs font-bold text-white">₹{wallet.total_spent}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/50">
                  <span className="text-[9px] text-slate-400 block">Referral Credits</span>
                  <span className="text-xs font-bold text-emerald-400">+₹{wallet.total_earned}</span>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            {recentOrders.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white">Recent Orders</h3>
                  <button onClick={() => setActiveTab("orders")} className="text-[10px] text-brand-400 hover:underline">View All</button>
                </div>
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                      <Package className="w-5 h-5 text-brand-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-white block truncate">{order.service_name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${statusColors[order.status] || "text-slate-400 bg-slate-800"}`}>
                          {order.status}
                        </span>
                        <span className="text-[9px] text-slate-500">
                          {new Date(order.scheduled_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-white">₹{order.price}</span>
                      <ChevronRight className="w-3 h-3 text-slate-500 ml-auto" />
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Quick Links */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-white">Quick Links</h3>
              {[
                { icon: MapPin, label: "Saved Addresses", href: "/profile/addresses", color: "text-brand-400" },
                { icon: HelpCircle, label: "Help & Support", href: "/help", color: "text-amber-400" },
                { icon: ShieldCheck, label: "Privacy & Security", href: "/profile", color: "text-emerald-400" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <link.icon className={`w-5 h-5 ${link.color}`} />
                  <span className="text-xs font-semibold text-white flex-1">{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-2">
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <Package className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">No orders yet</p>
                <Link href="/services" className="text-xs text-brand-400 hover:underline">Browse Services</Link>
              </div>
            ) : (
              recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">{order.service_name}</span>
                    <span className="text-xs font-bold text-white">₹{order.price}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${statusColors[order.status] || "text-slate-400 bg-slate-800"}`}>
                      {order.status}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(order.scheduled_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {activeTab === "addresses" && (
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <AddressManager />
          </div>
        )}

        {activeTab === "settings" && profile && (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-white">Account Info</h3>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <Mail className="w-4 h-4" /> {profile.email}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <Phone className="w-4 h-4" /> {profile.phone || "Not set"}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <User className="w-4 h-4" /> Member since {new Date(profile.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-white">Danger Zone</h3>
              <button onClick={handleSignOut} className="w-full py-2.5 rounded-xl border border-rose-500/30 text-rose-400 text-xs font-bold hover:bg-rose-500/10 transition-colors">
                Sign Out
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
