"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Send } from "lucide-react";

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function MessageInput({
  onSend,
  disabled,
  placeholder = "כתוב הודעה...",
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setMessage("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  return (
    <div
      className="border-t border-card-border bg-card p-4"
      style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px) + 70px)' }}
    >
      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full resize-none rounded-2xl border border-card-border bg-background px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ maxHeight: "120px" }}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={20} className="rotate-180" />
        </button>
      </div>

      <p className="text-xs text-muted mt-2 text-center">
        לחץ Enter לשליחה, Shift+Enter לשורה חדשה
      </p>
    </div>
  );
}
