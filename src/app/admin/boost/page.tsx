"use client";

import { useState, useEffect } from "react";
import Card, { CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { Video, Plus, Trash2, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

interface DailyBoost {
  id: string;
  date: string;
  title: string;
  description: string | null;
  videoUrl: string;
  createdAt: string;
  createdBy: { name: string | null };
}

export default function AdminBoostPage() {
  const [boosts, setBoosts] = useState<DailyBoost[]>([]);
  const [hasTodayBoost, setHasTodayBoost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    title: "",
    description: "",
    videoUrl: "",
  });

  useEffect(() => {
    fetchBoosts();
  }, []);

  const fetchBoosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/boost");
      const data = await res.json();

      if (data.boosts) {
        setBoosts(data.boosts);
        setHasTodayBoost(data.hasTodayBoost);
      }
    } catch (error) {
      console.error("Failed to fetch boosts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.videoUrl) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/boost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({
          date: format(new Date(), "yyyy-MM-dd"),
          title: "",
          description: "",
          videoUrl: "",
        });
        setShowForm(false);
        fetchBoosts();
      } else {
        const data = await res.json();
        alert(data.error || "שגיאה ביצירת חיזוק");
      }
    } catch (error) {
      console.error("Failed to create boost:", error);
      alert("שגיאה ביצירת חיזוק");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק חיזוק זה?")) return;

    try {
      const res = await fetch(`/api/admin/boost?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchBoosts();
      }
    } catch (error) {
      console.error("Failed to delete boost:", error);
    }
  };

  const extractVideoId = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
    );
    return match ? match[1] : null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">חיזוק יומי</h1>
          <p className="text-muted">ניהול סרטוני חיזוק יומיים</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={18} className="ml-2" />
          הוסף חיזוק
        </Button>
      </div>

      {/* Today Status */}
      {hasTodayBoost ? (
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
          <CheckCircle className="text-green-500" size={24} />
          <p className="text-green-700 dark:text-green-300">
            יש חיזוק להיום! החיילים יכולים לצפות בו.
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
          <AlertCircle className="text-orange-500" size={24} />
          <p className="text-orange-700 dark:text-orange-300">
            עדיין אין חיזוק להיום. הוסף חיזוק כדי שהחיילים יוכלו לצפות.
          </p>
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>הוספת חיזוק חדש</CardTitle>
            <CardDescription>
              הזן את פרטי הסרטון לחיזוק היומי
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">תאריך</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-card-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">כותרת</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="כותרת החיזוק"
                  className="w-full px-4 py-2 rounded-lg border border-card-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  תיאור (אופציונלי)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="תיאור קצר של הסרטון"
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-card-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  קישור לסרטון (YouTube)
                </label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, videoUrl: e.target.value })
                  }
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-2 rounded-lg border border-card-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>

              {/* Video Preview */}
              {formData.videoUrl && extractVideoId(formData.videoUrl) && (
                <div className="aspect-video rounded-lg overflow-hidden bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${extractVideoId(
                      formData.videoUrl
                    )}`}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              )}

              <div className="flex gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "שומר..." : "שמור חיזוק"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowForm(false)}
                >
                  ביטול
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Boosts List */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video size={20} className="text-primary" />
            חיזוקים קודמים
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted">טוען...</div>
          ) : boosts.length === 0 ? (
            <div className="text-center py-8 text-muted">
              אין חיזוקים עדיין
            </div>
          ) : (
            <div className="space-y-4">
              {boosts.map((boost) => {
                const videoId = extractVideoId(boost.videoUrl);
                const isToday =
                  new Date(boost.date).toDateString() ===
                  new Date().toDateString();

                return (
                  <div
                    key={boost.id}
                    className={`p-4 rounded-lg border ${
                      isToday
                        ? "border-green-500 bg-green-50 dark:bg-green-950"
                        : "border-card-border bg-background"
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      {videoId && (
                        <div className="w-32 h-20 rounded overflow-hidden flex-shrink-0 bg-black">
                          <img
                            src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold">{boost.title}</h3>
                              {isToday && (
                                <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                                  היום
                                </span>
                              )}
                            </div>
                            {boost.description && (
                              <p className="text-sm text-muted mt-1">
                                {boost.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted">
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {format(new Date(boost.date), "dd/MM/yyyy", {
                                  locale: he,
                                })}
                              </span>
                              <span>נוצר ע"י {boost.createdBy.name || "מנהל"}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDelete(boost.id)}
                            className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
