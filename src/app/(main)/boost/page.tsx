"use client";

import { useState, useEffect } from "react";
import { Play, Video, ChevronRight, Clock, Award, Loader2, X, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEngagement } from "@/hooks/use-engagement";
import Image from "next/image";

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

  // Get YouTube video ID from URL
  const getYoutubeId = (url: string): string | null => {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  // Get thumbnail URL for video
  const getThumbnailUrl = (url: string): string | null => {
    const youtubeId = getYoutubeId(url);
    if (youtubeId) {
      return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
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
      <div className="py-12 flex flex-col items-center justify-center gap-4 min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-gold animate-spin" />
        <p className="text-brown-warm animate-pulse">טוען שיעורי וידיאו...</p>
      </div>
    );
  }

  return (
    <div className="relative py-4 sm:py-6 space-y-6">
      {/* Aurora Background */}
      <div className="aurora-bg" />

      {/* Header */}
      <div className="relative flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 glass rounded-xl hover:glow-gold transition-all">
          <ChevronRight className="w-5 h-5 text-gold" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-brown-deep text-glow">שיעורי וידיאו</h1>
          <p className="text-sm text-brown-warm">{videos.length} סרטונים זמינים</p>
        </div>
      </div>

      {/* Stats Bar */}
      {isPlaying && (
        <div className="relative flex flex-wrap items-center gap-3">
          <div className="glass-card flex items-center gap-2 px-4 py-2.5">
            <Clock className="w-5 h-5 text-gold" />
            <span className="font-mono text-lg font-bold text-brown-deep">{formattedDuration}</span>
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                isEngaged ? "bg-emerald-400 animate-pulse" : "bg-gray-300"
              }`}
            />
          </div>

          <div className="glass-card flex items-center gap-2 px-4 py-2.5 glow-gold">
            <Award className="w-5 h-5 text-gold" />
            <span className="font-bold text-lg text-brown-deep">+{estimatedPoints}</span>
            <span className="text-brown-warm text-sm">נקודות</span>
          </div>
        </div>
      )}

      {/* Video Grid - YouTube Style */}
      {videos.length > 0 ? (
        <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
          {videos.map((video) => {
            const thumbnailUrl = video.videoUrl ? getThumbnailUrl(video.videoUrl) : null;
            const isYoutube = video.videoUrl ? !!getYoutubeId(video.videoUrl) : false;

            return (
              <div
                key={video.id}
                onClick={() => openVideo(video)}
                className="glass-card overflow-hidden cursor-pointer group hover-lift"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gradient-to-br from-brown-deep to-brown-rich overflow-hidden">
                  {thumbnailUrl ? (
                    <Image
                      src={thumbnailUrl}
                      alt={video.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center">
                        <Video className="w-10 h-10 text-gold" />
                      </div>
                    </div>
                  )}

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 bg-gold/90 rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-8 h-8 text-brown-deep mr-[-2px]" />
                    </div>
                  </div>

                  {/* Duration Badge (placeholder) */}
                  <div className="absolute bottom-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {isYoutube ? "YouTube" : "וידאו"}
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <h3 className="font-bold text-brown-deep text-lg line-clamp-2 group-hover:text-gold transition-colors">
                    {video.title}
                  </h3>
                  {video.description && (
                    <p className="text-sm text-brown-warm mt-1 line-clamp-2">{video.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-3 text-xs text-brown-soft">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      רוח חשמונאית
                    </span>
                    <span>•</span>
                    <span>{new Date(video.createdAt).toLocaleDateString("he-IL")}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gold/10 rounded-full flex items-center justify-center">
            <Video className="w-10 h-10 text-gold" />
          </div>
          <h3 className="font-bold text-brown-deep text-lg mb-2">אין סרטונים</h3>
          <p className="text-brown-warm">
            עדיין לא הועלו סרטונים.
            <br />
            חזור מאוחר יותר או עבור ללימוד היומי.
          </p>
          <button
            onClick={() => router.push("/daily")}
            className="mt-4 px-6 py-3 bg-gradient-to-l from-gold to-gold-dark text-brown-deep rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
          >
            לימוד יומי
          </button>
        </div>
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-gold/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gold to-gold-dark rounded-lg flex items-center justify-center shadow-lg">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-brown-deep">{selectedVideo.title}</h2>
                  {selectedVideo.description && (
                    <p className="text-sm text-brown-warm">{selectedVideo.description}</p>
                  )}
                </div>
              </div>
              <button
                onClick={closeVideo}
                className="p-2 glass rounded-lg hover:glow-gold transition-all"
              >
                <X className="w-6 h-6 text-brown-warm" />
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
                  {/* Thumbnail as background */}
                  {selectedVideo.videoUrl && getThumbnailUrl(selectedVideo.videoUrl) && (
                    <Image
                      src={getThumbnailUrl(selectedVideo.videoUrl)!}
                      alt={selectedVideo.title}
                      fill
                      className="object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
                    <button
                      onClick={() => setIsPlaying(true)}
                      className="w-20 h-20 bg-gold hover:bg-gold-light rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 glow-gold"
                    >
                      <Play className="w-10 h-10 text-brown-deep mr-[-4px]" />
                    </button>
                    <p className="text-white/90 mt-4 font-medium">לחץ להפעלה</p>
                  </div>
                </div>
              )}
            </div>

            {/* External Link Option */}
            {selectedVideo.videoUrl && !isPlaying && (
              <div className="p-4 border-t border-gold/20">
                <a
                  href={selectedVideo.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 glass hover:glow-gold text-brown-deep rounded-xl font-medium transition-all"
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
      <div className="relative glass-card p-6 text-center glow-gold">
        <p className="text-brown-deep font-bold text-lg">
          &ldquo;חזק ואמץ - לעלות ולהתעלות&rdquo;
        </p>
        <p className="text-gold text-sm mt-2 font-semibold">רוח חשמונאית</p>
      </div>
    </div>
  );
}
