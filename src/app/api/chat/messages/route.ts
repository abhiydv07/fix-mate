import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { enforceRateLimit } from "@/lib/rate-limit";

const postMessageSchema = z.object({
  bookingId: z.string().min(1, "bookingId is required"),
  message: z.string().min(1, "Message text cannot be empty"),
});

export async function POST(request: Request) {
  try {
    const rl = enforceRateLimit(request, "chat-post", 30, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many messages" }, { status: 429, headers: rl.headers });
    }
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const body = await request.json();
    const validation = postMessageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { bookingId, message } = validation.data;

    // Verify user is customer or provider of this booking
    const { data: booking } = await supabase
      .from("bookings")
      .select("customer_id, provider_id")
      .eq("id", bookingId)
      .single();

    if (!booking || (booking.customer_id !== user.id && booking.provider_id !== user.id)) {
      return NextResponse.json(
        { error: "Forbidden. You are not part of this booking." },
        { status: 403 }
      );
    }

    // Insert chat message
    const { data: newMessage, error: insertError } = await supabase
      .from("chat_messages")
      .insert({
        booking_id: bookingId,
        sender_id: user.id,
        message,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Chat insert error:", insertError.message);
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }

    // Fire notification to recipient (if user is customer -> send to provider, else customer)
    const recipientId = user.id === booking.customer_id ? booking.provider_id : booking.customer_id;
    if (recipientId) {
      await supabase.from("notifications").insert({
        user_id: recipientId,
        title: "New Chat Message 💬",
        body: `You received a message: "${message.slice(0, 40)}${message.length > 40 ? "..." : ""}"`,
      });
    }

    return NextResponse.json({ success: true, message: newMessage }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("bookingId");

    if (!bookingId) {
      return NextResponse.json({ error: "bookingId query parameter is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch messages for bookingId sorted chronologically
    const { data: messages, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("booking_id", bookingId)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ messages: messages || [] });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
