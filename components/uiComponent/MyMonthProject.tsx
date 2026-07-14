"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Calendar, Github, Clock as ClockIcon, ExternalLink, Edit, Share2, Sparkles } from "lucide-react";
import ContributeModal from "./ContributeModal";
import CreateProjectButton from "@/components/project/CreateProjectButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { normalizeImageSrc } from "@/lib/utils";

interface Project {
  id: string;
  project_title: string;
  description: string;
  cover_image_url: string | null;
  project_video_url: string | null;
  uploaded_video_url: string | null;
  github_repository: string | null;
  project_duration: string | null;
  created_at: string;
  end_date: string | null;
  student_id: string;
  status: string;
}

interface User {
  id: string;
  full_name: string;
  avatar_url: string | null;
  user_id: string;
  github_url?: string | null;
  university?: string | null;
}

interface MyMonthProjectProps {
  user: User;
  project: Project | null;
  isVisitor?: boolean;
  profileOwnerId?: string;
  isOwner?: boolean;
}

export default function MyMonthProject({ 
  user, 
  project, 
  profileOwnerId, 
  isVisitor = false,
  isOwner
}: MyMonthProjectProps) {
  const [open, setOpen] = useState(false);
  const [showIndicator, setShowIndicator] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [showReviewCard, setShowReviewCard] = useState(true);
  const [reviewCardExpired, setReviewCardExpired] = useState(false);

  const isMyProject = isOwner;

  // Video carousel
  const videos: Array<{ type: "uploaded" | "youtube"; url: string }> = [];
  if (project?.uploaded_video_url) videos.push({ type: "uploaded", url: project.uploaded_video_url });
  if (project?.project_video_url) videos.push({ type: "youtube", url: project.project_video_url });
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const currentVideo = videos.length > 0 ? videos[currentVideoIndex] : null;
  const hasVideos = videos.length > 0;

  const prevVideo = () => setCurrentVideoIndex((i) => (i - 1 + videos.length) % videos.length);
  const nextVideo = () => setCurrentVideoIndex((i) => (i + 1) % videos.length);

  useEffect(() => {
    const timer = setTimeout(() => setShowIndicator(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!project || project.status === 'valid' || !isVisitor) {
      setShowReviewCard(false);
      return;
    }
    setShowReviewCard(true);
    const fortyEightHours = 48 * 60 * 60 * 1000;
    const timer = setTimeout(() => {
      setReviewCardExpired(true);
      setShowReviewCard(false);
    }, fortyEightHours);
    return () => clearTimeout(timer);
  }, [project?.status, project?.id, isVisitor]);

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

  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}?autoplay=1` : null;
  };

  const currentYouTubeEmbed = currentVideo && currentVideo.type === "youtube" ? getYouTubeEmbedUrl(currentVideo.url) : null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const coverImageUrl = normalizeImageSrc(project?.cover_image_url, '/projects.png');

  // CASE 1: Project Submitted & Under Review
  if (project && project.status !== 'valid' && isVisitor) {
    if (reviewCardExpired) return null;

    return (
      <aside className="md:fixed md:right-6 md:top-32 w-full md:w-72 lg:w-80 bg-white rounded-[2rem] border border-blue-100 shadow-2xl overflow-hidden p-6 text-center animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-[#F6F8FF] rounded-3xl flex items-center justify-center mx-auto border border-blue-100 shadow-inner">
            <ClockIcon size={40} className="text-[#155DFC] animate-pulse" />
          </div>
          <div className="absolute -bottom-2 right-1/2 translate-x-12 w-8 h-8 bg-[#155DFC] rounded-full border-4 border-white flex items-center justify-center shadow-lg">
             <Sparkles size={14} className="text-white" />
          </div>
        </div>

        <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight leading-tight">Project Under Review</h3>
        <p className="text-sm text-slate-500 mb-6 px-4">
          Great works take time! {user.full_name}'s project is being verified by our curators.
        </p>

        <div className="bg-[#F6F8FF] rounded-2xl p-4 mb-6 text-left border border-blue-50">
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#155DFC] mb-2">ETA APPROVAL</p>
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                 <ClockIcon size={14} className="text-[#155DFC]" />
              </div>
              <span className="text-sm font-bold text-slate-800">Within 48 Hours</span>
           </div>
        </div>

        <Button onClick={() => setShowReviewCard(false)} className="w-full h-12 bg-[#155DFC] hover:bg-[#1A3CB9] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 transition-all">
          GOT IT! 👍
        </Button>
      </aside>
    );
  }

  // CASE 2: No active project
  if (!project) {
    return (
      <aside className="md:fixed md:right-6 md:top-32 w-full md:w-72 lg:w-80 bg-[#F6F8FF] rounded-[2rem] border border-blue-100 shadow-xl overflow-hidden p-8 text-center border-dashed border-2">
         <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-blue-50">
            <Calendar size={28} className="text-blue-200" />
         </div>
         <h4 className="text-lg font-black text-slate-800 mb-2">Quiet Before the Storm</h4>
         <p className="text-xs text-slate-500 mb-6 leading-relaxed">
           {isVisitor 
             ? `${user.full_name} is currently brewing their next big idea. Check back soon!` 
             : "You haven't showcased a project this month. Ready to inspire the community?"}
         </p>
         {!isVisitor && (
            <CreateProjectButton variant="custom" customTrigger={
               <Button className="w-full h-11 bg-white text-[#155DFC] hover:bg-blue-50 border border-blue-100 rounded-xl font-bold shadow-sm">
                  Launch Project
               </Button>
            } />
         )}
      </aside>
    );
  }

  // CASE 3: Active & Valid Project
  return (
    <>
      {/* Desktop Sidebar Showcase */}
      <aside className="hidden md:block fixed right-6 top-32 w-72 lg:w-80 bg-white rounded-[2.5rem] border border-blue-100 shadow-2xl shadow-blue-200/40 overflow-hidden transform hover:scale-[1.02] transition-all duration-500">
        {/* Media Block */}
        <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
           {!showVideo ? (
             <div className="w-full h-full relative group">
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
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {hasVideos && (
                  <button onClick={() => setShowVideo(true)} className="absolute inset-0 m-auto w-14 h-14 bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-[#155DFC] transition-all duration-300 shadow-2xl z-10 border border-white/30">
                    <Play className="ml-1 fill-current" />
                  </button>
                )}
                
                <div className="absolute top-4 left-4">
                   <div className="flex items-center gap-1.5 px-3 py-1 bg-[#155DFC] text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      MONTHLY HIGHLIGHT
                   </div>
                </div>
             </div>
           ) : (
             <div className="relative w-full h-full bg-black">
                {currentVideo?.type === 'youtube' && currentYouTubeEmbed ? (
                  <iframe src={currentYouTubeEmbed} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
                ) : (
                  <video src={currentVideo?.url} className="w-full h-full" controls autoPlay />
                )}
                <button onClick={() => setShowVideo(false)} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-lg p-1.5 z-20 transition-all">
                  <div className="w-3 h-3 flex items-center justify-center text-[10px] font-bold">X</div>
                </button>
             </div>
           )}
        </div>

        {/* Content Block */}
        <div className="p-6">
           <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight tracking-tight line-clamp-2">
             {project.project_title}
           </h3>
           <p className="text-xs text-slate-500 mb-6 leading-relaxed line-clamp-3">
             {project.description}
           </p>

           <div className="grid grid-cols-2 gap-4 mb-8 pt-6 border-t border-[#F6F8FF]">
              <div className="space-y-1">
                 <p className="text-[9px] font-black text-[#155DFC] uppercase tracking-wider">PROJECT ERA</p>
                 <div className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-700">{formatDate(project.created_at)}</span>
                 </div>
              </div>
              <div className="space-y-1">
                 <p className="text-[9px] font-black text-[#155DFC] uppercase tracking-wider">LIFESPAN</p>
                 <div className="flex items-center gap-1.5">
                    <ClockIcon size={12} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-700 capitalize">{project.project_duration?.replace('-', ' ') || 'Ongoing'}</span>
                 </div>
              </div>
           </div>

           <div className="space-y-3">
              <Button asChild className="w-full h-12 bg-[#155DFC] hover:bg-[#1A3CB9] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200/50 transition-all border-none">
                 <Link href={`/feed/projects/${project.id}`}>
                    EXPLORE FULL STORY
                 </Link>
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                 {isMyProject ? (
                    <Button asChild variant="outline" className="col-span-2 h-11 border-blue-100 hover:bg-blue-50 text-[#155DFC] rounded-xl font-bold">
                       <Link href={`/dashboard/projects/edit/${project.id}`}>
                          <Edit size={14} className="mr-2" /> Modify Project
                       </Link>
                    </Button>
                 ) : (
                    <>
                       {project.github_repository && (
                         <Button asChild variant="outline" className="h-11 border-slate-100 hover:border-slate-300 text-slate-700 rounded-xl font-bold">
                            <a href={project.github_repository} target="_blank" rel="noopener noreferrer">
                               <Github size={16} className="mr-2" /> Code
                            </a>
                         </Button>
                       )}
                       <Button variant="outline" className="h-11 border-slate-100 hover:border-slate-300 text-slate-700 rounded-xl font-bold">
                          <Share2 size={16} className="mr-2" /> Share
                       </Button>
                    </>
                 )}
              </div>
           </div>
        </div>
      </aside>

      {/* Mobile Floating Trigger */}
      <div className="md:hidden fixed bottom-6 left-6 z-50">
         <button onClick={() => setOpen(true)} className="group relative flex items-center justify-center w-14 h-14 bg-[#155DFC] text-white rounded-full shadow-2xl shadow-blue-400/50 active:scale-90 transition-transform">
            <Sparkles className="animate-pulse" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-bounce" />
         </button>
      </div>

      {/* Mobile Sliding Showcase Overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-[60] animate-in fade-in duration-300">
           <div onClick={() => setOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
           <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[3rem] p-8 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-full duration-500">
              <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8" />
              
              <div className="relative aspect-video rounded-[2rem] overflow-hidden mb-6 border border-blue-50 shadow-xl">
                 {!showVideo ? (
                    <div className="w-full h-full relative">
                       <Image src={coverImageUrl} alt={project.project_title} fill className="object-cover" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                       {hasVideos && (
                         <button onClick={() => setShowVideo(true)} className="absolute inset-0 m-auto w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/40">
                            <Play fill="currentColor" />
                         </button>
                       )}
                    </div>
                 ) : (
                    <div className="w-full h-full bg-black">
                       {currentVideo?.type === 'youtube' ? (
                          <iframe src={currentYouTubeEmbed!} className="w-full h-full" allow="autoplay" />
                       ) : (
                          <video src={currentVideo?.url} className="w-full h-full" controls autoPlay />
                       )}
                    </div>
                 )}
              </div>

              <div className="mb-8">
                 <h2 className="text-2xl font-black text-slate-900 mb-2 leading-tight tracking-tight">
                    {project.project_title}
                 </h2>
                 <p className="text-sm text-slate-500 leading-relaxed line-clamp-4">
                    {project.description}
                 </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="p-4 bg-[#F6F8FF] rounded-2xl border border-blue-50">
                    <p className="text-[9px] font-black text-[#155DFC] uppercase mb-1">STARTED</p>
                    <p className="text-sm font-bold text-slate-800">{formatDate(project.created_at)}</p>
                 </div>
                 <div className="p-4 bg-[#F6F8FF] rounded-2xl border border-blue-50">
                    <p className="text-[9px] font-black text-[#155DFC] uppercase mb-1">DURATION</p>
                    <p className="text-sm font-bold text-slate-800 capitalize">{project.project_duration || 'Ongoing'}</p>
                 </div>
              </div>

              <div className="space-y-3 pb-8">
                 <Button asChild className="w-full h-14 bg-[#155DFC] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-200">
                    <Link href={`/feed/projects/${project.id}`}>VIEW FULL PROJECT</Link>
                 </Button>
                 {isMyProject && (
                    <Button asChild variant="outline" className="w-full h-14 rounded-2xl font-bold border-blue-100 text-[#155DFC] hover:bg-blue-50">
                       <Link href={`/dashboard/projects/edit/${project.id}`}><Edit size={16} className="mr-2" /> EDIT DETAILS</Link>
                    </Button>
                 )}
              </div>
           </div>
        </div>
      )}
    </>
  );
}
