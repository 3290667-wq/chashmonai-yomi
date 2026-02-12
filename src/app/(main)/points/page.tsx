"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
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
  Star,
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

interface Prize {
  id: string;
  name: string;
  description: string | null;
  pointsCost: number;
  imageUrl: string | null;
}

interface PrizeData {
  prizes: Prize[];
  currentPoints: number;
  nextPrize: Prize | null;
  pointsToNextPrize: number;
  progressToNextPrize: number;
  availablePrizes: Prize[];
}

export default function PointsPage() {
  const [pointsData, setPointsData] = useState<PointsData | null>(null);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [prizeData, setPrizeData] = useState<PrizeData | null>(null);
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
      const [pointsRes, redemptionsRes, historyRes, prizesRes] = await Promise.all([
        fetch("/api/points"),
        fetch("/api/points/redeem"),
        fetch("/api/points/history"),
        fetch("/api/prizes"),
      ]);

      const [pointsJson, redemptionsJson, historyJson, prizesJson] = await Promise.all([
        pointsRes.json(),
        redemptionsRes.json(),
        historyRes.json(),
        prizesRes.json(),
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
      if (prizesJson.prizes) {
        setPrizeData(prizesJson);
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
          <span className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs">
            <Clock className="w-3 h-3" />
            ממתין
          </span>
        );
      case "APPROVED":
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">
            <CheckCircle2 className="w-3 h-3" />
            אושר
          </span>
        );
      case "REJECTED":
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gold/20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
        <p className="text-slate-600 animate-pulse">טוען נתונים...</p>
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-6 space-y-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-2xl overflow-hidden liquid-glass"
      >
        <div className="absolute inset-0">
          <Image
            src="/bbba.png"
            alt=""
            fill
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-white via-white/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-gold to-gold-dark rounded-xl flex items-center justify-center shadow-lg">
              <Award className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">הנקודות שלי</h1>
              <p className="text-slate-700">צבירה ופדיון נקודות</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-sky-100 backdrop-blur-sm border border-sky-200 rounded-xl p-4 text-center">
              <Star className="w-8 h-8 mx-auto mb-2 text-gold" />
              <p className="text-2xl sm:text-3xl font-bold text-slate-800">{pointsData?.currentPoints || 0}</p>
              <p className="text-xs text-slate-700">סה״כ נקודות</p>
            </div>

            <div className="bg-sky-100 backdrop-blur-sm border border-sky-200 rounded-xl p-4 text-center">
              <Gift className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
              <p className="text-2xl sm:text-3xl font-bold text-slate-800">{pointsData?.availablePoints || 0}</p>
              <p className="text-xs text-slate-700">זמין לסליקה</p>
            </div>

            <div className="bg-sky-100 backdrop-blur-sm border border-sky-200 rounded-xl p-4 text-center">
              <Flame className="w-8 h-8 mx-auto mb-2 text-orange-400" />
              <p className="text-2xl sm:text-3xl font-bold text-slate-800">{pointsData?.streak || 0}</p>
              <p className="text-xs text-slate-700">ימים רצופים</p>
            </div>

            <div className="bg-sky-100 backdrop-blur-sm border border-sky-200 rounded-xl p-4 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-violet-400" />
              <p className="text-2xl sm:text-3xl font-bold text-slate-800">{pointsData?.stats.total.minutes || 0}</p>
              <p className="text-xs text-slate-700">דקות לימוד</p>
            </div>
          </div>

          {/* Prize Progress */}
          {prizeData && (prizeData.nextPrize || prizeData.availablePrizes.length > 0) && (
            <div className="mt-6 p-4 bg-gradient-to-l from-gold/20 to-gold/10 border border-gold/30 rounded-xl">
              {prizeData.availablePrizes.length > 0 ? (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Gift className="w-6 h-6 text-gold" />
                    <span className="text-lg font-bold text-slate-800">
                      יש לך {pointsData?.currentPoints || 0} נקודות
                    </span>
                  </div>
                  <p className="text-gold text-lg">
                    אתה יכול לממש אותן ל:
                    <span className="font-bold mr-1">
                      {prizeData.availablePrizes[prizeData.availablePrizes.length - 1].name}
                    </span>
                  </p>
                  <p className="text-slate-700 text-sm mt-1">
                    ועוד {prizeData.availablePrizes.length - 1} פרסים זמינים
                  </p>
                </div>
              ) : prizeData.nextPrize ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Gift className="w-5 h-5 text-gold" />
                      <span className="text-slate-700 font-medium">הפרס הבא:</span>
                      <span className="text-gold font-bold">{prizeData.nextPrize.name}</span>
                    </div>
                    <span className="text-slate-600 text-sm">
                      {prizeData.nextPrize.pointsCost} נקודות
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="relative h-3 bg-sky-100 rounded-full overflow-hidden mb-2">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold-dark to-gold rounded-full transition-all duration-500"
                      style={{ width: `${prizeData.progressToNextPrize}%` }}
                    />
                  </div>

                  <p className="text-center text-gold">
                    נשאר לך <span className="font-bold">{prizeData.pointsToNextPrize}</span> נקודות
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex gap-2 overflow-x-auto pb-1"
      >
        {[
          { id: "overview", label: "סקירה", icon: TrendingUp },
          { id: "redeem", label: "סליקה", icon: Gift },
          { id: "history", label: "היסטוריה", icon: History },
        ].map((tab, index) => {
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-gold text-slate-900 shadow-lg shadow-gold/20"
                  : "bg-white border border-sky-200 text-slate-800 hover:bg-sky-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Overview Tab */}
      <AnimatePresence mode="wait">
      {activeTab === "overview" && (
        <motion.div
          key="overview"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {/* Today & Week Stats */}
          <div className="grid sm:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white rounded-2xl border border-sky-200 p-5 card-interactive shine-effect"
            >
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-violet-400" />
                <h2 className="font-bold text-slate-800">היום</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-sky-50 rounded-xl">
                  <p className="text-2xl font-bold text-slate-800">
                    {pointsData?.stats.today.minutes || 0}
                  </p>
                  <p className="text-xs text-slate-700">דקות</p>
                </div>
                <div className="text-center p-3 bg-gold/10 rounded-xl">
                  <p className="text-2xl font-bold text-gold">
                    +{pointsData?.stats.today.points || 0}
                  </p>
                  <p className="text-xs text-slate-700">נקודות</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-white rounded-2xl border border-sky-200 p-5 card-interactive shine-effect"
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <h2 className="font-bold text-slate-800">השבוע</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-sky-50 rounded-xl">
                  <p className="text-2xl font-bold text-slate-800">
                    {pointsData?.stats.week.minutes || 0}
                  </p>
                  <p className="text-xs text-slate-700">דקות</p>
                </div>
                <div className="text-center p-3 bg-emerald-500/10 rounded-xl">
                  <p className="text-2xl font-bold text-emerald-400">
                    +{pointsData?.stats.week.points || 0}
                  </p>
                  <p className="text-xs text-slate-700">נקודות</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* How Points Work */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-white rounded-2xl border border-sky-200 overflow-hidden card-interactive"
          >
            <div className="p-4 sm:p-5 border-b border-sky-200">
              <h2 className="font-bold text-slate-800 text-lg">איך צוברים נקודות?</h2>
            </div>
            <div className="p-4 sm:p-5 grid sm:grid-cols-3 gap-3">
              <div className="flex items-start gap-3 p-4 bg-sky-50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-violet-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">לימוד פעיל</p>
                  <p className="text-sm text-slate-700">1 נקודה לכל 5 דקות</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-sky-50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">רצף יומי</p>
                  <p className="text-sm text-slate-700">בונוס על לימוד כל יום</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-sky-50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">השלמת פרק</p>
                  <p className="text-sm text-slate-700">בונוס על סיום לימוד</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Redeem Tab */}
      {activeTab === "redeem" && (
        <motion.div
          key="redeem"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {/* Redeem Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-2xl border border-sky-200 overflow-hidden card-interactive"
          >
            <div className="p-4 sm:p-5 border-b border-sky-200">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-emerald-400" />
                <h2 className="font-bold text-slate-800 text-lg">בקשת סליקה בשק״ם</h2>
              </div>
              <p className="text-sm text-slate-700 mt-1">הזן את כמות הנקודות שברצונך לממש</p>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2 p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                <AlertCircle className="w-5 h-5 text-violet-400 flex-shrink-0" />
                <p className="text-sm text-slate-700">
                  יש לך <span className="font-bold text-gold-dark">{pointsData?.availablePoints || 0}</span> נקודות זמינות
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
                  className="flex-1 px-4 py-3 bg-sky-50 border border-sky-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
                <button
                  onClick={handleRedeem}
                  disabled={
                    submitting ||
                    !redeemAmount ||
                    parseInt(redeemAmount) < 1 ||
                    parseInt(redeemAmount) > (pointsData?.availablePoints || 0)
                  }
                  className="px-6 py-3 bg-gold text-slate-900 rounded-xl font-bold hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="px-4 py-2 rounded-xl text-sm font-medium border border-sky-200 text-slate-800 hover:bg-sky-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {amount}
                  </button>
                ))}
                <button
                  onClick={() => setRedeemAmount((pointsData?.availablePoints || 0).toString())}
                  disabled={!pointsData?.availablePoints}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-gold/20 text-gold hover:bg-gold/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  הכל
                </button>
              </div>
            </div>
          </motion.div>

          {/* Redemption History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white rounded-2xl border border-sky-200 overflow-hidden card-interactive"
          >
            <div className="p-4 sm:p-5 border-b border-sky-200">
              <h2 className="font-bold text-slate-800">בקשות סליקה</h2>
            </div>

            {redemptions.length === 0 ? (
              <div className="py-12 text-center">
                <Gift className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-700">אין בקשות סליקה</p>
              </div>
            ) : (
              <div className="divide-y divide-sky-200">
                {redemptions.map((redemption) => (
                  <div key={redemption.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-sky-50 rounded-lg flex items-center justify-center">
                        <Gift className="w-5 h-5 text-gold" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{redemption.points} נקודות</p>
                        <p className="text-xs text-slate-700">
                          {format(new Date(redemption.createdAt), "dd/MM/yyyy HH:mm", { locale: he })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(redemption.status)}
                      {redemption.status === "PENDING" && (
                        <button
                          onClick={() => handleCancelRedemption(redemption.id)}
                          className="text-xs text-red-400 hover:underline"
                        >
                          בטל
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <motion.div
          key="history"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl border border-sky-200 overflow-hidden card-interactive"
        >
          <div className="p-4 sm:p-5 border-b border-sky-200">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-slate-600" />
              <h2 className="font-bold text-slate-800 text-lg">היסטוריית צבירה</h2>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="py-12 text-center">
              <History className="w-16 h-16 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-700">אין היסטוריית לימוד עדיין</p>
            </div>
          ) : (
            <div className="divide-y divide-sky-200">
              {history.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">
                        {getContentTypeLabel(item.contentType)}
                        {item.contentRef && (
                          <span className="text-slate-700 font-normal mr-1">
                            - {item.contentRef}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-700">
                        {item.durationMinutes} דקות • {format(new Date(item.startTime), "dd/MM/yyyy HH:mm", { locale: he })}
                      </p>
                    </div>
                  </div>

                  <span className="text-lg font-bold text-emerald-400">
                    +{item.pointsEarned}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
