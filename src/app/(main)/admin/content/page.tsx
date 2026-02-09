"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import {
  Video,
  Plus,
  ChevronRight,
  Edit2,
  Trash2,
  ExternalLink,
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
  imageUrl: string | null;
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
    imageUrl: "",
    platoon: "",
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [thumbnailError, setThumbnailError] = useState("");
  const [saving, setSaving] = useState(false);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = session?.user?.role === "ADMIN";
  const isRam = session?.user?.role === "RAM";

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Extended MIME types for mobile compatibility
    const allowedTypes = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-msvideo",
      "video/3gpp",      // Android
      "video/3gpp2",     // Android
      "video/x-m4v",     // iOS
      "video/mpeg",
      "video/ogg",
    ];

    // Check by extension if MIME type is empty or generic
    const fileName = file.name.toLowerCase();
    const allowedExtensions = [".mp4", ".webm", ".mov", ".avi", ".m4v", ".3gp", ".3g2", ".mpeg", ".mpg", ".ogg"];
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

    if (!allowedTypes.includes(file.type) && !hasValidExtension) {
      setUploadError(`סוג קובץ לא נתמך (${file.type || 'לא ידוע'}). יש להעלות קובץ וידאו`);
      return;
    }

    // Validate file size (500MB)
    if (file.size > 500 * 1024 * 1024) {
      setUploadError("הקובץ גדול מדי. גודל מקסימלי: 500MB");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError("");

    // Retry logic with exponential backoff
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Upload attempt ${attempt}/${maxRetries} for file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

        // Use client-side upload to bypass serverless function limits
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/upload/get-url",
          onUploadProgress: (progress) => {
            setUploadProgress(Math.round(progress.percentage));
          },
        });

        console.log("Upload successful:", blob.url);
        setFormData(prev => ({ ...prev, videoUrl: blob.url }));
        setUploadProgress(100);
        lastError = null;
        break; // Success - exit retry loop

      } catch (error) {
        console.error(`Upload attempt ${attempt} failed:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff: 2s, 4s, 8s...)
          const waitTime = Math.pow(2, attempt) * 1000;
          setUploadError(`ניסיון ${attempt} נכשל, מנסה שוב...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          setUploadProgress(0);
        }
      }
    }

    if (lastError) {
      const errorMsg = lastError.message || "שגיאה בהעלאת הקובץ";
      setUploadError(`העלאה נכשלה לאחר ${maxRetries} ניסיונות: ${errorMsg}`);
      console.error("Final upload error:", lastError);
    }

    setUploading(false);
    if (inputFileRef.current) {
      inputFileRef.current.value = "";
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setThumbnailError("יש להעלות קובץ תמונה (JPG, PNG, WebP)");
      return;
    }

    // Max 5MB for thumbnails
    if (file.size > 5 * 1024 * 1024) {
      setThumbnailError("התמונה גדולה מדי. גודל מקסימלי: 5MB");
      return;
    }

    setUploadingThumbnail(true);
    setThumbnailError("");

    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload/get-url",
      });

      setFormData(prev => ({ ...prev, imageUrl: blob.url }));
    } catch (error) {
      console.error("Thumbnail upload error:", error);
      setThumbnailError("שגיאה בהעלאת התמונה");
    } finally {
      setUploadingThumbnail(false);
      if (thumbnailInputRef.current) {
        thumbnailInputRef.current.value = "";
      }
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

  const [saveError, setSaveError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");
    setSaving(true);

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

      const data = await res.json();

      if (res.ok && data.success) {
        fetchContents();
        setShowModal(false);
        setEditingContent(null);
        setFormData({
          title: "",
          description: "",
          content: "",
          type: "VIDEO",
          videoUrl: "",
          imageUrl: "",
          platoon: "",
        });
      } else {
        const errorMsg = data.error || "שגיאה בשמירת התוכן";
        setSaveError(errorMsg);
        alert("שגיאה: " + errorMsg + (data.code ? ` (${data.code})` : ""));
      }
    } catch (error) {
      setSaveError("שגיאה בשמירת התוכן - נא לנסות שוב");
      alert("שגיאה בשמירת התוכן: " + String(error));
    } finally {
      setSaving(false);
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
      imageUrl: content.imageUrl || "",
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
      imageUrl: "",
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
          <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-lg">
            <ChevronRight className="w-5 h-5 text-white/60" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">ניהול תוכן</h1>
            <p className="text-sm text-white/60">
              העלאה וניהול סרטונים ותכנים
            </p>
          </div>
        </div>

        <button
          onClick={() => openNewModal()}
          className="flex items-center gap-2 px-4 py-2 bg-gold text-[#1a140f] rounded-xl font-medium hover:bg-gold-light transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">תוכן חדש</span>
        </button>
      </div>

      {/* Content List */}
      <div className="bg-[#3b2d1f] rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center gap-2">
          <Video className="w-5 h-5 text-white/60" />
          <h2 className="font-bold text-white">תכנים שהועלו</h2>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
            <p className="text-white/50">טוען תכנים...</p>
          </div>
        ) : contents.length === 0 ? (
          <div className="py-12 text-center">
            <Video className="w-16 h-16 text-white/20 mx-auto mb-3" />
            <p className="text-white/50 mb-4">עדיין לא הועלו תכנים</p>
            <button
              onClick={() => openNewModal()}
              className="px-4 py-2 bg-gold/20 text-gold rounded-xl font-medium hover:bg-gold/30 transition-colors"
            >
              העלה תוכן ראשון
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {contents.map((content) => {
              const typeInfo = getContentTypeInfo(content.type);
              const Icon = typeInfo.icon;
              return (
                <div key={content.id} className="p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`w-12 h-12 bg-gradient-to-br ${typeInfo.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Content Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-white">{content.title}</p>
                        <span className="px-2 py-0.5 bg-violet-500/20 text-violet-400 rounded-full text-xs">
                          {typeInfo.label}
                        </span>
                        {content.platoon && (
                          <span className="px-2 py-0.5 bg-sky-500/20 text-sky-400 rounded-full text-xs">
                            {content.platoon}
                          </span>
                        )}
                      </div>

                      {content.description && (
                        <p className="text-white/60 text-sm mt-1 line-clamp-2">
                          {content.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-xs text-white/50">
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
                          className="p-2 text-white/40 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => openEditModal(content)}
                        className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(content.id)}
                        className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 pb-24 sm:pb-4">
          <div className="bg-[#3b2d1f] border border-white/10 rounded-2xl w-full max-w-md p-6 max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingContent ? "עריכת תוכן" : "הוספת תוכן חדש"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
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
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  תיאור
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="תיאור קצר של התוכן"
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  סוג תוכן
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
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
                  {/* URL Input - Primary option */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      קישור לסרטון (YouTube / Vimeo / קישור ישיר)
                    </label>
                    <input
                      type="url"
                      value={formData.videoUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, videoUrl: e.target.value })
                      }
                      placeholder="https://youtube.com/watch?v=..."
                      dir="ltr"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold/50"
                    />
                    <p className="text-white/50 text-xs mt-1">
                      ניתן להדביק קישור מיוטיוב, Vimeo או קישור ישיר לקובץ וידאו
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/10"></div>
                    <span className="text-white/50 text-sm">או</span>
                    <div className="flex-1 h-px bg-white/10"></div>
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      העלאת סרטון מהמכשיר
                    </label>
                    <div className="relative">
                      <input
                        ref={inputFileRef}
                        type="file"
                        accept="video/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="hidden"
                        id="video-upload"
                      />
                      <label
                        htmlFor="video-upload"
                        className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-gold/50 hover:bg-gold/5 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {uploading ? (
                          <div className="w-full">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <Loader2 className="w-5 h-5 animate-spin text-gold" />
                              <span className="text-white/70">מעלה סרטון... {uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2">
                              <div
                                className="bg-gold h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                            <p className="text-white/50 text-xs text-center mt-2">אל תסגור את הדפדפן</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Upload className="w-6 h-6 text-white/50 mx-auto mb-1" />
                            <span className="text-white/70 block">לחץ להעלאת סרטון</span>
                            <span className="text-white/50 text-xs">עד 500MB - העלאה ישירה</span>
                          </div>
                        )}
                      </label>
                    </div>
                    {uploadError && (
                      <p className="text-red-400 text-sm mt-1">{uploadError}</p>
                    )}
                    <p className="text-amber-400/70 text-xs mt-2">
                      💡 טיפ: להעלאת סרטונים גדולים, מומלץ להשתמש ב-WiFi יציב
                    </p>
                  </div>

                  {/* Preview */}
                  {formData.videoUrl && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <p className="text-emerald-400 text-sm font-medium flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        קישור לסרטון נוסף
                      </p>
                      <p className="text-emerald-300 text-xs mt-1 truncate" dir="ltr">
                        {formData.videoUrl}
                      </p>
                    </div>
                  )}

                  {/* Thumbnail Upload */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      תמונה ממוזערת (אופציונלי)
                    </label>
                    <div className="relative">
                      <input
                        ref={thumbnailInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        disabled={uploadingThumbnail}
                        className="hidden"
                        id="thumbnail-upload"
                      />
                      <label
                        htmlFor="thumbnail-upload"
                        className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-violet-500/50 hover:bg-violet-500/5 transition-colors ${uploadingThumbnail ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {uploadingThumbnail ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin text-violet-400" />
                            <span className="text-white/70">מעלה תמונה...</span>
                          </div>
                        ) : formData.imageUrl ? (
                          <div className="flex items-center gap-2 text-emerald-400">
                            <img src={formData.imageUrl} alt="תמונה ממוזערת" className="w-12 h-12 object-cover rounded" />
                            <span className="text-sm">תמונה נבחרה - לחץ להחלפה</span>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Upload className="w-5 h-5 text-white/50 mx-auto mb-1" />
                            <span className="text-white/70 text-sm block">העלה תמונה ממוזערת</span>
                            <span className="text-white/50 text-xs">JPG, PNG, WebP - עד 5MB</span>
                          </div>
                        )}
                      </label>
                    </div>
                    {thumbnailError && (
                      <p className="text-red-400 text-sm mt-1">{thumbnailError}</p>
                    )}
                    <p className="text-white/40 text-xs mt-1">
                      תמונה זו תוצג במקום הסרטון ברשימת הסרטונים
                    </p>
                  </div>
                </div>
              )}

              {/* Content textarea - for text-based content types */}
              {(formData.type === "CHASSIDUT" || formData.type === "MUSAR" || formData.type === "THOUGHT" || formData.type === "ARTICLE") && (
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    תוכן
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder="הכנס את התוכן כאן..."
                    rows={6}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none"
                  />
                </div>
              )}

              {isAdmin && (
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    פלוגה (ריק = לכולם)
                  </label>
                  <input
                    type="text"
                    value={formData.platoon}
                    onChange={(e) =>
                      setFormData({ ...formData, platoon: e.target.value })
                    }
                    placeholder="השאר ריק להצגה לכל הפלוגות"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold/50"
                  />
                </div>
              )}

              {saveError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-red-400 text-sm">{saveError}</p>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingContent(null);
                  }}
                  className="flex-1 py-3 border border-white/20 text-white rounded-xl font-medium hover:bg-white/5 transition-colors"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-gold text-[#1a140f] rounded-xl font-medium hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      שומר...
                    </>
                  ) : (
                    editingContent ? "שמור" : "הוסף"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
