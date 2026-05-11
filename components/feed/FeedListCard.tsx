// components/feed/FeedListCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Lock, 
  Unlock, 
  ArrowRight, 
  ShieldCheck,
  ChevronRight,
  Sparkles
} from "lucide-react";
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
      case "internships": return normalizeImageSrc((item as any).cover_image_url);
      case "programs": return normalizeImageSrc((item as any).program_picture_url);
      case "events": return normalizeImageSrc((item as any).event_picture_url);
      case "announcements": return normalizeImageSrc((item as any).image_url);
      default: return "/placeholder.png";
    }
  };

  const slug = slugify(item.title) || item.id;
  const href = `/feed/${slug}`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "50px" }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.05,
        ease: [0.21, 0.47, 0.32, 0.98]
      }}
      className="w-full"
    >
      <Link href={href} className="block group">
        <Card className="relative overflow-hidden border border-slate-100 dark:border-slate-800/50 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_100px_-20px_rgba(21,93,252,0.15)] transition-all duration-700 bg-white dark:bg-slate-900 rounded-[3rem] flex flex-col sm:flex-row gap-6 p-5 sm:p-6 group">
          
          {/* High-Fidelity Image Container */}
          <div className="relative w-full sm:w-80 h-56 sm:h-auto flex-shrink-0 overflow-hidden rounded-[2.2rem] shadow-inner">
            <Image
              src={getImageUrl()}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, 400px"
              priority={index < 3}
            />
            
            {/* Ambient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#155DFC]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

            {/* Premium Badges */}
            <div className="absolute top-5 left-5 flex flex-col gap-2.5 z-10">
              <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl px-5 py-2.5 rounded-[1.25rem] shadow-2xl border border-white/20">
                <span className="text-[#155DFC] text-[9px] font-black uppercase tracking-[0.3em]">
                  {item._type.slice(0, -1)}
                </span>
              </div>
              {item._type !== "announcements" && (
                <div className={cn(
                  "px-5 py-2.5 rounded-[1.25rem] shadow-2xl flex items-center gap-2.5 backdrop-blur-2xl border border-white/10",
                  isOpen ? "bg-emerald-500/95 text-white" : "bg-rose-500/95 text-white"
                )}>
                  {isOpen ? <Unlock size={10} strokeWidth={3} /> : <Lock size={10} strokeWidth={3} />}
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    {isOpen ? "Active" : "Closed"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Premium Content Body */}
          <div className="flex-1 flex flex-col py-2">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800 ring-4 ring-slate-50 dark:ring-slate-800/50 shadow-sm flex-shrink-0">
                  <Image
                    src={normalizeImageSrc(item.company?.logo_url || "/zigex.svg")}
                    alt={companyName}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[#155DFC] text-[10px] font-black uppercase tracking-[0.25em]">{companyName}</span>
                  <div className="flex items-center gap-1.5 opacity-50">
                    <ShieldCheck size={9} className="text-emerald-500" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">Verified</span>
                  </div>
                </div>
              </div>

              {/* Share Interaction */}
              <div 
                className="w-11 h-11 bg-slate-50 dark:bg-slate-800 hover:bg-[#155DFC] text-slate-400 hover:text-white rounded-2xl flex items-center justify-center transition-all duration-500 border border-transparent hover:border-blue-400/20"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              >
                 <ShareButton
                  title={item.title}
                  description={item.description || ""}
                  url={href}
                  imageUrl={getImageUrl()}
                  type={item._type as any}
                />
              </div>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tighter mb-4 group-hover:text-[#155DFC] transition-colors duration-500 line-clamp-2">
              {item.title}
            </h3>

            <div className="relative mb-6">
              <p className="text-[13px] text-slate-500 dark:text-slate-400 line-clamp-2 font-medium leading-relaxed max-w-2xl">
                {item.description?.replace(/<[^>]*>/g, "")}
              </p>
            </div>

            <div className="mt-auto flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-4 border-t border-slate-50 dark:border-slate-800/50">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 text-slate-400">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                    <MapPin size={14} strokeWidth={2.5} className="text-[#155DFC]" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{item.location}</span>
                </div>
                
                <div className="hidden md:flex items-center gap-3 text-slate-400">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                    <Sparkles size={14} strokeWidth={2.5} className="text-[#155DFC]" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Featured</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-14 px-8 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all duration-700 shadow-xl shadow-slate-950/20 group-hover:scale-[1.03] active:scale-[0.98] border border-white/5">
                  <span>Explore Opportunity</span>
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-[#155DFC] transition-colors duration-500">
                    <ChevronRight size={16} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
