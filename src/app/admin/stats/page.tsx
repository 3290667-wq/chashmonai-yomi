"use client";

import { useState, useEffect } from "react";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Button from "@/components/ui/button";
import {
  Gift,
  Check,
  X,
  Clock,
  CheckCircle,
  XCircle,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

interface Redemption {
  id: string;
  points: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    platoon: string | null;
    points: number;
  };
}

export default function AdminRedemptionsPage() {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("PENDING");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [showNoteFor, setShowNoteFor] = useState<string | null>(null);

  useEffect(() => {
    fetchRedemptions();
  }, [filterStatus]);

  const fetchRedemptions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set("status", filterStatus);

      const res = await fetch(`/api/admin/redemptions?${params}`);
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

  const handleProcess = async (
    redemptionId: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    setProcessingId(redemptionId);
    try {
      const res = await fetch("/api/admin/redemptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          redemptionId,
          status,
          adminNote: adminNote || null,
        }),
      });

      if (res.ok) {
        setAdminNote("");
        setShowNoteFor(null);
        fetchRedemptions();
      }
    } catch (error) {
      console.error("Failed to process redemption:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock size={18} className="text-warning" />;
      case "APPROVED":
        return <CheckCircle size={18} className="text-success" />;
      case "REJECTED":
        return <XCircle size={18} className="text-error" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "ממתין";
      case "APPROVED":
        return "אושר";
      case "REJECTED":
        return "נדחה";
      default:
        return status;
    }
  };

  const pendingCount = redemptions.filter((r) => r.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">אישור סליקות</h1>
        <p className="text-muted">ניהול בקשות סליקת נקודות בשק"ם</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {[
          { value: "PENDING", label: "ממתינים", count: pendingCount },
          { value: "APPROVED", label: "אושרו" },
          { value: "REJECTED", label: "נדחו" },
          { value: "", label: "הכל" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterStatus(tab.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
              filterStatus === tab.value
                ? "bg-primary text-white"
                : "bg-card border border-card-border text-foreground hover:border-primary"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Redemptions List */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift size={20} className="text-secondary" />
            בקשות סליקה
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted">טוען...</div>
          ) : redemptions.length === 0 ? (
            <div className="text-center py-8 text-muted">
              אין בקשות{" "}
              {filterStatus === "PENDING"
                ? "ממתינות"
                : filterStatus === "APPROVED"
                ? "שאושרו"
                : filterStatus === "REJECTED"
                ? "שנדחו"
                : ""}
            </div>
          ) : (
            <div className="space-y-4">
              {redemptions.map((redemption) => (
                <div
                  key={redemption.id}
                  className="p-4 bg-background rounded-lg border border-card-border"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User size={24} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">
                          {redemption.points} נקודות
                        </p>
                        <p className="font-medium">
                          {redemption.user.name || "משתמש"}
                        </p>
                        <p className="text-sm text-muted">
                          {redemption.user.email}
                        </p>
                        <p className="text-sm text-muted">
                          פלוגה: {redemption.user.platoon || "לא צוין"} • יתרה
                          נוכחית: {redemption.user.points} נקודות
                        </p>
                        <p className="text-xs text-muted mt-1">
                          {format(
                            new Date(redemption.createdAt),
                            "dd/MM/yyyy HH:mm",
                            { locale: he }
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(redemption.status)}
                        <span
                          className={`text-sm font-medium ${
                            redemption.status === "PENDING"
                              ? "text-warning"
                              : redemption.status === "APPROVED"
                              ? "text-success"
                              : "text-error"
                          }`}
                        >
                          {getStatusLabel(redemption.status)}
                        </span>
                      </div>

                      {redemption.status === "PENDING" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleProcess(redemption.id, "APPROVED")
                            }
                            disabled={processingId === redemption.id}
                            className="bg-success hover:bg-success/80"
                          >
                            <Check size={16} className="ml-1" />
                            אשר
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (showNoteFor === redemption.id) {
                                handleProcess(redemption.id, "REJECTED");
                              } else {
                                setShowNoteFor(redemption.id);
                              }
                            }}
                            disabled={processingId === redemption.id}
                            className="border-error text-error hover:bg-error hover:text-white"
                          >
                            <X size={16} className="ml-1" />
                            דחה
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Note Input */}
                  {showNoteFor === redemption.id && (
                    <div className="mt-4 pt-4 border-t border-card-border">
                      <input
                        type="text"
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        placeholder="סיבת הדחייה (אופציונלי)"
                        className="w-full px-4 py-2 rounded-lg border border-card-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() =>
                            handleProcess(redemption.id, "REJECTED")
                          }
                        >
                          אשר דחייה
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setShowNoteFor(null);
                            setAdminNote("");
                          }}
                        >
                          ביטול
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Admin Note */}
                  {redemption.adminNote && (
                    <div className="mt-4 pt-4 border-t border-card-border">
                      <p className="text-sm text-muted">
                        <span className="font-medium">הערה:</span>{" "}
                        {redemption.adminNote}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
