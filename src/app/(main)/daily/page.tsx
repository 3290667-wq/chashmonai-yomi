"use client";

import { useState, useEffect } from "react";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { useEngagement } from "@/hooks/use-engagement";
import { BookOpen, Clock, Award, ChevronDown, ChevronUp } from "lucide-react";

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

  if (loading) {
    return (
      <div className="py-6 flex justify-center">
        <div className="animate-pulse text-muted">טוען לימוד יומי...</div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6">
      {/* Header with Timer */}
      <div className="bg-gradient-to-l from-primary to-primary-light rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-4">לימוד יומי</h1>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock size={20} />
              <span className="text-lg font-mono">{formattedDuration}</span>
            </div>
            <div
              className={`w-3 h-3 rounded-full ${
                isEngaged ? "bg-green-400 animate-pulse" : "bg-red-400"
              }`}
            />
          </div>

          <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
            <Award size={18} className="text-secondary" />
            <span className="font-bold">+{estimatedPoints}</span>
          </div>
        </div>
      </div>

      {/* Mishnah Section */}
      <Card variant="bordered">
        <button
          onClick={() => toggleSection("mishnah")}
          className="w-full text-right"
        >
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <BookOpen className="text-white" size={20} />
              </div>
              <div>
                <CardTitle>משנה יומית</CardTitle>
                {content?.mishnah && (
                  <p className="text-sm text-muted mt-1">
                    {content.mishnah.heRef}
                  </p>
                )}
              </div>
            </div>
            {expandedSection === "mishnah" ? (
              <ChevronUp className="text-muted" />
            ) : (
              <ChevronDown className="text-muted" />
            )}
          </CardHeader>
        </button>

        {expandedSection === "mishnah" && (
          <CardContent>
            {content?.mishnah ? (
              <div className="prose prose-lg max-w-none text-foreground leading-relaxed">
                {content.mishnah.text.map((paragraph, i) => (
                  <p key={i} className="mb-4">
                    <span className="text-muted text-sm ml-2">({i + 1})</span>
                    <span dangerouslySetInnerHTML={{ __html: paragraph }} />
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-muted">לא נמצא לימוד להיום</p>
            )}
          </CardContent>
        )}
      </Card>

      {/* Rambam Section */}
      <Card variant="bordered">
        <button
          onClick={() => toggleSection("rambam")}
          className="w-full text-right"
        >
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <BookOpen className="text-white" size={20} />
              </div>
              <div>
                <CardTitle>רמב"ם יומי</CardTitle>
                {content?.rambam && (
                  <p className="text-sm text-muted mt-1">
                    {content.rambam.heRef}
                  </p>
                )}
              </div>
            </div>
            {expandedSection === "rambam" ? (
              <ChevronUp className="text-muted" />
            ) : (
              <ChevronDown className="text-muted" />
            )}
          </CardHeader>
        </button>

        {expandedSection === "rambam" && (
          <CardContent>
            {content?.rambam ? (
              <div className="prose prose-lg max-w-none text-foreground leading-relaxed">
                {content.rambam.text.map((paragraph, i) => (
                  <p key={i} className="mb-4">
                    <span className="text-muted text-sm ml-2">({i + 1})</span>
                    <span dangerouslySetInnerHTML={{ __html: paragraph }} />
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-muted">לא נמצא לימוד להיום</p>
            )}
          </CardContent>
        )}
      </Card>

      {/* Chassidut Section (Placeholder) */}
      <Card variant="bordered">
        <button
          onClick={() => toggleSection("chassidut")}
          className="w-full text-right"
        >
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <BookOpen className="text-white" size={20} />
              </div>
              <div>
                <CardTitle>חסידות ומוסר</CardTitle>
                <p className="text-sm text-muted mt-1">מחשבה יומית</p>
              </div>
            </div>
            {expandedSection === "chassidut" ? (
              <ChevronUp className="text-muted" />
            ) : (
              <ChevronDown className="text-muted" />
            )}
          </CardHeader>
        </button>

        {expandedSection === "chassidut" && (
          <CardContent>
            <p className="text-muted">תוכן זה יתווסף בקרוב...</p>
          </CardContent>
        )}
      </Card>

      {/* Mark as Complete */}
      <div className="flex justify-center">
        <Button size="lg" className="px-8">
          סיימתי את הלימוד היומי
        </Button>
      </div>
    </div>
  );
}
