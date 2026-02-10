"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Settings,
  ChevronRight,
  Shield,
  Database,
  Palette,
  Save,
  RotateCcw,
  Gift,
  Plus,
  Trash2,
  Edit2,
  X,
  Loader2,
  Trophy,
} from "lucide-react";

interface AppSettings {
  pointsPerMinute: number;
  minLearningMinutes: number;
  streakBonusPoints: number;
  completionBonusPoints: number;
  appName: string;
  appSlogan: string;
}

interface Prize {
  id: string;
  name: string;
  description: string | null;
  pointsCost: number;
  imageUrl: string | null;
  isActive: boolean;
  order: number;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<AppSettings>({
    pointsPerMinute: 0.2,
    minLearningMinutes: 5,
    streakBonusPoints: 5,
    completionBonusPoints: 10,
    appName: "חשמונאי יומי",
    appSlogan: "לעלות ולהתעלות",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Prizes
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loadingPrizes, setLoadingPrizes] = useState(true);
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
  const [prizeForm, setPrizeForm] = useState({
    name: "",
    description: "",
    pointsCost: "",
    imageUrl: "",
  });
  const [savingPrize, setSavingPrize] = useState(false);

  const isAdmin = session?.user?.role === "ADMIN";
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!isAdmin) {
      router.push("/dashboard");
    } else {
      fetchSettings();
      fetchPrizes();
    }
  }, [status, isAdmin, router]);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.settings) {
        setSettings({
          pointsPerMinute: data.settings.pointsPerMinute,
          minLearningMinutes: data.settings.minLearningMinutes,
          streakBonusPoints: data.settings.streakBonusPoints,
          completionBonusPoints: data.settings.completionBonusPoints,
          appName: data.settings.appName,
          appSlogan: data.settings.appSlogan,
        });
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoadingSettings(false);
    }
  };

  const fetchPrizes = async () => {
    try {
      const res = await fetch("/api/admin/prizes");
      const data = await res.json();
      if (data.prizes) {
        setPrizes(data.prizes);
      }
    } catch (error) {
      console.error("Failed to fetch prizes:", error);
    } finally {
      setLoadingPrizes(false);
    }
  };

  const handleOpenPrizeModal = (prize?: Prize) => {
    if (prize) {
      setEditingPrize(prize);
      setPrizeForm({
        name: prize.name,
        description: prize.description || "",
        pointsCost: prize.pointsCost.toString(),
        imageUrl: prize.imageUrl || "",
      });
    } else {
      setEditingPrize(null);
      setPrizeForm({ name: "", description: "", pointsCost: "", imageUrl: "" });
    }
    setShowPrizeModal(true);
  };

  const handleClosePrizeModal = () => {
    setShowPrizeModal(false);
    setEditingPrize(null);
    setPrizeForm({ name: "", description: "", pointsCost: "", imageUrl: "" });
  };

  const handleSavePrize = async () => {
    if (!prizeForm.name || !prizeForm.pointsCost) return;

    setSavingPrize(true);
    try {
      const method = editingPrize ? "PATCH" : "POST";
      const body = {
        ...(editingPrize && { id: editingPrize.id }),
        name: prizeForm.name,
        description: prizeForm.description || null,
        pointsCost: parseInt(prizeForm.pointsCost),
        imageUrl: prizeForm.imageUrl || null,
      };

      const res = await fetch("/api/admin/prizes", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        handleClosePrizeModal();
        fetchPrizes();
      } else {
        const data = await res.json();
        alert(data.error || "שגיאה בשמירת הפרס");
      }
    } catch (error) {
      console.error("Failed to save prize:", error);
      alert("שגיאה בשמירת הפרס");
    } finally {
      setSavingPrize(false);
    }
  };

  const handleDeletePrize = async (prizeId: string) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק את הפרס?")) return;

    try {
      const res = await fetch(`/api/admin/prizes?id=${prizeId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchPrizes();
      } else {
        const data = await res.json();
        alert(data.error || "שגיאה במחיקת הפרס");
      }
    } catch (error) {
      console.error("Failed to delete prize:", error);
      alert("שגיאה במחיקת הפרס");
    }
  };

  const handleTogglePrize = async (prize: Prize) => {
    try {
      const res = await fetch("/api/admin/prizes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: prize.id, isActive: !prize.isActive }),
      });

      if (res.ok) {
        fetchPrizes();
      }
    } catch (error) {
      console.error("Failed to toggle prize:", error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const data = await res.json();
        alert(data.error || "שגיאה בשמירת ההגדרות");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("שגיאה בשמירת ההגדרות");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const defaultSettings = {
      pointsPerMinute: 0.2,
      minLearningMinutes: 5,
      streakBonusPoints: 5,
      completionBonusPoints: 10,
      appName: "חשמונאי יומי",
      appSlogan: "לעלות ולהתעלות",
    };
    setSettings(defaultSettings);
    // Also save to database
    setSaving(true);
    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(defaultSettings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to reset settings:", error);
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || !isAdmin || loadingSettings) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
        <p className="text-white/50">טוען...</p>
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-lg">
          <ChevronRight className="w-5 h-5 text-white/60" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">הגדרות מערכת</h1>
          <p className="text-sm text-white/60">ניהול הגדרות האפליקציה</p>
        </div>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl p-4 text-center">
          ההגדרות נשמרו בהצלחה!
        </div>
      )}

      {/* Points Settings */}
      <div className="bg-[#3b2d1f] rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-500" />
          <h2 className="font-bold text-white">הגדרות נקודות</h2>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              נקודות לדקת לימוד
            </label>
            <input
              type="number"
              step="0.1"
              value={settings.pointsPerMinute}
              onChange={(e) =>
                setSettings({ ...settings, pointsPerMinute: parseFloat(e.target.value) })
              }
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
            <p className="text-xs text-white/50 mt-1">כמה נקודות לכל דקת לימוד פעילה</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              מינימום דקות לצבירה
            </label>
            <input
              type="number"
              value={settings.minLearningMinutes}
              onChange={(e) =>
                setSettings({ ...settings, minLearningMinutes: parseInt(e.target.value) })
              }
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
            <p className="text-xs text-white/50 mt-1">מספר דקות מינימלי לקבלת נקודות</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              בונוס רצף יומי
            </label>
            <input
              type="number"
              value={settings.streakBonusPoints}
              onChange={(e) =>
                setSettings({ ...settings, streakBonusPoints: parseInt(e.target.value) })
              }
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
            <p className="text-xs text-white/50 mt-1">נקודות בונוס על שמירת רצף יומי</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              בונוס השלמת לימוד
            </label>
            <input
              type="number"
              value={settings.completionBonusPoints}
              onChange={(e) =>
                setSettings({ ...settings, completionBonusPoints: parseInt(e.target.value) })
              }
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
            <p className="text-xs text-white/50 mt-1">נקודות בונוס על סיום לימוד יומי</p>
          </div>
        </div>
      </div>

      {/* App Settings */}
      <div className="bg-[#3b2d1f] rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center gap-2">
          <Palette className="w-5 h-5 text-violet-400" />
          <h2 className="font-bold text-white">הגדרות אפליקציה</h2>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              שם האפליקציה
            </label>
            <input
              type="text"
              value={settings.appName}
              onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              סלוגן
            </label>
            <input
              type="text"
              value={settings.appSlogan}
              onChange={(e) => setSettings({ ...settings, appSlogan: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>
        </div>
      </div>

      {/* Prize Management */}
      <div className="bg-[#3b2d1f] rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-gold" />
            <h2 className="font-bold text-white">ניהול פרסים</h2>
          </div>
          <button
            onClick={() => handleOpenPrizeModal()}
            className="flex items-center gap-2 px-3 py-2 bg-gold text-[#1a140f] rounded-lg text-sm font-medium hover:bg-gold-light transition-colors"
          >
            <Plus className="w-4 h-4" />
            הוסף פרס
          </button>
        </div>

        <div className="p-4 sm:p-5">
          {loadingPrizes ? (
            <div className="py-8 text-center">
              <Loader2 className="w-8 h-8 mx-auto text-gold animate-spin" />
            </div>
          ) : prizes.length === 0 ? (
            <div className="py-8 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-white/20" />
              <p className="text-white/50">לא הוגדרו פרסים עדיין</p>
              <p className="text-sm text-white/30 mt-1">הוסף פרסים כדי לעודד את החיילים</p>
            </div>
          ) : (
            <div className="space-y-3">
              {prizes.map((prize) => (
                <div
                  key={prize.id}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                    prize.isActive
                      ? "bg-white/5 border-white/10"
                      : "bg-white/[0.02] border-white/5 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {prize.imageUrl ? (
                      <img
                        src={prize.imageUrl}
                        alt={prize.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center">
                        <Gift className="w-6 h-6 text-gold" />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-white">{prize.name}</p>
                      <p className="text-sm text-gold">
                        {prize.pointsCost} נקודות
                      </p>
                      {prize.description && (
                        <p className="text-xs text-white/50 mt-0.5">
                          {prize.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePrize(prize)}
                      className={`p-2 rounded-lg transition-colors ${
                        prize.isActive
                          ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                          : "bg-white/5 text-white/40 hover:bg-white/10"
                      }`}
                      title={prize.isActive ? "פעיל" : "לא פעיל"}
                    >
                      {prize.isActive ? "פעיל" : "מושבת"}
                    </button>
                    <button
                      onClick={() => handleOpenPrizeModal(prize)}
                      className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePrize(prize.id)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* System Info */}
      <div className="bg-[#3b2d1f] rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center gap-2">
          <Database className="w-5 h-5 text-sky-400" />
          <h2 className="font-bold text-white">מידע מערכת</h2>
        </div>

        <div className="p-4 sm:p-5 space-y-3">
          <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
            <span className="text-white/70">גרסה</span>
            <span className="font-mono text-white">1.0.0</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
            <span className="text-white/70">סביבה</span>
            <span className="font-mono text-white">Production</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
            <span className="text-white/70">בסיס נתונים</span>
            <span className="font-mono text-white text-xs">Neon PostgreSQL</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleReset}
          className="flex-1 flex items-center justify-center gap-2 py-3 border border-white/20 text-white rounded-xl font-medium hover:bg-white/5 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          איפוס לברירת מחדל
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-gold text-[#1a140f] rounded-xl font-medium hover:bg-gold-light transition-colors disabled:opacity-50"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-[#1a140f] border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {saving ? "שומר..." : "שמור הגדרות"}
        </button>
      </div>

      {/* Prize Modal */}
      {showPrizeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-md bg-[#2a1f15] border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-bold text-white text-lg">
                {editingPrize ? "עריכת פרס" : "הוספת פרס חדש"}
              </h3>
              <button
                onClick={handleClosePrizeModal}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  שם הפרס *
                </label>
                <input
                  type="text"
                  value={prizeForm.name}
                  onChange={(e) => setPrizeForm({ ...prizeForm, name: e.target.value })}
                  placeholder="לדוגמה: שוקולד"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  עלות בנקודות *
                </label>
                <input
                  type="number"
                  value={prizeForm.pointsCost}
                  onChange={(e) => setPrizeForm({ ...prizeForm, pointsCost: e.target.value })}
                  placeholder="50"
                  min="1"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  תיאור (אופציונלי)
                </label>
                <textarea
                  value={prizeForm.description}
                  onChange={(e) => setPrizeForm({ ...prizeForm, description: e.target.value })}
                  placeholder="תיאור קצר של הפרס..."
                  rows={2}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  קישור לתמונה (אופציונלי)
                </label>
                <input
                  type="url"
                  value={prizeForm.imageUrl}
                  onChange={(e) => setPrizeForm({ ...prizeForm, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-gold/50"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="p-4 sm:p-5 border-t border-white/10 flex gap-3">
              <button
                onClick={handleClosePrizeModal}
                className="flex-1 py-3 border border-white/20 text-white rounded-xl font-medium hover:bg-white/5 transition-colors"
              >
                ביטול
              </button>
              <button
                onClick={handleSavePrize}
                disabled={savingPrize || !prizeForm.name || !prizeForm.pointsCost}
                className="flex-1 py-3 bg-gold text-[#1a140f] rounded-xl font-medium hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {savingPrize ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {savingPrize ? "שומר..." : "שמור"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
