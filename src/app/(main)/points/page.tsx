"use client";

import { useState, useEffect } from "react";
import {
  Award,
  TrendingUp,
  Clock,
  Calendar,
  Gift,
  History,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Flame,
  BookOpen,
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">
            <Clock className="w-3 h-3" />
            ממתין
          </span>
        );
      case "APPROVED":
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs">
            <CheckCircle2 className="w-3 h-3" />
            אושר
          </span>
        );
      case "REJECTED":
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
            <XCircle className="w-3 h-3" />
            נדחה
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-sky-light border-t-sky-dark rounded-full animate-spin" />
        <p className="text-brown-light">טוען נתונים...</p>
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-6 space-y-5">
      {/* Header with Points */}
      <div className="bg-gradient-to-l from-brown-dark to-brown-medium rounded-2xl p-5 sm:p-6 text-cream">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-6 h-6" />
          <h1 className="text-2xl font-bold">הנקודות שלי</h1>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <Award className="w-8 h-8 mx-auto mb-2 text-amber-300" />
            <p className="text-2xl sm:text-3xl font-bold">{pointsData?.currentPoints || 0}</p>
            <p className="text-xs text-cream/70">סה״כ נקודות</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <Gift className="w-8 h-8 mx-auto mb-2 text-emerald-300" />
            <p className="text-2xl sm:text-3xl font-bold">{pointsData?.availablePoints || 0}</p>
            <p className="text-xs text-cream/70">זמין לסליקה</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <Flame className="w-8 h-8 mx-auto mb-2 text-orange-300" />
            <p className="text-2xl sm:text-3xl font-bold">{pointsData?.streak || 0}</p>
            <p className="text-xs text-cream/70">ימים רצופים</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-sky-300" />
            <p className="text-2xl sm:text-3xl font-bold">{pointsData?.stats.total.minutes || 0}</p>
            <p className="text-xs text-cream/70">דקות לימוד</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
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
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-brown-medium text-cream shadow-md"
                  : "bg-white border border-cream-dark/50 text-brown-dark hover:bg-cream/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {/* Today & Week Stats */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-cream-dark/50 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-sky-dark" />
                <h2 className="font-bold text-brown-dark">היום</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-cream/50 rounded-xl">
                  <p className="text-2xl font-bold text-brown-dark">
                    {pointsData?.stats.today.minutes || 0}
                  </p>
                  <p className="text-xs text-brown-light">דקות</p>
                </div>
                <div className="text-center p-3 bg-sky-light/50 rounded-xl">
                  <p className="text-2xl font-bold text-sky-dark">
                    +{pointsData?.stats.today.points || 0}
                  </p>
                  <p className="text-xs text-brown-light">נקודות</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-cream-dark/50 p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h2 className="font-bold text-brown-dark">השבוע</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-cream/50 rounded-xl">
                  <p className="text-2xl font-bold text-brown-dark">
                    {pointsData?.stats.week.minutes || 0}
                  </p>
                  <p className="text-xs text-brown-light">דקות</p>
                </div>
                <div className="text-center p-3 bg-emerald-50 rounded-xl">
                  <p className="text-2xl font-bold text-emerald-600">
                    +{pointsData?.stats.week.points || 0}
                  </p>
                  <p className="text-xs text-brown-light">נקודות</p>
                </div>
              </div>
            </div>
          </div>

          {/* How Points Work */}
          <div className="bg-white rounded-2xl border border-cream-dark/50 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-cream-dark/30">
              <h2 className="font-bold text-brown-dark text-lg">איך צוברים נקודות?</h2>
            </div>
            <div className="p-4 sm:p-5 grid sm:grid-cols-3 gap-3">
              <div className="flex items-start gap-3 p-4 bg-cream/50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-sky-medium to-sky-dark rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-brown-dark">לימוד פעיל</p>
                  <p className="text-sm text-brown-light">1 נקודה לכל 5 דקות</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-cream/50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-brown-dark">רצף יומי</p>
                  <p className="text-sm text-brown-light">בונוס על לימוד כל יום</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-cream/50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-brown-dark">השלמת פרק</p>
                  <p className="text-sm text-brown-light">בונוס על סיום לימוד</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Redeem Tab */}
      {activeTab === "redeem" && (
        <div className="space-y-4">
          {/* Redeem Form */}
          <div className="bg-white rounded-2xl border border-cream-dark/50 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-cream-dark/30">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-emerald-600" />
                <h2 className="font-bold text-brown-dark text-lg">בקשת סליקה בשק״ם</h2>
              </div>
              <p className="text-sm text-brown-light mt-1">הזן את כמות הנקודות שברצונך לממש</p>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2 p-3 bg-sky-light/50 rounded-xl">
                <AlertCircle className="w-5 h-5 text-sky-dark flex-shrink-0" />
                <p className="text-sm text-brown-dark">
                  יש לך <span className="font-bold">{pointsData?.availablePoints || 0}</span> נקודות זמינות
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
                  className="flex-1 px-4 py-3 bg-cream/50 border border-cream-dark rounded-xl text-brown-dark placeholder-brown-light/60 focus:outline-none focus:ring-2 focus:ring-sky-medium"
                />
                <button
                  onClick={handleRedeem}
                  disabled={
                    submitting ||
                    !redeemAmount ||
                    parseInt(redeemAmount) < 1 ||
                    parseInt(redeemAmount) > (pointsData?.availablePoints || 0)
                  }
                  className="px-6 py-3 bg-brown-medium text-cream rounded-xl font-bold hover:bg-brown-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "שלח"
                  )}
                </button>
              </div>

              {/* Quick amounts */}
              <div className="flex gap-2 flex-wrap">
                {[10, 25, 50, 100].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setRedeemAmount(amount.toString())}
                    disabled={amount > (pointsData?.availablePoints || 0)}
                    className="px-4 py-2 rounded-xl text-sm font-medium border border-cream-dark text-brown-dark hover:bg-cream disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {amount}
                  </button>
                ))}
                <button
                  onClick={() => setRedeemAmount((pointsData?.availablePoints || 0).toString())}
                  disabled={!pointsData?.availablePoints}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-amber-100 text-amber-700 hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  הכל
                </button>
              </div>
            </div>
          </div>

          {/* Redemption History */}
          <div className="bg-white rounded-2xl border border-cream-dark/50 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-cream-dark/30">
              <h2 className="font-bold text-brown-dark">בקשות סליקה</h2>
            </div>

            {redemptions.length === 0 ? (
              <div className="py-12 text-center">
                <Gift className="w-16 h-16 text-cream-dark mx-auto mb-3" />
                <p className="text-brown-light">אין בקשות סליקה</p>
              </div>
            ) : (
              <div className="divide-y divide-cream-dark/30">
                {redemptions.map((redemption) => (
                  <div key={redemption.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cream rounded-lg flex items-center justify-center">
                        <Gift className="w-5 h-5 text-brown-medium" />
                      </div>
                      <div>
                        <p className="font-bold text-brown-dark">{redemption.points} נקודות</p>
                        <p className="text-xs text-brown-light">
                          {format(new Date(redemption.createdAt), "dd/MM/yyyy HH:mm", { locale: he })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(redemption.status)}
                      {redemption.status === "PENDING" && (
                        <button
                          onClick={() => handleCancelRedemption(redemption.id)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          בטל
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="bg-white rounded-2xl border border-cream-dark/50 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-cream-dark/30">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-brown-medium" />
              <h2 className="font-bold text-brown-dark text-lg">היסטוריית צבירה</h2>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="py-12 text-center">
              <History className="w-16 h-16 text-cream-dark mx-auto mb-3" />
              <p className="text-brown-light">אין היסטוריית לימוד עדיין</p>
            </div>
          ) : (
            <div className="divide-y divide-cream-dark/30">
              {history.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sky-light rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-sky-dark" />
                    </div>
                    <div>
                      <p className="font-medium text-brown-dark">
                        {getContentTypeLabel(item.contentType)}
                        {item.contentRef && (
                          <span className="text-brown-light font-normal mr-1">
                            - {item.contentRef}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-brown-light">
                        {item.durationMinutes} דקות • {format(new Date(item.startTime), "dd/MM/yyyy HH:mm", { locale: he })}
                      </p>
                    </div>
                  </div>

                  <span className="text-lg font-bold text-emerald-600">
                    +{item.pointsEarned}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
