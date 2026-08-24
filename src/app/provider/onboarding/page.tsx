"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, CheckCircle2, User, Wrench, FileText, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const SERVICES = [
  "Plumbing", "Electrical", "Cleaning", "Appliance Repair", "Painting", "Carpentry",
  "AC Repair", "Pest Control", "Water Purifier", "Geyser Installation"
];

export default function ProviderOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [experience, setExperience] = useState("1-3");
  const [bio, setBio] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [pan, setPan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const supabase = createClient();

  function toggleService(s: string) {
    setSelectedServices((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsSubmitting(false); return; }

    // Update profile
    await supabase.from("profiles").upsert({
      id: user.id,
      name,
      phone,
      role: "provider",
    }, { onConflict: "id" });

    // Create provider profile
    await supabase.from("provider_profiles").upsert({
      user_id: user.id,
      bio,
      experience_years: experience,
      is_available: true,
      verified: false,
      avg_rating: 0,
      total_reviews: 0,
    }, { onConflict: "user_id" });

    // Update user metadata
    await supabase.auth.updateUser({
      data: { role: "provider", full_name: name },
    });

    setIsSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100">
        <div className="max-w-md w-full text-center space-y-6 p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-extrabold text-white">Application Submitted!</h1>
            <p className="text-xs text-slate-400">
              Our team will review your application and KYC documents within 48 hours.
              You&apos;ll be notified once verified.
            </p>
          </div>
          <Link href="/provider/dashboard" className="block py-3 rounded-xl bg-brand-500 text-white text-xs font-bold">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 bg-slate-950 text-slate-100 pb-20 md:pb-8">
      <header className="flex items-center justify-between py-2 border-b border-slate-800/80 mb-6">
        <Link href="/" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200">
          ← Home
        </Link>
        <span className="font-bold text-sm text-white">Provider Onboarding</span>
        <span className="text-[10px] font-bold text-brand-400">Step {step + 1}/4</span>
      </header>

      {/* Progress */}
      <div className="flex gap-1 mb-6">
        {[0, 1, 2, 3].map((s) => (
          <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= step ? "bg-brand-500" : "bg-slate-800"}`} />
        ))}
      </div>

      <main className="max-w-lg mx-auto w-full flex-1 space-y-6">
        {/* Step 0: Personal Details */}
        {step === 0 && (
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-brand-400" />
              <h3 className="text-sm font-bold text-white">Personal Details</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Full Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Phone Number *</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">City *</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Bengaluru"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500" />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Skills & Services */}
        {step === 1 && (
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="w-4 h-4 text-brand-400" />
              <h3 className="text-sm font-bold text-white">Skills & Services</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-2">Select Services You Offer *</label>
                <div className="grid grid-cols-2 gap-2">
                  {SERVICES.map((s) => (
                    <button key={s} onClick={() => toggleService(s)}
                      className={`p-2.5 rounded-xl border text-[10px] font-bold text-left transition-all ${
                        selectedServices.includes(s) ? "bg-brand-500/10 border-brand-500/30 text-brand-400" : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}>
                      {selectedServices.includes(s) ? "✓ " : ""}{s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Experience</label>
                <select value={experience} onChange={(e) => setExperience(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500">
                  <option value="0-1">Less than 1 year</option>
                  <option value="1-3">1-3 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5-10">5-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Bio / Description</label>
                <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell customers about your expertise..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500" />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Documents */}
        {step === 2 && (
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-brand-400" />
              <h3 className="text-sm font-bold text-white">Identity Documents</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Aadhaar Number</label>
                <input type="text" value={aadhaar} onChange={(e) => setAadhaar(e.target.value)} placeholder="XXXX XXXX XXXX" maxLength={14}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">PAN Number</label>
                <input type="text" value={pan} onChange={(e) => setPan(e.target.value)} placeholder="ABCDE1234F" maxLength={10}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-brand-500" />
              </div>
              <p className="text-[10px] text-slate-500">
                You can also upload documents later in Settings → KYC. Documents are verified within 48 hours.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Review & Submit</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Name</span><span className="text-white font-bold">{name || "—"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Phone</span><span className="text-white font-bold">{phone || "—"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">City</span><span className="text-white font-bold">{city || "—"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Services</span>
                <span className="text-white font-bold text-right">{selectedServices.join(", ") || "—"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Experience</span><span className="text-white font-bold">{experience} years</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Aadhaar</span><span className="text-white font-bold">{aadhaar ? "Provided" : "—"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center gap-2">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="py-3 text-xs">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} disabled={step === 0 && !name}
              className="flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2">
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}
              className="flex-1 py-3 text-xs font-extrabold bg-emerald-500 hover:bg-emerald-600 text-slate-950 flex items-center justify-center gap-2">
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
