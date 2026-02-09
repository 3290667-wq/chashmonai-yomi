"use client";

import { useState, useEffect } from "react";
import { useEngagement } from "@/hooks/use-engagement";
import { BookOpen, Clock, Award, ChevronDown, ChevronUp, CheckCircle2, Sparkles, Heart, Video, Play, Loader2 } from "lucide-react";

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

export default function DailyPage() {
  const [content, setContent] = useState<DailyContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>("mishnah");
  const [completed, setCompleted] = useState(false);

  const { formattedDuration, isEngaged, estimatedPoints } = useEngagement({
    contentType: "DAILY",
  });

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
    setCompleted(true);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gold/20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
        <p className="text-white/60 animate-pulse">טוען לימוד יומי...</p>
      </div>
    );
  }

  return (
    <div className="relative py-6 space-y-6">
      {/* Aurora Background */}
      <div className="aurora-bg" />

      {/* Header with Timer */}
      <div className="relative bg-[#1e1e1e] border border-white/10 rounded-2xl overflow-hidden">
        {/* Gold top line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />

        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-gold to-gold-dark rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">לימוד יומי</h1>
              <p className="text-white/50 text-sm">משנה יומית ורמב״ם - לעלות ולהתעלות</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Timer */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#121212] border border-white/10 rounded-xl">
              <Clock className="w-5 h-5 text-gold" />
              <span className="font-mono text-lg font-bold text-white">{formattedDuration}</span>
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isEngaged ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                }`}
              />
            </div>

            {/* Points */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gold/10 border border-gold/30 rounded-xl">
              <Award className="w-5 h-5 text-gold" />
              <span className="font-bold text-lg text-white">+{estimatedPoints}</span>
              <span className="text-white/50 text-sm">נקודות</span>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Sections */}
      <div className="space-y-4">
        {/* Mishnah Section */}
        <div className="bg-[#1e1e1e] border border-white/10 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection("mishnah")}
            className="w-full text-right p-5 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white text-lg">משנה יומית</h2>
                {content?.mishnah && (
                  <p className="text-sm text-white/50 mt-0.5">{content.mishnah.heRef}</p>
                )}
              </div>
            </div>
            <div className={`p-2 rounded-lg transition-colors ${expandedSection === "mishnah" ? "bg-gold/20 text-gold" : "bg-white/5 text-white/50"}`}>
              {expandedSection === "mishnah" ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </button>

          {expandedSection === "mishnah" && (
            <div className="px-5 pb-5 border-t border-white/10">
              {content?.mishnah ? (
                <div className="pt-5 text-lg text-white/90 leading-[2] space-y-4">
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
                <p className="text-white/50 py-4">לא נמצא לימוד להיום</p>
              )}
            </div>
          )}
        </div>

        {/* Rambam Section */}
        <div className="bg-[#1e1e1e] border border-white/10 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection("rambam")}
            className="w-full text-right p-5 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white text-lg">רמב״ם יומי</h2>
                {content?.rambam && (
                  <p className="text-sm text-white/50 mt-0.5">{content.rambam.heRef}</p>
                )}
              </div>
            </div>
            <div className={`p-2 rounded-lg transition-colors ${expandedSection === "rambam" ? "bg-violet-500/20 text-violet-400" : "bg-white/5 text-white/50"}`}>
              {expandedSection === "rambam" ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </button>

          {expandedSection === "rambam" && (
            <div className="px-5 pb-5 border-t border-white/10">
              {content?.rambam ? (
                <div className="pt-5 text-lg text-white/90 leading-[2] space-y-4">
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
                <p className="text-white/50 py-4">לא נמצא לימוד להיום</p>
              )}
            </div>
          )}
        </div>

        {/* Daily Video Section */}
        {content?.dailyVideo && (
          <div className="bg-[#1e1e1e] border border-white/10 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection("video")}
              className="w-full text-right p-5 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-white text-lg">סרטון חיזוק יומי</h2>
                  <p className="text-sm text-white/50 mt-0.5">{content.dailyVideo.title}</p>
                </div>
              </div>
              <div className={`p-2 rounded-lg transition-colors ${expandedSection === "video" ? "bg-rose-500/20 text-rose-400" : "bg-white/5 text-white/50"}`}>
                {expandedSection === "video" ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </div>
            </button>

            {expandedSection === "video" && (
              <div className="px-5 pb-5 border-t border-white/10">
                <div className="pt-5">
                  {content.dailyVideo.description && (
                    <p className="text-white/60 mb-4">{content.dailyVideo.description}</p>
                  )}
                  {content.dailyVideo.videoUrl && (
                    <a
                      href={content.dailyVideo.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-l from-rose-500 to-rose-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                      <Play className="w-5 h-5" />
                      צפה בסרטון
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chassidut Section */}
        <div className="bg-[#1e1e1e] border border-white/10 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection("chassidut")}
            className="w-full text-right p-5 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-gold to-gold-dark rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white text-lg">חסידות יומית</h2>
                {content?.chassidut && (
                  <p className="text-sm text-white/50 mt-0.5">{content.chassidut.title}</p>
                )}
              </div>
            </div>
            <div className={`p-2 rounded-lg transition-colors ${expandedSection === "chassidut" ? "bg-gold/20 text-gold" : "bg-white/5 text-white/50"}`}>
              {expandedSection === "chassidut" ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </button>

          {expandedSection === "chassidut" && (
            <div className="px-5 pb-5 border-t border-white/10">
              {content?.chassidut ? (
                <div className="pt-5">
                  {content.chassidut.description && (
                    <p className="text-white/60 text-sm mb-3">{content.chassidut.description}</p>
                  )}
                  <div className="text-lg text-white/90 leading-[2] whitespace-pre-wrap">
                    {content.chassidut.content}
                  </div>
                </div>
              ) : (
                <div className="pt-5 text-center py-8">
                  <Sparkles className="w-12 h-12 text-gold/30 mx-auto mb-3" />
                  <p className="text-white/50">לא הועלה תוכן חסידות להיום</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Musar Section */}
        <div className="bg-[#1e1e1e] border border-white/10 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection("musar")}
            className="w-full text-right p-5 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white text-lg">מוסר יומי</h2>
                {content?.musar && (
                  <p className="text-sm text-white/50 mt-0.5">{content.musar.title}</p>
                )}
              </div>
            </div>
            <div className={`p-2 rounded-lg transition-colors ${expandedSection === "musar" ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/50"}`}>
              {expandedSection === "musar" ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </button>

          {expandedSection === "musar" && (
            <div className="px-5 pb-5 border-t border-white/10">
              {content?.musar ? (
                <div className="pt-5">
                  {content.musar.description && (
                    <p className="text-white/60 text-sm mb-3">{content.musar.description}</p>
                  )}
                  <div className="text-lg text-white/90 leading-[2] whitespace-pre-wrap">
                    {content.musar.content}
                  </div>
                </div>
              ) : (
                <div className="pt-5 text-center py-8">
                  <Heart className="w-12 h-12 text-emerald-500/30 mx-auto mb-3" />
                  <p className="text-white/50">לא הועלה תוכן מוסר להיום</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Complete Button */}
      <div className="pt-2">
        {completed ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
            <p className="font-bold text-white text-lg">כל הכבוד!</p>
            <p className="text-emerald-400 text-sm">סיימת את הלימוד היומי</p>
          </div>
        ) : (
          <button
            onClick={handleComplete}
            className="w-full py-4 bg-gradient-to-l from-gold to-gold-dark text-[#0a0a0a] rounded-xl font-bold text-lg shadow-lg shadow-gold/20 hover:shadow-xl hover:shadow-gold/30 transition-all active:scale-[0.98]"
          >
            <span className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              סיימתי את הלימוד היומי
            </span>
          </button>
        )}
      </div>

      {/* Daily tip */}
      <div className="bg-gold/10 border border-gold/30 rounded-xl p-4 text-center">
        <p className="text-white/80 text-sm">
          <span className="font-bold text-gold">טיפ:</span> לימוד קבוע בכל יום בונה רצף ומגדיל את הנקודות שלך!
        </p>
      </div>
    </div>
  );
}
