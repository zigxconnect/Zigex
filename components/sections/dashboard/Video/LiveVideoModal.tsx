"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
  ChevronDown,
  ChevronUp,
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
  const [showDetails, setShowDetails] = useState(false); // For mobile expandable section

  // Extract YouTube ID or handle Vimeo
  const extractVideoInfo = (url?: string) => {
    if (!url) return { type: 'youtube', id: 'ysz5S6PUM-U' };
    
    try {
      const urlObj = new URL(url);
      
      // Vimeo
      if (urlObj.hostname.includes('vimeo.com')) {
        const vimeoId = urlObj.pathname.split('/').pop() || '';
        return { type: 'vimeo', id: vimeoId };
      }
      
      // YouTube
      if (urlObj.hostname.includes('youtube.com')) {
        return { type: 'youtube', id: urlObj.searchParams.get('v') || 'ysz5S6PUM-U' };
      }
      if (urlObj.hostname.includes('youtu.be')) {
        return { type: 'youtube', id: urlObj.pathname.slice(1) || 'ysz5S6PUM-U' };
      }
    } catch {
      return { type: 'youtube', id: url };
    }
    return { type: 'youtube', id: url };
  };

  const videoInfo = extractVideoInfo(videoUrl);

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

  const getEmbedUrl = () => {
    if (videoInfo.type === 'vimeo') {
      return `https://player.vimeo.com/video/${videoInfo.id}?autoplay=1&muted=${isMuted ? 1 : 0}`;
    }
    return `https://www.youtube.com/embed/${videoInfo.id}?autoplay=1&mute=${
      isMuted ? 1 : 0
    }&playsinline=1&rel=0&controls=1&modestbranding=1`;
  };

  const embedUrl = getEmbedUrl();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`p-0 gap-0 overflow-hidden transition-all duration-300 ${
          isFullscreen 
            ? "max-w-full w-screen h-screen rounded-none" 
            : "max-w-[95vw] w-full h-[95vh] max-h-[900px] sm:max-w-6xl lg:max-w-7xl rounded-lg sm:rounded-xl"
        }`}
      >
        <div className="flex flex-col lg:grid lg:grid-cols-3 h-full bg-black">
          
          {/* ========== VIDEO SECTION ========== */}
          <div className="lg:col-span-2 relative bg-black flex flex-col h-[50vh] sm:h-[60vh] lg:h-full">
            
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/90 via-black/50 to-transparent p-3 sm:p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <Badge className="bg-red-600 hover:bg-red-600 text-white animate-pulse flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-ping" />
                  LIVE
                </Badge>
                <div className="flex items-center gap-1.5 sm:gap-2 text-white/90 text-xs sm:text-sm bg-black/30 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1.5 rounded-full">
                  <Eye size={14} className="sm:w-4 sm:h-4" />
                  <span className="font-semibold">{viewerCount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10"
                >
                  {isFullscreen ? <Minimize2 size={18} className="sm:w-5 sm:h-5" /> : <Maximize2 size={18} className="sm:w-5 sm:h-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10"
                >
                  <X size={18} className="sm:w-5 sm:h-5" />
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
                    <div className="text-center space-y-4 sm:space-y-6 px-4">
                      <button
                        onClick={handlePlay}
                        className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-red-600 hover:bg-red-700 transition-all hover:scale-110 cursor-pointer shadow-2xl shadow-red-600/50 active:scale-95"
                      >
                        <Play
                          size={24}
                          className="text-white ml-1 sm:w-8 sm:h-8"
                        />
                      </button>
                      <div>
                        <h3 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg line-clamp-2 px-2">
                          {title}
                        </h3>
                        <p className="text-white/80 text-xs sm:text-sm lg:text-base">
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

            {/* Bottom Controls (Visible during playback) */}
            {isPlaying && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-3 sm:p-4 lg:hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleToggleMute}
                      className="text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10"
                    >
                      {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </Button>
                    <span className="text-white text-xs sm:text-sm font-medium">
                      {formatTime(timeWatched)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ========== INFO & DETAILS SECTION ========== */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-900 flex flex-col max-h-[50vh] sm:max-h-[40vh] lg:max-h-full overflow-hidden">
            
            {/* Header Info - Always visible */}
            <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 border-b lg:border-b-0">
              <div>
                <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white leading-tight line-clamp-2">
                  {title}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {company}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={handleSubscribe}
                  size="sm"
                  className={`flex-1 min-w-[100px] text-xs sm:text-sm h-8 sm:h-9 ${
                    isSubscribed
                      ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                >
                  {isSubscribed ? (
                    <>
                      <BellOff size={14} className="mr-1.5" />
                      <span className="hidden sm:inline">Subscribed</span>
                      <span className="sm:hidden">Subscribed</span>
                    </>
                  ) : (
                    <>
                      <Bell size={14} className="mr-1.5" />
                      Subscribe
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLike}
                  className={`flex items-center gap-1.5 text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4 ${
                    hasLiked ? "bg-blue-50 border-blue-300 text-blue-600" : ""
                  }`}
                >
                  <ThumbsUp size={14} className={hasLiked ? "fill-current" : ""} />
                  <span className="font-semibold">{likes}</span>
                </Button>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleShare} 
                  className="flex items-center gap-1.5 text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4"
                >
                  <Share2 size={14} />
                </Button>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Eye size={14} className="text-gray-500" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {viewerCount.toLocaleString()}
                  </span>
                  <span className="text-gray-500 hidden sm:inline">watching</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Users size={14} className="text-gray-500" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {(viewerCount * 3.2).toFixed(0)}
                  </span>
                  <span className="text-gray-500 hidden sm:inline">joined</span>
                </div>
              </div>

              {/* Mobile: Expand/Collapse Button */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="lg:hidden w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {showDetails ? (
                  <>
                    <span>Show Less</span>
                    <ChevronUp size={16} />
                  </>
                ) : (
                  <>
                    <span>Show More Details</span>
                    <ChevronDown size={16} />
                  </>
                )}
              </button>
            </div>

            {/* Expandable Details Section */}
            <div className={`flex-1 overflow-y-auto ${showDetails ? 'block' : 'hidden'} lg:block`}>
              <Separator className="lg:hidden" />

              {/* Description */}
              <div className="p-3 sm:p-4 lg:p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-2 sm:mb-3">
                    About this stream
                  </h3>
                  <div
                    className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: description || "<p>No description available.</p>",
                    }}
                  />
                </div>

                {/* Live Chat Placeholder */}
                <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <Users size={14} className="text-gray-500" />
                    <span className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white">
                      Live Chat
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Chat will be available during the live stream
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Section - Sticky at bottom */}
            <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-t mt-auto">
              <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-2 sm:mb-3">
                Interested in this opportunity?
              </p>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-xs sm:text-sm h-9 sm:h-10">
                Apply Now
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};