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
} from "lucide-react";

interface AppSettings {
  pointsPerMinute: number;
  minLearningMinutes: number;
  streakBonusPoints: number;
  completionBonusPoints: number;
  appName: string;
  appSlogan: string;
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

  const isAdmin = session?.user?.role === "ADMIN";

  useEffect(() => {
    if (status === "loading") return;
    if (!isAdmin) {
      router.push("/dashboard");
    }
  }, [status, isAdmin, router]);

  const handleSave = async () => {
    setSaving(true);
    // TODO: Save to database
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setSettings({
      pointsPerMinute: 0.2,
      minLearningMinutes: 5,
      streakBonusPoints: 5,
      completionBonusPoints: 10,
      appName: "חשמונאי יומי",
      appSlogan: "לעלות ולהתעלות",
    });
  };

  if (status === "loading" || !isAdmin) {
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
    </div>
  );
}
