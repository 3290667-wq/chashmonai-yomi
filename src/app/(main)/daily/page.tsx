"use client";

import { useState, useEffect } from "react";
import { useEngagement } from "@/hooks/use-engagement";
import { BookOpen, Clock, Award, ChevronDown, ChevronUp, CheckCircle2, Sparkles } from "lucide-react";

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
    // TODO: Send completion to server
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-sky-light border-t-sky-dark rounded-full animate-spin" />
        <p className="text-brown-light animate-pulse">טוען לימוד יומי...</p>
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-6 space-y-5">
      {/* Header with Timer */}
      <div className="bg-gradient-to-l from-brown-dark to-brown-medium rounded-2xl p-5 sm:p-6 text-cream relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute left-0 bottom-0 w-40 h-40 bg-white/5 rounded-full -translate-x-1/2 translate-y-1/2" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-6 h-6" />
            <h1 className="text-2xl font-bold">לימוד יומי</h1>
          </div>
          <p className="text-cream/70 text-sm mb-4">משנה יומית ורמב״ם - לעלות ולהתעלות</p>

          <div className="flex flex-wrap items-center gap-3">
            {/* Timer */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5">
              <Clock className="w-5 h-5 text-sky-light" />
              <span className="font-mono text-lg font-bold">{formattedDuration}</span>
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isEngaged ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                }`}
              />
            </div>

            {/* Points */}
            <div className="flex items-center gap-2 bg-amber-500/20 backdrop-blur-sm rounded-xl px-4 py-2.5">
              <Award className="w-5 h-5 text-amber-300" />
              <span className="font-bold text-lg">+{estimatedPoints}</span>
              <span className="text-cream/70 text-sm">נקודות</span>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Sections */}
      <div className="space-y-4">
        {/* Mishnah Section */}
        <div className="bg-white rounded-2xl border border-cream-dark/50 overflow-hidden shadow-sm">
          <button
            onClick={() => toggleSection("mishnah")}
            className="w-full text-right p-4 sm:p-5 flex items-center justify-between hover:bg-cream/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-sky-medium to-sky-dark rounded-xl flex items-center justify-center shadow-md">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-brown-dark text-lg">משנה יומית</h2>
                {content?.mishnah && (
                  <p className="text-sm text-brown-light mt-0.5">
                    {content.mishnah.heRef}
                  </p>
                )}
              </div>
            </div>
            <div className={`p-2 rounded-lg transition-colors ${expandedSection === "mishnah" ? "bg-sky-light" : "bg-cream"}`}>
              {expandedSection === "mishnah" ? (
                <ChevronUp className="w-5 h-5 text-brown-medium" />
              ) : (
                <ChevronDown className="w-5 h-5 text-brown-light" />
              )}
            </div>
          </button>

          {expandedSection === "mishnah" && (
            <div className="px-4 sm:px-6 pb-5 border-t border-cream-dark/30">
              {content?.mishnah ? (
                <div className="pt-5 font-learning text-lg text-brown-dark leading-[2] space-y-4">
                  {content.mishnah.text.map((paragraph, i) => (
                    <p key={i} className="relative pr-8">
                      <span className="absolute right-0 top-0 text-sky-dark font-bold text-sm font-sans">
                        ({i + 1})
                      </span>
                      <span dangerouslySetInnerHTML={{ __html: paragraph }} />
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-brown-light py-4">לא נמצא לימוד להיום</p>
              )}
            </div>
          )}
        </div>

        {/* Rambam Section */}
        <div className="bg-white rounded-2xl border border-cream-dark/50 overflow-hidden shadow-sm">
          <button
            onClick={() => toggleSection("rambam")}
            className="w-full text-right p-4 sm:p-5 flex items-center justify-between hover:bg-cream/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-md">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-brown-dark text-lg">רמב״ם יומי</h2>
                {content?.rambam && (
                  <p className="text-sm text-brown-light mt-0.5">
                    {content.rambam.heRef}
                  </p>
                )}
              </div>
            </div>
            <div className={`p-2 rounded-lg transition-colors ${expandedSection === "rambam" ? "bg-amber-100" : "bg-cream"}`}>
              {expandedSection === "rambam" ? (
                <ChevronUp className="w-5 h-5 text-brown-medium" />
              ) : (
                <ChevronDown className="w-5 h-5 text-brown-light" />
              )}
            </div>
          </button>

          {expandedSection === "rambam" && (
            <div className="px-4 sm:px-6 pb-5 border-t border-cream-dark/30">
              {content?.rambam ? (
                <div className="pt-5 font-learning text-lg text-brown-dark leading-[2] space-y-4">
                  {content.rambam.text.map((paragraph, i) => (
                    <p key={i} className="relative pr-8">
                      <span className="absolute right-0 top-0 text-amber-600 font-bold text-sm font-sans">
                        ({i + 1})
                      </span>
                      <span dangerouslySetInnerHTML={{ __html: paragraph }} />
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-brown-light py-4">לא נמצא לימוד להיום</p>
              )}
            </div>
          )}
        </div>

        {/* Chassidut Section */}
        <div className="bg-white rounded-2xl border border-cream-dark/50 overflow-hidden shadow-sm">
          <button
            onClick={() => toggleSection("chassidut")}
            className="w-full text-right p-4 sm:p-5 flex items-center justify-between hover:bg-cream/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-violet-600 rounded-xl flex items-center justify-center shadow-md">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-brown-dark text-lg">חסידות ומוסר</h2>
                <p className="text-sm text-brown-light mt-0.5">מחשבה יומית</p>
              </div>
            </div>
            <div className={`p-2 rounded-lg transition-colors ${expandedSection === "chassidut" ? "bg-violet-100" : "bg-cream"}`}>
              {expandedSection === "chassidut" ? (
                <ChevronUp className="w-5 h-5 text-brown-medium" />
              ) : (
                <ChevronDown className="w-5 h-5 text-brown-light" />
              )}
            </div>
          </button>

          {expandedSection === "chassidut" && (
            <div className="px-4 sm:px-6 pb-5 border-t border-cream-dark/30">
              <div className="pt-5 text-center py-8">
                <Sparkles className="w-12 h-12 text-violet-300 mx-auto mb-3" />
                <p className="text-brown-light">תוכן זה יתווסף בקרוב...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Complete Button */}
      <div className="pt-2">
        {completed ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-emerald-700 text-lg">כל הכבוד!</p>
            <p className="text-emerald-600 text-sm">סיימת את הלימוד היומי</p>
          </div>
        ) : (
          <button
            onClick={handleComplete}
            className="w-full py-4 bg-gradient-to-l from-brown-dark to-brown-medium text-cream rounded-2xl font-bold text-lg hover:shadow-lg transition-all active:scale-[0.98]"
          >
            <span className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              סיימתי את הלימוד היומי
            </span>
          </button>
        )}
      </div>

      {/* Daily tip */}
      <div className="bg-gradient-to-l from-sky-light/50 to-sky-medium/50 rounded-2xl p-4 text-center">
        <p className="text-brown-dark text-sm">
          <span className="font-bold">טיפ:</span> לימוד קבוע בכל יום בונה רצף ומגדיל את הנקודות שלך!
        </p>
      </div>
    </div>
  );
}
