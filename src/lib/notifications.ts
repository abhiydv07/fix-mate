"use client";

import { createClient } from "@/lib/supabase/client";

// ═══════════════════════════════════════
// FEATURE 2: Browser Push Notifications
// ═══════════════════════════════════════

export async function requestPushPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  const permission = await Notification.requestPermission();
  return permission === "granted";
}

export function sendBrowserNotification(title: string, body: string, icon?: string) {
  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: icon || "/favicon.svg",
      badge: "/favicon.svg",
      tag: "fixmate-" + Date.now(),
    });
  }
}

// ═══════════════════════════════════════
// FEATURE 3: SMS Notifications (via API)
// ═══════════════════════════════════════

export async function sendSMSNotification(phone: string, message: string): Promise<boolean> {
  try {
    const res = await fetch("/api/notifications/sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, message }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ═══════════════════════════════════════
// In-App Notification (existing)
// ═══════════════════════════════════════

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

export async function getUserNotifications(): Promise<NotificationItem[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (data as NotificationItem[]) || [];
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("notifications").update({ read: true }).eq("id", id);
}
