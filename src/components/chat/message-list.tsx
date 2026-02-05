"use client";

import { useEffect, useRef } from "react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Check, CheckCheck } from "lucide-react";

export interface Message {
  id: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  fromUser: {
    id: string;
    name: string | null;
    image: string | null;
    role: string;
  };
  toUser: {
    id: string;
    name: string | null;
    image: string | null;
    role: string;
  };
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  loading?: boolean;
}

export default function MessageList({
  messages,
  currentUserId,
  loading,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return format(date, "HH:mm");
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isYesterday) {
      return `אתמול ${format(date, "HH:mm")}`;
    }

    return format(date, "dd/MM HH:mm", { locale: he });
  };

  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];

    msgs.forEach((msg) => {
      const date = new Date(msg.createdAt).toDateString();
      const existingGroup = groups.find((g) => g.date === date);

      if (existingGroup) {
        existingGroup.messages.push(msg);
      } else {
        groups.push({ date, messages: [msg] });
      }
    });

    return groups;
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return "היום";
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return "אתמול";
    }

    return format(date, "EEEE, d בMMMM", { locale: he });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-muted">טוען הודעות...</div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted">
          <p className="text-lg mb-2">אין הודעות עדיין</p>
          <p className="text-sm">שלח הודעה כדי להתחיל שיחה</p>
        </div>
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {groupedMessages.map((group) => (
        <div key={group.date}>
          {/* Date Header */}
          <div className="flex justify-center mb-4">
            <span className="bg-card-border text-muted text-xs px-3 py-1 rounded-full">
              {formatDateHeader(group.date)}
            </span>
          </div>

          {/* Messages */}
          <div className="space-y-2">
            {group.messages.map((msg) => {
              const isFromMe = msg.fromUser.id === currentUserId;

              return (
                <div
                  key={msg.id}
                  className={`flex ${isFromMe ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      isFromMe
                        ? "bg-primary text-white rounded-br-sm"
                        : "bg-card border border-card-border rounded-bl-sm"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {msg.message}
                    </p>
                    <div
                      className={`flex items-center gap-1 mt-1 ${
                        isFromMe ? "justify-start" : "justify-end"
                      }`}
                    >
                      <span
                        className={`text-xs ${
                          isFromMe ? "text-white/70" : "text-muted"
                        }`}
                      >
                        {formatMessageTime(msg.createdAt)}
                      </span>
                      {isFromMe && (
                        <span className="text-white/70">
                          {msg.isRead ? (
                            <CheckCheck size={14} />
                          ) : (
                            <Check size={14} />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
