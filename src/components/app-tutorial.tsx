"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
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
  CheckCircle2,
  Flame,
  Trophy,
  Users,
  Sparkles,
  Play,
  Gift,
  Target,
  Heart
} from "lucide-react";

interface TutorialStep {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  longDescription: string;
  icon: React.ReactNode;
  color: string;
  features: { icon: React.ReactNode; text: string }[];
  animation: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 0,
    title: "ברוכים הבאים!",
    subtitle: "רוח חשמונאית - לעלות ולהתעלות",
    description: "אפליקציית הלימוד הרשמית של חטיבת חשמונאים",
    longDescription: "חשמונאי יומי היא אפליקציה ייחודית שנבנתה במיוחד עבור חיילי חטיבת חשמונאים. האפליקציה מאפשרת לכם ללמוד תורה בכל מקום ובכל זמן, לצבור נקודות על הלמידה, ולהיות חלק מקהילה לומדת וצומחת. בואו נכיר את כל האפשרויות שמחכות לכם!",
    icon: <Sparkles className="w-16 h-16" />,
    color: "from-[#C9A227] to-[#9A7B1A]",
    features: [
      { icon: <BookOpen className="w-5 h-5" />, text: "לימוד יומי מגוון" },
      { icon: <Star className="w-5 h-5" />, text: "צבירת נקודות ופרסים" },
      { icon: <Users className="w-5 h-5" />, text: "קהילה לומדת" },
      { icon: <Heart className="w-5 h-5" />, text: "חיבור לרב הפלוגה" },
    ],
    animation: "animate-intro"
  },
  {
    id: 1,
    title: "הרשמה והתחברות",
    subtitle: "הצטרפות לקהילה",
    description: "צור חשבון חדש או התחבר עם פרטי המשתמש שלך",
    longDescription: "תהליך ההרשמה פשוט ומהיר. הזן את כתובת האימייל שלך, בחר סיסמה חזקה, הכנס את השם המלא שלך ובחר את הפלוגה שאליה אתה משתייך. לאחר ההרשמה תוכל להתחבר מכל מכשיר ולהמשיך ללמוד מאיפה שהפסקת. כל ההתקדמות שלך נשמרת אוטומטית!",
    icon: <LogIn className="w-16 h-16" />,
    color: "from-[#5c7a3a] to-[#3d5226]",
    features: [
      { icon: <CheckCircle2 className="w-5 h-5" />, text: "הזן כתובת אימייל תקינה" },
      { icon: <CheckCircle2 className="w-5 h-5" />, text: "בחר סיסמה חזקה ובטוחה" },
      { icon: <CheckCircle2 className="w-5 h-5" />, text: "הכנס את שמך המלא" },
      { icon: <CheckCircle2 className="w-5 h-5" />, text: "בחר את הפלוגה שלך" },
    ],
    animation: "animate-slide-in-right"
  },
  {
    id: 2,
    title: "לוח הבקרה",
    subtitle: "המרכז האישי שלך",
    description: "צפה בסטטיסטיקות, נקודות והתקדמות",
    longDescription: "לוח הבקרה הוא המקום הראשון שתראה אחרי ההתחברות. כאן תוכל לראות את כל המידע החשוב במבט אחד: כמה נקודות צברת, מה רצף הלמידה שלך, כמה דקות למדת היום, ומה הלימוד היומי שמחכה לך. תוכל גם לגשת במהירות לכל חלקי האפליקציה מכאן.",
    icon: <LayoutDashboard className="w-16 h-16" />,
    color: "from-[#3b82f6] to-[#1d4ed8]",
    features: [
      { icon: <Star className="w-5 h-5" />, text: "סך הנקודות שצברת" },
      { icon: <Flame className="w-5 h-5" />, text: "רצף ימי הלמידה שלך" },
      { icon: <Clock className="w-5 h-5" />, text: "זמן הלמידה היומי" },
      { icon: <Target className="w-5 h-5" />, text: "גישה מהירה לכל התכנים" },
    ],
    animation: "animate-scale-in"
  },
  {
    id: 3,
    title: "לימוד יומי",
    subtitle: "הלב של האפליקציה",
    description: "משנה, רמב\"ם, חסידות, מוסר ועוד",
    longDescription: "באזור הלימוד היומי תמצא מגוון רחב של תכנים: משנה יומית מתוך מחזור הש\"ס, הלכה יומית מהרמב\"ם, תורת החסידות, מוסר ומחשבה יהודית, וסרטוני וידאו מעוררי השראה. הטיימר החכם עוקב אחרי זמן הלמידה שלך ומזכה אותך בנקודות על כל דקה. השלם את הלימוד היומי וקבל בונוס מיוחד!",
    icon: <BookOpen className="w-16 h-16" />,
    color: "from-[#C9A227] to-[#9A7B1A]",
    features: [
      { icon: <BookOpen className="w-5 h-5" />, text: "משנה יומית - לימוד שיטתי" },
      { icon: <BookOpen className="w-5 h-5" />, text: "רמב\"ם יומי - הלכה למעשה" },
      { icon: <Heart className="w-5 h-5" />, text: "חסידות ומוסר - עבודת המידות" },
      { icon: <Play className="w-5 h-5" />, text: "סרטוני וידאו מעוררי השראה" },
    ],
    animation: "animate-float"
  },
  {
    id: 4,
    title: "מערכת הנקודות",
    subtitle: "למידה משתלמת",
    description: "צבור נקודות והמר לפרסים מגוונים",
    longDescription: "כל דקת לימוד מזכה אותך ב-0.2 נקודות. סיימת את כל הלימוד היומי? קבל בונוס של 10 נקודות! שומר על רצף למידה יומי? עוד 5 נקודות בונוס! את הנקודות שצברת תוכל להמיר לפרסים מגוונים - ספרים, ציוד, ועוד הפתעות. ככל שתלמד יותר, תרוויח יותר!",
    icon: <Trophy className="w-16 h-16" />,
    color: "from-[#f59e0b] to-[#d97706]",
    features: [
      { icon: <Star className="w-5 h-5" />, text: "0.2 נקודות לכל דקת לימוד" },
      { icon: <CheckCircle2 className="w-5 h-5" />, text: "10 נקודות להשלמת יום" },
      { icon: <Flame className="w-5 h-5" />, text: "5 נקודות בונוס רצף" },
      { icon: <Gift className="w-5 h-5" />, text: "המרה לפרסים מגוונים" },
    ],
    animation: "animate-pulse-gold"
  },
  {
    id: 5,
    title: "צ'אט עם הרב",
    subtitle: "תמיד כאן בשבילך",
    description: "שאל שאלות וקבל מענה מהרב",
    longDescription: "יש לך שאלה הלכתית? מתלבט בעניין רוחני? רוצה לשוחח על משהו שלמדת? הרב של הפלוגה זמין עבורך דרך הצ'אט המובנה באפליקציה. שלח הודעה בכל עת, והרב יחזור אליך בהקדם האפשרי. זו הזדמנות מיוחדת ליצור קשר אישי ולקבל הדרכה מותאמת.",
    icon: <MessageCircle className="w-16 h-16" />,
    color: "from-[#8b5cf6] to-[#6d28d9]",
    features: [
      { icon: <MessageCircle className="w-5 h-5" />, text: "שלח הודעות בכל עת" },
      { icon: <CheckCircle2 className="w-5 h-5" />, text: "קבל תשובות מהרב" },
      { icon: <Heart className="w-5 h-5" />, text: "הדרכה אישית ומותאמת" },
      { icon: <Users className="w-5 h-5" />, text: "שמור על קשר רציף" },
    ],
    animation: "animate-bounce-soft"
  },
  {
    id: 6,
    title: "זמני תפילה",
    subtitle: "תמיד בזמן",
    description: "זמני היום המדויקים לפי מיקומך",
    longDescription: "באפליקציה תמצא את כל זמני התפילה והיום לפי המיקום שלך. בחר מתוך רשימה של ערים בכל רחבי הארץ - מירושלים ועד אילת, מהגולן ועד עזה - וקבל את הזמנים המדויקים: עלות השחר, זריחה, סוף זמן קריאת שמע, סוף זמן תפילה, חצות, שקיעה ועוד. תמיד תדע מתי להתפלל!",
    icon: <Clock className="w-16 h-16" />,
    color: "from-[#06b6d4] to-[#0891b2]",
    features: [
      { icon: <Target className="w-5 h-5" />, text: "בחר את העיר שלך" },
      { icon: <Clock className="w-5 h-5" />, text: "כל זמני היום המדויקים" },
      { icon: <CheckCircle2 className="w-5 h-5" />, text: "עדכון אוטומטי יומי" },
      { icon: <Star className="w-5 h-5" />, text: "מותאם לכל מיקום בארץ" },
    ],
    animation: "animate-spin-slow"
  },
  {
    id: 7,
    title: "מוכנים להתחיל!",
    subtitle: "לעלות ולהתעלות",
    description: "הצטרף לאלפי חיילים שכבר לומדים",
    longDescription: "עכשיו אתה מכיר את כל האפשרויות שמחכות לך באפליקציה. הגיע הזמן להתחיל את המסע! למד כל יום, צבור נקודות, שמור על רצף, והפוך להיות חלק מקהילה לומדת וצומחת. זכור - כל דקת לימוד חשובה, וכל צעד קטן מקרב אותך למטרה. בהצלחה!",
    icon: <Sparkles className="w-16 h-16" />,
    color: "from-[#C9A227] to-[#9A7B1A]",
    features: [
      { icon: <BookOpen className="w-5 h-5" />, text: "התחל ללמוד עכשיו" },
      { icon: <Star className="w-5 h-5" />, text: "צבור נקודות ופרסים" },
      { icon: <Flame className="w-5 h-5" />, text: "שמור על רצף יומי" },
      { icon: <Trophy className="w-5 h-5" />, text: "הפוך לחלק מהקהילה" },
    ],
    animation: "animate-intro"
  }
];

interface AppTutorialProps {
  onClose?: () => void;
  autoPlay?: boolean;
}

export default function AppTutorial({ onClose, autoPlay = false }: AppTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goToNext = useCallback(() => {
    if (currentStep < tutorialSteps.length - 1) {
      setDirection("next");
      setCurrentStep(currentStep + 1);
      setProgress(0);
    }
  }, [currentStep]);

  const goToPrev = useCallback(() => {
    if (currentStep > 0) {
      setDirection("prev");
      setCurrentStep(currentStep - 1);
      setProgress(0);
    }
  }, [currentStep]);

  // Auto-advance with progress bar
  useEffect(() => {
    if (autoPlay && !isPaused && currentStep < tutorialSteps.length - 1) {
      const duration = currentStep === 0 ? 8000 : 6000; // Intro is longer
      const interval = 50;
      const increment = (interval / duration) * 100;

      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            goToNext();
            return 0;
          }
          return prev + increment;
        });
      }, interval);

      return () => clearInterval(timer);
    }
  }, [autoPlay, isPaused, currentStep, goToNext]);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 800);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const goToStep = (index: number) => {
    setDirection(index > currentStep ? "next" : "prev");
    setCurrentStep(index);
    setProgress(0);
  };

  const step = tutorialSteps[currentStep];
  const isIntro = currentStep === 0;
  const isOutro = currentStep === tutorialSteps.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
      onClick={() => setIsPaused(!isPaused)}
    >
      <div
        className="relative w-full max-w-3xl mx-4 bg-gradient-to-b from-[#1a140f] to-[#0d0a07] rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 left-4 z-20 p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-all hover:scale-110"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        )}

        {/* Progress Bar (Auto-play) */}
        {autoPlay && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-10">
            <div
              className="h-full bg-gradient-to-l from-[#C9A227] to-[#E8D48A] transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Step Progress Dots */}
        <div className="flex justify-center gap-2 pt-8 pb-2 relative z-10">
          {tutorialSteps.map((s, index) => (
            <button
              key={s.id}
              onClick={() => goToStep(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentStep
                  ? "w-10 h-3 bg-gradient-to-l from-[#C9A227] to-[#E8D48A]"
                  : index < currentStep
                  ? "w-3 h-3 bg-[#5c7a3a]"
                  : "w-3 h-3 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className={`px-6 sm:px-10 pb-8 ${direction === "next" ? "animate-slide-in-left" : "animate-slide-in-right"}`}>

          {/* Logo for Intro/Outro */}
          {(isIntro || isOutro) && (
            <div className={`flex justify-center mb-4 ${isAnimating ? "animate-scale-in" : ""}`}>
              <div className="relative">
                <div className="absolute inset-0 bg-[#C9A227]/30 blur-3xl rounded-full scale-150" />
                <Image
                  src="/רוח חשמונאית.png"
                  alt="רוח חשמונאית"
                  width={120}
                  height={120}
                  className="relative drop-shadow-2xl animate-float"
                />
              </div>
            </div>
          )}

          {/* Icon with Gradient Background */}
          {!isIntro && !isOutro && (
            <div className={`flex justify-center mb-6 ${isAnimating ? step.animation : ""}`}>
              <div className="relative">
                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${step.color} blur-3xl rounded-full scale-150 opacity-30`} />

                {/* Icon Container */}
                <div className={`relative w-28 h-28 flex items-center justify-center rounded-3xl bg-gradient-to-br ${step.color} shadow-2xl`}>
                  <div className="text-white">
                    {step.icon}
                  </div>
                </div>

                {/* Animated Ring */}
                <div className={`absolute inset-0 rounded-3xl border-2 border-white/20 animate-ping`} style={{ animationDuration: "2s" }} />
              </div>
            </div>
          )}

          {/* Step Counter */}
          {!isIntro && !isOutro && (
            <div className="text-center mb-3">
              <span className={`inline-block px-5 py-1.5 bg-gradient-to-l ${step.color} bg-opacity-20 text-white rounded-full text-sm font-bold border border-white/20`}>
                שלב {step.id} מתוך {tutorialSteps.length - 2}
              </span>
            </div>
          )}

          {/* Title */}
          <h2 className={`text-3xl sm:text-4xl font-bold text-white text-center mb-2 ${isAnimating ? "animate-fade-in-up" : ""}`}>
            {step.title}
          </h2>

          {/* Subtitle */}
          <p className={`text-[#C9A227] text-center text-lg font-medium mb-4 ${isAnimating ? "animate-fade-in-up" : ""}`}
             style={{ animationDelay: "100ms" }}>
            {step.subtitle}
          </p>

          {/* Long Description */}
          <p className={`text-white/70 text-center text-base sm:text-lg mb-6 leading-relaxed max-w-2xl mx-auto ${isAnimating ? "animate-fade-in-up" : ""}`}
             style={{ animationDelay: "200ms" }}>
            {step.longDescription}
          </p>

          {/* Features Grid */}
          <div className={`grid grid-cols-2 gap-3 mb-8 ${isAnimating ? "animate-fade-in-up" : ""}`}
               style={{ animationDelay: "300ms" }}>
            {step.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10 hover:border-[#C9A227]/30 transition-all hover:bg-white/10"
                style={{ animationDelay: `${400 + index * 100}ms` }}
              >
                <div className={`p-2 rounded-lg bg-gradient-to-br ${step.color} text-white`}>
                  {feature.icon}
                </div>
                <span className="text-white/90 text-sm font-medium">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={goToPrev}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all ${
                currentStep === 0
                  ? "bg-white/5 text-white/30 cursor-not-allowed"
                  : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
              }`}
            >
              <ChevronRight className="w-5 h-5" />
              הקודם
            </button>

            {isOutro ? (
              <button
                onClick={onClose}
                className="flex-1 flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold bg-gradient-to-l from-[#C9A227] to-[#E8D48A] text-[#1a140f] hover:shadow-xl hover:shadow-[#C9A227]/30 transition-all transform hover:-translate-y-1 text-lg"
              >
                <Sparkles className="w-5 h-5" />
                בואו נתחיל!
              </button>
            ) : (
              <button
                onClick={goToNext}
                className="flex-1 flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold bg-gradient-to-l from-[#C9A227] to-[#E8D48A] text-[#1a140f] hover:shadow-xl hover:shadow-[#C9A227]/30 transition-all transform hover:-translate-y-1 text-lg"
              >
                {isIntro ? "בואו נתחיל!" : "הבא"}
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Auto-play indicator */}
          {autoPlay && (
            <p className="text-center text-white/40 text-sm mt-4">
              {isPaused ? "לחץ להמשך" : "לחץ להשהייה"}
            </p>
          )}
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-0 w-64 h-64 bg-[#C9A227]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#5c7a3a]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-10 w-2 h-2 bg-[#C9A227] rounded-full animate-float opacity-50" style={{ animationDelay: "0s" }} />
          <div className="absolute top-1/3 left-16 w-1.5 h-1.5 bg-[#E8D48A] rounded-full animate-float opacity-40" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-1/4 right-20 w-2 h-2 bg-[#5c7a3a] rounded-full animate-float opacity-50" style={{ animationDelay: "2s" }} />
          <div className="absolute bottom-1/3 left-10 w-1 h-1 bg-[#C9A227] rounded-full animate-float opacity-30" style={{ animationDelay: "0.5s" }} />
        </div>
      </div>
    </div>
  );
}
