"use client";

import { useState, useSyncExternalStore, useCallback } from "react";
import { motion } from "framer-motion";
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
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="safe-area-top"
      >
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3"
          >
            <Image
              src="/רוח חשמונאית.png"
              alt="רוח חשמונאית"
              width={50}
              height={50}
              className="drop-shadow-md"
            />
            <span className="text-xl font-bold text-slate-800">חשמונאי יומי</span>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Link
            href="/login"
            className="px-5 py-2 bg-gold text-slate-900 rounded-full font-bold hover:bg-gold-light transition-colors shadow-md btn-premium"
          >
            כניסה
          </Link>
          </motion.div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-8 sm:py-16">
        <div className="text-center max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-6"
          >
            <div className="absolute inset-0 bg-gold/30 rounded-full blur-xl animate-pulse" />
            <Image
              src="/רוח חשמונאית.png"
              alt="רוח חשמונאית"
              fill
              className="object-contain drop-shadow-xl relative z-10"
              priority
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl sm:text-5xl font-bold text-slate-800 mb-4"
          >
            רוח חשמונאית
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-xl sm:text-2xl text-gradient-animated mb-2"
          >
            אפליקציית לימוד לחיילי חטיבת חשמונאים
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-slate-700 mb-8"
          >
            למען שמו באהבה - לעלות ולהתעלות
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
          >
            <motion.div whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/login"
              className="px-8 py-4 bg-gradient-to-l from-gold via-gold-light to-gold text-slate-900 rounded-xl font-bold text-lg shadow-lg shadow-gold/30 btn-premium block"
            >
              התחל ללמוד
            </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/daily"
              className="px-8 py-4 bg-white text-slate-800 rounded-xl font-bold text-lg shadow-lg border border-sky-200 shine-effect block"
            >
              צפה בלימוד היומי
            </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
          <Link
            href="/tutorial"
            className="inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors mb-8"
          >
            <span className="text-lg">איך משתמשים באפליקציה?</span>
            <span className="animate-bounce-soft">&#x2190;</span>
          </Link>
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          <FeatureCard
            icon={<BookOpen className="w-8 h-8" />}
            title="לימוד יומי"
            description="משנה ורמב״ם"
            index={0}
          />
          <FeatureCard
            icon={<Clock className="w-8 h-8" />}
            title="זמני היום"
            description="תפילות וזמנים"
            index={1}
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="קהילה"
            description="לומדים יחד"
            index={2}
          />
          <FeatureCard
            icon={<Award className="w-8 h-8" />}
            title="נקודות"
            description="צבירה ופדיון"
            index={3}
          />
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="mt-auto py-6 text-center text-slate-700 safe-area-bottom"
      >
        <p>חטיבת חשמונאים - גדוד 932</p>
      </motion.footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  index,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
      whileHover={{ scale: 1.05, y: -4 }}
      className="bg-white backdrop-blur-sm rounded-2xl p-4 text-center border border-sky-200 hover:border-gold/30 transition-colors card-tilt shine-effect"
    >
      <div className="text-gold mb-2 flex justify-center icon-pop">{icon}</div>
      <h3 className="font-bold text-slate-800 text-sm sm:text-base">{title}</h3>
      <p className="text-slate-700 text-xs sm:text-sm">{description}</p>
    </motion.div>
  );
}
