// components/feed/UnifiedFeedCard.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  MapPin, Calendar, Clock, Users, 
  Lock, Unlock, ChevronRight, Star, TrendingUp 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/uiComponent/Badge";
import type { FeedItem } from "@/lib/types/feed";
import { normalizeImageSrc } from "@/lib/utils";

interface UnifiedFeedCardProps {
  item: FeedItem;
  onLiveClick?: () => void;
  index?: number;
}

export function UnifiedFeedCard({ item, onLiveClick, index = 0 }: UnifiedFeedCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for scroll animations
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
        rootMargin: "50px",
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  const getImageUrl = () => {
    if (imageError) return "/placeholder.png";
    
    switch (item._type) {
      case "internships":
        return normalizeImageSrc((item as any).cover_image_url || (item as any).internship_picture_url);
      case "programs":
        return normalizeImageSrc((item as any).program_picture_url);
      case "events":
        return normalizeImageSrc((item as any).event_picture_url);
      default:
        return "/placeholder.png";
    }
  };

  const companyName = typeof item.company === "string" 
    ? item.company 
    : item.company?.company_name || "Company";

  // Check if program is open (improved logic)
  const now = new Date();
  let isOpen = true;
  let statusMessage = "";

  if (item._type === "programs") {
    const program = item as any;
    
    // Check if explicitly locked
    if (program.isLocked) {
      isOpen = false;
      statusMessage = "Applications Closed";
    } 
    // Check end date
    else if (program.end_date && new Date(program.end_date) < now) {
      isOpen = false;
      statusMessage = "Program Ended";
    }
    // Check application deadline
    else if (program.application_deadline && new Date(program.application_deadline) < now) {
      isOpen = false;
      statusMessage = "Deadline Passed";
    }
    else {
      isOpen = true;
      statusMessage = "Open for Applications";
    }
  }

  const formatDate = (date?: string) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  // Mock rating/enrollment data - replace with actual data from your database
  const rating = (4 + Math.random()).toFixed(1);
  const enrolled = Math.floor(Math.random() * 5000) + 500;

  return (
    <div
      ref={cardRef}
      className={`transition-all duration-700 h-full ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}
      style={{ 
        transitionDelay: `${index * 80}ms`,
      }}
    >
      <Card className="group overflow-hidden border border-gray-200 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 bg-white rounded-xl hover:-translate-y-2 h-full flex flex-col">
        <Link href={`/feed/${item.id}`} className="block h-full flex flex-col">
          {/* Image Section */}
          <div className="relative h-48 flex-shrink-0 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
            <Image
              src={getImageUrl()}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={index < 3}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-blue-600/5 opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
            
            {/* Top Badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 border backdrop-blur-sm transform transition-transform duration-300 group-hover:scale-105">
                {item._type.charAt(0).toUpperCase() + item._type.slice(1, -1)}
              </Badge>
              
              {item.is_live && (
                <Badge 
                  className="bg-red-600 text-white border-red-700 backdrop-blur-sm cursor-pointer hover:bg-red-700 transition-all transform hover:scale-105"
                  onClick={(e) => {
                    e.preventDefault();
                    onLiveClick?.();
                  }}
                >
                  <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse inline-block" />
                  LIVE
                </Badge>
              )}
            </div>

            {/* Lock Status for Programs - Enhanced */}
            {item._type === "programs" && (
              <div className="absolute top-3 right-3 z-10 group/lock">
                {isOpen ? (
                  <div 
                    className="bg-gradient-to-br from-blue-600 to-blue-600 text-white   shadow-lg backdrop-blur-sm transform flex transition-all duration-300 hover:scale-110 hover:rotate-12 cursor-pointer p-2 align-center justify-center rounded-sm" 
                    title={statusMessage}
                  >
                    <Unlock size={16} className="drop-shadow-md" />
                    <span className="text-white text-sm">Open</span>
                  </div>
                ) : (
                  <div 
                    className="bg-gradient-to-br from-gray-500 to-gray-600 text-white p-2.5 rounded-full shadow-lg backdrop-blur-sm transform transition-all duration-300 hover:scale-110 hover:rotate-12 cursor-pointer" 
                    title={statusMessage}
                  >
                    <Lock size={16} className="drop-shadow-md" />
                  </div>
                )}
                
                {/* Tooltip */}
                <div className="absolute top-full right-0 mt-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/lock:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                  {statusMessage}
                  <div className="absolute bottom-full right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900" />
                </div>
              </div>
            )}

            {/* Bottom Stats - Enhanced */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2 z-10">
              <div className="bg-white/95 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 backdrop-blur-sm shadow-md transform transition-all duration-300 group-hover:scale-105">
                <Star size={14} className="text-yellow-500 fill-yellow-500 animate-pulse" />
                <span className="text-xs font-bold text-gray-900">{rating}</span>
              </div>
              <div className="bg-white/95 px-2.5 py-1.5 rounded-lg backdrop-blur-sm shadow-md transform transition-all duration-300 group-hover:scale-105">
                <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <TrendingUp size={12} className="text-green-600" />
                  {enrolled.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-5 space-y-3 flex-1 flex flex-col">
            {/* Company Info */}
            <div className="flex items-center gap-2.5 transform transition-transform duration-300 group-hover:translate-x-1">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-gray-100 group-hover:ring-blue-200 transition-all duration-300">
                <Image
                  src={normalizeImageSrc(item.company?.logo_url || "/seedLogo.png")}
                  alt={companyName}
                  width={36}
                  height={36}
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{companyName}</p>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 leading-snug min-h-[3.5rem]">
              {item.title}
            </h3>

            {/* Description */}
            {item.description && (
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                {item.description.replace(/<[^>]*>/g, "")}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap gap-3 text-xs text-gray-500 pt-2 border-t border-gray-100 flex-1 content-start">
              <div className="flex items-center gap-1 transition-colors duration-300 hover:text-gray-700">
                <MapPin size={13} className="flex-shrink-0" />
                <span className="truncate">{item.location}</span>
              </div>
              
              {item._type === "programs" && (item as any).duration && (
                <div className="flex items-center gap-1 transition-colors duration-300 hover:text-gray-700">
                  <Clock size={13} className="flex-shrink-0" />
                  <span>{(item as any).duration}</span>
                </div>
              )}
              
              {item._type === "internships" && (item as any).department && (
                <div className="flex items-center gap-1 transition-colors duration-300 hover:text-gray-700">
                  <Users size={13} className="flex-shrink-0" />
                  <span>{(item as any).department}</span>
                </div>
              )}

              {item._type === "events" && (item as any).start_date && (
                <div className="flex items-center gap-1 transition-colors duration-300 hover:text-gray-700">
                  <Calendar size={13} className="flex-shrink-0" />
                  <span>{formatDate((item as any).start_date)}</span>
                </div>
              )}
            </div>

            {/* CTA Button with Sparkle Effects */}
            <div className="mt-auto pt-3">
              <button 
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="relative cursor-pointer  overflow-hidden w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:scale-[1.02]"
            >
              {/* Shimmer effect */}
              <span
                className={`
                  absolute inset-0 -translate-x-full
                  bg-gradient-to-r from-transparent via-white/30 to-transparent
                  ${isHovered ? "animate-shimmer" : ""}
                `}
              />

              {/* Pulse background on hover */}
              {isHovered && (
                <span className="absolute inset-0 bg-blue-400 animate-ping opacity-20" />
              )}

              {/* Particle effects on hover */}
              {isHovered && (
                <>
                  <span className="absolute top-0 left-1/4 w-1 h-1 bg-white rounded-full animate-particle-1" />
                  <span className="absolute top-0 right-1/4 w-1 h-1 bg-white rounded-full animate-particle-2" />
                  <span className="absolute bottom-0 left-1/3 w-1 h-1 bg-white rounded-full animate-particle-3" />
                </>
              )}

              {/* Button content */}
              <span className="relative z-10">{isOpen ? "View Details" : "Learn More"}</span>
              <ChevronRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            </div>
          </div>
        </Link>
      </Card>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes particle-1 {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-10px, -20px) scale(0);
            opacity: 0;
          }
        }

        @keyframes particle-2 {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(10px, -20px) scale(0);
            opacity: 0;
          }
        }

        @keyframes particle-3 {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(5px, 20px) scale(0);
            opacity: 0;
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-particle-1 {
          animation: particle-1 0.8s ease-out forwards;
        }

        .animate-particle-2 {
          animation: particle-2 0.8s ease-out forwards;
          animation-delay: 0.1s;
        }

        .animate-particle-3 {
          animation: particle-3 0.8s ease-out forwards;
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
}