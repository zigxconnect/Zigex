"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Youtube, 
  Github, 
  MessageCircle, 
  Linkedin, 
  ChevronRight,
  MapPin,
  AlertCircle,
  Sparkles,
  Play,
  Share2,
  Calendar,
  Clock,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Project {
  id: string;
  project_title: string;
  description: string;
  cover_image_url: string | null;
  github_repository: string | null;
  project_video_url: string | null;
  uploaded_video_url: string | null;
  project_duration: string;
  end_date: string;
  created_at: string;
  status: string;
}

interface UserData {
  id: string;
  full_name?: string;
  avatar_url?: string | null;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  university?: string;
  hard_skills?: string[];
}

interface ProjectPanelProps {
  project: Project | null;
  user: UserData;
  isOwner: boolean;
}

// Extract YouTube video ID from various YouTube URL formats
const getYoutubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
};

// Format date nicely
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateString;
  }
};

export default function ProjectPanel({ project, user, isOwner }: ProjectPanelProps) {
  const [open, setOpen] = useState(false);
  const [showIndicator, setShowIndicator] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowIndicator(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const original = document.body.style.overflow;
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = original;
    }
    return () => { document.body.style.overflow = original; };
  }, [open]);

  const youtubeVideoId = project?.project_video_url ? getYoutubeVideoId(project.project_video_url) : null;
  
  const getImageUrl = (url: string | null) => {
    if (!url || url.length < 5) return '/projects.png';
    if (url.includes('supabase.co')) return url;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return url;
    return '/projects.png';
  };

  const coverImageUrl = getImageUrl(project?.cover_image_url ?? null);

  const whatsappMessage = `Hi ${user.full_name || 'there'}! 👋\n\nI saw your profile on ZigX and I'm impressed by your work${project ? ` on "${project.project_title}"` : ''}. I'd love to connect and chat!`;
  const whatsappUrl = user.phone ? `https://wa.me/${user.phone.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}` : null;

  // CASE 1: EMPTY STATE
  if (!project) {
    return (
      <aside className="md:fixed md:right-6 md:top-32 w-full md:w-72 lg:w-80 bg-[#F6F8FF] rounded-[2.5rem] border border-blue-100 shadow-xl overflow-hidden p-8 text-center border-dashed border-2">
         <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-blue-50">
            <Calendar size={28} className="text-blue-200" />
         </div>
         <h4 className="text-lg font-black text-slate-800 mb-2">Build in Progress</h4>
         <p className="text-xs text-slate-500 mb-6 leading-relaxed">
           {user.full_name?.split(' ')[0] || 'This user'} is currently brewing their next big idea. Check back soon for the reveal!
         </p>
         
         <div className="space-y-3">
            {whatsappUrl && (
              <Button asChild className="w-full h-11 bg-[#155DFC] hover:bg-[#1A3CB9] text-white rounded-xl font-bold shadow-lg shadow-blue-200">
                 <Link href={whatsappUrl} target="_blank"><MessageCircle size={16} className="mr-2" /> Message</Link>
              </Button>
            )}
            {user.linkedin_url && (
              <Button asChild variant="outline" className="w-full h-11 border-blue-100 text-[#155DFC] hover:bg-blue-50 rounded-xl font-bold">
                 <Link href={user.linkedin_url} target="_blank"><Linkedin size={16} className="mr-2" /> LinkedIn</Link>
              </Button>
            )}
         </div>
      </aside>
    );
  }

  // CASE 2: PROJECT EXISTS
  return (
    <>
      <aside className="hidden md:block fixed right-6 top-32 w-72 lg:w-80 bg-white rounded-[2.5rem] border border-blue-100 shadow-2xl shadow-blue-200/40 overflow-hidden group hover:scale-[1.02] transition-all duration-500">
        <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
          {!imageError && coverImageUrl && coverImageUrl !== '/projects.png' ? (
            <Image 
              src={coverImageUrl} 
              alt={project.project_title} 
              fill 
              className="object-cover group-hover:scale-110 transition-transform duration-1000"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#155DFC] to-[#1A3CB9] flex items-center justify-center">
              <Calendar size={48} className="text-white opacity-20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
          
          <div className="absolute top-4 left-4">
             <div className="flex items-center gap-1.5 px-3 py-1 bg-[#155DFC] text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                ACTIVE PROJECT
             </div>
          </div>

          {youtubeVideoId && (
            <Link 
              href={`https://www.youtube.com/watch?v=${youtubeVideoId}`}
              target="_blank"
              className="absolute inset-0 m-auto w-14 h-14 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-[#155DFC] transition-all duration-300 shadow-2xl z-10 border border-white/30"
            >
               <Play className="ml-1 fill-current" />
            </Link>
          )}
        </div>

        <div className="p-6">
          <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight line-clamp-2">{project.project_title}</h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed line-clamp-3">{project.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-8 pt-6 border-t border-[#F6F8FF]">
             <div className="space-y-1">
                <p className="text-[9px] font-black text-[#155DFC] uppercase tracking-wider">PROJECT ERA</p>
                <div className="flex items-center gap-1.5">
                   <Calendar size={12} className="text-slate-400" />
                   <span className="text-xs font-bold text-slate-700">{formatDate(project.created_at)}</span>
                </div>
             </div>
             <div className="space-y-1">
                <p className="text-[9px] font-black text-[#155DFC] uppercase tracking-wider">TIMELINE</p>
                <div className="flex items-center gap-1.5">
                   <Clock size={12} className="text-slate-400" />
                   <span className="text-xs font-bold text-slate-700">{project.project_duration || 'Ongoing'}</span>
                </div>
             </div>
          </div>

          <div className="space-y-3">
             <Button asChild className="w-full h-12 bg-[#155DFC] hover:bg-[#1A3CB9] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200/50 transition-all">
                <Link href={`/feed/projects/${project.id}`}>EXPLORE PROJECT</Link>
             </Button>
             
             <div className="grid grid-cols-2 gap-3">
                {project.github_repository && (
                   <Button asChild variant="outline" className="h-11 border-slate-100 hover:border-slate-300 text-slate-700 rounded-xl font-bold">
                      <a href={project.github_repository} target="_blank" rel="noopener noreferrer">
                         <Github size={16} className="mr-2" /> Code
                      </a>
                   </Button>
                )}
                <Button variant="outline" className={`${!project.github_repository ? 'col-span-2' : ''} h-11 border-slate-100 hover:border-slate-300 text-slate-700 rounded-xl font-bold`}>
                   <Share2 size={16} className="mr-2" /> Share
                </Button>
             </div>
          </div>
        </div>
      </aside>

      {/* Mobile Trigger */}
      {!isOwner && (
        <div className="md:hidden fixed bottom-6 left-6 z-50">
           <button onClick={() => setOpen(true)} className="flex items-center justify-center w-14 h-14 bg-[#155DFC] text-white rounded-full shadow-2xl shadow-blue-400/50 active:scale-90 transition-transform">
              <Sparkles className="animate-pulse" />
           </button>
        </div>
      )}

      {/* Mobile Sliding Panel */}
      {open && (
        <div className="md:hidden fixed inset-0 z-[60] animate-in fade-in duration-300">
           <div onClick={() => setOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
           <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[3rem] p-8 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-full duration-500">
              <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8" />
              
              <div className="relative aspect-video rounded-[2rem] overflow-hidden mb-6 border border-blue-50 shadow-xl">
                 {!imageError && coverImageUrl && coverImageUrl !== '/projects.png' ? (
                    <Image src={coverImageUrl} alt={project.project_title} fill className="object-cover" onError={() => setImageError(true)} />
                 ) : (
                    <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                       <Play className="text-white opacity-20" size={48} />
                    </div>
                 )}
                 {youtubeVideoId && (
                   <Link href={`https://www.youtube.com/watch?v=${youtubeVideoId}`} target="_blank" className="absolute inset-0 m-auto w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/40">
                      <Play fill="currentColor" />
                   </Link>
                 )}
              </div>

              <div className="mb-8">
                 <h2 className="text-2xl font-black text-slate-900 mb-2 leading-tight tracking-tight">{project.project_title}</h2>
                 <p className="text-sm text-slate-500 leading-relaxed line-clamp-4">{project.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="p-4 bg-[#F6F8FF] rounded-2xl border border-blue-50">
                    <p className="text-[9px] font-black text-[#155DFC] uppercase mb-1">STARTED</p>
                    <p className="text-sm font-bold text-slate-800">{formatDate(project.created_at)}</p>
                 </div>
                 <div className="p-4 bg-[#F6F8FF] rounded-2xl border border-blue-50">
                    <p className="text-[9px] font-black text-[#155DFC] uppercase mb-1">TIMELINE</p>
                    <p className="text-sm font-bold text-slate-800">{project.project_duration || 'Ongoing'}</p>
                 </div>
              </div>

              <div className="space-y-3 pb-8">
                 <Button asChild className="w-full h-14 bg-[#155DFC] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-200">
                    <Link href={`/feed/projects/${project.id}`}>VIEW FULL PROJECT</Link>
                 </Button>
                 {whatsappUrl && (
                   <Button asChild variant="outline" className="w-full h-14 border-blue-100 text-[#155DFC] rounded-2xl font-bold">
                      <Link href={whatsappUrl} target="_blank"><MessageCircle size={16} className="mr-2" /> Message Creator</Link>
                   </Button>
                 )}
              </div>
           </div>
        </div>
      )}
    </>
  );
}
