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

interface ProgramDetailsSlideOverProps {
  item: any;
  isOpen: boolean;
  onClose: () => void;
}

export function ProgramDetailsSlideOver({ item, isOpen, onClose }: ProgramDetailsSlideOverProps) {
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
      <SheetContent className="sm:max-w-xl p-0 overflow-y-auto bg-white dark:bg-slate-950 border-none rounded-l-[3rem] shadow-[-50px_0_100px_-20px_rgba(21,93,252,0.15)]">
        {/* Banner Image */}
        <div className="relative h-72 w-full overflow-hidden">
          <Image
            src={getImageUrl()}
            alt={item.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
          
          <div className="absolute bottom-8 left-8 right-8 space-y-2">
            <Badge className="bg-[#155DFC] hover:bg-[#155DFC] text-white border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest">
              {item._type?.replace('s', '')}
            </Badge>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight line-clamp-2">
              {item.title}
            </h2>
          </div>
        </div>

        <div className="p-8 space-y-10">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 space-y-1">
               <div className="flex items-center gap-2 text-slate-400">
                  <Building2 size={12} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Provider</span>
               </div>
               <p className="text-xs font-black text-slate-900 dark:text-white uppercase truncate">{companyName}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 space-y-1">
               <div className="flex items-center gap-2 text-slate-400">
                  <MapPin size={12} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Location</span>
               </div>
               <p className="text-xs font-black text-slate-900 dark:text-white uppercase truncate">{location}</p>
            </div>
            {startDate && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 space-y-1">
                 <div className="flex items-center gap-2 text-slate-400">
                    <Calendar size={12} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Starts</span>
                 </div>
                 <p className="text-xs font-black text-slate-900 dark:text-white uppercase truncate">
                    {new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                 </p>
              </div>
            )}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 space-y-1">
               <div className="flex items-center gap-2 text-slate-400">
                  <Clock size={12} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Duration</span>
               </div>
               <p className="text-xs font-black text-slate-900 dark:text-white uppercase truncate">
                 {item.duration || "Self-paced"}
               </p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#155DFC]">About Program</h3>
            <div className="prose prose-sm dark:prose-invert max-w-none">
               <p className="text-[13px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic">
                 {item.description || "No description provided for this opportunity. Connect with the provider for more details."}
               </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-6">
            {loading ? (
              <Button disabled className="w-full h-16 rounded-[2rem] bg-slate-100 dark:bg-slate-900 text-slate-400 border-none">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Verifying Credentials...
              </Button>
            ) : status === "accepted" ? (
              <Link href="/student/workspace" className="block w-full">
                <Button className="w-full h-16 rounded-[2rem] bg-[#155DFC] hover:bg-[#0D47A1] text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-3">
                  <CheckCircle2 size={18} />
                  Enter Workspace
                  <ArrowRight size={18} />
                </Button>
              </Link>
            ) : status === "pending" ? (
              <Button disabled className="w-full h-16 rounded-[2rem] bg-amber-500/10 text-amber-500 border border-amber-500/20 font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3">
                <Clock3 size={18} />
                Pending Review
              </Button>
            ) : status === "rejected" ? (
              <Button disabled className="w-full h-16 rounded-[2rem] bg-red-500/10 text-red-500 border border-red-500/20 font-black uppercase tracking-[0.2em] text-[11px]">
                Application Unsuccessful
              </Button>
            ) : (
              <Link href={`/feed/${item.id}`} className="block w-full">
                <Button className="w-full h-16 rounded-[2rem] bg-[#155DFC] hover:bg-[#0D47A1] text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-blue-500/30">
                  Register Now
                </Button>
              </Link>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
