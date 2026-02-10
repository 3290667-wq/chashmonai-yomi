"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Lock,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Shield,
} from "lucide-react";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("הסיסמאות אינן תואמות");
      return;
    }

    if (newPassword.length < 6) {
      setError("הסיסמה חייבת להכיל לפחות 6 תווים");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "שגיאה בשינוי סיסמה");
        return;
      }

      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("שגיאה בשינוי סיסמה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-4 sm:py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-white/60" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">הגדרות חשבון</h1>
          <p className="text-sm text-white/50">ניהול פרטי החשבון שלך</p>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="bg-[#1e1e1e] rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center gap-2">
          <div className="w-10 h-10 bg-gold/20 rounded-lg flex items-center justify-center">
            <Lock className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h2 className="font-bold text-white">שינוי סיסמה</h2>
            <p className="text-xs text-white/50">עדכן את הסיסמה שלך</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="p-4 sm:p-5 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <Check className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">הסיסמה שונתה בהצלחה!</span>
            </div>
          )}

          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              סיסמה נוכחית
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="הכנס סיסמה נוכחית"
                className="w-full px-4 py-3 pl-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              סיסמה חדשה
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="הכנס סיסמה חדשה (לפחות 6 תווים)"
                className="w-full px-4 py-3 pl-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              >
                {showNewPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              אימות סיסמה חדשה
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="הכנס שוב את הסיסמה החדשה"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50"
              required
            />
          </div>

          {/* Password Requirements */}
          <div className="p-3 bg-white/5 rounded-xl">
            <div className="flex items-center gap-2 text-white/50 text-sm">
              <Shield className="w-4 h-4" />
              <span>דרישות סיסמה:</span>
            </div>
            <ul className="mt-2 space-y-1 text-xs text-white/40 mr-6">
              <li className={newPassword.length >= 6 ? "text-emerald-400" : ""}>
                • לפחות 6 תווים
              </li>
              <li className={newPassword === confirmPassword && newPassword.length > 0 ? "text-emerald-400" : ""}>
                • הסיסמאות תואמות
              </li>
            </ul>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-gold to-gold-dark text-white rounded-xl font-medium hover:from-gold-dark hover:to-gold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-gold/20"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Lock className="w-5 h-5" />
            )}
            {loading ? "משנה סיסמה..." : "שנה סיסמה"}
          </button>
        </form>
      </div>

      {/* Security Tips */}
      <div className="bg-[#1e1e1e] rounded-2xl border border-white/10 p-4 sm:p-5">
        <h3 className="font-medium text-white mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-gold" />
          טיפים לאבטחה
        </h3>
        <ul className="space-y-2 text-sm text-white/50">
          <li>• השתמש בסיסמה ייחודית שאינה משמשת אותך באתרים אחרים</li>
          <li>• שלב אותיות גדולות וקטנות, מספרים וסימנים מיוחדים</li>
          <li>• אל תשתף את הסיסמה שלך עם אף אחד</li>
        </ul>
      </div>
    </div>
  );
}
