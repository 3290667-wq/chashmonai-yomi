"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Video,
  Plus,
  ChevronRight,
  Edit2,
  Trash2,
  ExternalLink,
  Play,
  BookOpen,
  Sparkles,
  Heart,
  FileText,
  Upload,
  Loader2,
} from "lucide-react";

interface Content {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  type: string;
  videoUrl: string | null;
  platoon: string | null;
  createdAt: string;
  createdBy: {
    name: string | null;
  };
}

const CONTENT_TYPES = [
  { value: "VIDEO", label: "סרטון חיזוק", icon: Video, color: "from-violet-400 to-violet-600" },
  { value: "CHASSIDUT", label: "חסידות יומית", icon: Sparkles, color: "from-amber-400 to-amber-600" },
  { value: "MUSAR", label: "מוסר יומי", icon: Heart, color: "from-rose-400 to-rose-600" },
  { value: "THOUGHT", label: "מחשבה יומית", icon: BookOpen, color: "from-sky-400 to-sky-600" },
  { value: "ARTICLE", label: "מאמר", icon: FileText, color: "from-emerald-400 to-emerald-600" },
];

export default function ContentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    type: "VIDEO",
    videoUrl: "",
    platoon: "",
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const isAdmin = session?.user?.role === "ADMIN";
  const isRam = session?.user?.role === "RAM";

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || "שגיאה בהעלאה");
        return;
      }

      setFormData(prev => ({ ...prev, videoUrl: data.url }));
    } catch (error) {
      setUploadError("שגיאה בהעלאת הקובץ");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (status === "loading") return;
    if (!isAdmin && !isRam) {
      router.push("/dashboard");
      return;
    }
    fetchContents();
  }, [status, isAdmin, isRam, router]);

  const fetchContents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/content");
      if (res.ok) {
        const data = await res.json();
        setContents(data.contents || []);
      }
    } catch (error) {
      console.error("Failed to fetch contents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingContent ? "PATCH" : "POST";
      const body = editingContent
        ? { ...formData, id: editingContent.id }
        : formData;

      // For RAMs, auto-assign their platoon
      if (isRam && !isAdmin && session?.user?.platoon) {
        body.platoon = session.user.platoon;
      }

      const res = await fetch("/api/admin/content", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        fetchContents();
        setShowModal(false);
        setEditingContent(null);
        setFormData({
          title: "",
          description: "",
          content: "",
          type: "VIDEO",
          videoUrl: "",
          platoon: "",
        });
      }
    } catch (error) {
      console.error("Failed to save content:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק תוכן זה?")) return;

    try {
      const res = await fetch(`/api/admin/content?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchContents();
      }
    } catch (error) {
      console.error("Failed to delete content:", error);
    }
  };

  const openEditModal = (content: Content) => {
    setEditingContent(content);
    setFormData({
      title: content.title,
      description: content.description || "",
      content: content.content || "",
      type: content.type,
      videoUrl: content.videoUrl || "",
      platoon: content.platoon || "",
    });
    setShowModal(true);
  };

  const openNewModal = (contentType?: string) => {
    setEditingContent(null);
    setFormData({
      title: "",
      description: "",
      content: "",
      type: contentType || "VIDEO",
      videoUrl: "",
      platoon: isRam && !isAdmin ? session?.user?.platoon || "" : "",
    });
    setShowModal(true);
  };

  const getContentTypeInfo = (type: string) => {
    return CONTENT_TYPES.find(t => t.value === type) || CONTENT_TYPES[0];
  };

  return (
    <div className="py-4 sm:py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="p-2 hover:bg-cream rounded-lg">
            <ChevronRight className="w-5 h-5 text-brown-medium" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-brown-dark">ניהול תוכן</h1>
            <p className="text-sm text-brown-light">
              העלאה וניהול סרטונים ותכנים
            </p>
          </div>
        </div>

        <button
          onClick={() => openNewModal()}
          className="flex items-center gap-2 px-4 py-2 bg-brown-medium text-cream rounded-xl font-medium hover:bg-brown-dark transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">תוכן חדש</span>
        </button>
      </div>

      {/* Content List */}
      <div className="bg-white rounded-2xl border border-cream-dark/50 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-cream-dark/30 flex items-center gap-2">
          <Video className="w-5 h-5 text-brown-medium" />
          <h2 className="font-bold text-brown-dark">תכנים שהועלו</h2>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-sky-light border-t-sky-dark rounded-full animate-spin" />
            <p className="text-brown-light">טוען תכנים...</p>
          </div>
        ) : contents.length === 0 ? (
          <div className="py-12 text-center">
            <Video className="w-16 h-16 text-cream-dark mx-auto mb-3" />
            <p className="text-brown-light mb-4">עדיין לא הועלו תכנים</p>
            <button
              onClick={() => openNewModal()}
              className="px-4 py-2 bg-sky-light text-sky-dark rounded-xl font-medium hover:bg-sky-medium/30 transition-colors"
            >
              העלה תוכן ראשון
            </button>
          </div>
        ) : (
          <div className="divide-y divide-cream-dark/30">
            {contents.map((content) => {
              const typeInfo = getContentTypeInfo(content.type);
              const Icon = typeInfo.icon;
              return (
                <div key={content.id} className="p-4 hover:bg-cream/30 transition-colors">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`w-12 h-12 bg-gradient-to-br ${typeInfo.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Content Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-brown-dark">{content.title}</p>
                        <span className="px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full text-xs">
                          {typeInfo.label}
                        </span>
                        {content.platoon && (
                          <span className="px-2 py-0.5 bg-sky-100 text-sky-700 rounded-full text-xs">
                            {content.platoon}
                          </span>
                        )}
                      </div>

                      {content.description && (
                        <p className="text-brown-light text-sm mt-1 line-clamp-2">
                          {content.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-xs text-brown-light">
                        <span>
                          נוצר ע״י: {content.createdBy?.name || "לא ידוע"}
                        </span>
                        <span>
                          {new Date(content.createdAt).toLocaleDateString("he-IL")}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {content.videoUrl && (
                        <a
                          href={content.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-brown-light hover:text-sky-dark hover:bg-sky-light/50 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => openEditModal(content)}
                        className="p-2 text-brown-light hover:text-brown-dark hover:bg-cream rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(content.id)}
                        className="p-2 text-brown-light hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-brown-dark mb-4">
              {editingContent ? "עריכת תוכן" : "הוספת תוכן חדש"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brown-medium mb-1">
                  כותרת
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  placeholder="הכנס כותרת"
                  className="w-full px-4 py-3 bg-cream/50 border border-cream-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brown-medium mb-1">
                  תיאור
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="תיאור קצר של התוכן"
                  rows={3}
                  className="w-full px-4 py-3 bg-cream/50 border border-cream-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-medium resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brown-medium mb-1">
                  סוג תוכן
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-cream/50 border border-cream-dark rounded-xl"
                >
                  {CONTENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Video field - only for VIDEO type */}
              {formData.type === "VIDEO" && (
                <div className="space-y-3">
                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-brown-medium mb-1">
                      העלאת סרטון מהמכשיר
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="hidden"
                        id="video-upload"
                      />
                      <label
                        htmlFor="video-upload"
                        className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-cream-dark rounded-xl cursor-pointer hover:border-sky-medium hover:bg-sky-light/20 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin text-sky-dark" />
                            <span className="text-brown-medium">מעלה סרטון...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5 text-brown-light" />
                            <span className="text-brown-medium">לחץ להעלאת סרטון</span>
                          </>
                        )}
                      </label>
                    </div>
                    {uploadError && (
                      <p className="text-red-500 text-sm mt-1">{uploadError}</p>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-cream-dark"></div>
                    <span className="text-brown-light text-sm">או</span>
                    <div className="flex-1 h-px bg-cream-dark"></div>
                  </div>

                  {/* URL Input */}
                  <div>
                    <label className="block text-sm font-medium text-brown-medium mb-1">
                      קישור לסרטון (YouTube / Vimeo)
                    </label>
                    <input
                      type="url"
                      value={formData.videoUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, videoUrl: e.target.value })
                      }
                      placeholder="https://youtube.com/..."
                      dir="ltr"
                      className="w-full px-4 py-3 bg-cream/50 border border-cream-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-medium"
                    />
                  </div>

                  {/* Preview */}
                  {formData.videoUrl && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <p className="text-emerald-700 text-sm font-medium flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        סרטון הועלה בהצלחה
                      </p>
                      <p className="text-emerald-600 text-xs mt-1 truncate" dir="ltr">
                        {formData.videoUrl}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Content textarea - for text-based content types */}
              {(formData.type === "CHASSIDUT" || formData.type === "MUSAR" || formData.type === "THOUGHT" || formData.type === "ARTICLE") && (
                <div>
                  <label className="block text-sm font-medium text-brown-medium mb-1">
                    תוכן
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder="הכנס את התוכן כאן..."
                    rows={6}
                    className="w-full px-4 py-3 bg-cream/50 border border-cream-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-medium resize-none"
                  />
                </div>
              )}

              {isAdmin && (
                <div>
                  <label className="block text-sm font-medium text-brown-medium mb-1">
                    פלוגה (ריק = לכולם)
                  </label>
                  <input
                    type="text"
                    value={formData.platoon}
                    onChange={(e) =>
                      setFormData({ ...formData, platoon: e.target.value })
                    }
                    placeholder="השאר ריק להצגה לכל הפלוגות"
                    className="w-full px-4 py-3 bg-cream/50 border border-cream-dark rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-medium"
                  />
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingContent(null);
                  }}
                  className="flex-1 py-3 border border-cream-dark text-brown-dark rounded-xl font-medium hover:bg-cream transition-colors"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-brown-medium text-cream rounded-xl font-medium hover:bg-brown-dark transition-colors"
                >
                  {editingContent ? "שמור" : "הוסף"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
