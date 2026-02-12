"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEngagement } from "@/hooks/use-engagement";
import { BookOpen, ChevronDown, ChevronUp, CheckCircle2, Sparkles, Heart, Video, Loader2, Award } from "lucide-react";

interface AdminContent {
  id: string;
  type: string;
  title: string;
  description: string | null;
  content: string | null;
  videoUrl: string | null;
  createdAt: string;
}

interface DailyContent {
  mishnah: {
    ref: string;
    heRef: string;
    text: string[];
  } | null;
  rambam: {
    ref: string;
    heRef: string;
    text: string[];
  } | null;
  chassidut: AdminContent | null;
  musar: AdminContent | null;
  thought: AdminContent | null;
  dailyVideo: AdminContent | null;
}

// Helper to get today's date key
const getTodayKey = () => {
  const today = new Date();
  return `daily-completed-${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
};

export default function DailyPage() {
  const [content, setContent] = useState<DailyContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>("mishnah");
  const [completed, setCompleted] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [completing, setCompleting] = useState(false);

  // Pause tracking when video section is expanded (video time doesn't count for points)
  const isWatchingVideo = expandedSection === "video";

  // Track engagement in the background (no visible timer)
  const { duration } = useEngagement({
    contentType: "DAILY",
    paused: isWatchingVideo, // Don't count video watching time
    autoSaveInterval: 30000, // Auto-save every 30 seconds
    onSessionEnd: (data) => {
      console.log("[DailyPage] Session ended:", data);
    },
  });

  // Load completion state from localStorage
  useEffect(() => {
    const todayKey = getTodayKey();
    const savedCompletion = localStorage.getItem(todayKey);
    if (savedCompletion) {
      const data = JSON.parse(savedCompletion);
      setCompleted(true);
      setPointsEarned(data.pointsEarned || 0);
    }

    // Clean up old completion keys (older than today)
    const allKeys = Object.keys(localStorage);
    allKeys.forEach((key) => {
      if (key.startsWith("daily-completed-") && key !== todayKey) {
        localStorage.removeItem(key);
      }
    });
  }, []);

  useEffect(() => {
    fetchDailyContent();
  }, []);

  const fetchDailyContent = async () => {
    try {
      const res = await fetch("/api/daily");
      const data = await res.json();
      setContent(data);
    } catch (error) {
      console.error("Failed to fetch daily content:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleComplete = async () => {
    if (completing || completed) return;
    setCompleting(true);

    try {
      // Manually save a completion bonus
      const bonusPoints = 5; // Bonus for completing daily learning
      const durationMinutes = Math.floor(duration / 60000);
      const basePoints = Math.floor(durationMinutes / 5); // 1 point per 5 minutes

      const res = await fetch("/api/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: "DAILY",
          duration: duration,
          verified: true,
          pointsEarned: basePoints + bonusPoints,
          contentRef: "daily-completion",
        }),
      });

      const data = await res.json();
      console.log("[DailyPage] Completion saved:", data);

      if (data.success) {
        const earnedPoints = data.pointsEarned || basePoints + bonusPoints;
        setPointsEarned(earnedPoints);
        setCompleted(true);

        // Save completion state to localStorage for today
        const todayKey = getTodayKey();
        localStorage.setItem(todayKey, JSON.stringify({
          completed: true,
          pointsEarned: earnedPoints,
          completedAt: new Date().toISOString(),
        }));
      } else {
        alert("שגיאה בשמירת הלימוד");
      }
    } catch (error) {
      console.error("Failed to save completion:", error);
      alert("שגיאה בשמירת הלימוד");
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gold/20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
        <p className="text-slate-600 animate-pulse">טוען לימוד יומי...</p>
      </div>
    );
  }

  return (
    <div className="relative py-6 space-y-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-white border border-sky-200 rounded-2xl overflow-hidden liquid-glass"
      >
        {/* Gold top line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />

        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-gold to-gold-dark rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">לימוד יומי</h1>
              <p className="text-slate-700 text-sm">משנה יומית ורמב״ם - לעלות ולהתעלות</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Learning Sections */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4"
      >
        {/* Mishnah Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white border border-sky-200 rounded-xl overflow-hidden card-interactive shine-effect"
        >
          <button
            onClick={() => toggleSection("mishnah")}
            className="w-full text-right p-5 flex items-center justify-between hover:bg-sky-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-lg">משנה יומית</h2>
                {content?.mishnah && (
                  <p className="text-sm text-slate-700 mt-0.5">{content.mishnah.heRef}</p>
                )}
              </div>
            </div>
            <div className={`p-2 rounded-lg transition-colors ${expandedSection === "mishnah" ? "bg-gold/20 text-gold" : "bg-sky-50 text-slate-700"}`}>
              {expandedSection === "mishnah" ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </button>

          <AnimatePresence>
          {expandedSection === "mishnah" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
            <div className="px-5 pb-5 border-t border-sky-200">
              {content?.mishnah ? (
                <div className="pt-5 text-lg text-slate-800 leading-[2] space-y-4">
                  {content.mishnah.text.map((paragraph, i) => (
                    <p key={i} className="relative pr-8">
                      <span className="absolute right-0 top-0 text-gold font-bold text-sm">
                        ({i + 1})
                      </span>
                      <span dangerouslySetInnerHTML={{ __html: paragraph }} />
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-slate-700 py-4">לא נמצא לימוד להיום</p>
              )}
            </div>
            </motion.div>
          )}
          </AnimatePresence>
        </motion.div>

        {/* Rambam Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white border border-sky-200 rounded-xl overflow-hidden card-interactive shine-effect"
        >
          <button
            onClick={() => toggleSection("rambam")}
            className="w-full text-right p-5 flex items-center justify-between hover:bg-sky-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-lg">רמב״ם יומי</h2>
                {content?.rambam && (
                  <p className="text-sm text-slate-700 mt-0.5">{content.rambam.heRef}</p>
                )}
              </div>
            </div>
            <div className={`p-2 rounded-lg transition-colors ${expandedSection === "rambam" ? "bg-violet-500/20 text-violet-400" : "bg-sky-50 text-slate-700"}`}>
              {expandedSection === "rambam" ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </button>

          <AnimatePresence>
          {expandedSection === "rambam" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
            <div className="px-5 pb-5 border-t border-sky-200">
              {content?.rambam ? (
                <div className="pt-5 text-lg text-slate-800 leading-[2] space-y-4">
                  {content.rambam.text.map((paragraph, i) => (
                    <p key={i} className="relative pr-8">
                      <span className="absolute right-0 top-0 text-violet-400 font-bold text-sm">
                        ({i + 1})
                      </span>
                      <span dangerouslySetInnerHTML={{ __html: paragraph }} />
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-slate-700 py-4">לא נמצא לימוד להיום</p>
              )}
            </div>
            </motion.div>
          )}
          </AnimatePresence>
        </motion.div>

        {/* Daily Video Section */}
        {content?.dailyVideo && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-white border border-sky-200 rounded-xl overflow-hidden card-interactive shine-effect"
          >
            <button
              onClick={() => toggleSection("video")}
              className="w-full text-right p-5 flex items-center justify-between hover:bg-sky-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800 text-lg">סרטון חיזוק יומי</h2>
                  <p className="text-sm text-slate-700 mt-0.5">{content.dailyVideo.title}</p>
                </div>
              </div>
              <div className={`p-2 rounded-lg transition-colors ${expandedSection === "video" ? "bg-rose-500/20 text-rose-400" : "bg-sky-50 text-slate-700"}`}>
                {expandedSection === "video" ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </div>
            </button>

            <AnimatePresence>
            {expandedSection === "video" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
              <div className="px-5 pb-5 border-t border-sky-200">
                <div className="pt-5">
                  {content.dailyVideo.description && (
                    <p className="text-slate-600 mb-4">{content.dailyVideo.description}</p>
                  )}
                  {content.dailyVideo.videoUrl && (
                    <div className="space-y-4">
                      {/* Embedded Video Player */}
                      <div className="aspect-video bg-black rounded-xl overflow-hidden">
                        {content.dailyVideo.videoUrl.includes('youtube.com') || content.dailyVideo.videoUrl.includes('youtu.be') ? (
                          <iframe
                            src={`https://www.youtube.com/embed/${content.dailyVideo.videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/)?.[1] || ''}`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : content.dailyVideo.videoUrl.includes('vimeo.com') ? (
                          <iframe
                            src={`https://player.vimeo.com/video/${content.dailyVideo.videoUrl.match(/vimeo\.com\/(\d+)/)?.[1] || ''}`}
                            className="w-full h-full"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <video
                            src={content.dailyVideo.videoUrl}
                            controls
                            className="w-full h-full"
                          >
                            הדפדפן שלך לא תומך בתגית וידאו.
                          </video>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              </motion.div>
            )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Chassidut Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-white border border-sky-200 rounded-xl overflow-hidden card-interactive shine-effect"
        >
          <button
            onClick={() => toggleSection("chassidut")}
            className="w-full text-right p-5 flex items-center justify-between hover:bg-sky-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-gold to-gold-dark rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-lg">חסידות יומית</h2>
                {content?.chassidut && (
                  <p className="text-sm text-slate-700 mt-0.5">{content.chassidut.title}</p>
                )}
              </div>
            </div>
            <div className={`p-2 rounded-lg transition-colors ${expandedSection === "chassidut" ? "bg-gold/20 text-gold" : "bg-sky-50 text-slate-700"}`}>
              {expandedSection === "chassidut" ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </button>

          <AnimatePresence>
          {expandedSection === "chassidut" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
            <div className="px-5 pb-5 border-t border-sky-200">
              {content?.chassidut ? (
                <div className="pt-5">
                  {content.chassidut.description && (
                    <p className="text-slate-600 text-sm mb-3">{content.chassidut.description}</p>
                  )}
                  <div className="text-lg text-slate-800 leading-[2] whitespace-pre-wrap">
                    {content.chassidut.content}
                  </div>
                </div>
              ) : (
                <div className="pt-5 text-center py-8">
                  <Sparkles className="w-12 h-12 text-gold/30 mx-auto mb-3" />
                  <p className="text-slate-700">לא הועלה תוכן חסידות להיום</p>
                </div>
              )}
            </div>
            </motion.div>
          )}
          </AnimatePresence>
        </motion.div>

        {/* Musar Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="bg-white border border-sky-200 rounded-xl overflow-hidden card-interactive shine-effect"
        >
          <button
            onClick={() => toggleSection("musar")}
            className="w-full text-right p-5 flex items-center justify-between hover:bg-sky-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-lg">מוסר יומי</h2>
                {content?.musar && (
                  <p className="text-sm text-slate-700 mt-0.5">{content.musar.title}</p>
                )}
              </div>
            </div>
            <div className={`p-2 rounded-lg transition-colors ${expandedSection === "musar" ? "bg-emerald-500/20 text-emerald-400" : "bg-sky-50 text-slate-700"}`}>
              {expandedSection === "musar" ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </button>

          <AnimatePresence>
          {expandedSection === "musar" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
            <div className="px-5 pb-5 border-t border-sky-200">
              {content?.musar ? (
                <div className="pt-5">
                  {content.musar.description && (
                    <p className="text-slate-600 text-sm mb-3">{content.musar.description}</p>
                  )}
                  <div className="text-lg text-slate-800 leading-[2] whitespace-pre-wrap">
                    {content.musar.content}
                  </div>
                </div>
              ) : (
                <div className="pt-5 text-center py-8">
                  <Heart className="w-12 h-12 text-emerald-500/30 mx-auto mb-3" />
                  <p className="text-slate-700">לא הועלה תוכן מוסר להיום</p>
                </div>
              )}
            </div>
            </motion.div>
          )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Complete Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="pt-2"
      >
        {completed ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 text-center glow-gold"
          >
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
            <p className="font-bold text-slate-800 text-lg">כל הכבוד!</p>
            <p className="text-emerald-400 text-sm">סיימת את הלימוד היומי</p>
            {pointsEarned > 0 && (
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-3 flex items-center justify-center gap-2 text-gold"
              >
                <Award className="w-5 h-5" />
                <span className="font-bold">+{pointsEarned} נקודות נוספו!</span>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleComplete}
            disabled={completing}
            className="w-full py-4 bg-gradient-to-l from-gold to-gold-dark text-[#0a0a0a] rounded-xl font-bold text-lg shadow-lg shadow-gold/20 hover:shadow-xl hover:shadow-gold/30 transition-all disabled:opacity-70 btn-premium"
          >
            {completing ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                שומר...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                סיימתי את הלימוד היומי
              </span>
            )}
          </motion.button>
        )}
      </motion.div>

      {/* Daily tip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="bg-gold/10 border border-gold/30 rounded-xl p-4 text-center animate-float"
      >
        <p className="text-slate-700 text-sm">
          <span className="font-bold text-gradient-animated">טיפ:</span> לימוד קבוע בכל יום בונה רצף ומגדיל את הנקודות שלך!
        </p>
      </motion.div>
    </div>
  );
}
