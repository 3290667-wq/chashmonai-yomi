"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Gift,
  Check,
  X,
  Clock,
  User,
  MessageSquare,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface Redemption {
  id: string;
  userId: string;
  points: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNote: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    platoon: string | null;
    points: number;
  };
}

export default function RedemptionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"PENDING" | "APPROVED" | "REJECTED" | "ALL">("PENDING");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [noteModal, setNoteModal] = useState<{ id: string; action: "APPROVED" | "REJECTED" } | null>(null);
  const [adminNote, setAdminNote] = useState("");

  const isAdmin = session?.user?.role === "ADMIN";
  const isRam = session?.user?.role === "RAM";

  useEffect(() => {
    if (status === "loading") return;
    if (!isAdmin && !isRam) {
      router.push("/dashboard");
      return;
    }
    fetchRedemptions();
  }, [status, isAdmin, isRam, router, filter]);

  const fetchRedemptions = async () => {
    try {
      const url = filter === "ALL" ? "/api/admin/redemptions" : `/api/admin/redemptions?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.redemptions) {
        setRedemptions(data.redemptions);
      }
    } catch (error) {
      console.error("Failed to fetch redemptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (redemptionId: string, newStatus: "APPROVED" | "REJECTED", note?: string) => {
    setProcessingId(redemptionId);
    try {
      const res = await fetch("/api/admin/redemptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          redemptionId,
          status: newStatus,
          adminNote: note || null,
        }),
      });

      if (res.ok) {
        // Refresh the list
        fetchRedemptions();
        setNoteModal(null);
        setAdminNote("");
      } else {
        const data = await res.json();
        alert(data.error || "שגיאה בעיבוד הבקשה");
      }
    } catch (error) {
      console.error("Failed to process redemption:", error);
      alert("שגיאה בעיבוד הבקשה");
    } finally {
      setProcessingId(null);
    }
  };

  const openNoteModal = (id: string, action: "APPROVED" | "REJECTED") => {
    setNoteModal({ id, action });
    setAdminNote("");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("he-IL", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-amber-500/20 text-amber-400">
            <Clock className="w-3 h-3" />
            ממתין
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-400">
            <Check className="w-3 h-3" />
            אושר
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400">
            <X className="w-3 h-3" />
            נדחה
          </span>
        );
      default:
        return null;
    }
  };

  if (status === "loading" || (!isAdmin && !isRam)) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
        <p className="text-white/50">טוען...</p>
      </div>
    );
  }

  const pendingCount = redemptions.filter((r) => r.status === "PENDING").length;

  return (
    <div className="py-4 sm:py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-lg">
          <ChevronRight className="w-5 h-5 text-white/60" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">אישור סליקות</h1>
          <p className="text-sm text-white/60">ניהול בקשות סליקת נקודות</p>
        </div>
        {pendingCount > 0 && (
          <div className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-sm font-medium">
            {pendingCount} ממתינים
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { value: "PENDING", label: "ממתינים" },
          { value: "APPROVED", label: "אושרו" },
          { value: "REJECTED", label: "נדחו" },
          { value: "ALL", label: "הכל" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setFilter(tab.value as typeof filter);
              setLoading(true);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              filter === tab.value
                ? "bg-gold text-[#1a140f]"
                : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Redemptions List */}
      <div className="bg-[#3b2d1f] rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center gap-2">
          <Gift className="w-5 h-5 text-rose-400" />
          <h2 className="font-bold text-white">בקשות סליקה</h2>
        </div>

        <div className="divide-y divide-white/10">
          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-8 h-8 mx-auto text-gold animate-spin" />
              <p className="text-white/50 mt-2">טוען בקשות...</p>
            </div>
          ) : redemptions.length === 0 ? (
            <div className="py-12 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-white/20" />
              <p className="text-white/50">אין בקשות {filter !== "ALL" ? "בסטטוס זה" : ""}</p>
            </div>
          ) : (
            redemptions.map((redemption) => (
              <div key={redemption.id} className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white/60" />
                      </div>
                      <div>
                        <p className="font-bold text-white">
                          {redemption.user.name || redemption.user.email}
                        </p>
                        <p className="text-xs text-white/50">
                          {redemption.user.platoon && `פלוגה ${redemption.user.platoon} • `}
                          יתרה: {redemption.user.points} נקודות
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="text-gold font-bold">
                        {redemption.points} נקודות לסליקה
                      </span>
                      <span className="text-white/30">|</span>
                      <span className="text-white/50">{formatDate(redemption.createdAt)}</span>
                      {getStatusBadge(redemption.status)}
                    </div>

                    {redemption.adminNote && (
                      <div className="mt-2 flex items-start gap-2 text-sm text-white/60 bg-white/5 rounded-lg p-2">
                        <MessageSquare className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{redemption.adminNote}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {redemption.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => openNoteModal(redemption.id, "REJECTED")}
                        disabled={processingId === redemption.id}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors disabled:opacity-50"
                      >
                        {processingId === redemption.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        דחה
                      </button>
                      <button
                        onClick={() => handleProcess(redemption.id, "APPROVED")}
                        disabled={processingId === redemption.id}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                      >
                        {processingId === redemption.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        אשר
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Note Modal */}
      {noteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-md bg-[#2a1f15] border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-bold text-white text-lg">
                {noteModal.action === "APPROVED" ? "אישור בקשה" : "דחיית בקשה"}
              </h3>
              <button
                onClick={() => setNoteModal(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  הערה למשתמש (אופציונלי)
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="הוסף הערה..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none"
                />
              </div>
            </div>

            <div className="p-4 sm:p-5 border-t border-white/10 flex gap-3">
              <button
                onClick={() => setNoteModal(null)}
                className="flex-1 py-3 border border-white/20 text-white rounded-xl font-medium hover:bg-white/5 transition-colors"
              >
                ביטול
              </button>
              <button
                onClick={() => handleProcess(noteModal.id, noteModal.action, adminNote)}
                disabled={processingId !== null}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                  noteModal.action === "APPROVED"
                    ? "bg-emerald-500 text-white hover:bg-emerald-600"
                    : "bg-red-500 text-white hover:bg-red-600"
                }`}
              >
                {processingId ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : noteModal.action === "APPROVED" ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <X className="w-5 h-5" />
                )}
                {processingId
                  ? "מעבד..."
                  : noteModal.action === "APPROVED"
                  ? "אשר"
                  : "דחה"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
