"use client";

import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Clock,
  ExternalLink,
  GraduationCap,
  Bookmark,
  BookmarkCheck,
  Play,
  Eye,
  Heart,
  ChevronRight,
  Share2,
  CheckCircle,
  XCircle,
  LockIcon,
  LockOpen,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Program } from "@/lib/types/dashoard";
import LiveBadge from "@/components/uiComponent/LiveBadge";
import LivePanel from "@/components/uiComponent/LivePanel";

interface ProgramCardProps {
  program: Program;
  viewMode?: "grid" | "list";
  onLiveClick?: () => void;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export const ProgramCard = ({ 
  program, 
  viewMode = "grid",
  onLiveClick 
}: ProgramCardProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [openLive, setOpenLive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Setup intersection observer for smooth scroll animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const companyName = program.company?.company_name || "Community Program";
  const coverImage = program.program_picture_url || "/program-placeholder.jpg";
  const isLive = (program as any).is_live || /live/i.test(program.title || "");
  const viewerCount = (program as any).viewerCount || 0;
  const logoColor = "#2563eb"; // Blue theme for programs like internships
  const category = program.program_category || "Training";
  const locationType = program.location || program.type || "Remote";

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
    if (isLive && onLiveClick) {
      onLiveClick();
    }
  };

  // Handle native sharing
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const shareData = {
      title: program.title,
      text: `Check out this program: ${program.title} at ${companyName}`,
      url: window.location.origin + `/programs/${program.id}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copy link
        await navigator.clipboard.writeText(shareData.url);
        // You might want to add a toast notification here
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  // Determine if program is open based on dates
  const isOpenWindow = (program: Program) => {
    try {
      const now = new Date();
      if (program.start_date && program.end_date) {
        const start = new Date(program.start_date);
        const end = new Date(program.end_date);
        return now >= start && now <= end;
      }
      if (program.end_date) {
        const end = new Date(program.end_date);
        return now <= end;
      }
      if (program.start_date) {
        const start = new Date(program.start_date);
        return now >= start;
      }
      return true; // If no dates are set, consider it open
    } catch (error) {
      console.error('Error checking program status:', error);
      return true; // Default to open if there's an error
    }
  };

  const openStatusComputed = isOpenWindow(program);

  const formatViewCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (viewMode === "list") {
    return (
      <div
        ref={cardRef}
        className={`${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} transition-all duration-700`}
      >
        <Link href={`/programs/${program.id}`}>
          <div 
            onClick={handleCardClick}
            className={`bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden group ${isLive ? 'cursor-pointer' : ''}`}
          >
          <div className="flex">
            {/* Image Section */}
            <div className="relative w-48 h-full flex-shrink-0">
              <Image
                src={coverImage}
                alt={`Cover for ${program.title}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
              
              {isLive && (
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
                  {program.title}
                </h3>
                <div className="flex items-center gap-1 text-sm text-blue-800 font-medium mb-3">
                  <GraduationCap size={14} className="text-blue-600" />
                  <p>{companyName}</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span className="capitalize">{locationType}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{formatDate(program.start_date)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {/* Bookmark */}
                <button
                  onClick={handleBookmark}
                  className="w-10 h-10 bg-white/95 backdrop-blur-xl hover:bg-white shadow rounded-md flex items-center justify-center"
                >
                  {isBookmarked ? (
                    <BookmarkCheck size={18} className="text-blue-600" />
                  ) : (
                    <Bookmark size={18} className="text-gray-500" />
                  )}
                </button>

                {/* Like button */}
                <button
                  onClick={handleLike}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-10 h-10 bg-white/95 backdrop-blur-xl hover:bg-white shadow rounded-md flex items-center justify-center"
                >
                  <Heart size={18} className={`transition-all duration-300 ${isLiked ? 'text-red-600 fill-red-600' : 'text-gray-700'}`} />
                </button>

                {/* Share (native) */}
                <button
                  onClick={handleShare}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-10 h-10 bg-white/95 backdrop-blur-xl hover:bg-white shadow rounded-md flex items-center justify-center"
                  aria-label="Share"
                >
                  <Share2 size={18} className="text-gray-700" />
                </button>

                {/* Open/Closed status */}
                <div className="ml-2">
                  {openStatusComputed ? (
                    <div className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold inline-flex items-center gap-1 border border-emerald-100">
                      <CheckCircle size={14} className="text-emerald-600" />
                      <span>Open</span>
                    </div>
                  ) : (
                    <div className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs font-semibold inline-flex items-center gap-1 border border-red-100">
                      <XCircle size={14} className="text-red-600" />
                      <span>Closed</span>
                    </div>
                  )}
                </div>

                {/* CTA Button - View */}
                <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 h-10">
                  View
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
    );
  }

  // Grid View - Full Image Card with Overlay (TikTok/Instagram Style)
  return (
    <>
      <div
        ref={cardRef}
        className={`${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} transition-all duration-700`}
      >
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
            src={coverImage}
            alt={`Cover for ${program.title}`}
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
            {isLive ? (
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

              {/* Share Button (native) */}
              <button
                onClick={handleShare}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-11 h-11 bg-white/95 backdrop-blur-xl hover:bg-white shadow-2xl rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
                aria-label="Share"
              >
                <Share2 size={18} className="text-gray-700" />
              </button>

              {/* Open/Closed status */}
              <div className="flex items-center justify-center b">
                {openStatusComputed ? (
                  <div className="flex flex-col items-center gap-1 bg-blue-600/90 backdrop-blur-xl rounded-full shadow-lg border border-white/20 p-2">
                    <LockOpen size={18} className="text-white" />
                    {/* <span className="text-xs text-white">Open</span> */}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 bg-red-600/90 backdrop-blur-xl rounded-full shadow-lg border border-white/20 p-2">
                    <LockIcon size={18} className="text-white" />
                    {/* <span className="text-xs text-white">Closed</span> */}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Viewer Count for Live */}
          {isLive && viewerCount > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-black/70 backdrop-blur-xl rounded-full">
              <Eye className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-bold">
                {formatViewCount(viewerCount)} watching
              </span>
            </div>
          )}
        </div>

        {/* Center Play Button for Live Content */}
        {isLive && (
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
          {/* Company/Organizer Logo Badge (use actual logo with seed fallback) */}
          <div className="flex items-center gap-3 mb-3">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/30">
              <Image
                src={program.company?.logo_url || "/seedLogo.png"}
                alt={`${companyName} logo`}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-0.5">
                {companyName}
              </p>
              <h3 className="text-white text-lg font-black leading-tight line-clamp-2 drop-shadow-2xl">
                {program.title}
              </h3>
            </div>
          </div>

          {/* Location & Start Date - Compact */}
          <div className="flex items-center gap-3 mb-4 text-white/90">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <div className="w-6 h-6 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center">
                <MapPin size={13} />
              </div>
              <span className="drop-shadow-lg capitalize">{locationType}</span>
            </div>
            <span className="text-white/60">•</span>
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <div className="w-6 h-6 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center">
                <Clock size={13} />
              </div>
              <span className="drop-shadow-lg">{formatDate(program.start_date)}</span>
            </div>
          </div>

          {/* CTA Button - Full Width, Instagram Story Style */}
          <Link href={`/programs/${program.id}`} onClick={(e) => e.stopPropagation()}>
            <button
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-2xl transition-all duration-300 hover:shadow-blue-500/50 active:scale-98 group/btn cursor-pointer"
            >
              <span className="text-base">
                {isLive ? 'Join Live Session' : 'View Program'}
              </span>
              {isLive ? (
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
              boxShadow: 'inset 0 0 60px rgba(168, 85, 247, 0.3)',
            }}
          />
        )}
      </div>
      </div>

      <LivePanel
        open={openLive}
        onClose={() => setOpenLive(false)}
        title={program.title}
        description={(program as any).description || `<p>${program.title} — A hands-on program to level up skills. Join the live session to ask questions and watch demos.</p>`}
        coverImage={coverImage}
        youtubeId={(program as any).live_stream_url || "https://www.youtube.com/watch?v=ysz5S6PUM-U"}
        postingType="Program"
        applyUrl={`/programs/${program.id}`}
      />

      <style jsx global>{`
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