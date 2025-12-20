"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Calendar, Github, Clock, ExternalLink, Eye, User, Share2 } from "lucide-react";
import ContributeModal from "./ContributeModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  hard_skills?: string[];
}

interface ProjectCardProps {
  user: User;
  project: Project | null;
  isVisitor?: boolean;
  profileOwnerId?: string;
  isOwner?: boolean;
}

export default function ProjectCard({ 
  user, 
  project, 
  profileOwnerId, 
  isVisitor = false,
  isOwner
}: ProjectCardProps) {
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

  const coverImageUrl = normalizeImageSrc(project?.cover_image_url, '/projects.png');

  // --- CARD 1: UNDER REVIEW / PENDING ---
  if (project && project.status !== 'valid' && isVisitor) {
    return (
      <div className="bg-muted rounded-3xl border border-border shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
        <div className="p-6">
            <div className="flex items-start gap-5">
                <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-card rounded-2xl flex items-center justify-center border border-border">
                        <Clock className="w-6 h-6 text-primary" />
                    </div>
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-base font-bold text-foreground">Project Pending</h3>
                        <Badge variant="outline" className="bg-muted text-primary border-border">Reviewing</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                        This project is currently under quality review by our team.
                    </p>
                    <div className="flex items-center gap-3">
                         {user.avatar_url ? (
                             <Image src={user.avatar_url} alt={user.full_name} width={28} height={28} className="rounded-full ring-2 ring-card shadow-sm" />
                         ) : (
                             <div className="w-7 h-7 bg-muted rounded-full flex items-center justify-center text-xs font-bold text-primary">
                                 {user.full_name.charAt(0)}
                             </div>
                         )}
                         <span className="text-sm font-medium text-foreground">{user.full_name}</span>
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
      <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 group h-full flex flex-col">
          <div className="p-8 flex flex-col items-center text-center justify-center flex-1">
             <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                 <User className="w-8 h-8 text-primary/50" />
             </div>
             <h3 className="text-lg font-bold text-foreground mb-1">{user.full_name}</h3>
             <p className="text-sm text-muted-foreground mb-6">No active project yet.</p>
             {isMyProject && (
                 <Button asChild className="rounded-full bg-primary hover:bg-secondary text-primary-foreground">
                    <Link href="/dashboard/projects">Create Project</Link>
                 </Button>
             )}
          </div>
      </div>
    );
  }

  // --- CARD 3: ACTIVE PROJECT (MAIN) ---
  return (
    <div className="bg-card rounded-3xl border border-border shadow-sm hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 overflow-hidden flex flex-col h-full group relative">
      
      {/* 1. Cover Media Section */}
      <div className="relative aspect-[16/10] w-full bg-muted/50 overflow-hidden">
        {!showVideo ? (
          <>
            {/* Image */}
            <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-110">
                {!imageError && coverImageUrl && coverImageUrl !== '/projects.png' ? (
                  <Image
                    src={coverImageUrl} 
                    alt={project.project_title}
                    fill
                    className="object-cover"
                    priority
                    onError={() => setImageError(true)}
                  />
                ) : (
                   <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-muted to-border p-6 text-center">
                      <div className="w-14 h-14 bg-card rounded-2xl shadow-sm flex items-center justify-center mb-3">
                        <Calendar className="w-7 h-7 text-primary" />
                      </div>
                      <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Project Overview</p>
                   </div>
                )}
            </div>

            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Top Badges */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
               <div className="flex gap-2">
                 {isVisitor && (
                     <Badge className="bg-muted/90 text-primary hover:bg-muted backdrop-blur-md shadow-sm border-none font-bold px-3 py-1 text-[10px] rounded-full">
                        VIEWING
                     </Badge>
                 )}
                 {project.status === 'valid' && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/90 backdrop-blur-md text-primary-foreground rounded-full text-[10px] font-black shadow-lg">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        LIVE
                    </div>
                 )}
               </div>
               
               <button className="bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full text-white transition-all duration-300">
                  <Share2 className="w-4 h-4" />
               </button>
            </div>

            {/* Play Button (if video exists) */}
            {hasVideos && (
              <button 
                onClick={(e) => { e.preventDefault(); setShowVideo(true); }}
                className="absolute inset-0 m-auto w-16 h-16 bg-primary/80 backdrop-blur-md rounded-full flex items-center justify-center text-primary-foreground hover:bg-primary transition-all duration-500 hover:scale-110 shadow-2xl z-20"
              >
                 <Play className="w-7 h-7 fill-current ml-1" />
              </button>
            )}
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
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 backdrop-blur-md z-30"
             >
                <div className="w-4 h-4 flex items-center justify-center text-xs font-bold font-mono">X</div>
             </button>

             {/* Carousel Controls */}
             {videos.length > 1 && (
                 <>
                    <button onClick={(e) => {e.stopPropagation(); prevVideo()}} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md z-30 transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={(e) => {e.stopPropagation(); nextVideo()}} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md z-30 transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                 </>
             )}
          </div>
        )}
      </div>

      {/* 2. Content Body */}
      <div className="p-6 flex flex-col flex-1 relative bg-card">
         {/* User Detail (Overlapping slightly) */}
         <div className="flex items-center gap-3 mb-4">
             <div className="relative">
                 {user.avatar_url ? (
                     <div className="relative w-11 h-11">
                        <Image src={user.avatar_url} alt={user.full_name} fill className="rounded-full object-cover border-2 border-white shadow-md" />
                     </div>
                 ) : (
                     <div className="w-11 h-11 bg-gradient-to-br from-[#155DFC] to-[#1A3CB9] rounded-full flex items-center justify-center text-white font-black text-sm border-2 border-white shadow-md">
                         {user.full_name.charAt(0)}
                     </div>
                 )}
                 {user.university && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#155DFC] border-2 border-white rounded-full shadow-sm" title={user.university}>
                        <div className="w-full h-full flex items-center justify-center text-[6px] text-white font-bold uppercase">Z</div>
                    </div>
                 )}
             </div>
             <div className="min-w-0">
                 <p className="text-sm font-black text-foreground truncate leading-none mb-1">{user.full_name}</p>
                 <p className="text-[10px] text-primary font-bold uppercase tracking-wider truncate">{user.university || "Zigex Scholar"}</p>
             </div>
         </div>

         {/* Title & Desc */}
         <div className="mb-5">
             <Link href={`/feed/projects/${project.id}`} className="block group/title mb-2">
                <h3 className="text-xl font-black text-foreground leading-tight group-hover/title:text-primary transition-all duration-300 line-clamp-1">
                    {project.project_title}
                </h3>
             </Link>
             <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed h-[40px]">
                 {project.description}
             </p>
         </div>

         {/* Meta Stats Row */}
         <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                <Clock className="w-3.5 h-3.5 text-primary/70" />
                <span>{project.project_duration || 'Ongoing'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground border-l border-border pl-4">
                <Calendar className="w-3.5 h-3.5 text-primary/70" />
                <span>{formatDate(project.created_at)}</span>
            </div>
         </div>

         {/* Action Buttons */}
         <div className="mt-auto pt-5 border-t border-border flex items-center gap-3">
             <Button asChild className="flex-1 bg-primary hover:bg-secondary text-primary-foreground rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 h-11">
                 <Link href={`/feed/projects/${project.id}`}>
                     EXPLORE PROJECT
                 </Link>
             </Button>
             
             {project.github_repository && (
                 <a 
                    href={project.github_repository} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="h-11 w-11 flex items-center justify-center bg-muted text-primary rounded-xl hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm"
                 >
                     <Github className="w-5 h-5" />
                 </a>
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
