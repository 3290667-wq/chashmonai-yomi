"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  LogIn,
  LayoutDashboard,
  BookOpen,
  Star,
  MessageCircle,
  Clock,
  X,
  CheckCircle2,
  Flame,
  Trophy,
  Users,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Gift,
  Target,
  Heart,
  Volume2,
  VolumeX
} from "lucide-react";

interface Scene {
  id: number;
  duration: number; // in ms
  title: string;
  subtitle?: string;
  content: string[];
  icon?: React.ReactNode;
  color: string;
  bgColor: string;
  highlights?: string[];
}

const scenes: Scene[] = [
  {
    id: 0,
    duration: 6000,
    title: "ברוכים הבאים",
    subtitle: "לרוח חשמונאית",
    content: [
      "אפליקציית הלימוד הרשמית",
      "של חטיבת חשמונאים",
      "לעלות ולהתעלות"
    ],
    color: "from-[#C9A227] to-[#9A7B1A]",
    bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
    highlights: ["לימוד יומי", "צבירת נקודות", "קהילה לומדת"]
  },
  {
    id: 1,
    duration: 5000,
    title: "התחברות קלה",
    content: [
      "הירשם עם אימייל וסיסמה",
      "בחר את הפלוגה שלך",
      "והתחל ללמוד מיד!"
    ],
    icon: <LogIn className="w-20 h-20" />,
    color: "from-[#5c7a3a] to-[#3d5226]",
    bgColor: "bg-gradient-to-br from-green-50 to-emerald-50"
  },
  {
    id: 2,
    duration: 5000,
    title: "לוח הבקרה",
    content: [
      "צפה בכל הנתונים שלך",
      "נקודות, רצף למידה, זמן לימוד",
      "הכל במקום אחד"
    ],
    icon: <LayoutDashboard className="w-20 h-20" />,
    color: "from-[#3b82f6] to-[#1d4ed8]",
    bgColor: "bg-gradient-to-br from-blue-50 to-sky-50",
    highlights: ["נקודות", "רצף", "זמן"]
  },
  {
    id: 3,
    duration: 6000,
    title: "לימוד יומי",
    subtitle: "הלב של האפליקציה",
    content: [
      "משנה יומית מהש״ס",
      "רמב״ם - הלכה למעשה",
      "חסידות ומוסר",
      "סרטוני וידאו"
    ],
    icon: <BookOpen className="w-20 h-20" />,
    color: "from-[#C9A227] to-[#9A7B1A]",
    bgColor: "bg-gradient-to-br from-amber-50 to-yellow-50"
  },
  {
    id: 4,
    duration: 5500,
    title: "צבירת נקודות",
    subtitle: "למידה משתלמת!",
    content: [
      "0.2 נקודות לכל דקת לימוד",
      "10 נקודות להשלמת יום",
      "5 נקודות בונוס על רצף",
      "המר לפרסים מגוונים!"
    ],
    icon: <Trophy className="w-20 h-20" />,
    color: "from-[#f59e0b] to-[#d97706]",
    bgColor: "bg-gradient-to-br from-orange-50 to-amber-50",
    highlights: ["0.2", "10", "5"]
  },
  {
    id: 5,
    duration: 4500,
    title: "צ׳אט עם הרב",
    content: [
      "שאלות הלכתיות?",
      "התלבטויות רוחניות?",
      "הרב כאן בשבילך!"
    ],
    icon: <MessageCircle className="w-20 h-20" />,
    color: "from-[#8b5cf6] to-[#6d28d9]",
    bgColor: "bg-gradient-to-br from-purple-50 to-violet-50"
  },
  {
    id: 6,
    duration: 4500,
    title: "זמני תפילה",
    content: [
      "כל הזמנים לפי מיקומך",
      "עלות השחר עד צאת הכוכבים",
      "תמיד תדע מתי להתפלל"
    ],
    icon: <Clock className="w-20 h-20" />,
    color: "from-[#06b6d4] to-[#0891b2]",
    bgColor: "bg-gradient-to-br from-cyan-50 to-sky-50"
  },
  {
    id: 7,
    duration: 5000,
    title: "מתחילים!",
    subtitle: "לעלות ולהתעלות",
    content: [
      "למד כל יום",
      "צבור נקודות",
      "הפוך לחלק מהקהילה",
      "בהצלחה!"
    ],
    color: "from-[#C9A227] to-[#9A7B1A]",
    bgColor: "bg-gradient-to-br from-amber-50 to-orange-50"
  }
];

interface AppTutorialProps {
  onClose?: () => void;
}

export default function AppTutorial({ onClose }: AppTutorialProps) {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [showIcon, setShowIcon] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);
  const [totalProgress, setTotalProgress] = useState(0);
  const progressRef = useRef<number>(0);
  const sceneStartTime = useRef<number>(Date.now());

  const scene = scenes[currentScene];
  const isLastScene = currentScene === scenes.length - 1;
  const isFirstScene = currentScene === 0;

  const totalDuration = scenes.reduce((acc, s) => acc + s.duration, 0);

  // Reset scene animations
  const resetSceneAnimations = () => {
    setVisibleLines([]);
    setShowIcon(false);
    setShowTitle(false);
    setShowHighlights(false);
    setProgress(0);
    sceneStartTime.current = Date.now();
  };

  // Scene animation sequence
  useEffect(() => {
    if (!isPlaying) return;

    resetSceneAnimations();

    // Show title after 200ms
    const titleTimer = setTimeout(() => setShowTitle(true), 200);

    // Show icon after 400ms
    const iconTimer = setTimeout(() => setShowIcon(true), 400);

    // Show content lines one by one
    const lineTimers = scene.content.map((_, index) => {
      return setTimeout(() => {
        setVisibleLines(prev => [...prev, index]);
      }, 800 + index * 600);
    });

    // Show highlights near the end
    const highlightTimer = setTimeout(() => {
      setShowHighlights(true);
    }, scene.duration - 1500);

    return () => {
      clearTimeout(titleTimer);
      clearTimeout(iconTimer);
      lineTimers.forEach(t => clearTimeout(t));
      clearTimeout(highlightTimer);
    };
  }, [currentScene, isPlaying, scene.content, scene.duration]);

  // Progress bar and auto-advance
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - sceneStartTime.current;
      const sceneProgress = Math.min((elapsed / scene.duration) * 100, 100);
      setProgress(sceneProgress);

      // Calculate total progress
      const previousDuration = scenes.slice(0, currentScene).reduce((acc, s) => acc + s.duration, 0);
      const currentElapsed = Math.min(elapsed, scene.duration);
      setTotalProgress(((previousDuration + currentElapsed) / totalDuration) * 100);

      if (elapsed >= scene.duration && currentScene < scenes.length - 1) {
        setCurrentScene(prev => prev + 1);
      } else if (elapsed >= scene.duration && isLastScene) {
        setIsPlaying(false);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, currentScene, scene.duration, isLastScene, totalDuration]);

  const handlePlayPause = () => {
    if (!isPlaying) {
      sceneStartTime.current = Date.now() - (progress / 100) * scene.duration;
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setCurrentScene(0);
    setIsPlaying(true);
    setTotalProgress(0);
    resetSceneAnimations();
  };

  const handleSkipToEnd = () => {
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className={`relative w-full max-w-4xl mx-4 h-[600px] rounded-3xl overflow-hidden shadow-2xl ${scene.bgColor} transition-all duration-700`}>

        {/* Video Progress Bar (Top) */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-black/10 z-20">
          <div
            className="h-full bg-gradient-to-l from-[#C9A227] to-[#E8D48A] transition-all duration-100"
            style={{ width: `${totalProgress}%` }}
          />
        </div>

        {/* Scene Progress Dots */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {scenes.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentScene
                  ? "w-8 bg-[#C9A227]"
                  : index < currentScene
                  ? "w-1.5 bg-[#5c7a3a]"
                  : "w-1.5 bg-slate-400"
              }`}
            />
          ))}
        </div>

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 left-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white transition-all shadow-lg"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        )}

        {/* Skip Button */}
        <button
          onClick={handleSkipToEnd}
          className="absolute top-4 right-4 z-20 px-4 py-2 rounded-full bg-white/80 hover:bg-white transition-all shadow-lg text-slate-600 text-sm font-medium"
        >
          דלג
        </button>

        {/* Main Content Area */}
        <div className="relative h-full flex flex-col items-center justify-center px-8 py-16">

          {/* Logo for first/last scene */}
          {(isFirstScene || isLastScene) && (
            <div className={`mb-6 transition-all duration-700 ${showIcon ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}>
              <div className="relative">
                <div className="absolute inset-0 bg-[#C9A227]/30 blur-3xl rounded-full scale-150 animate-pulse" />
                <Image
                  src="/רוח חשמונאית.png"
                  alt="רוח חשמונאית"
                  width={140}
                  height={140}
                  className="relative drop-shadow-2xl"
                />
              </div>
            </div>
          )}

          {/* Icon for other scenes */}
          {scene.icon && !isFirstScene && !isLastScene && (
            <div className={`mb-8 transition-all duration-700 ${showIcon ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-50 translate-y-10"}`}>
              <div className={`p-8 rounded-3xl bg-gradient-to-br ${scene.color} shadow-2xl`}>
                <div className="text-white">
                  {scene.icon}
                </div>
              </div>
            </div>
          )}

          {/* Title */}
          <div className={`text-center mb-6 transition-all duration-700 ${showTitle ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h1 className="text-5xl sm:text-6xl font-bold text-slate-800 mb-2">
              {scene.title}
            </h1>
            {scene.subtitle && (
              <p className="text-2xl text-[#C9A227] font-medium">
                {scene.subtitle}
              </p>
            )}
          </div>

          {/* Content Lines - Typewriter Style */}
          <div className="space-y-4 text-center max-w-2xl">
            {scene.content.map((line, index) => (
              <p
                key={index}
                className={`text-2xl sm:text-3xl text-slate-700 font-medium transition-all duration-500 ${
                  visibleLines.includes(index)
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-10"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {scene.highlights?.some(h => line.includes(h)) ? (
                  <span>
                    {line.split(new RegExp(`(${scene.highlights.join('|')})`)).map((part, i) => (
                      scene.highlights?.includes(part) ? (
                        <span key={i} className="text-[#C9A227] font-bold">{part}</span>
                      ) : (
                        <span key={i}>{part}</span>
                      )
                    ))}
                  </span>
                ) : (
                  line
                )}
              </p>
            ))}
          </div>

          {/* Highlights Pills */}
          {scene.highlights && !isFirstScene && (
            <div className={`flex gap-3 mt-8 transition-all duration-700 ${showHighlights ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              {scene.highlights.map((highlight, index) => (
                <span
                  key={index}
                  className={`px-4 py-2 rounded-full bg-gradient-to-r ${scene.color} text-white font-bold text-lg shadow-lg`}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {highlight}
                </span>
              ))}
            </div>
          )}

          {/* Floating Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 right-[10%] w-4 h-4 bg-[#C9A227] rounded-full animate-float opacity-30" />
            <div className="absolute top-1/3 left-[15%] w-3 h-3 bg-[#5c7a3a] rounded-full animate-float opacity-25" style={{ animationDelay: "1s" }} />
            <div className="absolute bottom-1/4 right-[20%] w-5 h-5 bg-[#E8D48A] rounded-full animate-float opacity-35" style={{ animationDelay: "0.5s" }} />
            <div className="absolute bottom-1/3 left-[10%] w-2 h-2 bg-[#C9A227] rounded-full animate-float opacity-20" style={{ animationDelay: "1.5s" }} />

            {/* Animated circles */}
            <div className="absolute top-[20%] left-[5%] w-32 h-32 border-2 border-[#C9A227]/20 rounded-full animate-ping" style={{ animationDuration: "3s" }} />
            <div className="absolute bottom-[15%] right-[8%] w-24 h-24 border-2 border-[#5c7a3a]/20 rounded-full animate-ping" style={{ animationDuration: "4s" }} />
          </div>
        </div>

        {/* Video Controls (Bottom) */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/20 to-transparent">
          <div className="flex items-center justify-center gap-4">
            {/* Restart */}
            <button
              onClick={handleRestart}
              className="p-3 rounded-full bg-white/90 hover:bg-white transition-all shadow-lg"
            >
              <RotateCcw className="w-5 h-5 text-slate-600" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={handlePlayPause}
              className="p-5 rounded-full bg-gradient-to-br from-[#C9A227] to-[#9A7B1A] hover:shadow-xl transition-all shadow-lg"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" />
              )}
            </button>

            {/* Finish */}
            {isLastScene && !isPlaying && onClose && (
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-full bg-gradient-to-br from-[#5c7a3a] to-[#3d5226] text-white font-bold hover:shadow-xl transition-all shadow-lg"
              >
                בואו נתחיל!
              </button>
            )}
          </div>

          {/* Time indicator */}
          <div className="text-center mt-3 text-slate-600 text-sm">
            {Math.ceil((totalDuration - (totalProgress / 100) * totalDuration) / 1000)} שניות נותרו
          </div>
        </div>

        {/* Scene indicator */}
        <div className="absolute bottom-6 left-6 text-slate-500 text-sm font-medium">
          {currentScene + 1} / {scenes.length}
        </div>
      </div>
    </div>
  );
}
