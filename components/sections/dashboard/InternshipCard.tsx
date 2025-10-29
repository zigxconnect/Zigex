"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Clock,
  Building2,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Play,
  Eye,
  Heart,
  ChevronRight,
  Share2,
} from "lucide-react";
import { useState } from "react";
import { SharePopover } from "@/components/SharePopover";
import LiveBadge from "@/components/uiComponent/LiveBadge";
import LivePanel from "@/components/uiComponent/LivePanel";

interface InternshipCardProps {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  category: string;
  logoColor: string;
  cover_image_url: string;
  viewMode?: "grid" | "list";
  is_live?: boolean;
  live_stream_url?: string;
  viewerCount?: number;
  onLiveClick?: () => void;
}

export const InternshipCard = ({
  id,
  title,
  company,
  location,
  type,
  category,
  logoColor,
  cover_image_url,
  viewMode = "grid",
  is_live = false,
  live_stream_url,
  viewerCount = 0,
  onLiveClick,
}: InternshipCardProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [openLive, setOpenLive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleCardClick = () => {
    if (is_live && onLiveClick) {
      onLiveClick();
    }
  };

  const formatViewCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (viewMode === "list") {
    return (
      <Link href={`/internships/${id}`}>
        <div 
          onClick={handleCardClick}
          className={`bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden group ${is_live ? 'cursor-pointer' : ''}`}
        >
          <div className="flex">
            {/* Image Section */}
            <div className="relative w-48 h-full flex-shrink-0">
              <Image
                src={cover_image_url || "/int.png"}
                alt={`Cover image for ${company}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
              
              {is_live && (
                <>
                  <div className="absolute top-3 left-3 z-10">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-600 rounded-full shadow-lg">
                      <div className="relative flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-ping absolute" />
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                      <span className="text-white text-xs font-bold uppercase tracking-wide">
                        Live
                      </span>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl transform transition-transform duration-300 group-hover:scale-110">
                      <Play className="w-5 h-5 text-blue-700 fill-blue-700 ml-0.5" />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Content Section */}
            <div className="flex-1 p-6 flex items-center justify-between">
              <div className="flex-1">
                <span className="px-3 py-1.5 mb-2 inline-block text-xs text-blue-800 bg-blue-100 rounded-full font-medium border border-blue-200">
                  {category}
                </span>
                <h3 className="text-lg font-bold text-blue-900 leading-tight mb-1">
                  {title}
                </h3>
                <div className="flex items-center gap-1 text-sm text-blue-800 font-medium mb-3">
                  <Building2 size={14} className="text-blue-600" />
                  <p>{company}</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span>{location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{type}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleBookmark}
                  className="rounded-lg"
                >
                  {isBookmarked ? (
                    <BookmarkCheck size={18} className="text-blue-600" />
                  ) : (
                    <Bookmark size={18} className="text-gray-500" />
                  )}
                </Button>
                <SharePopover title={title} urlPath={`/internships/${id}`} />
                <Button className="bg-blue-700 hover:bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 h-10">
                  View
                  <ExternalLink size={14} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid View - Full Image Card with Overlay (TikTok/Instagram Style)
  return (
    <>
      <div 
        className="relative group cursor-pointer overflow-hidden rounded-3xl shadow-2xl border-2 border-transparent hover:border-blue-500 transition-all duration-500 aspect-[3/4]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
        style={{
          transform: isHovered ? 'scale(1.02) translateY(-8px)' : 'scale(1)',
          boxShadow: isHovered 
            ? '0 25px 50px -12px rgba(59, 130, 246, 0.4), 0 0 0 3px rgba(59, 130, 246, 0.1)' 
            : '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Full Background Image */}
        <div className="absolute inset-0">
          <Image
            src={cover_image_url || "/int.png"}
            alt={`Cover image for ${company}`}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Dynamic Gradient Overlay - Darker at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
          
          {/* Animated Shimmer Effect on Hover */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
              backgroundSize: '200% 200%',
              animation: isHovered ? 'shimmer 2s infinite' : 'none',
            }}
          />
        </div>

        {/* Top Section - Floating Elements */}
        <div className="absolute top-0 left-0 right-0 p-4 z-20">
          <div className="flex items-start justify-between">
            {/* Live Badge or Category */}
            {is_live ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 rounded-full shadow-2xl animate-pulse-glow">
                <div className="relative flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-white rounded-full animate-ping absolute" />
                  <div className="w-2.5 h-2.5 bg-white rounded-full" />
                </div>
                <span className="text-white text-sm font-black uppercase tracking-wider">
                  Live Now
                </span>
              </div>
            ) : (
              <div className="px-4 py-2 bg-blue-600/90 backdrop-blur-xl rounded-full shadow-lg border border-white/20">
                <span className="text-white text-xs font-bold uppercase tracking-wide">
                  {category}
                </span>
              </div>
            )}

            {/* Action Buttons - Right Side */}
            <div className="flex flex-col gap-3">
              {/* Bookmark */}
              <button
                onClick={handleBookmark}
                className="w-11 h-11 bg-white/95 backdrop-blur-xl hover:bg-white shadow-2xl rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
              >
                {isBookmarked ? (
                  <BookmarkCheck size={18} className="text-blue-600" />
                ) : (
                  <Bookmark size={18} className="text-gray-700" />
                )}
              </button>

              {/* Like Button (Instagram-style) */}
              <button
                onClick={handleLike}
                className="w-11 h-11 bg-white/95 backdrop-blur-xl hover:bg-white shadow-2xl rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
              >
                <Heart 
                  size={18} 
                  className={`transition-all duration-300 ${
                    isLiked 
                      ? 'text-red-600 fill-red-600 animate-like-bounce' 
                      : 'text-gray-700'
                  }`}
                />
              </button>

              {/* Share Button - Styled same as Like and Bookmark */}
              <div onClick={(e) => e.stopPropagation()}>
                <SharePopover 
                  title={title} 
                  urlPath={`/internships/${id}`}
                  
                />
              </div>
            </div>
          </div>

          {/* Viewer Count for Live */}
          {is_live && viewerCount > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-black/70 backdrop-blur-xl rounded-full">
              <Eye className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-bold">
                {formatViewCount(viewerCount)} watching
              </span>
            </div>
          )}
        </div>

        {/* Center Play Button for Live Content */}
        {is_live && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div 
              className="relative transition-all duration-500"
              style={{
                transform: isHovered ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl">
                <Play className="w-9 h-9 text-blue-600 fill-blue-600 ml-1" />
              </div>
              {/* Pulsing Ring */}
              <div className="absolute inset-0 w-20 h-20 bg-white rounded-full animate-ping-slow opacity-40" />
            </div>
          </div>
        )}

        {/* Bottom Content - Always Visible */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
          {/* Company Logo Badge */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-2xl border-2 border-white/30"
              style={{ backgroundColor: logoColor }}
            >
              {company.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-0.5">
                {company}
              </p>
              <h3 className="text-white text-lg font-black leading-tight line-clamp-2 drop-shadow-2xl">
                {title}
              </h3>
            </div>
          </div>

          {/* Location & Type - Compact */}
          <div className="flex items-center gap-3 mb-4 text-white/90">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <div className="w-6 h-6 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center">
                <MapPin size={13} />
              </div>
              <span className="drop-shadow-lg">{location}</span>
            </div>
            <span className="text-white/60">•</span>
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <div className="w-6 h-6 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center">
                <Clock size={13} />
              </div>
              <span className="drop-shadow-lg">{type}</span>
            </div>
          </div>

          {/* CTA Button - Full Width, Instagram Story Style */}
          <Link href={`/internships/${id}`} onClick={(e) => e.stopPropagation()}>
            <button
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-2xl transition-all duration-300 hover:shadow-blue-500/50 active:scale-98 group/btn"
            >
              <span className="text-base">
                {is_live ? 'Join Live Now' : 'View Details'}
              </span>
              {is_live ? (
                <Play size={18} className="fill-white transition-transform group-hover/btn:scale-110" />
              ) : (
                <ChevronRight size={20} className="transition-transform group-hover/btn:translate-x-1" />
              )}
            </button>
          </Link>
        </div>

        {/* Hover Glow Effect */}
        {isHovered && (
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow: 'inset 0 0 60px rgba(59, 130, 246, 0.3)',
            }}
          />
        )}
      </div>

      <LivePanel
        open={openLive}
        onClose={() => setOpenLive(false)}
        title={title}
        description={`<p>${title} at ${company} — Live Q&A with the hiring team.</p>`}
        coverImage={cover_image_url}
        youtubeId={live_stream_url || "https://www.youtube.com/watch?v=ysz5S6PUM-U"}
        postingType="Internship"
        applyUrl={`/internships/${id}`}
      />

      <style jsx>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
        @keyframes like-bounce {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.3);
          }
        }
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
          }
          50% {
            box-shadow: 0 0 40px rgba(239, 68, 68, 0.8);
          }
        }
        .animate-ping {
          animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-like-bounce {
          animation: like-bounce 0.4s ease-in-out;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .active\\:scale-98:active {
          transform: scale(0.98);
        }
      `}</style>
    </>
  );
};