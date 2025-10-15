"use client";

import { useState, useEffect } from "react";
// import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  X,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Users,
  Eye,
  ThumbsUp,
  Share2,
  Bell,
  BellOff,
  Play,
  Pause,
} from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/uiComponent/Badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface LiveVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
  title: string;
  company: string;
  description?: string;
  thumbnail?: string;
  viewerCount?: number;
}

export const LiveVideoModal = ({
  isOpen,
  onClose,
  videoUrl,
  title,
  company,
  description,
  thumbnail,
  viewerCount = 1247,
}: LiveVideoModalProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [likes, setLikes] = useState(892);
  const [hasLiked, setHasLiked] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [timeWatched, setTimeWatched] = useState(0);

  // Extract YouTube ID
  const extractYouTubeId = (url?: string) => {
    if (!url) return "ysz5S6PUM-U"; // default
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes("youtube.com"))
        return urlObj.searchParams.get("v") || "ysz5S6PUM-U";
      if (urlObj.hostname.includes("youtu.be"))
        return urlObj.pathname.slice(1) || "ysz5S6PUM-U";
    } catch {
      return url;
    }
    return url;
  };

  const videoId = extractYouTubeId(videoUrl);

  // Timer for watch time
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTimeWatched((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlay = () => {
    setIsPlaying(true);
    setIframeKey((k) => k + 1);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    setIframeKey((k) => k + 1);
  };

  const handleLike = () => {
    if (!hasLiked) {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
    } else {
      setLikes((prev) => prev - 1);
      setHasLiked(false);
    }
  };

  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: `Check out this live stream: ${title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${
    isMuted ? 1 : 0
  }&playsinline=1&rel=0&controls=1&modestbranding=1`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`max-w-7xl w-[95vw] h-[95vh] p-0 gap-0 overflow-hidden ${
          isFullscreen ? "max-w-full w-screen h-screen" : ""
        }`}
      >
        <div className="flex flex-col lg:grid lg:grid-cols-3 h-full bg-black lg:bg-gradient-to-br lg:from-gray-950 lg:to-black">
          {/* Video Section */}
          <div className="lg:col-span-2 relative bg-black flex flex-col">
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className="bg-red-600 hover:bg-red-600 text-white animate-pulse flex items-center gap-1.5 px-3 py-1.5">
                  <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                  LIVE
                </Badge>
                <div className="hidden sm:flex items-center gap-2 text-white/90 text-sm bg-black/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Eye size={16} />
                  <span className="font-semibold">{viewerCount.toLocaleString()}</span>
                  <span className="hidden md:inline">watching</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="text-white hover:bg-white/20 hidden sm:flex"
                >
                  {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  <X size={20} />
                </Button>
              </div>
            </div>

            {/* Video Player */}
            <div className="flex-1 relative flex items-center justify-center">
              {!isPlaying ? (
                <div className="absolute inset-0">
                  {thumbnail && (
                    <Image
                      src={thumbnail}
                      alt={title}
                      fill
                      className="object-cover"
                      priority
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-6 px-4">
                      <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-600 hover:bg-red-700 transition-all hover:scale-110 cursor-pointer shadow-2xl shadow-red-600/50">
                        <Play
                          size={32}
                          className="text-white ml-1"
                          onClick={handlePlay}
                        />
                      </div>
                      <div>
                        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                          {title}
                        </h3>
                        <p className="text-white/80 text-sm sm:text-base">
                          Click to start live stream
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <iframe
                  key={iframeKey}
                  src={embedUrl}
                  title="Live Stream"
                  className="w-full h-full"
                  frameBorder="0"
                  allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>

            {/* Bottom Controls (Mobile) */}
            {isPlaying && (
              <div className="lg:hidden absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleToggleMute}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </Button>
                    <span className="text-white text-sm font-medium">
                      {formatTime(timeWatched)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="text-white hover:bg-white/20"
                  >
                    {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Info & Chat Section */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-900 flex flex-col max-h-[40vh] lg:max-h-full">
            {/* Header Info */}
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                  {title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {company}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={handleSubscribe}
                  className={`flex-1 sm:flex-none ${
                    isSubscribed
                      ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                >
                  {isSubscribed ? (
                    <>
                      <BellOff size={16} className="mr-2" />
                      Subscribed
                    </>
                  ) : (
                    <>
                      <Bell size={16} className="mr-2" />
                      Subscribe
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleLike}
                  className={`flex items-center gap-2 ${
                    hasLiked ? "bg-blue-50 border-blue-300 text-blue-600" : ""
                  }`}
                >
                  <ThumbsUp size={16} className={hasLiked ? "fill-current" : ""} />
                  <span className="font-semibold">{likes}</span>
                </Button>

                <Button variant="outline" onClick={handleShare} className="flex items-center gap-2">
                  <Share2 size={16} />
                  <span className="hidden sm:inline">Share</span>
                </Button>
              </div>

              <Separator />

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-gray-500" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {viewerCount.toLocaleString()}
                  </span>
                  <span className="text-gray-500">watching</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-gray-500" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {(viewerCount * 3.2).toFixed(0)}
                  </span>
                  <span className="text-gray-500">joined</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                About this stream
              </h3>
              <div
                className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{
                  __html: description || "<p>No description available.</p>",
                }}
              />

              {/* Live Chat Placeholder */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <Users size={16} className="text-gray-500" />
                  <span className="font-semibold text-sm text-gray-900 dark:text-white">
                    Live Chat
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Chat will be available during the live stream
                </p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="p-4 sm:p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-t">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Interested in this opportunity?
              </p>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold">
                Apply Now
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};