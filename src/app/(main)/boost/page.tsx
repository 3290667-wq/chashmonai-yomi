"use client";

import { useState, useEffect } from "react";
import { Play, Video, ChevronRight, Clock, Award, Loader2, X } from "lucide-react";
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
      console.log("Fetched videos:", data);
      // Combine all videos from different sources
      const allVideos: VideoContent[] = [];
      if (data.dailyVideo) allVideos.push(data.dailyVideo);
      if (data.allVideos) allVideos.push(...data.allVideos);
      // Remove duplicates by id
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
      <div className="py-12 flex flex-col items-center justify-center gap-4 min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
        <p className="text-brown-light animate-pulse">טוען שיעורי וידיאו...</p>
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
          <h1 className="text-2xl font-bold text-brown-dark">שיעורי וידיאו</h1>
          <p className="text-sm text-brown-light">{videos.length} סרטונים זמינים</p>
        </div>
      </div>

      {/* Stats Bar */}
      {isPlaying && (
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
      )}

      {/* Video List */}
      {videos.length > 0 ? (
        <div className="grid gap-4">
          {videos.map((video) => (
            <div
              key={video.id}
              onClick={() => openVideo(video)}
              className="bg-white rounded-2xl border border-cream-dark/50 overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="p-4 sm:p-5 flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-400 to-violet-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                  <Play className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-brown-dark text-lg truncate">{video.title}</h3>
                  {video.description && (
                    <p className="text-sm text-brown-light mt-1 line-clamp-2">{video.description}</p>
                  )}
                  <p className="text-xs text-brown-light/70 mt-2">
                    {new Date(video.createdAt).toLocaleDateString("he-IL")}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-brown-light rotate-180 flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-cream-dark/50 p-8 text-center">
          <Video className="w-16 h-16 text-violet-300 mx-auto mb-4" />
          <h3 className="font-bold text-brown-dark text-lg mb-2">אין סרטונים</h3>
          <p className="text-brown-light">
            עדיין לא הועלו סרטונים.
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

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-cream-dark/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-violet-600 rounded-lg flex items-center justify-center">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-brown-dark">{selectedVideo.title}</h2>
                  {selectedVideo.description && (
                    <p className="text-sm text-brown-light">{selectedVideo.description}</p>
                  )}
                </div>
              </div>
              <button
                onClick={closeVideo}
                className="p-2 hover:bg-cream rounded-lg"
              >
                <X className="w-6 h-6 text-brown-medium" />
              </button>
            </div>

            {/* Video Player */}
            <div className="aspect-video bg-gray-900 relative">
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
            {selectedVideo.videoUrl && !isPlaying && (
              <div className="p-4 border-t border-cream-dark/30">
                <a
                  href={selectedVideo.videoUrl}
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
