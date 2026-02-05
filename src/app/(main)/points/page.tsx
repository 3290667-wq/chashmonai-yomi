"use client";

import { useState, useEffect } from "react";
import Card, { CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import Button from "@/components/ui/button";
import {
  Award,
  TrendingUp,
  Clock,
  Calendar,
  Gift,
  History,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

interface PointsData {
  currentPoints: number;
  streak: number;
  pendingPoints: number;
  availablePoints: number;
  stats: {
    today: { minutes: number; points: number };
    week: { minutes: number; points: number };
    total: { minutes: number; points: number; sessions: number };
  };
}

interface Redemption {
  id: string;
  points: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
}

interface HistoryItem {
  id: string;
  contentType: string;
  contentRef: string | null;
  durationMinutes: number;
  pointsEarned: number;
  startTime: string;
}

export default function PointsPage() {
  const [pointsData, setPointsData] = useState<PointsData | null>(null);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "redeem" | "history">("overview");
  const [redeemAmount, setRedeemAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pointsRes, redemptionsRes, historyRes] = await Promise.all([
        fetch("/api/points"),
        fetch("/api/points/redeem"),
        fetch("/api/points/history"),
      ]);

      const [pointsJson, redemptionsJson, historyJson] = await Promise.all([
        pointsRes.json(),
        redemptionsRes.json(),
        historyRes.json(),
      ]);

      if (pointsJson.currentPoints !== undefined) {
        setPointsData(pointsJson);
      }
      if (redemptionsJson.redemptions) {
        setRedemptions(redemptionsJson.redemptions);
      }
      if (historyJson.sessions) {
        setHistory(historyJson.sessions);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    const points = parseInt(redeemAmount);
    if (!points || points < 1) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/points/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points }),
      });

      const data = await res.json();

      if (data.success) {
        setRedeemAmount("");
        fetchData();
      } else {
        alert(data.error || "שגיאה בבקשת הסליקה");
      }
    } catch (error) {
      console.error("Failed to redeem:", error);
      alert("שגיאה בבקשת הסליקה");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRedemption = async (id: string) => {
    if (!confirm("האם אתה בטוח שברצונך לבטל את הבקשה?")) return;

    try {
      const res = await fetch(`/api/points/redeem?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Failed to cancel:", error);
    }
  };

  const getContentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ARTICLE: "מאמר",
      VIDEO: "סרטון",
      MISHNAH: "משנה",
      RAMBAM: "רמב״ם",
      CHASSIDUT: "חסידות",
      MUSAR: "מוסר",
      DAILY: "לימוד יומי",
    };
    return labels[type] || type;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock size={16} className="text-warning" />;
      case "APPROVED":
        return <CheckCircle size={16} className="text-success" />;
      case "REJECTED":
        return <XCircle size={16} className="text-error" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "ממתין לאישור";
      case "APPROVED":
        return "אושר";
      case "REJECTED":
        return "נדחה";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="py-6 flex justify-center">
        <div className="animate-pulse text-muted">טוען נתונים...</div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6">
      {/* Header with Points */}
      <div className="bg-gradient-to-l from-primary to-primary-light rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-4">הנקודות שלי</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <Award className="mx-auto mb-2 text-secondary" size={32} />
            <p className="text-3xl font-bold">{pointsData?.currentPoints || 0}</p>
            <p className="text-sm text-white/70">סה"כ נקודות</p>
          </div>

          <div className="bg-white/10 rounded-xl p-4 text-center">
            <Gift className="mx-auto mb-2" size={32} />
            <p className="text-3xl font-bold">{pointsData?.availablePoints || 0}</p>
            <p className="text-sm text-white/70">זמין לסליקה</p>
          </div>

          <div className="bg-white/10 rounded-xl p-4 text-center">
            <TrendingUp className="mx-auto mb-2" size={32} />
            <p className="text-3xl font-bold">{pointsData?.streak || 0}</p>
            <p className="text-sm text-white/70">ימים רצופים</p>
          </div>

          <div className="bg-white/10 rounded-xl p-4 text-center">
            <Clock className="mx-auto mb-2" size={32} />
            <p className="text-3xl font-bold">{pointsData?.stats.total.minutes || 0}</p>
            <p className="text-sm text-white/70">דקות לימוד</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {[
          { id: "overview", label: "סקירה", icon: TrendingUp },
          { id: "redeem", label: "סליקה", icon: Gift },
          { id: "history", label: "היסטוריה", icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-white"
                  : "bg-card border border-card-border text-foreground hover:border-primary"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Today's Progress */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar size={20} className="text-primary" />
                היום
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-background rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {pointsData?.stats.today.minutes || 0}
                  </p>
                  <p className="text-sm text-muted">דקות</p>
                </div>
                <div className="text-center p-4 bg-background rounded-lg">
                  <p className="text-2xl font-bold text-secondary">
                    +{pointsData?.stats.today.points || 0}
                  </p>
                  <p className="text-sm text-muted">נקודות</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* This Week */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp size={20} className="text-primary" />
                השבוע
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-background rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {pointsData?.stats.week.minutes || 0}
                  </p>
                  <p className="text-sm text-muted">דקות</p>
                </div>
                <div className="text-center p-4 bg-background rounded-lg">
                  <p className="text-2xl font-bold text-secondary">
                    +{pointsData?.stats.week.points || 0}
                  </p>
                  <p className="text-sm text-muted">נקודות</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How Points Work */}
          <Card variant="bordered" className="md:col-span-2">
            <CardHeader>
              <CardTitle>איך צוברים נקודות?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3 p-4 bg-background rounded-lg">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">לימוד פעיל</p>
                    <p className="text-sm text-muted">1 נקודה לכל 5 דקות לימוד</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-background rounded-lg">
                  <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp size={20} className="text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium">רצף יומי</p>
                    <p className="text-sm text-muted">בונוס על לימוד כל יום</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-background rounded-lg">
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={20} className="text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">השלמת פרק</p>
                    <p className="text-sm text-muted">בונוס על סיום לימוד שלם</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Redeem Tab */}
      {activeTab === "redeem" && (
        <div className="space-y-6">
          {/* Redeem Form */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift size={20} className="text-secondary" />
                בקשת סליקה בשק"ם
              </CardTitle>
              <CardDescription>
                הזן את כמות הנקודות שברצונך לממש
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm">
                  <AlertCircle size={18} className="text-blue-500 flex-shrink-0" />
                  <p className="text-blue-700 dark:text-blue-300">
                    יש לך {pointsData?.availablePoints || 0} נקודות זמינות לסליקה
                  </p>
                </div>

                <div className="flex gap-3">
                  <input
                    type="number"
                    value={redeemAmount}
                    onChange={(e) => setRedeemAmount(e.target.value)}
                    placeholder="כמות נקודות"
                    min="1"
                    max={pointsData?.availablePoints || 0}
                    className="flex-1 px-4 py-3 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <Button
                    onClick={handleRedeem}
                    disabled={
                      submitting ||
                      !redeemAmount ||
                      parseInt(redeemAmount) < 1 ||
                      parseInt(redeemAmount) > (pointsData?.availablePoints || 0)
                    }
                    size="lg"
                  >
                    {submitting ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      "שלח בקשה"
                    )}
                  </Button>
                </div>

                {/* Quick amounts */}
                <div className="flex gap-2 flex-wrap">
                  {[10, 25, 50, 100].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setRedeemAmount(amount.toString())}
                      disabled={amount > (pointsData?.availablePoints || 0)}
                      className="px-3 py-1 rounded-full text-sm border border-card-border hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {amount} נקודות
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      setRedeemAmount((pointsData?.availablePoints || 0).toString())
                    }
                    disabled={!pointsData?.availablePoints}
                    className="px-3 py-1 rounded-full text-sm border border-secondary text-secondary hover:bg-secondary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    הכל
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Redemption History */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>בקשות סליקה</CardTitle>
            </CardHeader>
            <CardContent>
              {redemptions.length === 0 ? (
                <p className="text-center text-muted py-8">
                  אין בקשות סליקה
                </p>
              ) : (
                <div className="divide-y divide-card-border">
                  {redemptions.map((redemption) => (
                    <div
                      key={redemption.id}
                      className="flex items-center justify-between py-4"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(redemption.status)}
                        <div>
                          <p className="font-medium">
                            {redemption.points} נקודות
                          </p>
                          <p className="text-sm text-muted">
                            {format(new Date(redemption.createdAt), "dd/MM/yyyy HH:mm", {
                              locale: he,
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-sm ${
                            redemption.status === "PENDING"
                              ? "text-warning"
                              : redemption.status === "APPROVED"
                              ? "text-success"
                              : "text-error"
                          }`}
                        >
                          {getStatusLabel(redemption.status)}
                        </span>

                        {redemption.status === "PENDING" && (
                          <button
                            onClick={() => handleCancelRedemption(redemption.id)}
                            className="text-sm text-error hover:underline"
                          >
                            בטל
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <Card variant="bordered">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History size={20} className="text-primary" />
              היסטוריית צבירה
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-center text-muted py-8">
                אין היסטוריית לימוד עדיין
              </p>
            ) : (
              <div className="divide-y divide-card-border">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-4"
                  >
                    <div>
                      <p className="font-medium">
                        {getContentTypeLabel(item.contentType)}
                        {item.contentRef && (
                          <span className="text-muted font-normal mr-2">
                            - {item.contentRef}
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-muted">
                        {item.durationMinutes} דקות •{" "}
                        {format(new Date(item.startTime), "dd/MM/yyyy HH:mm", {
                          locale: he,
                        })}
                      </p>
                    </div>

                    <span className="text-lg font-bold text-secondary">
                      +{item.pointsEarned}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
