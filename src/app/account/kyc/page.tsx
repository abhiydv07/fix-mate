"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Upload, CheckCircle2, Clock, XCircle, FileText, Camera, AlertTriangle, BadgeCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface KycStatus {
  status: "not_started" | "pending" | "verified" | "rejected";
  aadhaar: boolean;
  pan: boolean;
  photo: boolean;
  submitted_at: string | null;
}

export default function KycPage() {
  const [kyc, setKyc] = useState<KycStatus>({ status: "not_started", aadhaar: false, pan: false, photo: false, submitted_at: null });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDoc, setUploadDoc] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => { loadKyc(); }, []);

  async function loadKyc() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: pp } = await supabase.from("provider_profiles").select("verified, kyc_status").eq("user_id", user.id).single();
    if (pp) {
      setKyc({
        status: pp.verified ? "verified" : pp.kyc_status || "not_started",
        aadhaar: pp.kyc_status === "verified",
        pan: pp.kyc_status === "verified",
        photo: pp.kyc_status === "verified",
        submitted_at: null,
      });
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, docType: string) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File too large. Max 5MB allowed.");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, PNG, and PDF files are allowed.");
      return;
    }

    setIsUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const fileExt = file.name.split(".").pop();
    const { error } = await supabase.storage.from("kyc-docs").upload(`${user.id}/${docType}.${fileExt}`, file, { upsert: true });

    if (!error) {
      setKyc((prev) => ({ ...prev, [docType]: true }));
    }
    setIsUploading(false);
  }

  async function handleSubmitKyc() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("provider_profiles").upsert({
      user_id: user.id,
      kyc_status: "pending",
      verified: false,
    });

    setKyc((prev) => ({ ...prev, status: "pending", submitted_at: new Date().toISOString() }));
  }

  const statusConfig = {
    not_started: { label: "Not Started", color: "text-slate-400 bg-slate-800", icon: FileText },
    pending: { label: "Under Review", color: "text-amber-400 bg-amber-500/10", icon: Clock },
    verified: { label: "Verified", color: "text-emerald-400 bg-emerald-500/10", icon: CheckCircle2 },
    rejected: { label: "Rejected", color: "text-rose-400 bg-rose-500/10", icon: XCircle },
  };

  const cfg = statusConfig[kyc.status];
  const StatusIcon = cfg.icon;
  const allDocsUploaded = kyc.aadhaar && kyc.pan && kyc.photo;

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 bg-slate-950 text-slate-100 pb-20 md:pb-8">
      <header className="flex items-center justify-between py-2 border-b border-slate-800/80 mb-6">
        <Link href="/account" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200">
          <ArrowLeft className="w-4 h-4" /> Account
        </Link>
        <span className="font-bold text-sm text-white">KYC Verification</span>
        <div />
      </header>

      <main className="max-w-lg mx-auto w-full flex-1 space-y-5">
        {/* Status Banner */}
        <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
          kyc.status === "verified" ? "bg-emerald-500/10 border-emerald-500/20" :
          kyc.status === "pending" ? "bg-amber-500/10 border-amber-500/20" :
          kyc.status === "rejected" ? "bg-rose-500/10 border-rose-500/20" :
          "bg-slate-900 border-slate-800"
        }`}>
          <StatusIcon className={`w-6 h-6 shrink-0 ${
            kyc.status === "verified" ? "text-emerald-400" :
            kyc.status === "pending" ? "text-amber-400" :
            kyc.status === "rejected" ? "text-rose-400" : "text-slate-400"
          }`} />
          <div>
            <h3 className={`text-xs font-bold ${kyc.status === "verified" ? "text-emerald-400" : kyc.status === "pending" ? "text-amber-400" : kyc.status === "rejected" ? "text-rose-400" : "text-slate-400"}`}>
              {cfg.label}
            </h3>
            <p className="text-[10px] text-slate-400">
              {kyc.status === "verified" && "Your identity has been verified. You're good to go!"}
              {kyc.status === "pending" && "Your documents are being reviewed. This takes 24-48 hours."}
              {kyc.status === "rejected" && "Some documents were rejected. Please re-upload."}
              {kyc.status === "not_started" && "Upload your documents to verify your identity"}
            </p>
          </div>
        </div>

        {/* Why KYC */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-400" />
            <h3 className="text-xs font-bold text-white">Why do we need KYC?</h3>
          </div>
          <ul className="space-y-1.5 text-[11px] text-slate-400">
            <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /> Builds trust with customers</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /> Gets you a verified badge on your profile</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /> Required for receiving payments</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /> Compliance with Indian regulations</li>
          </ul>
        </div>

        {/* Document Uploads */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1">Documents Required</h3>

          {[
            { key: "aadhaar", label: "Aadhaar Card", desc: "Government-issued photo ID", icon: FileText },
            { key: "pan", label: "PAN Card", desc: "For tax & payment purposes", icon: FileText },
            { key: "photo", label: "Live Photo", desc: "Clear face photo for verification", icon: Camera },
          ].map((doc) => (
            <div key={doc.key} className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  kyc[doc.key as keyof typeof kyc] ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"
                }`}>
                  {kyc[doc.key as keyof typeof kyc] ? <CheckCircle2 className="w-5 h-5" /> : <doc.icon className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold text-white block">{doc.label}</span>
                  <span className="text-[10px] text-slate-400">{doc.desc}</span>
                </div>
                {kyc[doc.key as keyof typeof kyc] ? (
                  <span className="text-[9px] font-bold text-emerald-400">Uploaded ✓</span>
                ) : (
                  <label className="px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-[10px] font-bold cursor-pointer transition-colors">
                    <Upload className="w-3 h-3 inline mr-1" /> Upload
                    <input type="file" accept="image/jpeg,image/png,application/pdf" className="hidden" onChange={(e) => handleUpload(e, doc.key)} />
                  </label>
                )}
              </div>
            </div>
          ))}
        </div>

        {isUploading && (
          <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs text-brand-400 text-center">
            Uploading document...
          </div>
        )}

        {/* Important Note */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Your documents are encrypted and stored securely. We only use them for identity verification purposes and never share them with third parties.
          </p>
        </div>

        {/* Submit Button */}
        {kyc.status === "not_started" && (
          <button
            onClick={handleSubmitKyc}
            disabled={!allDocsUploaded}
            className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <BadgeCheck className="w-4 h-4" /> Submit for Verification
          </button>
        )}
      </main>
    </div>
  );
}
