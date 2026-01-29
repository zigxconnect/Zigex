"use client";

import {
  MapPin, Clock, Building2, ExternalLink,
  Bookmark, BookmarkCheck, Play, Eye,
  Heart, Share2, CheckCircle, XCircle,
  ArrowRight, Lock, Unlock
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { normalizeImageSrc, slugify } from "@/lib/utils";
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
  company_logo_url?: string;
  start_date?: string | null;
  end_date?: string | null;
  application_deadline?: string | null;
  viewMode?: "grid" | "list";
  is_live?: boolean;
  live_stream_url?: string;
  viewerCount?: number;
  onLiveClick?: () => void;
  description?: string;
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
  company_logo_url,
  start_date,
  end_date,
  application_deadline,
  viewMode = "grid",
  onLiveClick,
  description
}: InternshipCardProps) => {
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

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
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const slug = slugify(title) || id;
    const shareData = {
      title,
      text: `Check out this internship: ${title} at ${company}`,
      url: window.location.origin + `/internships/${slug}`
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

  // Check if open
  const now = new Date();
  let isOpen = true;
  if (application_deadline && new Date(application_deadline) < now) isOpen = false;
  if (start_date && new Date(start_date) < now) isOpen = false;

  const slug = slugify(title) || id;

  if (viewMode === "list") {
    return (
      <div
        ref={cardRef}
        className={`${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} transition-all duration-700`}
      >
        <Link href={`/internships/${slug}`}>
          <Card className="p-0 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden bg-white rounded-2xl">
            <div className="flex">
              <div className="relative w-48 h-full flex-shrink-0">
                <Image
                  src={cover_image_url || "/intern.png"}
                  alt={title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 p-6 flex items-center justify-between">
                <div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full mb-2 inline-block">
                    {category}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
                  <p className="text-blue-600 font-semibold text-sm mb-3 uppercase tracking-wider">{company}</p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><MapPin size={14} /> {location}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {type}</span>
                  </div>
                </div>
                <button className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                  View
                </button>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      className={`${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} transition-all duration-700 h-full`}
    >
      <Card
        className="group overflow-hidden border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-500 bg-white rounded-[2rem] h-full flex flex-col cursor-pointer"
        onClick={() => router.push(`/internships/${slug}`)}
      >
        <div className="relative h-64 flex-shrink-0 overflow-hidden m-3 rounded-[1.8rem]">
          <Image
            src={cover_image_url || "/intern.png"}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            <div className="bg-white px-4 py-1.5 rounded-full shadow-sm">
              <span className="text-black text-xs font-bold uppercase tracking-tight">Internship</span>
            </div>
            {isOpen ? (
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

        <div className="px-6 py-6 space-y-4 flex-1 flex flex-col">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={normalizeImageSrc(company_logo_url || "/seedLogo.png")}
                alt={company}
                width={24}
                height={24}
                className="object-cover"
              />
            </div>
            <p className="text-[#155DFC] text-sm font-black uppercase tracking-wider">{company}</p>
          </div>

          <h3 className="text-2xl font-black text-black leading-tight line-clamp-2">{title}</h3>

          {description && (
            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed font-medium">
              {description.replace(/<[^>]*>/g, "")}
            </p>
          )}

          <div className="flex items-center gap-2 text-black pt-2">
            <div className="w-8 h-8 rounded-full bg-[#155DFC]/10 flex items-center justify-center text-[#155DFC]">
              <MapPin size={18} />
            </div>
            <span className="text-base font-bold truncate">{location}</span>
          </div>

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