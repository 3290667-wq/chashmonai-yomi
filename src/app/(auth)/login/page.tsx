"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, Users } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-logo flex flex-col">
      {/* Header */}
      <header className="safe-area-top p-4">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <Image
            src="/רוח חשמונאית.png"
            alt="רוח חשמונאית"
            width={40}
            height={40}
          />
          <span className="font-bold text-brown-dark">חשמונאי יומי</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <Image
                src="/רוח חשמונאית.png"
                alt="רוח חשמונאית"
                fill
                className="object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-brown-dark">
              {isRegister ? "הרשמה למערכת" : "ברוכים הבאים"}
            </h1>
            <p className="text-brown-medium mt-1">
              {isRegister ? "צור חשבון חדש" : "התחבר כדי להמשיך ללמוד"}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-cream-dark/30">
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <>
                  <div className="relative">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brown-light" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="שם מלא"
                      className="w-full pr-12 pl-4 py-3.5 bg-cream/50 border border-cream-dark rounded-xl text-brown-dark placeholder-brown-light/60 focus:outline-none focus:ring-2 focus:ring-sky-medium focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Users className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brown-light" />
                    <input
                      type="text"
                      value={formData.platoon}
                      onChange={(e) => setFormData({ ...formData, platoon: e.target.value })}
                      placeholder="פלוגה"
                      className="w-full pr-12 pl-4 py-3.5 bg-cream/50 border border-cream-dark rounded-xl text-brown-dark placeholder-brown-light/60 focus:outline-none focus:ring-2 focus:ring-sky-medium focus:border-transparent transition-all"
                    />
                  </div>
                </>
              )}

              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brown-light" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="אימייל"
                  required
                  className="w-full pr-12 pl-4 py-3.5 bg-cream/50 border border-cream-dark rounded-xl text-brown-dark placeholder-brown-light/60 focus:outline-none focus:ring-2 focus:ring-sky-medium focus:border-transparent transition-all"
                />
              </div>

              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brown-light" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="סיסמה"
                  required
                  className="w-full pr-12 pl-12 py-3.5 bg-cream/50 border border-cream-dark rounded-xl text-brown-dark placeholder-brown-light/60 focus:outline-none focus:ring-2 focus:ring-sky-medium focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-brown-light hover:text-brown-medium transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {error && (
                <div className="bg-error/10 text-error text-sm p-3 rounded-xl text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-brown-medium text-cream rounded-xl font-bold text-lg hover:bg-brown-dark transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    מתחבר...
                  </span>
                ) : isRegister ? "הרשמה" : "כניסה"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError("");
                }}
                className="text-sky-dark hover:text-brown-dark transition-colors font-medium"
              >
                {isRegister ? "כבר יש לך חשבון? התחבר" : "אין לך חשבון? הירשם"}
              </button>
            </div>
          </div>

          {/* Footer text */}
          <p className="text-center text-brown-light text-sm mt-6">
            למען שמו באהבה - לעלות ולהתעלות
          </p>
        </div>
      </main>
    </div>
  );
}
