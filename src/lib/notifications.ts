import { createClient } from "@/lib/supabase/client";

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

export async function createNotification(
  userId: string,
  title: string,
  body: string
): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from("notifications").insert({
      user_id: userId,
      title,
      body,
      read: false,
    });
    return !error;
  } catch (err) {
    console.error("Create notification error:", err);
    return false;
  }
}

export async function getUserNotifications(): Promise<NotificationItem[]> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error || !data) return [];
    return data as NotificationItem[];
  } catch {
    return [];
  }
}

export async function markNotificationAsRead(id: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Transactional Email Helper via Resend API
 */
export async function sendEmailResend(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[Resend Email Simulated] To: ${to} | Subject: ${subject}`);
    return true;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "FixMate Services <notifications@fixmate.in>",
        to: [to],
        subject,
        html,
      }),
    });

    return res.ok;
  } catch (err) {
    console.error("Resend email send error:", err);
    return false;
  }
}
