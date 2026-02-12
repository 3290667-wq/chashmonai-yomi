"use client";

import { useState, useSyncExternalStore, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import SplashScreen from "@/components/splash-screen";
import { BookOpen, Clock, Users, Award } from "lucide-react";

// Custom hook for session storage with SSR support
function useSessionStorage(key: string) {
  const subscribe = useCallback((callback: () => void) => {
    window.addEventListener('storage', callback);
    return () => window.removeEventListener('storage', callback);
  }, []);
  
  const getSnapshot = useCallback(() => {
    return sessionStorage.getItem(key);
  }, [key]);
  
  const getServerSnapshot = useCallback(() => {
    return null;
  }, []);
  
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default function Home() {
  const hasSeenSplash = useSessionStorage("hasSeenSplash");
  const [splashCompleted, setSplashCompleted] = useState(false);
  
  const showSplash = hasSeenSplash === null && !splashCompleted;
  const isLoaded = hasSeenSplash !== null || splashCompleted;

  const handleSplashComplete = () => {
    sessionStorage.setItem("hasSeenSplash", "true");
    setSplashCompleted(true);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div className={`min-h-screen bg-gradient-logo ${isLoaded ? "animate-fade-in" : ""}`}>
      {/* Header */}
      <header className="safe-area-top">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image
              src="/רוח חשמונאית.png"
              alt="רוח חשמונאית"
              width={50}
              height={50}
              className="drop-shadow-md"
            />
            <span className="text-xl font-bold text-white">חשמונאי יומי</span>
          </div>
          <Link
            href="/login"
            className="px-5 py-2 bg-gold text-slate-900 rounded-full font-bold hover:bg-gold-light transition-colors shadow-md"
          >
            כניסה
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-8 sm:py-16">
        <div className="text-center max-w-2xl mx-auto">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-6">
            <Image
              src="/רוח חשמונאית.png"
              alt="רוח חשמונאית"
              fill
              className="object-contain drop-shadow-xl"
              priority
            />
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            רוח חשמונאית
          </h1>
          <p className="text-xl sm:text-2xl text-gold mb-2">
            אפליקציית לימוד לחיילי חטיבת חשמונאים
          </p>
          <p className="text-slate-600 mb-8">
            למען שמו באהבה - לעלות ולהתעלות
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/login"
              className="px-8 py-4 bg-gradient-to-l from-gold via-gold-light to-gold text-slate-900 rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-gold/30 transition-all shadow-lg transform hover:-translate-y-1"
            >
              התחל ללמוד
            </Link>
            <Link
              href="/daily"
              className="px-8 py-4 bg-white text-white rounded-xl font-bold text-lg hover:bg-[#4a3825] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 border border-sky-300"
            >
              צפה בלימוד היומי
            </Link>
          </div>

          <Link
            href="/tutorial"
            className="inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors mb-8"
          >
            <span className="text-lg">איך משתמשים באפליקציה?</span>
            <span className="animate-bounce-soft">&#x2190;</span>
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <FeatureCard
            icon={<BookOpen className="w-8 h-8" />}
            title="לימוד יומי"
            description="משנה ורמב״ם"
          />
          <FeatureCard
            icon={<Clock className="w-8 h-8" />}
            title="זמני היום"
            description="תפילות וזמנים"
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="קהילה"
            description="לומדים יחד"
          />
          <FeatureCard
            icon={<Award className="w-8 h-8" />}
            title="נקודות"
            description="צבירה ופדיון"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-slate-600 safe-area-bottom">
        <p>חטיבת חשמונאים - גדוד 932</p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white backdrop-blur-sm rounded-2xl p-4 text-center border border-sky-200 hover:border-gold/30 transition-colors">
      <div className="text-gold mb-2 flex justify-center">{icon}</div>
      <h3 className="font-bold text-white text-sm sm:text-base">{title}</h3>
      <p className="text-slate-600 text-xs sm:text-sm">{description}</p>
    </div>
  );
}
