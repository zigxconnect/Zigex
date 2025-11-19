"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Play, Eye, Heart, Share2, X, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { formatViewCount, formatViewCountWithLabel, getViewCountDescription } from "@/lib/utils/formatViews";
import { useHappeningNowViewTracking, useIndividualMediaViewTracking } from "@/hooks/useHappeningNowViewTracking";
import { HappeningNowItem } from "@/lib/types/happening-now";

interface HappeningNowCardProps {
  item: HappeningNowItem;
  onClose?: () => void;
}

export function HappeningNowCard({ item, onClose }: HappeningNowCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [localViewCount, setLocalViewCount] = useState(item.view_count || 0);
  const [liked, setLiked] = useState(false);

  // Track views when component mounts or item changes
  useHappeningNowViewTracking(item.id);

  // Track individual media views when viewing
  useIndividualMediaViewTracking(item.id, "image", currentImageIndex);

  // Subscribe to real-time view count updates
  useEffect(() => {
    if (!item.id) return;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Subscribe to updates for this specific item
    const subscription = supabase
      .channel(`happening_now_${item.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "happening_now",
          filter: `id=eq.${item.id}`,
        },
        (payload) => {
          console.log("✅ View count updated:", payload.new.view_count);
          setLocalViewCount(payload.new.view_count || 0);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [item.id]);

  const hasMultipleImages = (item.images?.length || 0) > 1;
  const currentImage = item.images?.[currentImageIndex];
  const hasVideo = !!item.video?.url;

  const handleNextImage = () => {
    if (item.images && currentImageIndex < item.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleImageDotClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {item.company?.charAt(0).toUpperCase() || "C"}
            </div>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{item.company}</p>
            <p className="text-xs text-gray-500">
              {item.created_at
                ? new Date(item.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : "Recently"}
            </p>
          </div>
          {item.is_live && (
            <span className="ml-auto flex items-center gap-1 px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              LIVE
            </span>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-gray-500" />
          </button>
        )}
      </div>

      {/* Media Container */}
      <div className="relative bg-gray-900 aspect-video overflow-hidden group">
        {isVideoPlaying && hasVideo ? (
          // Video View
          <video
            src={item.video.url}
            className="w-full h-full object-cover"
            controls
            autoPlay
            onPlay={() => useIndividualMediaViewTracking(item.id, "video")}
          />
        ) : (
          // Image View
          <div className="relative w-full h-full">
            {currentImage && (
              <Image
                src={currentImage}
                alt={`${item.company} - ${item.captions?.[currentImageIndex] || "image"}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
              />
            )}

            {/* Play Button Overlay for Video */}
            {hasVideo && !isVideoPlaying && (
              <button
                onClick={() => setIsVideoPlaying(true)}
                className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors group-hover:bg-black/40"
              >
                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors transform hover:scale-110 transition-transform">
                  <Play size={32} className="text-gray-900 fill-gray-900 ml-1" />
                </div>
              </button>
            )}

            {/* Image Navigation */}
            {hasMultipleImages && (
              <>
                {/* Previous Button */}
                {currentImageIndex > 0 && (
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full transition-all transform hover:scale-110 z-10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} className="text-gray-900" />
                  </button>
                )}

                {/* Next Button */}
                {currentImageIndex < (item.images?.length || 0) - 1 && (
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full transition-all transform hover:scale-110 z-10"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} className="text-gray-900" />
                  </button>
                )}

                {/* Image Indicators */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {item.images?.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleImageDotClick(index)}
                      className={`transition-all ${
                        index === currentImageIndex
                          ? "w-2.5 h-2.5 bg-white"
                          : "w-2 h-2 bg-white/50 hover:bg-white/70"
                      } rounded-full`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Image Counter */}
            {hasMultipleImages && (
              <div className="absolute top-3 right-3 px-2.5 py-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold rounded-lg">
                {currentImageIndex + 1} / {item.images?.length}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Caption for current image */}
      {item.captions?.[currentImageIndex] && (
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <p className="text-sm text-gray-700">{item.captions[currentImageIndex]}</p>
        </div>
      )}

      {/* Stats & Actions */}
      <div className="p-4 space-y-4">
        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          {/* View Count */}
          <div className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors cursor-help group">
            <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg group-hover:shadow-md transition-shadow">
              <Eye size={16} className="text-blue-600" />
              <span className="font-semibold text-blue-600">{formatViewCount(localViewCount)}</span>
            </div>
            <span className="text-xs text-gray-500 hidden group-hover:inline">
              {getViewCountDescription(localViewCount)}
            </span>
          </div>

          {/* Video indicator */}
          {hasVideo && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 rounded-lg">
              <Play size={14} className="text-purple-600" />
              <span className="text-xs font-medium text-purple-600">+Video</span>
            </div>
          )}

          {/* Image count */}
          {hasMultipleImages && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 rounded-lg">
              <Zap size={14} className="text-amber-600" />
              <span className="text-xs font-medium text-amber-600">{item.images?.length} Images</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {/* Like Button */}
          <button
            onClick={() => setLiked(!liked)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-all transform hover:scale-105 ${
              liked
                ? "bg-red-100 text-red-600 hover:bg-red-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Heart size={18} className={liked ? "fill-current" : ""} />
            {liked ? "Liked" : "Like"}
          </button>

          {/* Share Button */}
          <button className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-all transform hover:scale-105 bg-blue-100 text-blue-600 hover:bg-blue-200">
            <Share2 size={18} />
            Share
          </button>

          {/* View Video Button */}
          {hasVideo && !isVideoPlaying && (
            <button
              onClick={() => setIsVideoPlaying(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-all transform hover:scale-105 bg-purple-100 text-purple-600 hover:bg-purple-200"
            >
              <Play size={18} className="fill-current" />
              Video
            </button>
          )}
        </div>
      </div>

      {/* Footer info */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
        {item.is_live ? (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            This is happening now!
          </span>
        ) : (
          <span>
            {item.updated_at
              ? `Updated ${new Date(item.updated_at).toLocaleDateString()}`
              : "Update not available"}
          </span>
        )}
      </div>
    </div>
  );
}
