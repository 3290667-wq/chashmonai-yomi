"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowRight, User } from "lucide-react";
import MessageList, { Message } from "./message-list";
import MessageInput from "./message-input";

interface Contact {
  id: string;
  name: string | null;
  image: string | null;
  role: string;
  platoon: string | null;
}

interface ChatWindowProps {
  contact: Contact;
  currentUserId: string;
  onBack: () => void;
}

export default function ChatWindow({
  contact,
  currentUserId,
  onBack,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat?recipientId=${contact.id}`);
      const data = await res.json();

      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  }, [contact.id]);

  useEffect(() => {
    fetchMessages();

    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);

    return () => clearInterval(interval);
  }, [fetchMessages]);

  const handleSend = async (message: string) => {
    setSending(true);

    // Optimistic update
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      message,
      createdAt: new Date().toISOString(),
      isRead: false,
      fromUser: {
        id: currentUserId,
        name: null,
        image: null,
        role: "USER",
      },
      toUser: {
        id: contact.id,
        name: contact.name,
        image: contact.image,
        role: contact.role,
      },
    };

    setMessages((prev) => [...prev, tempMessage]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toUserId: contact.id,
          message,
        }),
      });

      const data = await res.json();

      if (data.message) {
        // Replace temp message with real one
        setMessages((prev) =>
          prev.map((m) => (m.id === tempMessage.id ? data.message : m))
        );
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // Remove temp message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
    } finally {
      setSending(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "RAM":
        return 'ר"מ';
      case "ADMIN":
        return "מנהל";
      default:
        return "חייל";
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-primary text-white">
        <button
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowRight size={24} />
        </button>

        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
          {contact.image ? (
            <img
              src={contact.image}
              alt={contact.name || ""}
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={20} />
          )}
        </div>

        <div className="flex-1">
          <h2 className="font-bold">{contact.name || "משתמש"}</h2>
          <p className="text-sm text-white/70">
            {getRoleLabel(contact.role)}
            {contact.platoon && ` • ${contact.platoon}`}
          </p>
        </div>
      </div>

      {/* Messages */}
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        loading={loading}
      />

      {/* Input */}
      <MessageInput
        onSend={handleSend}
        disabled={sending}
        placeholder={`שלח הודעה ל${contact.name || "ר\"מ"}...`}
      />
    </div>
  );
}
