"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { MessageCircle, User, ChevronLeft } from "lucide-react";
import Card from "@/components/ui/card";
import ChatWindow from "@/components/chat/chat-window";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";

interface Contact {
  id: string;
  name: string | null;
  image: string | null;
  role: string;
  platoon: string | null;
  lastMessage: {
    text: string;
    timestamp: string;
    isFromMe: boolean;
  } | null;
  unreadCount: number;
}

export default function ChatPage() {
  const { data: session } = useSession();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await fetch("/api/chat/contacts");
      const data = await res.json();

      if (data.contacts) {
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedContact(null);
    // Refresh contacts to update unread counts
    fetchContacts();
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

  const formatLastMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: he,
    });
  };

  // Mobile: Show either contacts or chat window
  // Desktop: Show both side by side
  if (selectedContact) {
    return (
      <div className="fixed inset-0 md:relative md:inset-auto md:py-6">
        <div className="h-full md:h-[calc(100vh-12rem)] md:rounded-xl md:overflow-hidden md:border md:border-card-border">
          <ChatWindow
            contact={selectedContact}
            currentUserId={session?.user?.id || ""}
            onBack={handleBack}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-l from-primary to-primary-light rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">צ'אט</h1>
        <p className="text-white/80">שלח הודעה לר"מ הפלוגתי</p>
      </div>

      {/* Contacts List */}
      <Card variant="bordered">
        {loading ? (
          <div className="p-8 text-center text-muted">טוען אנשי קשר...</div>
        ) : contacts.length === 0 ? (
          <div className="p-8 text-center">
            <MessageCircle size={48} className="mx-auto text-muted mb-4" />
            <p className="text-lg font-medium mb-2">אין אנשי קשר זמינים</p>
            <p className="text-muted text-sm">
              פנה למנהל המערכת להוספת ר"מ לפלוגה שלך
            </p>
          </div>
        ) : (
          <div className="divide-y divide-card-border">
            {contacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className="w-full flex items-center gap-4 p-4 hover:bg-background transition-colors text-right"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {contact.image ? (
                      <img
                        src={contact.image}
                        alt={contact.name || ""}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={24} className="text-primary" />
                    )}
                  </div>

                  {/* Unread Badge */}
                  {contact.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {contact.unreadCount > 9 ? "9+" : contact.unreadCount}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-foreground truncate">
                      {contact.name || "משתמש"}
                    </h3>
                    {contact.lastMessage && (
                      <span className="text-xs text-muted flex-shrink-0 mr-2">
                        {formatLastMessageTime(contact.lastMessage.timestamp)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted truncate">
                      {contact.lastMessage ? (
                        <>
                          {contact.lastMessage.isFromMe && (
                            <span className="text-primary">אתה: </span>
                          )}
                          {contact.lastMessage.text}
                        </>
                      ) : (
                        <span>
                          {getRoleLabel(contact.role)}
                          {contact.platoon && ` • ${contact.platoon}`}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Arrow */}
                <ChevronLeft size={20} className="text-muted flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Info */}
      <div className="text-center text-sm text-muted">
        <p>ההודעות שלך נשמרות בצורה מאובטחת</p>
        <p>רק אתה והר"מ יכולים לראות את השיחה</p>
      </div>
    </div>
  );
}
