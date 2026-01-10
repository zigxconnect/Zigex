// components/feed/UnifiedFeedCard.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin, Calendar, Clock, Users,
  Lock, Unlock, ArrowRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/uiComponent/Badge";
import { ShareButton } from "@/components/sections/dashboard/ShareButton";
import type { FeedItem } from "@/lib/types/feed";
import { normalizeImageSrc, slugify } from "@/lib/utils";

interface UnifiedFeedCardProps {
  item: FeedItem;
  onLiveClick?: () => void;
  index?: number;
}

export function UnifiedFeedCard({ item, onLiveClick, index = 0 }: UnifiedFeedCardProps) {
  const router = useRouter();
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

  const handleCardClick = () => {
    router.push(`/feed/${slugify(item.title)}`);
  };

  return (
    <div
      ref={cardRef}
      className={`transition-all duration-700 h-full ${isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8'
        }`}
      style={{
        transitionDelay: `${index * 80}ms`,
      }}
    >
      <Card
        onClick={handleCardClick}
        className="group overflow-hidden border border-border hover:shadow-xl transition-all duration-500 bg-card rounded-xl hover:-translate-y-2 h-full flex flex-col cursor-pointer"
      >
        <div className="block h-full flex flex-col">
          {/* Image Section */}
          <div className="relative h-48 flex-shrink-0 overflow-hidden bg-muted">
            <Image
              src={getImageUrl()}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={index < 3}
            />

            {/* Gradient Overlay - Simplified */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-60 transition-opacity duration-500" />

            {/* Top Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2 z-10 items-start">
              <Badge className="bg-white text-black border-gray-100 border backdrop-blur-sm transform transition-transform duration-300 group-hover:scale-105">
                {item._type.charAt(0).toUpperCase() + item._type.slice(1, -1)}
              </Badge>

              {item.is_live && (
                <Badge
                  className="bg-destructive text-destructive-foreground border-destructive backdrop-blur-sm cursor-pointer hover:bg-destructive/90 transition-all transform hover:scale-105"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onLiveClick?.();
                  }}
                >
                  <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse inline-block" />
                  LIVE
                </Badge>
              )}

              {/* Status Badge */}
              {item._type === "programs" && (
                isOpen ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-success backdrop-blur-md rounded-full border border-success/30 shadow-sm">
                    <Unlock size={12} className="text-success-foreground" />
                    <span className="text-success-foreground text-xs font-bold uppercase tracking-wide">Open</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-destructive backdrop-blur-md rounded-full border border-destructive/30 shadow-sm">
                    <Lock size={12} className="text-destructive-foreground" />
                    <span className="text-destructive-foreground text-xs font-bold uppercase tracking-wide">Closed</span>
                  </div>
                )
              )}
            </div>

            {/* Share Button - Top Right */}
            <div className="absolute top-3 right-3 z-10">
              <div
                className="bg-white/95 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md transition-all"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <ShareButton
                  title={item.title}
                  description={item.description || `Check out this ${item._type.slice(0, -1)}`}
                  url={`/feed/${slugify(item.title)}`}
                  imageUrl={getImageUrl()}
                  type={item._type === "internships" ? "internship" : item._type === "events" ? "event" : "program"}
                />
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-5 space-y-3 flex-1 flex flex-col">
            {/* Company Info */}
            <div className="flex items-center gap-2.5 transform transition-transform duration-300 group-hover:translate-x-1">
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-muted group-hover:ring-primary/20 transition-all duration-300">
                <Image
                  src={normalizeImageSrc(item.company?.logo_url || "/seedLogo.png")}
                  alt={companyName}
                  width={36}
                  height={36}
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-primary uppercase tracking-wide truncate">{companyName}</p>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-tight min-h-[3.5rem] mb-1">
              {item.title}
            </h3>

            {/* Description */}
            {item.description && (
              <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                {item.description.replace(/<[^>]*>/g, "")}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-2 border-t border-border flex-1 content-start">
              <div className="flex items-center gap-1 transition-colors duration-300 hover:text-foreground">
                <MapPin size={16} className="flex-shrink-0 text-primary" />
                <span className="truncate text-sm font-medium text-gray-700">{item.location}</span>
              </div>

              {item._type === "programs" && (item as any).duration && (
                <div className="flex items-center gap-1 transition-colors duration-300 hover:text-foreground">
                  <Clock size={13} className="flex-shrink-0" />
                  <span>{(item as any).duration}</span>
                </div>
              )}

              {item._type === "internships" && (item as any).department && (
                <div className="flex items-center gap-1 transition-colors duration-300 hover:text-foreground">
                  <Users size={13} className="flex-shrink-0" />
                  <span>{(item as any).department}</span>
                </div>
              )}

              {item._type === "events" && (item as any).start_date && (
                <div className="flex items-center gap-1 transition-colors duration-300 hover:text-foreground">
                  <Calendar size={13} className="flex-shrink-0" />
                  <span>{formatDate((item as any).start_date)}</span>
                </div>
              )}
            </div>

            {/* CTA Button */}
            <div className="mt-auto pt-3">
              <button
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="relative cursor-pointer overflow-hidden w-full py-2.5 px-4 bg-primary text-primary-foreground font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transform hover:scale-[1.02]"
              >
                {/* Button content */}
                <span className="relative z-10">{isOpen ? "View Details" : "Learn More"}</span>
                <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      <style jsx>{`
        /* AI Animations Removed */
      `}</style>
    </div>
  );
}