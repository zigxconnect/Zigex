"use client";

import {
  MapPin, Calendar, Clock, Building2, ExternalLink,
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
import { Event } from "@/lib/types/dashoard";

interface EventCardProps {
  event: Event;
  viewMode?: "grid" | "list";
  onLiveClick?: () => void;
}

export const EventCard = ({
  event,
  viewMode = "grid",
  onLiveClick
}: EventCardProps) => {
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

    const slug = slugify(event.title) || event.id;
    const shareData = {
      title: event.title,
      text: `Check out this event: ${event.title} by ${event.company?.company_name || 'Community'}`,
      url: window.location.origin + `/events/${slug}`
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

  const companyName = event.company?.company_name || "Community Event";
  const coverImage = event.event_picture_url || "/events-placeholder.jpg";
  const slug = slugify(event.title) || event.id;
  const isLive = (event as any).is_live || /live/i.test(event.title || "");

  if (viewMode === "list") {
    return (
      <div
        ref={cardRef}
        className={`${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} transition-all duration-700`}
      >
        <Link href={`/events/${slug}`}>
          <Card className="p-0 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden bg-white rounded-2xl">
            <div className="flex">
              <div className="relative w-48 h-full flex-shrink-0">
                <Image
                  src={coverImage}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 p-6 flex items-center justify-between">
                <div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full mb-2 inline-block">
                    Event
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{event.title}</h3>
                  <p className="text-green-600 font-semibold text-sm mb-3 uppercase tracking-wider">{companyName}</p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><MapPin size={14} /> {event.location}</span>
                    <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(event.start_date)}</span>
                  </div>
                </div>
                <button className="px-6 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors">
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
        onClick={() => router.push(`/events/${slug}`)}
      >
        <div className="relative h-64 flex-shrink-0 overflow-hidden m-3 rounded-[1.8rem]">
          <Image
            src={coverImage}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            <div className="bg-white px-4 py-1.5 rounded-full shadow-sm">
              <span className="text-black text-xs font-bold uppercase tracking-tight">Event</span>
            </div>
            {isLive ? (
              <div className="bg-red-600 px-4 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 animate-pulse">
                <Play size={12} className="text-white fill-white" />
                <span className="text-white text-xs font-bold uppercase tracking-tight">LIVE</span>
              </div>
            ) : (
              <div className="bg-[#16A34A] px-4 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                <Unlock size={12} className="text-black" />
                <span className="text-black text-xs font-bold uppercase tracking-tight">OPEN</span>
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
            <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-green-100 flex items-center justify-center">
              <Image
                src={normalizeImageSrc(event.company?.logo_url || "/seedLogo.png")}
                alt={companyName}
                width={24}
                height={24}
                className="object-cover"
              />
            </div>
            <p className="text-green-600 text-sm font-black uppercase tracking-wider">{companyName}</p>
          </div>

          <h3 className="text-2xl font-black text-black leading-tight line-clamp-2">{event.title}</h3>

          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-center gap-2 text-black">
              <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                <MapPin size={18} />
              </div>
              <span className="text-base font-bold truncate">{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-black">
              <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                <Calendar size={18} />
              </div>
              <span className="text-base font-bold truncate">{formatDate(event.start_date)}</span>
            </div>
          </div>

          <div className="mt-auto pt-4 pb-2">
            <button
              className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-green-500/20 group/btn transition-all hover:scale-[1.02] active:scale-[0.98]"
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