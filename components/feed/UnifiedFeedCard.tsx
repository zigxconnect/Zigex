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
      observer.disconnect();
    };
  }, []);

  const getImageUrl = () => {
    if (imageError) return "/placeholder.png";

    switch (item._type) {
      case "internships":
        return normalizeImageSrc((item as any).cover_image_url);
      case "programs":
        return normalizeImageSrc((item as any).program_picture_url);
      case "events":
        return normalizeImageSrc((item as any).event_picture_url);
      case "announcements":
        return normalizeImageSrc((item as any).image_url);
      default:
        return "/placeholder.png";
    }
  };

  const companyName = typeof item.company === "string"
    ? item.company
    : item.company?.company_name || "Company";

  // Check if program is open
  const now = new Date();
  let isOpen = true;

  if (item._type === "programs") {
    const program = item as any;
    const appDeadline = program.application_deadline ? new Date(program.application_deadline) : null;
    const endDate = program.end_date ? new Date(program.end_date) : null;
    
    if (appDeadline) appDeadline.setHours(23, 59, 59, 999);
    if (endDate) endDate.setHours(23, 59, 59, 999);

    if (program.isLocked || (endDate && endDate < now) || (appDeadline && appDeadline < now)) {
      isOpen = false;
    }
  } else if (item._type === "internships") {
    const internship = item as any;
    const deadline = internship.deadline ? new Date(internship.deadline) : null;
    if (deadline) {
      deadline.setHours(23, 59, 59, 999);
      if (deadline < now) isOpen = false;
    }
  } else if (item._type === "events") {
    const event = item as any;
    const registrationDeadline = event.registration_deadline ? new Date(event.registration_deadline) : null;
    const endDate = event.end_date ? new Date(event.end_date) : null;

    if (registrationDeadline) registrationDeadline.setHours(23, 59, 59, 999);
    if (endDate) endDate.setHours(23, 59, 59, 999);

    if ((endDate && endDate < now) || (registrationDeadline && registrationDeadline < now)) {
      isOpen = false;
    }
  }

  const handleCardClick = () => {
    // Use slug for cleaner URLs as requested
    const slug = slugify(item.title) || item.id;
    router.push(`/feed/${slug}`);
  };

  return (
    <div
      ref={cardRef}
      className={`transition-all duration-700 h-full ${isVisible
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 translate-y-8'
        }`}
      style={{
        transitionDelay: `${index * 50}ms`,
      }}
    >
      <Card
        onClick={handleCardClick}
        className="group overflow-hidden border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-500 bg-white rounded-[2rem] h-full flex flex-col cursor-pointer"
      >
        {/* Image Section */}
        <div className="relative h-64 flex-shrink-0 overflow-hidden m-3 rounded-[1.8rem]">
          <Image
            src={getImageUrl()}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={index < 3}
          />

          {/* Badges on Image */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            <div className="bg-white px-4 py-1.5 rounded-full shadow-sm">
              <span className="text-black text-xs font-bold uppercase tracking-tight">
                {item._type.slice(0, -1)}
              </span>
            </div>

            {item._type !== "announcements" && (
              isOpen ? (
                <div className="bg-[#16A34A] px-4 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                  <Unlock size={12} className="text-black" />
                  <span className="text-black text-xs font-bold uppercase tracking-tight">OPEN</span>
                </div>
              ) : (
                <div className="bg-destructive px-4 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                  <Lock size={12} className="text-white" />
                  <span className="text-white text-xs font-bold uppercase tracking-tight">CLOSED</span>
                </div>
              )
            )}
          </div>

          {/* Share Button */}
          <div className="absolute top-4 right-4 z-10">
            <div
              className="w-10 h-10 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white transition-all shadow-sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <ShareButton
                title={item.title}
                description={item.description || `Check out this ${item._type.slice(0, -1)}`}
                url={`/feed/${slugify(item.title) || item.id}`}
                imageUrl={getImageUrl()}
                type={item._type === "internships" ? "internship" : item._type === "events" ? "event" : "program"}
              />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-6 py-6 space-y-4 flex-1 flex flex-col">
          {/* Company Info */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={normalizeImageSrc(item.company?.logo_url || "/seedLogo.png")}
                alt={companyName}
                width={24}
                height={24}
                className="object-cover"
              />
            </div>
            <p className="text-[#155DFC] text-sm font-black uppercase tracking-wider">{companyName}</p>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-black text-black leading-tight line-clamp-2">
            {item.title}
          </h3>

          {/* Description */}
          {item.description && (
            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed font-medium">
              {item.description.replace(/<[^>]*>/g, "")}
            </p>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-2 text-black pt-2">
            <div className="w-8 h-8 rounded-full bg-[#155DFC]/10 flex items-center justify-center text-[#155DFC]">
              <MapPin size={18} />
            </div>
            <span className="text-base font-bold truncate">{item.location}</span>
          </div>

          {/* CTA Button */}
          <div className="mt-auto pt-4 pb-2">
            <button
              className="w-full py-4 bg-gradient-to-r from-[#155DFC] to-[#0D47A1] text-white font-bold rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 group/btn transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>View Details</span>
              <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}