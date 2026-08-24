"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Camera, Save, User, Phone, Mail, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function EditProfilePage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [userId, setUserId] = useState("");
  const supabase = createClient();

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    setEmail(user.email || "");
    const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (p) {
      setName(p.name || "");
      setPhone(p.phone || "");
      setAvatarUrl(p.avatar_url || user.user_metadata?.avatar_url || null);
      setCreatedAt(new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }));
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setIsUploading(true);
    const fileExt = file.name.split(".").pop();
    const { error } = await supabase.storage.from("avatars").upload(`avatars/${userId}.${fileExt}`, file, { upsert: true });
    if (!error) {
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(`avatars/${userId}.${fileExt}`);
      await supabase.from("profiles").update({ avatar_url: urlData.publicUrl }).eq("id", userId);
      setAvatarUrl(urlData.publicUrl);
    }
    setIsUploading(false);
  }

  async function handleSave() {
    setIsSaving(true);
    const { error } = await supabase.from("profiles").update({ name, phone }).eq("id", userId);
    setMessage(error ? { type: "error", text: error.message } : { type: "success", text: "Profile updated!" });
    setIsSaving(false);
    setTimeout(() => setMessage(null), 3000);
  }

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 bg-slate-950 text-slate-100 pb-20 md:pb-8">
      <header className="flex items-center justify-between py-2 border-b border-slate-800/80 mb-6">
        <Link href="/account" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <span className="font-bold text-sm text-white">Edit Profile</span>
        <button onClick={handleSave} disabled={isSaving} className="text-[11px] font-bold text-brand-400 hover:text-brand-300 disabled:opacity-50">
          {isSaving ? "Saving..." : "Save"}
        </button>
      </header>

      <main className="max-w-lg mx-auto w-full space-y-5">
        {message && (
          <div className={`p-3 rounded-xl text-xs ${message.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
            {message.text}
          </div>
        )}

        {/* Avatar */}
        <div className="flex justify-center">
          <label className="relative cursor-pointer group">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="Avatar" width={96} height={96} className="w-24 h-24 rounded-3xl object-cover border-2 border-brand-500/30" />
            ) : (
              <div className="w-24 h-24 rounded-3xl bg-brand-500/20 text-brand-400 border-2 border-brand-500/30 flex items-center justify-center font-bold text-3xl">
                {name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
            <div className="absolute inset-0 rounded-3xl bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            {isUploading && <div className="absolute inset-0 rounded-3xl bg-black/60 flex items-center justify-center"><span className="text-[10px] text-white">Uploading...</span></div>}
          </label>
        </div>
        <p className="text-center text-[10px] text-slate-500">Tap to change profile photo</p>

        {/* Form Fields */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><User className="w-3 h-3" /> Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500 transition-colors" placeholder="Your full name" />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><Mail className="w-3 h-3" /> Email</label>
            <input value={email} disabled className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs text-slate-400 cursor-not-allowed" />
            <span className="text-[9px] text-slate-500">Email cannot be changed</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><Phone className="w-3 h-3" /> Phone Number</label>
            <div className="flex gap-2">
              <span className="px-3 py-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-400">+91</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500 transition-colors" placeholder="Enter phone number" maxLength={10} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Member Since</label>
            <input value={createdAt} disabled className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs text-slate-400 cursor-not-allowed" />
          </div>
        </div>

        <button onClick={handleSave} disabled={isSaving} className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </main>
    </div>
  );
}
