"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Calendar, Github, Clock, ExternalLink, AlertCircle, CheckCircle2, Eye, MoreHorizontal, User } from "lucide-react";
import ContributeModal from "./ContributeModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  is_valid: boolean;
}

interface User {
  id: string;
  full_name: string;
  avatar_url: string | null;
  user_id: string;
  github_url?: string | null;
  university?: string | null;
  hard_skills?: string[];
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
  const [showVideo, setShowVideo] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  
  const isMyProject = isOwner;

  // Video carousel: prioritize uploaded video first, then youtube link
  const videos: Array<{ type: "uploaded" | "youtube"; url: string }> = [];
  if (project?.uploaded_video_url) videos.push({ type: "uploaded", url: project.uploaded_video_url });
  if (project?.project_video_url) videos.push({ type: "youtube", url: project.project_video_url });
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const currentVideo = videos.length > 0 ? videos[currentVideoIndex] : null;
  const hasVideos = videos.length > 0;

  const prevVideo = () => setCurrentVideoIndex((i) => (i - 1 + videos.length) % videos.length);
  const nextVideo = () => setCurrentVideoIndex((i) => (i + 1) % videos.length);

  // Extract YouTube video ID
  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}?autoplay=1` : null;
  };

  const currentYouTubeEmbed = currentVideo && currentVideo.type === "youtube" ? getYouTubeEmbedUrl(currentVideo.url) : null;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get image URL with fallback
  const getImageUrl = (url: string | null) => {
    if (!url) return '/projects.png';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return '/projects.png';
  };

  const coverImageUrl = getImageUrl(project?.cover_image_url ?? null);

  // --- CARD 1: UNDER REVIEW / PENDING ---
  if (project && !project.is_valid && isVisitor) {
    return (
      <div className="bg-white rounded-3xl border border-amber-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
        <div className="p-6">
            <div className="flex items-start gap-5">
                <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100">
                        <Clock className="w-6 h-6 text-amber-500" />
                    </div>
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-base font-bold text-slate-900">Project Pending</h3>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Reviewing</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">
                        This project is currently under quality review by our team.
                    </p>
                    <div className="flex items-center gap-3">
                         {user.avatar_url ? (
                             <Image src={user.avatar_url} alt={user.full_name} width={28} height={28} className="rounded-full ring-2 ring-white shadow-sm" />
                         ) : (
                             <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-500">
                                 {user.full_name.charAt(0)}
                             </div>
                         )}
                         <span className="text-sm font-medium text-slate-700">{user.full_name}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // --- CARD 2: EMPTY STATE ---
  if (!project) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 group h-full flex flex-col">
          <div className="p-8 flex flex-col items-center text-center justify-center flex-1">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                 <User className="w-8 h-8 text-slate-400" />
             </div>
             <h3 className="text-lg font-bold text-slate-900 mb-1">{user.full_name}</h3>
             <p className="text-sm text-slate-500 mb-6">No active project yet.</p>
             {isMyProject && (
                 <Button variant="outline" className="rounded-full border-dashed border-slate-300 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50">
                     Create Project
                 </Button>
             )}
          </div>
      </div>
    );
  }

  // --- CARD 3: ACTIVE PROJECT (MAIN) ---
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden flex flex-col h-full group relative">
      
      {/* 1. Cover Media Section */}
      <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
        {!showVideo ? (
          <>
            {/* Image */}
            <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                {!imageError && coverImageUrl && coverImageUrl !== '/projects.png' ? (
                  <Image
                    src={coverImageUrl} 
                    alt={project.project_title}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                   <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6 text-center">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3">
                        <Calendar className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">No Cover Image</p>
                   </div>
                )}
            </div>

            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

            {/* Top Badges */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
               {isVisitor && (
                   <Badge className="bg-white/90 text-slate-800 hover:bg-white backdrop-blur-md shadow-sm border-none font-semibold px-2 py-1">
                      Viewing
                   </Badge>
               )}
               {/* Status Indicator */}
               <div className="ml-auto">
                   <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/90 backdrop-blur-md text-white rounded-full text-[10px] font-bold shadow-sm">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      LIVE
                   </div>
               </div>
            </div>

            {/* Play Button (if video exists) */}
            {hasVideos && (
              <button 
                onClick={(e) => { e.preventDefault(); setShowVideo(true); }}
                className="absolute inset-0 m-auto w-14 h-14 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white hover:text-blue-600 transition-all duration-300 hover:scale-110 shadow-lg group/btn"
              >
                 <Play className="w-6 h-6 fill-current ml-1" />
              </button>
            )}

            {/* Bottom Info (Title on Image) */}
            {/* Optional: We can put title over image like Instagram/TikTok style, but let's keep it below for cleaner read.
                Instead, let's put the user avatar here overlapping the edge. */}
          </>
        ) : (
          /* Video Player Mode */
          <div className="relative w-full h-full bg-black">
             {currentVideo?.type === 'youtube' && currentYouTubeEmbed ? (
                 <iframe src={currentYouTubeEmbed} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
             ) : (
                 <video src={currentVideo?.url} className="w-full h-full" controls autoPlay />
             )}
             <button 
                onClick={(e) => { e.stopPropagation(); setShowVideo(false); }}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 backdrop-blur-md z-20"
             >
                <div className="w-4 h-4 flex items-center justify-center">✕</div>
             </button>

             {/* Carousel Controls */}
             {videos.length > 1 && (
                 <>
                    <button onClick={(e) => {e.stopPropagation(); prevVideo()}} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={(e) => {e.stopPropagation(); nextVideo()}} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                 </>
             )}
          </div>
        )}
      </div>

      {/* 2. Content Body */}
      <div className="p-5 flex flex-col flex-1">
         {/* User & Meta */}
         <div className="flex items-center gap-3 mb-3">
             <div className="relative">
                 {user.avatar_url ? (
                     <Image src={user.avatar_url} alt={user.full_name} width={40} height={40} className="rounded-full object-cover border border-slate-100 shadow-sm" />
                 ) : (
                     <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm border border-blue-50">
                         {user.full_name.charAt(0)}
                     </div>
                 )}
                 {user.university && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-600 border-2 border-white rounded-full flex items-center justify-center" title={user.university}>
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                 )}
             </div>
             <div className="min-w-0">
                 <p className="text-sm font-bold text-slate-900 truncate">{user.full_name}</p>
                 <p className="text-xs text-slate-500 truncate">{user.university || "Student"}</p>
             </div>
         </div>

         {/* Title & Desc */}
         <div className="mb-4">
             <Link href={`/feed/projects/${project.id}`} className="block group/title">
                <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2 group-hover/title:text-blue-600 transition-colors line-clamp-1">
                    {project.project_title}
                </h3>
             </Link>
             <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed h-[40px]">
                 {project.description}
             </p>
         </div>

         {/* Tags */}
         {user.hard_skills && user.hard_skills.length > 0 && (
             <div className="flex flex-wrap gap-1.5 mb-5 h-[26px] overflow-hidden">
                 {user.hard_skills.slice(0, 3).map((skill, i) => (
                     <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] uppercase tracking-wide font-bold rounded-md border border-slate-200">
                         {skill}
                     </span>
                 ))}
                 {user.hard_skills.length > 3 && (
                     <span className="px-2 py-0.5 bg-slate-50 text-slate-400 text-[10px] font-bold rounded-md border border-slate-100">+{user.hard_skills.length - 3}</span>
                 )}
             </div>
         )}
         
         <div className="mt-auto pt-4 border-t border-slate-100 flex items-center gap-3">
             <Button asChild className="flex-1 bg-slate-900 hover:bg-blue-600 text-white rounded-xl font-semibold shadow-sm hover:shadow-blue-200 transition-all">
                 <Link href={`/feed/projects/${project.id}`}>
                     View Details
                 </Link>
             </Button>
             {project.github_repository && (
                 <Button asChild variant="outline" size="icon" className="rounded-xl border-slate-200 hover:bg-slate-50 hover:text-slate-900 text-slate-500">
                     <a href={project.github_repository} target="_blank" rel="noopener noreferrer">
                         <Github className="w-5 h-5" />
                     </a>
                 </Button>
             )}
         </div>

      </div>

      <ContributeModal 
        isOpen={showContributeModal} 
        onClose={() => setShowContributeModal(false)}
        projectTitle={project?.project_title || ''}
        githubUrl={project?.github_repository || ''}
      />
    </div>
  );
}
