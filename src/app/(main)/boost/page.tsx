"use client";

import { useState, useEffect } from "react";
import { Play, Video, ChevronRight, Clock, Award, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEngagement } from "@/hooks/use-engagement";

interface VideoContent {
  id: string;
  type: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  createdAt: string;
}

export default function BoostPage() {
  const router = useRouter();
  const [video, setVideo] = useState<VideoContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const { formattedDuration, isEngaged, estimatedPoints } = useEngagement({
    contentType: "VIDEO",
    enabled: isPlaying,
  });

  useEffect(() => {
    fetchVideo();
  }, []);

  const fetchVideo = async () => {
    try {
      const res = await fetch("/api/daily");
      const data = await res.json();
      console.log("Fetched daily data:", data);
      console.log("Daily video:", data.dailyVideo);
      setVideo(data.dailyVideo);
    } catch (error) {
      console.error("Failed to fetch video:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEmbedUrl = (url: string): string | null => {
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1`;
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }

    // Direct video URL (mp4, webm, etc.)
    if (url.match(/\.(mp4|webm|ogg|mov)(\?|$)/i) || url.includes('blob.vercel-storage.com')) {
      return url;
    }

    return null;
  };

  const isDirectVideo = (url: string): boolean => {
    return url.match(/\.(mp4|webm|ogg|mov)(\?|$)/i) !== null || url.includes('blob.vercel-storage.com');
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-4 min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
        <p className="text-brown-light animate-pulse">טוען סרטון חיזוק...</p>
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button onClick={() => router.back()} className="p-2 hover:bg-cream rounded-lg">
          <ChevronRight className="w-5 h-5 text-brown-medium" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-brown-dark">חיזוק יומי</h1>
          <p className="text-sm text-brown-light">סרטון מחזק לכל יום</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-violet-100 rounded-xl px-4 py-2.5">
          <Clock className="w-5 h-5 text-violet-600" />
          <span className="font-mono text-lg font-bold text-violet-700">{formattedDuration}</span>
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isEngaged ? "bg-emerald-400 animate-pulse" : "bg-gray-300"
            }`}
          />
        </div>

        <div className="flex items-center gap-2 bg-amber-100 rounded-xl px-4 py-2.5">
          <Award className="w-5 h-5 text-amber-600" />
          <span className="font-bold text-lg text-amber-700">+{estimatedPoints}</span>
          <span className="text-amber-600 text-sm">נקודות</span>
        </div>
      </div>

      {/* Video Content */}
      {video ? (
        <div className="bg-white rounded-2xl border border-cream-dark/50 overflow-hidden shadow-sm">
          {/* Video Info */}
          <div className="p-4 sm:p-5 border-b border-cream-dark/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-violet-600 rounded-xl flex items-center justify-center shadow-md">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-brown-dark text-lg">{video.title}</h2>
                {video.description && (
                  <p className="text-sm text-brown-light mt-0.5">{video.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Video Player Area */}
          <div className="aspect-video bg-gray-900 relative">
            {isPlaying && video.videoUrl ? (
              isDirectVideo(video.videoUrl) ? (
                <video
                  src={video.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full"
                >
                  הדפדפן שלך לא תומך בתגית וידאו.
                </video>
              ) : (
                <iframe
                  src={getEmbedUrl(video.videoUrl) || video.videoUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <button
                  onClick={() => setIsPlaying(true)}
                  className="w-20 h-20 bg-violet-500 hover:bg-violet-600 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95"
                >
                  <Play className="w-10 h-10 text-white mr-[-4px]" />
                </button>
                <p className="text-white/70 mt-4 text-sm">לחץ להפעלה</p>
              </div>
            )}
          </div>

          {/* External Link Option */}
          {video.videoUrl && !isPlaying && (
            <div className="p-4 sm:p-5 border-t border-cream-dark/30">
              <a
                href={video.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-cream hover:bg-cream-dark/30 text-brown-dark rounded-xl font-medium transition-colors"
              >
                <Play className="w-4 h-4" />
                פתח בחלון חדש
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-cream-dark/50 p-8 text-center">
          <Video className="w-16 h-16 text-violet-300 mx-auto mb-4" />
          <h3 className="font-bold text-brown-dark text-lg mb-2">אין סרטון להיום</h3>
          <p className="text-brown-light">
            עדיין לא הועלה סרטון חיזוק יומי.
            <br />
            חזור מאוחר יותר או עבור ללימוד היומי.
          </p>
          <button
            onClick={() => router.push("/daily")}
            className="mt-4 px-6 py-3 bg-gradient-to-l from-brown-dark to-brown-medium text-cream rounded-xl font-medium"
          >
            לימוד יומי
          </button>
        </div>
      )}

      {/* Motivation */}
      <div className="bg-gradient-to-l from-violet-100 to-violet-200 rounded-2xl p-5 text-center">
        <p className="text-violet-800 font-medium text-lg">
          &ldquo;חזק ואמץ - לעלות ולהתעלות&rdquo;
        </p>
        <p className="text-violet-600 text-sm mt-2">רוח חשמונאית</p>
      </div>
    </div>
  );
}
