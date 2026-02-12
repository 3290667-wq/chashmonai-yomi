"use client";

import { useState, useEffect } from "react";
import {
  LogIn,
  LayoutDashboard,
  BookOpen,
  Star,
  MessageCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2
} from "lucide-react";

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  animation: string;
  tips: string[];
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: "הרשמה והתחברות",
    description: "צור חשבון חדש או התחבר עם פרטי המשתמש שלך. בחר את הפלוגה שלך כדי להצטרף לקהילה.",
    icon: <LogIn className="w-12 h-12" />,
    animation: "animate-slide-in-right",
    tips: ["הזן כתובת אימייל תקינה", "בחר סיסמה חזקה", "בחר את הפלוגה שלך מהרשימה"]
  },
  {
    id: 2,
    title: "לוח הבקרה",
    description: "צפה בסטטיסטיקות האישיות שלך, הנקודות שצברת, רצף הלמידה והתקדמותך.",
    icon: <LayoutDashboard className="w-12 h-12" />,
    animation: "animate-scale-in",
    tips: ["צפה בסיכום היומי", "עקוב אחר רצף הלמידה", "גש במהירות לכל האזורים"]
  },
  {
    id: 3,
    title: "לימוד יומי",
    description: "למד משנה יומית, רמב\"ם, חסידות ומוסר. הטיימר עוקב אחר זמן הלמידה שלך.",
    icon: <BookOpen className="w-12 h-12" />,
    animation: "animate-float",
    tips: ["בחר נושא לימוד", "הטיימר מתחיל אוטומטית", "השלם את הלימוד לקבלת בונוס"]
  },
  {
    id: 4,
    title: "צבירת נקודות",
    description: "צבור נקודות על כל דקת לימוד והמר אותן לפרסים מגוונים.",
    icon: <Star className="w-12 h-12" />,
    animation: "animate-pulse-gold",
    tips: ["0.2 נקודות לכל דקה", "10 נקודות להשלמת יום", "5 נקודות בונוס רצף"]
  },
  {
    id: 5,
    title: "צ'אט עם הרב",
    description: "שאל שאלות הלכתיות ורוחניות וקבל מענה מהרב של הפלוגה.",
    icon: <MessageCircle className="w-12 h-12" />,
    animation: "animate-bounce-soft",
    tips: ["שלח הודעות בכל עת", "קבל תשובות מהרב", "שמור על שיח מכבד"]
  },
  {
    id: 6,
    title: "זמני תפילה",
    description: "צפה בזמני התפילה המדויקים לפי המיקום שלך.",
    icon: <Clock className="w-12 h-12" />,
    animation: "animate-spin-slow",
    tips: ["בחר את העיר שלך", "צפה בכל זמני היום", "קבל עדכונים בזמן אמת"]
  }
];

interface AppTutorialProps {
  onClose?: () => void;
  autoPlay?: boolean;
}

export default function AppTutorial({ onClose, autoPlay = false }: AppTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    if (autoPlay) {
      const interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < tutorialSteps.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoPlay]);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 600);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const goToNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (index: number) => {
    setCurrentStep(index);
  };

  const step = tutorialSteps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-[#1a140f] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 left-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        )}

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
          <div
            className="h-full bg-gradient-to-l from-[#C9A227] to-[#E8D48A] transition-all duration-500"
            style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
          />
        </div>

        {/* Header with Step Indicators */}
        <div className="flex justify-center gap-2 pt-8 pb-4">
          {tutorialSteps.map((s, index) => (
            <button
              key={s.id}
              onClick={() => goToStep(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? "w-8 bg-[#C9A227]"
                  : completedSteps.includes(index)
                  ? "bg-[#5c7a3a]"
                  : "bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="px-8 pb-8">
          {/* Icon with Animation */}
          <div className={`flex justify-center mb-6 ${isAnimating ? step.animation : ""}`}>
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-[#C9A227]/20 blur-3xl rounded-full scale-150" />

              {/* Icon Container */}
              <div className="relative w-24 h-24 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#C9A227] to-[#9A7B1A] shadow-lg shadow-[#C9A227]/30">
                <div className="text-[#1a140f]">
                  {step.icon}
                </div>
              </div>

              {/* Floating Particles */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#C9A227] rounded-full animate-ping opacity-75" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-[#E8D48A] rounded-full animate-pulse" />
            </div>
          </div>

          {/* Step Number */}
          <div className="text-center mb-2">
            <span className="inline-block px-4 py-1 bg-[#C9A227]/10 text-[#C9A227] rounded-full text-sm font-bold border border-[#C9A227]/30">
              שלב {step.id} מתוך {tutorialSteps.length}
            </span>
          </div>

          {/* Title */}
          <h2 className={`text-3xl font-bold text-white text-center mb-4 ${isAnimating ? "animate-fade-in-up" : ""}`}>
            {step.title}
          </h2>

          {/* Description */}
          <p className={`text-white/70 text-center text-lg mb-6 leading-relaxed ${isAnimating ? "animate-fade-in-up" : ""}`}
             style={{ animationDelay: "100ms" }}>
            {step.description}
          </p>

          {/* Tips */}
          <div className={`bg-[#3b2d1f] rounded-2xl p-4 mb-8 ${isAnimating ? "animate-fade-in-up" : ""}`}
               style={{ animationDelay: "200ms" }}>
            <div className="text-[#C9A227] font-bold mb-3 text-sm">טיפים:</div>
            <ul className="space-y-2">
              {step.tips.map((tip, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 text-white/80"
                  style={{ animationDelay: `${300 + index * 100}ms` }}
                >
                  <CheckCircle2 className="w-4 h-4 text-[#5c7a3a] flex-shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={goToPrev}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                currentStep === 0
                  ? "bg-white/5 text-white/30 cursor-not-allowed"
                  : "bg-[#3b2d1f] text-white hover:bg-[#4a3825]"
              }`}
            >
              <ChevronRight className="w-5 h-5" />
              הקודם
            </button>

            {currentStep === tutorialSteps.length - 1 ? (
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold bg-gradient-to-l from-[#C9A227] to-[#E8D48A] text-[#1a140f] hover:shadow-lg hover:shadow-[#C9A227]/30 transition-all transform hover:-translate-y-1"
              >
                התחל להשתמש!
              </button>
            ) : (
              <button
                onClick={goToNext}
                className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold bg-gradient-to-l from-[#C9A227] to-[#E8D48A] text-[#1a140f] hover:shadow-lg hover:shadow-[#C9A227]/30 transition-all transform hover:-translate-y-1"
              >
                הבא
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/2 right-0 w-32 h-32 bg-[#C9A227]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-[#5c7a3a]/5 rounded-full blur-3xl pointer-events-none" />
      </div>
    </div>
  );
}

/* Demo Component - Shows how to use the tutorial */
export function TutorialDemo() {
  const [showTutorial, setShowTutorial] = useState(false);

  return (
    <div className="min-h-screen bg-[#1a140f] flex items-center justify-center">
      <button
        onClick={() => setShowTutorial(true)}
        className="px-8 py-4 rounded-xl font-bold bg-gradient-to-l from-[#C9A227] to-[#E8D48A] text-[#1a140f] hover:shadow-lg hover:shadow-[#C9A227]/30 transition-all"
      >
        הצג מדריך שימוש
      </button>

      {showTutorial && (
        <AppTutorial onClose={() => setShowTutorial(false)} />
      )}
    </div>
  );
}
