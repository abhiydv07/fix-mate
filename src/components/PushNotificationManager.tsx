"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function PushNotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("Notification" in window && "serviceWorker" in navigator) {
      setIsSupported(true);
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, []);

  async function checkSubscription() {
    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch {
      // SW not ready yet
    }
  }

  async function handleSubscribe() {
    if (!isSupported) return;

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result !== "granted") return;

    try {
      const reg = await navigator.serviceWorker.ready;

      // Use VAPID key from env (you need to generate one at https://web-push-codelab.glitch.me/)
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        console.warn("VAPID public key not configured. Push notifications disabled.");
        return;
      }

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Save subscription to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("push_subscriptions").upsert({
          user_id: user.id,
          endpoint: subscription.endpoint,
          keys: JSON.parse(JSON.stringify(subscription)),
        }, { onConflict: "user_id" });
      }

      setIsSubscribed(true);
    } catch (err) {
      console.error("Push subscription error:", err);
    }
  }

  async function handleUnsubscribe() {
    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("push_subscriptions").delete().eq("user_id", user.id);
      }

      setIsSubscribed(false);
      setPermission("default");
    } catch (err) {
      console.error("Unsubscribe error:", err);
    }
  }

  if (!isSupported) return null;

  if (permission === "denied") {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800">
        <BellOff className="w-4 h-4 text-slate-500" />
        <div className="flex-1">
          <span className="text-xs font-bold text-slate-300 block">Notifications Blocked</span>
          <span className="text-[10px] text-slate-500">Enable in browser settings to receive order updates</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
      {isSubscribed ? (
        <BellRing className="w-4 h-4 text-emerald-400" />
      ) : (
        <Bell className="w-4 h-4 text-slate-400" />
      )}
      <div className="flex-1">
        <span className="text-xs font-bold text-slate-300 block">
          {isSubscribed ? "Notifications Active" : "Enable Notifications"}
        </span>
        <span className="text-[10px] text-slate-500">
          {isSubscribed ? "Get real-time order updates" : "Get notified about booking status"}
        </span>
      </div>
      <button
        onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
          isSubscribed
            ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
            : "bg-brand-500 text-white hover:bg-brand-600"
        }`}
      >
        {isSubscribed ? "Disable" : "Enable"}
      </button>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
