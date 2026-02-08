"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, Users, Sparkles, Shield, Star, Zap } from "lucide-react";

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
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/login-bg.png"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-brown-deep/40" />
        {/* Aurora Overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/40 rounded-full blur-[100px] animate-aurora" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-500/30 rounded-full blur-[80px] animate-aurora" style={{ animationDelay: "-5s" }} />
        </div>
      </div>

      {/* Floating Orbs */}
      <div className="floating-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(rgba(201, 162, 39, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201, 162, 39, 0.3) 1px, transparent 1px)",
          backgroundSize: "50px 50px"
        }} />
      </div>

      {/* Decorative top bar - Animated */}
      <div className="relative h-1.5 bg-gradient-to-r from-transparent via-gold to-transparent overflow-hidden z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
      </div>

      {/* Header - Glass Effect */}
      <header className="safe-area-top p-5 relative z-10">
        <Link href="/" className="flex items-center gap-3 w-fit group">
          <div className="relative">
            <div className="absolute inset-0 bg-gold/40 rounded-xl blur-lg group-hover:blur-xl transition-all animate-pulse-gold" />
            <Image
              src="/רוח חשמונאית.png"
              alt="רוח חשמונאית"
              width={48}
              height={48}
              className="relative drop-shadow-2xl group-hover:scale-110 transition-transform"
            />
          </div>
          <div>
            <span className="font-bold text-cream text-lg text-glow">חשמונאי יומי</span>
            <p className="text-xs text-gold font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              רוח חשמונאית
            </p>
          </div>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-5 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo Section - Enhanced */}
          <div className="text-center mb-10 stagger-item">
            <div className="relative w-36 h-36 mx-auto mb-6">
              {/* Multi-layer Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-gold via-amber-400 to-gold-dark rounded-full blur-2xl opacity-50 animate-pulse-gold" />
              <div className="absolute inset-4 bg-gold/30 rounded-full blur-xl animate-float" />
              <Image
                src="/shield-emblem.png"
                alt="רוח חשמונאית"
                fill
                className="object-contain drop-shadow-2xl relative z-10 animate-float"
                priority
              />
            </div>
            <h1 className="text-4xl font-bold text-cream mb-3 text-glow">
              {isRegister ? "הצטרף למשפחה" : "ברוכים הבאים"}
            </h1>
            <p className="text-gold text-lg font-medium">
              {isRegister ? "הרשמה לרוח חשמונאית" : "התחבר כדי להמשיך ללמוד"}
            </p>
          </div>

          {/* Form Card - Glassmorphism */}
          <div className="glass-card p-8 sm:p-10 relative overflow-hidden stagger-item" style={{ animationDelay: "100ms" }}>
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700 animate-shimmer pointer-events-none" />

            {/* Corner Ornaments with Glow */}
            <div className="absolute top-0 right-0 w-24 h-24 opacity-30 pointer-events-none">
              <Image src="/corner-ornament.png" alt="" fill className="object-contain" />
            </div>
            <div className="absolute bottom-0 left-0 w-24 h-24 opacity-30 rotate-180 pointer-events-none">
              <Image src="/corner-ornament.png" alt="" fill className="object-contain" />
            </div>

            {/* Floating Particles in Card */}
            <div className="particles">
              <div className="particle" />
              <div className="particle" />
              <div className="particle" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              {isRegister && (
                <>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gold/10 rounded-xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold z-10" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="שם מלא"
                      className="relative w-full glass-button !bg-white/50 !border-gold/30 pr-12 py-4 rounded-xl text-brown-deep placeholder:text-brown-soft focus:!border-gold focus:glow-gold transition-all"
                    />
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gold/10 rounded-xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <Users className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold z-10" />
                    <input
                      type="text"
                      value={formData.platoon}
                      onChange={(e) => setFormData({ ...formData, platoon: e.target.value })}
                      placeholder="פלוגה"
                      className="relative w-full glass-button !bg-white/50 !border-gold/30 pr-12 py-4 rounded-xl text-brown-deep placeholder:text-brown-soft focus:!border-gold focus:glow-gold transition-all"
                    />
                  </div>
                </>
              )}

              <div className="relative group">
                <div className="absolute inset-0 bg-gold/10 rounded-xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold z-10" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="אימייל"
                  required
                  className="relative w-full glass-button !bg-white/50 !border-gold/30 pr-12 py-4 rounded-xl text-brown-deep placeholder:text-brown-soft focus:!border-gold focus:glow-gold transition-all"
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gold/10 rounded-xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold z-10" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="סיסמה"
                  required
                  className="relative w-full glass-button !bg-white/50 !border-gold/30 pr-12 pl-12 py-4 rounded-xl text-brown-deep placeholder:text-brown-soft focus:!border-gold focus:glow-gold transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-brown-soft hover:text-gold transition-colors z-10"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {error && (
                <div className="glass !bg-error/20 border border-error/40 text-error text-sm p-4 rounded-xl text-center">
                  <Zap className="w-4 h-4 inline-block ml-2" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full relative overflow-hidden bg-gradient-to-l from-gold via-gold-light to-gold text-brown-deep font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {/* Button Shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity animate-shimmer" />

                {loading ? (
                  <span className="relative flex items-center justify-center gap-3">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    מתחבר...
                  </span>
                ) : (
                  <span className="relative flex items-center justify-center gap-2">
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
                className="text-gold hover:text-gold-dark transition-colors font-semibold hover:underline underline-offset-4"
              >
                {isRegister ? "כבר יש לך חשבון? התחבר" : "אין לך חשבון? הצטרף למשפחה"}
              </button>
            </div>
          </div>

          {/* Footer Quote - Glass Card */}
          <div className="glass-card text-center mt-8 p-6 stagger-item" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-4 h-4 text-gold animate-pulse" />
              <Shield className="w-5 h-5 text-gold" />
              <Star className="w-4 h-4 text-gold animate-pulse" />
            </div>
            <p className="text-brown-deep font-bold text-lg">
              &ldquo;למען שמו באהבה - לעלות ולהתעלות&rdquo;
            </p>
            <p className="text-gold text-sm mt-2 font-semibold">רוח חשמונאית</p>
          </div>
        </div>
      </main>

      {/* Decorative bottom bar - Animated */}
      <div className="relative h-1.5 bg-gradient-to-r from-transparent via-gold to-transparent overflow-hidden z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
      </div>
    </div>
  );
}
