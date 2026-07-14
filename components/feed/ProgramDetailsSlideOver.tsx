"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Building2, 
  Users, 
  ArrowRight, 
  Loader2,
  CheckCircle2,
  Clock3
} from "lucide-react";
import { checkApplicationStatus, type ApplicationStatus } from "@/lib/actions/applications.actions";
import { cn, normalizeImageSrc } from "@/lib/utils";
import { RichContentRenderer } from "@/components/ui/RichContentRenderer";

interface ProgramDetailsSlideOverProps {
  item: any;
  isOpen: boolean;
  onClose: () => void;
  /** When false the register/apply CTA redirects to sign-in instead of opening a modal. */
  isAuthenticated?: boolean;
}

export function ProgramDetailsSlideOver({ item, isOpen, onClose, isAuthenticated = true }: ProgramDetailsSlideOverProps) {
  const [status, setStatus] = useState<ApplicationStatus>("not_applied");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && item?.id) {
      const fetchStatus = async () => {
        setLoading(true);
        const res = await checkApplicationStatus(item.id);
        setStatus(res);
        setLoading(false);
      };
      fetchStatus();
    }
  }, [isOpen, item?.id]);

  if (!item) return null;

  const getImageUrl = () => {
    switch (item._type) {
      case "internships": return normalizeImageSrc(item.cover_image_url);
      case "programs": return normalizeImageSrc(item.program_picture_url);
      case "events": return normalizeImageSrc(item.event_picture_url);
      case "announcements": return normalizeImageSrc(item.image_url);
      default: return "/placeholder.png";
    }
  };

  const companyName = typeof item.company === "string" ? item.company : item.company?.company_name || "Zigex";
  const location = item.location || item.venue || "Online";
  const startDate = item.start_date || item.event_date;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent 
        className="w-[97vw] sm:max-w-xl p-0 flex flex-col h-full bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-[-20px_0_80px_rgba(0,0,0,0.1)] overflow-hidden"
      >
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Banner Image */}
          <div className="relative h-72 sm:h-80 w-full overflow-hidden group">
            <Image
              src={getImageUrl()}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent opacity-90" />
            
            <div className="absolute bottom-8 left-8 right-8 space-y-3 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
              <Badge className="bg-[#155DFC] hover:bg-[#155DFC] text-white border-none px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] rounded">
                {item._type?.replace('s', '')}
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter leading-none line-clamp-3 drop-shadow-xl">
                {item.title}
              </h2>
            </div>
          </div>

          <div className="p-8 sm:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/50 space-y-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/80">
                 <div className="flex items-center gap-2 text-slate-400">
                    <Building2 size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Provider</span>
                 </div>
                 <p className="text-sm font-black text-slate-900 dark:text-white uppercase truncate">{companyName}</p>
              </div>
              <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/50 space-y-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/80">
                 <div className="flex items-center gap-2 text-slate-400">
                    <MapPin size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Location</span>
                 </div>
                 <p className="text-sm font-black text-slate-900 dark:text-white uppercase truncate">{location}</p>
              </div>
              {startDate && (
                <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/50 space-y-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/80">
                   <div className="flex items-center gap-2 text-slate-400">
                      <Calendar size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Starts</span>
                   </div>
                   <p className="text-sm font-black text-slate-900 dark:text-white uppercase truncate">
                      {new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                   </p>
                </div>
              )}
              <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/50 space-y-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/80">
                 <div className="flex items-center gap-2 text-slate-400">
                    <Clock size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Duration</span>
                 </div>
                 <p className="text-sm font-black text-slate-900 dark:text-white uppercase truncate">
                   {item.duration || "Self-paced"}
                 </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-5">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#155DFC] flex items-center gap-3">
                 <span className="w-8 h-[2px] bg-[#155DFC] rounded-full"></span>
                 About Program
              </h3>
              <div className="bg-slate-50/50 dark:bg-slate-900/30 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800/50">
                 {(item as any).description ? (
                   <RichContentRenderer content={(item as any).description} />
                 ) : (
                   <p className="text-[13px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                     No description provided for this opportunity. Connect with the provider for more details.
                   </p>
                 )}
              </div>
            </div>
            
            {/* Added spacer to ensure content doesn't get hidden behind the fixed footer */}
            <div className="h-4"></div>
          </div>
        </div>

        {/* Fixed Action Button Footer */}
        <div className="p-6 sm:px-10 sm:py-8 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20 animate-in slide-in-from-bottom-full duration-700 delay-500 fill-mode-both">
          {loading ? (
            <Button disabled className="w-full h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-400 border-none cursor-pointer">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Verifying Credentials...
            </Button>
          ) : status === "accepted" ? (
            <Link href="/student/workspace" className="block w-full">
              <Button className="w-full h-14 rounded-2xl bg-[#155DFC] hover:bg-[#0D47A1] text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-3 transition-all active:scale-95 cursor-pointer">
                <CheckCircle2 size={18} />
                Visit Workspace
                <ArrowRight size={18} />
              </Button>
            </Link>
          ) : status === "pending" ? (
            <Button disabled className="w-full h-14 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 cursor-pointer">
              <Clock3 size={18} />
              Pending Review
            </Button>
          ) : status === "rejected" ? (
            <Button disabled className="w-full h-14 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 font-black uppercase tracking-[0.2em] text-[11px] cursor-pointer">
              Application Unsuccessful
            </Button>
          ) : (new Date(item.end_date || item.event_date || 0) < new Date() && (item.end_date || item.event_date)) ? (
            <Button disabled className="w-full h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-300 dark:text-slate-700 border-none font-black uppercase tracking-[0.2em] text-[11px] opacity-50 cursor-pointer blur-[0.5px]">
              Registration Closed
            </Button>
          ) : !isAuthenticated ? (
            // Anonymous visitor — redirect to sign-in with return URL
            <Link
              href={`/sign-in?next=${encodeURIComponent(`/feed/${item.id}`)}`}
              className="block w-full"
              onClick={onClose}
            >
              <Button
                className="w-full h-14 rounded-2xl bg-[#155DFC] hover:bg-[#0D47A1] text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-blue-500/30 transition-all active:scale-95 cursor-pointer group"
              >
                Sign in to Register
                <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          ) : (
            <Link href={`/feed/${item.id}`} className="block w-full" onClick={onClose}>
              <Button
                className="w-full h-14 rounded-2xl bg-[#155DFC] hover:bg-[#0D47A1] text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-blue-500/30 transition-all active:scale-95 cursor-pointer group"
              >
                Register Now
                <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
