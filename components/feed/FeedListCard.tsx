// components/feed/FeedListCard.tsx
import Image from "next/image";
import Link from "next/link";
import { MapPin, Lock, Unlock, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ShareButton } from "@/components/sections/dashboard/ShareButton";
import type { FeedItem } from "@/lib/types/feed";
import { normalizeImageSrc, slugify } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface FeedListCardProps {
  item: FeedItem;
  index?: number;
  isOpen: boolean;
}

export function FeedListCard({ item, index = 0, isOpen }: FeedListCardProps) {
  const companyName = typeof item.company === "string"
    ? item.company
    : item.company?.company_name || "Company";

  const getImageUrl = () => {
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

  const slug = slugify(item.title) || item.id;
  const href = `/feed/${slug}`;

  return (
    <div
      className="opacity-0 translate-y-4 animate-fade-in-up"
      style={{
        animationDelay: `${index * 40}ms`,
        animationFillMode: "forwards",
      }}
    >
      <Link href={href} className="block group">
        <Card className="overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-500 bg-white dark:bg-slate-900 rounded-[2.5rem] flex flex-col sm:flex-row gap-2 p-3">
          {/* Image Section */}
          <div className="relative w-full sm:w-64 h-48 sm:h-auto aspect-video sm:aspect-square flex-shrink-0 overflow-hidden rounded-[2rem]">
            <Image
              src={getImageUrl()}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 256px"
              priority={index < 4}
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
              <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
                <span className="text-[10px] text-black font-black uppercase tracking-wider">
                  {item._type.slice(0, -1)}
                </span>
              </div>
              {item._type !== "announcements" && (
                <div className={cn(
                  "px-3 py-1 rounded-full shadow-sm flex items-center gap-1",
                  isOpen ? "bg-emerald-500" : "bg-rose-500"
                )}>
                  {isOpen ? <Unlock size={10} className="text-white" /> : <Lock size={10} className="text-white" />}
                  <span className="text-[10px] text-white font-black uppercase tracking-wider">
                    {isOpen ? "OPEN" : "CLOSED"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 p-5 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                <Image
                  src={normalizeImageSrc(item.company?.logo_url || "/zigex.svg")}
                  alt={companyName}
                  width={20}
                  height={20}
                  className="object-cover"
                />
              </div>
              <span className="text-[10px] font-black text-[#155DFC] uppercase tracking-[0.2em]">{companyName}</span>
            </div>

            <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight mb-2 group-hover:text-[#155DFC] transition-colors">
              {item.title}
            </h3>

            {item.description && (
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6 font-medium leading-relaxed">
                {item.description.replace(/<[^>]*>/g, "")}
              </p>
            )}

            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-1.5 text-slate-400">
                <MapPin size={14} />
                <span className="text-xs font-bold tracking-wide">{item.location}</span>
              </div>

              <div className="flex items-center gap-3">
                <div 
                  className="w-9 h-9 border border-slate-100 dark:border-slate-800 rounded-full flex items-center justify-center hover:bg-slate-50 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                   <ShareButton
                    title={item.title}
                    description={item.description || `Check out this ${item._type.slice(0, -1)}`}
                    url={href}
                    imageUrl={getImageUrl()}
                    type={item._type === "internships" ? "internship" : item._type === "events" ? "event" : "program"}
                  />
                </div>
                <div className="h-9 px-6 bg-[#155DFC] text-white rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center justify-center transition-all shadow-lg shadow-blue-500/20 whitespace-nowrap">
                  Read Details
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  );
}
