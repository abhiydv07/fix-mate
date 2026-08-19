"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Clock,
  MapPin,
  CheckCircle2,
  Navigation,
  Play,
  Check,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface JobItem {
  id: string;
  customer_id: string;
  provider_id: string | null;
  service_id: string;
  address_id: string;
  status: "assigned" | "on_the_way" | "in_progress" | "completed" | "cancelled" | "pending";
  scheduled_at: string;
  price: number;
  created_at: string;
  updated_at?: string;
}

export default function ProviderJobsPage() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [activeTab, setActiveTab] = useState<"today" | "upcoming" | "history">("today");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  // 30-Second Client-Side Geolocation Broadcaster when status = on_the_way
  useEffect(() => {
    const hasOnTheWayJob = jobs.some((j) => j.status === "on_the_way");
    if (!hasOnTheWayJob) return;

    function sendLocationPing() {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await fetch("/api/provider/location", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              }),
            });
            console.log("📡 Provider GPS Broadcaster sent ping:", position.coords.latitude, position.coords.longitude);
          } catch (err) {
            console.error("Location ping error:", err);
          }
        },
        (err) => console.warn("GPS ping position error:", err)
      );
    }

    sendLocationPing(); // Send immediate ping
    const timer = setInterval(sendLocationPing, 30000); // Repeat every 30 seconds

    return () => clearInterval(timer);
  }, [jobs]);

  async function loadJobs() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/bookings");
      if (res.ok) {
        const data = await res.json();
        setJobs(data.bookings || []);
      }
    } catch (err) {
      console.error("Fetch jobs error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    setUpdatingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        loadJobs();
      }
    } catch (err) {
      console.error("Update status error:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  const filteredJobs = jobs.filter((job) => {
    if (job.status === "pending") return false;
    const jobDate = new Date(job.scheduled_at).toISOString().split("T")[0];

    if (activeTab === "today") {
      return (jobDate === todayStr || job.status === "on_the_way" || job.status === "in_progress") && job.status !== "completed";
    } else if (activeTab === "upcoming") {
      return jobDate > todayStr && job.status !== "completed";
    } else {
      return job.status === "completed" || job.status === "cancelled";
    }
  });

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 md:p-8 bg-slate-950 text-slate-100 pb-20 md:pb-8">
      {/* Header */}
      <header className="flex items-center justify-between py-2 border-b border-slate-800/80 mb-6">
        <Link href="/" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200">
          ← Main Site
        </Link>
        <span className="font-bold text-sm text-white">Provider Jobs Control</span>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Verified
        </span>
      </header>

      <main className="max-w-4xl mx-auto w-full flex-1 space-y-6">
        {/* Tabs Switcher */}
        <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-slate-900 border border-slate-800">
          {[
            { key: "today", label: "Today's Jobs" },
            { key: "upcoming", label: "Upcoming" },
            { key: "history", label: "Job History" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.key
                  ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Jobs List */}
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500 animate-pulse">
            Loading assigned service jobs...
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
            <Briefcase className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs font-semibold text-slate-300">No jobs in {activeTab}</p>
            <p className="text-[11px] text-slate-500">Check the requests queue to claim open broadcast jobs.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">
                      Job #{job.id.slice(0, 8)}
                    </span>
                    <h3 className="font-bold text-base text-white mt-0.5">Assigned Home Service</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-emerald-400">₹{job.price}</span>
                    <p className="text-[10px] text-slate-400">Collect Cash / UPI</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brand-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400">Scheduled</p>
                      <p className="font-semibold">{new Date(job.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400">Service Spot</p>
                      <p className="font-semibold">Delivery Address</p>
                    </div>
                  </div>
                </div>

                {/* Status Transition Action Buttons */}
                <div className="space-y-2 pt-1 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Current Status:</span>
                    <span className="font-bold uppercase tracking-wider px-2.5 py-0.5 rounded text-[10px] bg-brand-500/20 text-brand-300 border border-brand-500/30">
                      {job.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {job.status === "assigned" && (
                      <Button
                        onClick={() => handleUpdateStatus(job.id, "on_the_way")}
                        disabled={updatingId === job.id}
                        className="w-full bg-brand-500 hover:bg-brand-600 text-xs font-bold py-2.5 flex items-center justify-center gap-1.5"
                      >
                        <Navigation className="w-3.5 h-3.5" /> Start Travel (On The Way)
                      </Button>
                    )}

                    {job.status === "on_the_way" && (
                      <Button
                        onClick={() => handleUpdateStatus(job.id, "in_progress")}
                        disabled={updatingId === job.id}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold py-2.5 flex items-center justify-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5" /> Arrived & Start Work (In Progress)
                      </Button>
                    )}

                    {job.status === "in_progress" && (
                      <Button
                        onClick={() => handleUpdateStatus(job.id, "completed")}
                        disabled={updatingId === job.id}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold py-2.5 flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" /> Mark Completed & Collect ₹{job.price}
                      </Button>
                    )}

                    {job.status === "completed" && (
                      <div className="w-full p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Service Completed & Payment Collected
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
