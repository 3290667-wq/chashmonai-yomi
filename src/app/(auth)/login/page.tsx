"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, Users, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    platoon: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isRegister) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "שגיאה בהרשמה");
          setLoading(false);
          return;
        }

        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          setError("שגיאה בהתחברות לאחר הרשמה");
          setLoading(false);
          return;
        }

        router.push("/dashboard");
      } else {
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          setError("אימייל או סיסמה שגויים");
          setLoading(false);
          return;
        }

        router.push("/dashboard");
      }
    } catch {
      setError("שגיאה בהתחברות");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-logo flex flex-col relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <Image
          src="/splash-bg.png"
          alt=""
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Decorative top bar */}
      <div className="h-1 bg-gradient-to-r from-transparent via-gold to-transparent relative z-10" />

      {/* Header */}
      <header className="safe-area-top p-5 relative z-10">
        <Link href="/" className="flex items-center gap-3 w-fit">
          <Image
            src="/רוח חשמונאית.png"
            alt="רוח חשמונאית"
            width={48}
            height={48}
            className="drop-shadow-md"
          />
          <div>
            <span className="font-bold text-brown-deep text-lg">חשמונאי יומי</span>
            <p className="text-xs text-brown-warm">רוח חשמונאית</p>
          </div>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-5 relative z-10">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Logo Section */}
          <div className="text-center mb-10">
            <div className="relative w-32 h-32 mx-auto mb-5">
              <Image
                src="/shield-emblem.png"
                alt="רוח חשמונאית"
                fill
                className="object-contain drop-shadow-xl"
                priority
              />
            </div>
            <h1 className="text-3xl font-bold text-brown-deep mb-2">
              {isRegister ? "הצטרף למשפחה" : "ברוכים הבאים"}
            </h1>
            <p className="text-brown-warm text-lg">
              {isRegister ? "הרשמה לרוח חשמונאית" : "התחבר כדי להמשיך ללמוד"}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-xl p-7 sm:p-9 border border-sand relative overflow-hidden">
            {/* Corner Ornaments */}
            <div className="absolute top-0 right-0 w-20 h-20 opacity-20 pointer-events-none">
              <Image src="/corner-ornament.png" alt="" fill className="object-contain" />
            </div>
            <div className="absolute bottom-0 left-0 w-20 h-20 opacity-20 rotate-180 pointer-events-none">
              <Image src="/corner-ornament.png" alt="" fill className="object-contain" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              {isRegister && (
                <>
                  <div className="relative">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="שם מלא"
                      className="input-premium"
                    />
                  </div>
                  <div className="relative">
                    <Users className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold" />
                    <input
                      type="text"
                      value={formData.platoon}
                      onChange={(e) => setFormData({ ...formData, platoon: e.target.value })}
                      placeholder="פלוגה"
                      className="input-premium"
                    />
                  </div>
                </>
              )}

              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="אימייל"
                  required
                  className="input-premium"
                />
              </div>

              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="סיסמה"
                  required
                  className="input-premium !pl-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-brown-soft hover:text-gold transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {error && (
                <div className="bg-error/10 text-error text-sm p-4 rounded-xl text-center border border-error/20">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-premium btn-gold text-lg py-4 mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    מתחבר...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    {isRegister ? "הצטרף עכשיו" : "כניסה"}
                  </span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="gold-divider relative z-10" />

            {/* Toggle Register/Login */}
            <div className="text-center relative z-10">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError("");
                }}
                className="text-gold hover:text-gold-dark transition-colors font-semibold"
              >
                {isRegister ? "כבר יש לך חשבון? התחבר" : "אין לך חשבון? הצטרף למשפחה"}
              </button>
            </div>
          </div>

          {/* Footer Quote */}
          <div className="text-center mt-8">
            <p className="text-brown-soft font-medium">
              &ldquo;למען שמו באהבה - לעלות ולהתעלות&rdquo;
            </p>
            <p className="text-gold-dark text-sm mt-1 font-semibold">רוח חשמונאית</p>
          </div>
        </div>
      </main>

      {/* Decorative bottom bar */}
      <div className="h-1 bg-gradient-to-r from-transparent via-gold to-transparent relative z-10" />
    </div>
  );
}
