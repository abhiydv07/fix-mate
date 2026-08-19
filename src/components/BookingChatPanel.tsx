"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, User, Wrench, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export interface ChatMessage {
  id: string;
  booking_id: string;
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
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchMessages();

    // Subscribe to Supabase Realtime changes for chat_messages of this bookingId
    const channel = supabase
      .channel(`chat-${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function fetchMessages() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/chat/messages?bookingId=${bookingId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Fetch chat messages error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const text = inputMessage.trim();
    setInputMessage("");
    setIsSending(true);

    try {
      await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          message: text,
        }),
      });
    } catch (err) {
      console.error("Send message error:", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-brand-400" />
          <h3 className="font-bold text-sm text-slate-100">Live Service Chat</h3>
        </div>
        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          Encrypted & Realtime
        </span>
      </div>

      {/* Messages Thread Container */}
      <div className="h-64 overflow-y-auto rounded-xl bg-slate-950 p-3 space-y-3 scrollbar-thin scrollbar-thumb-slate-800">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500 animate-pulse">
            Loading chat messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-1 p-4">
            <MessageSquare className="w-6 h-6 text-slate-600" />
            <p className="text-xs font-semibold text-slate-400">No chat messages yet</p>
            <p className="text-[11px] text-slate-500">Coordinate timing, gate codes, or instructions here.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"} space-y-1`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-xs space-y-1 ${
                    isMe
                      ? "bg-brand-500 text-white rounded-br-none shadow-md shadow-brand-500/10"
                      : "bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none"
                  }`}
                >
                  <p className="leading-relaxed">{msg.message}</p>
                </div>
                <span className="text-[9px] text-slate-500 px-1">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Form */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type message to service professional..."
          className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
        />
        <Button
          type="submit"
          disabled={!inputMessage.trim() || isSending}
          size="sm"
          className="bg-brand-500 hover:bg-brand-600 text-white shrink-0 px-4"
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </form>
    </div>
  );
}
