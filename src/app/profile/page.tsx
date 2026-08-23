"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { User, MapPin, LogOut, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AddressManager } from "@/components/AddressManager";
import { Button } from "@/components/ui/button";

interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      setProfile({
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User",
        email: user.email || "",
        role: user.user_metadata?.role || "customer",
        avatarUrl: user.user_metadata?.avatar_url || null,
      });
    }
    setIsLoading(false);
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const initials = profile?.name?.charAt(0).toUpperCase() || "U";
  const roleLabel = profile?.role === "provider" ? "Service Provider" : profile?.role === "admin" ? "Admin Account" : "Customer Account";

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 md:p-8 bg-slate-950 text-slate-100 pb-20 md:pb-8">
      {/* Header */}
      <header className="flex items-center justify-between py-2 border-b border-slate-800/80 mb-6">
        <Link href="/" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200">
          ← Home
        </Link>
        <span className="font-bold text-sm text-white">My Account</span>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Verified
        </span>
      </header>

      {/* Main Profile Layout */}
      <main className="max-w-3xl mx-auto w-full flex-1 space-y-6">
        {/* User Card */}
        {isLoading ? (
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse h-24" />
        ) : profile ? (
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={profile.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-2xl object-cover border border-brand-500/30"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center font-bold text-lg">
                  {initials}
                </div>
              )}
              <div>
                <h2 className="text-base font-bold text-white">{profile.name}</h2>
                <p className="text-xs text-slate-400">{profile.email}</p>
                <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-md">
                  {roleLabel}
                </span>
              </div>
            </div>

            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="text-xs text-slate-400 hover:text-rose-400 border-slate-800 hover:border-rose-500/40"
            >
              <LogOut className="w-3.5 h-3.5 mr-1" /> Sign Out
            </Button>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
            <p className="text-xs text-slate-400">Not signed in.</p>
            <Link href="/login" className="text-xs text-brand-400 hover:underline">
              Sign In
            </Link>
          </div>
        )}

        {/* Saved Addresses Section */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <AddressManager />
        </div>
      </main>
    </div>
  );
}
