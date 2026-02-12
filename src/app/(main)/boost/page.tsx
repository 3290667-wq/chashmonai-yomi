"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Video, ChevronRight, Clock, Award, Loader2, X, Eye, PlayCircle, BookOpen, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEngagement } from "@/hooks/use-engagement";
import Image from "next/image";

interface VideoContent {
  id: string;
  type: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  imageUrl: string | null;
  createdAt: string;
}

export default function BoostPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const { formattedDuration, isEngaged, estimatedPoints } = useEngagement({
    contentType: "VIDEO",
    enabled: isPlaying,
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await fetch("/api/daily?all=true");
      const data = await res.json();
      const allVideos: VideoContent[] = [];
      if (data.dailyVideo) allVideos.push(data.dailyVideo);
      if (data.allVideos) allVideos.push(...data.allVideos);
      const uniqueVideos = allVideos.filter((v, i, arr) =>
        arr.findIndex(x => x.id === v.id) === i
      );
      setVideos(uniqueVideos);
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const getYoutubeId = (url: string): string | null => {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const getThumbnailUrl = (video: VideoContent): string | null => {
    // First priority: custom uploaded thumbnail
    if (video.imageUrl) {
      return video.imageUrl;
    }

    // Second priority: YouTube thumbnail
    if (video.videoUrl) {
      const youtubeId = getYoutubeId(video.videoUrl);
      if (youtubeId) {
        return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
      }
    }

    return null;
  };

  const getEmbedUrl = (url: string): string | null => {
    const youtubeId = getYoutubeId(url);
    if (youtubeId) {
      return `https://www.youtube.com/embed/${youtubeId}?autoplay=1`;
    }

    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }

    if (url.match(/\.(mp4|webm|ogg|mov)(\?|$)/i) || url.includes('blob.vercel-storage.com')) {
      return url;
    }

    return null;
  };

  const isDirectVideo = (url: string): boolean => {
    return url.match(/\.(mp4|webm|ogg|mov)(\?|$)/i) !== null || url.includes('blob.vercel-storage.com');
  };

  const openVideo = (video: VideoContent) => {
    setSelectedVideo(video);
    setIsPlaying(false);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
    setIsPlaying(false);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gold/20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
        <p className="text-slate-600 animate-pulse">טוען שיעורי וידיאו...</p>
      </div>
    );
  }

  return (
    <div className="relative py-6 space-y-8">

      {/* Hero Section - Artlist Academy Style */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-2xl overflow-hidden liquid-glass"
      >
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="/bbba.png"
            alt=""
            fill
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-white/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 px-6 py-12 sm:px-10 sm:py-16">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-gold/20 text-gold text-xs font-bold rounded-full">
                Academy
              </span>
              <span className="px-3 py-1 bg-sky-100 text-slate-600 text-xs font-medium rounded-full">
                {videos.length} שיעורים
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
              שיעורי וידיאו
              <span className="text-gradient-animated"> מיוחדים</span>
            </h1>

            <p className="text-slate-500 text-lg mb-6 leading-relaxed">
              שיעורים מרתקים בתורה, הלכה ומחשבת ישראל.
              <br className="hidden sm:block" />
              צפה ולמד בקצב שלך, וצבור נקודות.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center icon-pop">
                  <PlayCircle className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-slate-800 font-bold">{videos.length}</p>
                  <p className="text-slate-500 text-sm">סרטונים</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center icon-pop">
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-slate-800 font-bold">תורה</p>
                  <p className="text-slate-500 text-sm">נושאים</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center icon-pop">
                  <Users className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-slate-800 font-bold">רוח חשמונאית</p>
                  <p className="text-slate-500 text-sm">יוצר</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gold line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
      </motion.div>

      {/* Active Video Stats Bar */}
      <AnimatePresence>
      {isPlaying && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="flex flex-wrap items-center gap-3"
        >
          <div className="flex items-center gap-3 px-4 py-3 bg-white border border-sky-200 rounded-xl">
            <Clock className="w-5 h-5 text-gold" />
            <span className="font-mono text-lg font-bold text-slate-800">{formattedDuration}</span>
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                isEngaged ? "bg-emerald-400 animate-pulse" : "bg-white/30"
              }`}
            />
          </div>

          <div className="flex items-center gap-3 px-4 py-3 bg-gold/10 border border-gold/30 rounded-xl glow-gold">
            <Award className="w-5 h-5 text-gold" />
            <span className="font-bold text-lg text-slate-800">+{estimatedPoints}</span>
            <span className="text-slate-500 text-sm">נקודות</span>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Video Grid - Artlist Academy Style */}
      {videos.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {videos.map((video, index) => {
            const thumbnailUrl = getThumbnailUrl(video);
            const isYoutube = video.videoUrl ? !!getYoutubeId(video.videoUrl) : false;
            const hasCustomThumbnail = !!video.imageUrl;

            return (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                whileHover={{ y: -8 }}
                onClick={() => openVideo(video)}
                className="group cursor-pointer"
              >
                <div className="bg-white border border-sky-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-gold/30 hover:shadow-2xl card-tilt shine-effect">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-sky-100 overflow-hidden">
                    {thumbnailUrl ? (
                      <Image
                        src={thumbnailUrl}
                        alt={video.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#3b2d1f] to-[#251c14]">
                        <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center">
                          <Video className="w-8 h-8 text-gold/50" />
                        </div>
                      </div>
                    )}

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-sky-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center shadow-lg shadow-gold/30 transform scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-7 h-7 text-slate-900 mr-[-2px]" />
                      </div>
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/80 text-white text-xs font-medium rounded">
                      {isYoutube ? "YouTube" : "וידאו"}
                    </div>

                    {/* Points Badge */}
                    <div className="absolute top-3 right-3 px-2 py-1 bg-gold/90 text-slate-900 text-xs font-bold rounded">
                      +10 נקודות
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h3 className="font-bold text-slate-800 text-lg line-clamp-2 mb-2 group-hover:text-gold-dark transition-colors">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="text-slate-500 text-sm line-clamp-2 mb-3">{video.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        רוח חשמונאית
                      </span>
                      <span>•</span>
                      <span>{new Date(video.createdAt).toLocaleDateString("he-IL")}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <div className="bg-white border border-sky-200 rounded-2xl p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gold/10 rounded-full flex items-center justify-center">
            <Video className="w-10 h-10 text-gold/50" />
          </div>
          <h3 className="font-bold text-slate-800 text-xl mb-3">אין סרטונים עדיין</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            עדיין לא הועלו סרטונים. חזור מאוחר יותר או עבור ללימוד היומי.
          </p>
          <button
            onClick={() => router.push("/daily")}
            className="px-6 py-3 bg-gradient-to-l from-gold to-gold-dark text-slate-900 rounded-xl font-bold shadow-lg shadow-gold/20 hover:shadow-xl transition-all"
          >
            לימוד יומי
          </button>
        </div>
      )}

      {/* Video Player Modal */}
      <AnimatePresence>
      {selectedVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="bg-white border border-sky-200 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-sky-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-gold to-gold-dark rounded-xl flex items-center justify-center shadow-lg">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800 text-lg">{selectedVideo.title}</h2>
                  {selectedVideo.description && (
                    <p className="text-slate-500 text-sm line-clamp-1">{selectedVideo.description}</p>
                  )}
                </div>
              </div>
              <button
                onClick={closeVideo}
                className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center hover:bg-sky-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Video Player */}
            <div className="aspect-video bg-black relative">
              {isPlaying && selectedVideo.videoUrl ? (
                isDirectVideo(selectedVideo.videoUrl) ? (
                  <video
                    src={selectedVideo.videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full"
                  >
                    הדפדפן שלך לא תומך בתגית וידאו.
                  </video>
                ) : (
                  <iframe
                    src={getEmbedUrl(selectedVideo.videoUrl) || selectedVideo.videoUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )
              ) : (
                <div className="absolute inset-0">
                  {/* Thumbnail */}
                  {getThumbnailUrl(selectedVideo) && (
                    <Image
                      src={getThumbnailUrl(selectedVideo)!}
                      alt={selectedVideo.title}
                      fill
                      className="object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-sky-900/50 flex flex-col items-center justify-center">
                    <button
                      onClick={() => setIsPlaying(true)}
                      className="w-20 h-20 bg-gold hover:bg-gold-light rounded-full flex items-center justify-center shadow-2xl shadow-gold/30 transition-all hover:scale-110 active:scale-95"
                    >
                      <Play className="w-10 h-10 text-slate-900 mr-[-4px]" />
                    </button>
                    <p className="text-slate-700 mt-5 font-medium">לחץ להפעלה</p>
                  </div>
                </div>
              )}
            </div>

            {/* External Link */}
            {selectedVideo.videoUrl && !isPlaying && (
              <div className="p-5 border-t border-sky-200">
                <a
                  href={selectedVideo.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-sky-50 border border-sky-200 hover:border-gold/30 text-slate-700 rounded-xl font-medium transition-all"
                >
                  <Play className="w-4 h-4" />
                  פתח בחלון חדש
                </a>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Bottom Motivation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white border border-sky-200 rounded-xl p-6 text-center glow-gold animate-float"
      >
        <p className="text-slate-800 font-bold text-lg">
          &ldquo;חזק ואמץ - לעלות ולהתעלות&rdquo;
        </p>
        <p className="text-gradient-animated text-sm mt-2 font-medium">רוח חשמונאית</p>
      </motion.div>
    </div>
  );
}
