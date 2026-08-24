"use client";

import { useState, useEffect, useRef } from "react";
import { Send, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ChatMessage {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

interface BookingChatPanelProps {
  bookingId: string;
  currentUserId?: string;
}

export function BookingChatPanel({ bookingId, currentUserId }: BookingChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    async function init() {
      if (currentUserId) {
        setUserId(currentUserId);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setUserId(user.id);
      }

      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("booking_id", bookingId)
        .order("created_at", { ascending: true });

      setMessages(data || []);
    }
    init();

    const channel = supabase
      .channel(`chat-${bookingId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `booking_id=eq.${bookingId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [bookingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!newMessage.trim() || !userId) return;

    const { error } = await supabase.from("chat_messages").insert({
      booking_id: bookingId,
      sender_id: userId,
      message: newMessage.trim(),
    });

    if (!error) setNewMessage("");
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-brand-400 hover:border-brand-500/30 transition-all relative"
      >
        <MessageSquare className="w-4 h-4" />
        {messages.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-500 text-white text-[8px] font-bold flex items-center justify-center">
            {messages.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-12 right-0 w-80 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden z-50">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-white">Chat</span>
            <button onClick={() => setIsOpen(false)} className="text-[10px] text-slate-400 hover:text-slate-200">Close</button>
          </div>

          <div className="h-64 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-[10px] text-slate-500 text-center">No messages yet.<br/>Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender_id === userId ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] px-3 py-2 rounded-xl text-[11px] ${
                    msg.sender_id === userId
                      ? "bg-brand-500 text-white rounded-br-none"
                      : "bg-slate-800 text-slate-200 rounded-bl-none"
                  }`}>
                    <p>{msg.message}</p>
                    <span className={`text-[8px] ${msg.sender_id === userId ? "text-brand-200" : "text-slate-500"}`}>
                      {new Date(msg.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="p-2 rounded-xl bg-brand-500 text-white disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
