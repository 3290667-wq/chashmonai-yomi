"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Input from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    platoon: "",
  });

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

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

        // After registration, sign in
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary-light p-4">
      <Card variant="elevated" className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">
            <span className="text-secondary">חשמונאי</span> יומי
          </h1>
          <p className="text-muted">אפליקציית לימוד לחיילי חטיבת חשמונאים</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <Input
                label="שם מלא"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="הכנס שם מלא"
              />
              <Input
                label="פלוגה"
                type="text"
                value={formData.platoon}
                onChange={(e) =>
                  setFormData({ ...formData, platoon: e.target.value })
                }
                placeholder="הכנס שם פלוגה"
              />
            </>
          )}

          <Input
            label="אימייל"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="הכנס אימייל"
            required
          />

          <Input
            label="סיסמה"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder="הכנס סיסמה"
            required
          />

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? "טוען..." : isRegister ? "הרשמה" : "כניסה"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
            className="text-secondary hover:underline text-sm"
          >
            {isRegister ? "כבר יש לך חשבון? התחבר" : "אין לך חשבון? הירשם"}
          </button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-card-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-card text-muted">או</span>
          </div>
        </div>

        <Button
          onClick={handleGoogleSignIn}
          variant="outline"
          size="lg"
          className="w-full flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          כניסה עם Google
        </Button>

        <div className="mt-6 pt-6 border-t border-card-border text-center">
          <p className="text-sm text-muted">רוח חשמונאית - לעלות ולהתעלות</p>
        </div>
      </Card>
    </div>
  );
}
