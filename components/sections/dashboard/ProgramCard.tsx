"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Lock,
  Unlock,
  ArrowRight,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Program } from "@/lib/types/dashoard";
import { Card } from "@/components/ui/card";
import { normalizeImageSrc } from "@/lib/utils";
import LiveBadge from "@/components/uiComponent/LiveBadge";
import LivePanel from "@/components/uiComponent/LivePanel";
import { slugify } from "@/lib/utils";

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
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
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

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Use slugified title for sharing
    const slug = slugify(program.title) || program.id;
    const shareData = {
      title: program.title,
      text: `Check out this program: ${program.title} at ${companyName}`,
      url: window.location.origin + `/programs/${slug}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
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
      return true;
    } catch (error) {
      return true;
    }
  };

  const openStatusComputed = isOpenWindow(program);
  const slug = slugify(program.title) || program.id;

  if (viewMode === "list") {
    return (
      <div
        ref={cardRef}
        className={`${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} transition-all duration-700`}
      >
        <Link href={`/programs/${slug}`}>
          <div
            className={`bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group`}
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

                  <button
                    onClick={handleShare}
                    className="w-10 h-10 bg-white/95 backdrop-blur-xl hover:bg-white shadow rounded-md flex items-center justify-center"
                  >
                    <Share2 size={18} className="text-gray-700" />
                  </button>

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

  // Grid View - Premium Style Matching Screenshot
  return (
    <div
      ref={cardRef}
      className={`${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} transition-all duration-700 h-full`}
    >
      <Card
        className="group overflow-hidden border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-500 bg-white rounded-[2rem] h-full flex flex-col cursor-pointer"
        onClick={() => router.push(`/programs/${slug}`)}
      >
        {/* Image Section */}
        <div className="relative h-64 flex-shrink-0 overflow-hidden m-3 rounded-[1.8rem]">
          <Image
            src={coverImage}
            alt={program.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Badges on Image */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            <div className="bg-white px-4 py-1.5 rounded-full shadow-sm">
              <span className="text-black text-xs font-bold uppercase tracking-tight">Program</span>
            </div>

            {openStatusComputed ? (
              <div className="bg-[#16A34A] px-4 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                <Unlock size={12} className="text-black" />
                <span className="text-black text-xs font-bold uppercase tracking-tight">OPEN</span>
              </div>
            ) : (
              <div className="bg-destructive px-4 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                <Lock size={12} className="text-white" />
                <span className="text-white text-xs font-bold uppercase tracking-tight">CLOSED</span>
              </div>
            )}
          </div>

          {/* Share Button */}
          <div className="absolute top-4 right-4 z-10">
            <button
              className="w-10 h-10 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white transition-all shadow-sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleShare(e);
              }}
            >
              <Share2 size={18} className="text-black" />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-6 py-6 space-y-4 flex-1 flex flex-col">
          {/* Company Info */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={normalizeImageSrc(program.company?.logo_url || "/seedLogo.png")}
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
            {program.title}
          </h3>

          {/* Description */}
          {program.description && (
            <div className="text-sm text-gray-500 line-clamp-2 leading-relaxed font-medium"
              dangerouslySetInnerHTML={{ __html: program.description }}
            />
          )}

          {/* Metadata */}
          <div className="flex items-center gap-2 text-black pt-2">
            <div className="w-8 h-8 rounded-full bg-[#155DFC]/10 flex items-center justify-center text-[#155DFC]">
              <MapPin size={18} />
            </div>
            <span className="text-base font-bold truncate">{locationType}</span>
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
};

// Helper inside file for now
function slugify(text: string) {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}
