"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, Users, Sparkles, Shield, Star, ArrowLeft, ChevronDown } from "lucide-react";

interface Platoon {
  id: string;
  name: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [platoons, setPlatoons] = useState<Platoon[]>([]);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    platoon: "",
  });

  // Fetch available platoons
  useEffect(() => {
    const fetchPlatoons = async () => {
      try {
        const res = await fetch("/api/admin/platoons");
        if (res.ok) {
          const data = await res.json();
          setPlatoons(data.platoons || []);
        }
      } catch (error) {
        console.error("Failed to fetch platoons:", error);
      }
    };

    if (isRegister) {
      fetchPlatoons();
    }
  }, [isRegister]);

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
    <div className="min-h-screen flex relative overflow-hidden bg-[#1a140f]">
      {/* Background Image - Left Side */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="/bbba.png"
          alt=""
          fill
          className="object-cover"
          priority
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#1a140f]/50 to-[#1a140f]" />

        {/* Content Over Image */}
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-12 h-12">
                <Image
                  src="/רוח חשמונאית.png"
                  alt="רוח חשמונאית"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-white font-bold text-xl">חשמונאי יומי</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              לעלות ולהתעלות
              <br />
              <span className="text-gold">למען שמו באהבה</span>
            </h2>
            <p className="text-white/70 text-lg max-w-md">
              הצטרף לאלפי חיילים הלומדים כל יום משנה יומית ורמב״ם יומי
            </p>
          </div>
        </div>
      </div>

      {/* Form Side - Right */}
      <div className="w-full lg:w-1/2 flex flex-col min-h-screen">
        {/* Mobile Background */}
        <div className="lg:hidden absolute inset-0">
          <Image
            src="/bbba.png"
            alt=""
            fill
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a140f]/80 via-[#1a140f]/90 to-[#1a140f]" />
        </div>

        {/* Header */}
        <header className="safe-area-top p-6 relative z-10">
          <Link href="/" className="flex items-center gap-3 w-fit group">
            <div className="w-10 h-10 rounded-xl bg-[#3b2d1f] border border-white/10 flex items-center justify-center group-hover:border-gold/50 transition-colors">
              <ArrowLeft className="w-5 h-5 text-white/70 group-hover:text-gold transition-colors" />
            </div>
            <div className="lg:hidden flex items-center gap-2">
              <Image
                src="/רוח חשמונאית.png"
                alt="רוח חשמונאית"
                width={32}
                height={32}
                className="drop-shadow-lg"
              />
              <span className="font-bold text-white">חשמונאי יומי</span>
            </div>
          </Link>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-6 relative z-10">
          <div className="w-full max-w-md">
            {/* Title */}
            <div className="text-center mb-10 animate-fade-in-up">
              <div className="relative w-20 h-20 mx-auto mb-6 lg:hidden">
                <div className="absolute inset-0 bg-gold/20 rounded-full blur-xl" />
                <Image
                  src="/רוח חשמונאית.png"
                  alt="רוח חשמונאית"
                  fill
                  className="object-contain relative z-10"
                  priority
                />
              </div>
              <h1 className="text-3xl font-bold text-white mb-3">
                {isRegister ? "הצטרף למשפחה" : "ברוכים הבאים"}
              </h1>
              <p className="text-white/60">
                {isRegister ? "צור חשבון חדש כדי להתחיל" : "התחבר כדי להמשיך ללמוד"}
              </p>
            </div>

            {/* Form Card */}
            <div
              className="bg-[#3b2d1f] border border-white/10 rounded-2xl p-8 animate-fade-in-up"
              style={{ animationDelay: "100ms" }}
            >
              <form onSubmit={handleSubmit} className="space-y-5">
                {isRegister && (
                  <>
                    {/* Name Input */}
                    <div className="relative">
                      <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="שם מלא"
                        className="w-full bg-[#251c14] border border-white/10 rounded-xl pr-12 pl-4 py-4 text-white placeholder:text-white/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
                      />
                    </div>

                    {/* Platoon Select */}
                    <div className="relative">
                      <Users className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none z-10" />
                      <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
                      <select
                        value={formData.platoon}
                        onChange={(e) => setFormData({ ...formData, platoon: e.target.value })}
                        className="w-full bg-[#251c14] border border-white/10 rounded-xl pr-12 pl-10 py-4 text-white focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-[#251c14]">בחר פלוגה</option>
                        {platoons.map((platoon) => (
                          <option key={platoon.id} value={platoon.name} className="bg-[#251c14]">
                            {platoon.name}
                          </option>
                        ))}
                      </select>
                      {platoons.length === 0 && (
                        <p className="text-white/40 text-xs mt-1">אין פלוגות זמינות כרגע</p>
                      )}
                    </div>
                  </>
                )}

                {/* Email Input */}
                <div className="relative">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="אימייל"
                    required
                    className="w-full bg-[#251c14] border border-white/10 rounded-xl pr-12 pl-4 py-4 text-white placeholder:text-white/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
                  />
                </div>

                {/* Password Input */}
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="סיסמה"
                    required
                    className="w-full bg-[#251c14] border border-white/10 rounded-xl pr-12 pl-12 py-4 text-white placeholder:text-white/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-4 rounded-xl text-center">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-l from-gold via-gold-light to-gold text-[#1a140f] font-bold text-lg py-4 rounded-xl shadow-lg shadow-gold/20 hover:shadow-xl hover:shadow-gold/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      מתחבר...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      {isRegister ? "הצטרף עכשיו" : "כניסה"}
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-white/40 text-sm">או</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Toggle Register/Login */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError("");
                  }}
                  className="text-gold hover:text-gold-light transition-colors font-medium"
                >
                  {isRegister ? "כבר יש לך חשבון? התחבר" : "אין לך חשבון? הצטרף למשפחה"}
                </button>
              </div>
            </div>

            {/* Footer Quote */}
            <div
              className="text-center mt-8 animate-fade-in-up"
              style={{ animationDelay: "200ms" }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-4 h-4 text-gold/50" />
                <Shield className="w-5 h-5 text-gold" />
                <Star className="w-4 h-4 text-gold/50" />
              </div>
              <p className="text-white/70 font-medium">
                &ldquo;למען שמו באהבה - לעלות ולהתעלות&rdquo;
              </p>
              <p className="text-gold/70 text-sm mt-1 font-medium">רוח חשמונאית</p>
            </div>
          </div>
        </main>

        {/* Bottom Gold Line */}
        <div className="h-1 bg-gradient-to-r from-transparent via-gold to-transparent relative z-10" />
      </div>
    </div>
  );
}
