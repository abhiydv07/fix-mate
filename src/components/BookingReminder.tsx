"use client";

import { useState, useEffect } from "react";
import { Clock, Bell, BellRing } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ReminderBooking {
  id: string;
  service_name: string;
  scheduled_at: string;
  address?: string;
}

export function BookingReminder() {
  const [upcomingBookings, setUpcomingBookings] = useState<ReminderBooking[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const supabase = createClient();

  useEffect(() => {
    loadUpcoming();
    const interval = setInterval(loadUpcoming, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  async function loadUpcoming() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const { data: bookings } = await supabase
      .from("bookings")
      .select("id, scheduled_at, service_id, reminder_sent")
      .eq("customer_id", user.id)
      .in("status", ["assigned", "on_the_way"])
      .gte("scheduled_at", now.toISOString())
      .lte("scheduled_at", tomorrow.toISOString())
      .eq("reminder_sent", false);

    if (!bookings || bookings.length === 0) return;

    const serviceIds = [...new Set(bookings.map((b) => b.service_id))];
    const { data: svcs } = await supabase.from("services").select("id, name").in("id", serviceIds);
    const svcMap = new Map(svcs?.map((s) => [s.id, s.name]) || []);

    const reminders: ReminderBooking[] = bookings.map((b) => ({
      id: b.id,
      service_name: svcMap.get(b.service_id) || "Service",
      scheduled_at: b.scheduled_at,
    }));

    setUpcomingBookings(reminders);

    // Send notification for reminders
    for (const booking of reminders) {
      if (Notification.permission === "granted") {
        const schedDate = new Date(booking.scheduled_at);
        const hoursUntil = Math.round((schedDate.getTime() - now.getTime()) / (1000 * 60 * 60));
        new Notification(`Upcoming: ${booking.service_name}`, {
          body: hoursUntil <= 1 ? "Starting in less than 1 hour!" : `Starting in ${hoursUntil} hours`,
          icon: "/icons/icon-192.png",
        });
      }
      // Mark reminder as sent
      await supabase.from("bookings").update({ reminder_sent: true }).eq("id", booking.id);
    }
  }

  const visible = upcomingBookings.filter((b) => !dismissed.includes(b.id));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      {visible.map((booking) => {
        const schedDate = new Date(booking.scheduled_at);
        const now = new Date();
        const hoursUntil = Math.max(0, Math.round((schedDate.getTime() - now.getTime()) / (1000 * 60 * 60)));
        const isToday = schedDate.toDateString() === now.toDateString();

        return (
          <div key={booking.id} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
              <BellRing className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-amber-400">
                {isToday ? "Today" : "Tomorrow"} • {schedDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </p>
              <p className="text-xs font-bold text-white truncate">{booking.service_name}</p>
              <p className="text-[9px] text-slate-400">
                {hoursUntil <= 1 ? "Starting very soon!" : `${hoursUntil} hours away`}
              </p>
            </div>
            <button
              onClick={() => setDismissed((prev) => [...prev, booking.id])}
              className="text-[9px] text-slate-500 hover:text-slate-300 px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        );
      })}
    </div>
  );
}
