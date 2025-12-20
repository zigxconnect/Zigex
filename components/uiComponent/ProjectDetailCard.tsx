"use client";

import React, { useState } from "react";
import ProjectDetailMedia from "./ProjectDetailMedia";
import ContributeModal from "./ContributeModal";
import Link from "next/link";
import { ExternalLink, Github, Calendar, Clock, User, Heart, Share2, Eye, Sparkles, MessageSquare, ShieldCheck } from "lucide-react";
import Image from "next/image";

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

interface Owner {
  id: string;
  full_name: string;
  avatar_url?: string | null;
}

export default function ProjectDetailCard({ project, owner }: { project: Project; owner?: Owner | null }) {
  const [openContribute, setOpenContribute] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Hero Section with Media */}
      <div className="relative mb-12 lg:mb-16">
        <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(21,93,252,0.2)] bg-card border border-border group">
          <div className="aspect-[21/9] min-h-[400px] sm:min-h-[500px]">
            <ProjectDetailMedia
              uploadedVideo={project.uploaded_video_url}
              youtubeVideo={project.project_video_url}
              coverImage={project.cover_image_url ?? undefined}
              title={project.project_title}
            />
          </div>
          
          {/* Floating Action Buttons */}
          <div className="absolute top-8 right-8 flex gap-3 z-10">
            <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-primary hover:scale-110 transition-all duration-500 group shadow-2xl">
              <Heart className="w-5 h-5 group-hover:fill-current" />
            </button>
            <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-primary hover:scale-110 transition-all duration-500 shadow-2xl">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          <div className="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row md:items-end justify-between gap-6 pointer-events-none">
             <div className="space-y-4">
                <div className="flex gap-2">
                   <span className="px-4 py-1.5 bg-primary text-primary-foreground text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-xl shadow-primary/40">
                      Featured Build
                   </span>
                   {project.status === 'valid' && (
                     <span className="px-4 py-1.5 bg-green-500 text-white text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-xl shadow-green-500/40 flex items-center gap-1.5">
                        <ShieldCheck size={12} /> Verified
                     </span>
                   )}
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none drop-shadow-2xl">
                   {project.project_title}
                </h1>
             </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {[
               { label: 'STARTED', value: new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), icon: Calendar, color: 'text-blue-600' },
               { label: 'DURATION', value: project.project_duration || 'Open', icon: Clock, color: 'text-purple-600' },
               { label: 'COMMUNITY', value: 'Active', icon: MessageSquare, color: 'text-green-600' },
               { label: 'IMPACT', value: 'High', icon: Sparkles, color: 'text-amber-600' },
             ].map((stat, i) => (
               <div key={i} className="bg-card rounded-3xl p-6 border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <stat.icon size={20} className={`${stat.color} mb-3`} />
                  <p className="text-[10px] font-black text-muted-foreground tracking-widest mb-1">{stat.label}</p>
                  <p className="text-sm font-black text-foreground">{stat.value}</p>
               </div>
             ))}
          </div>

          {/* About Section */}
          <div className="bg-card rounded-[2.5rem] border border-border p-8 md:p-12 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
               <Sparkles size={120} className="text-primary" />
            </div>
            
            <h2 className="text-2xl font-black text-foreground mb-8 flex items-center gap-3">
              <span className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                 <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
              </span>
              The Project Vision
            </h2>
            
            <div className="prose prose-blue max-w-none">
              <p className="text-lg text-muted-foreground leading-relaxed font-medium whitespace-pre-wrap">
                {project.description}
              </p>
            </div>

            <div className="mt-12 flex flex-wrap gap-4">
              <button 
                onClick={() => setOpenContribute(true)} 
                className="group flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-secondary hover:scale-105 transition-all shadow-xl shadow-primary/20"
              >
                <Heart className="w-4 h-4 group-hover:fill-current" />
                Support Creator
              </button>

              <Link 
                href={`/dashboard/student/${project.student_id}`} 
                className="flex items-center gap-3 px-8 py-4 bg-muted text-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-muted/80 transition-all border border-border"
              >
                <User className="w-4 h-4" />
                Creator Profile
              </Link>
            </div>
          </div>

          {project.status !== 'valid' && (
            <div className="bg-amber-50 rounded-[2rem] p-8 border border-amber-100 flex items-start gap-6">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-amber-500 shrink-0">
                <Clock size={24} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-black text-amber-900 mb-1">Under Quality Review</h3>
                <p className="text-sm text-amber-800/80 leading-relaxed">
                  This project is currently being verified by our elite curating team. This usually takes less than 48 hours.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          {/* Creator Profile Card */}
          {owner && (
            <div className="bg-card rounded-[2.5rem] border border-border p-8 shadow-sm group">
               <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-primary rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                    {owner.avatar_url ? (
                      <Image
                        src={owner.avatar_url}
                        alt={owner.full_name}
                        width={100}
                        height={100}
                        className="rounded-full ring-8 ring-muted relative z-10 grayscale-[30%] group-hover:grayscale-0 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground text-3xl font-black relative z-10 shadow-xl">
                        {owner.full_name?.[0] || "U"}
                      </div>
                    )}
                    <div className="absolute -bottom-2 right-2 w-8 h-8 bg-card rounded-full flex items-center justify-center shadow-lg z-20 border-2 border-muted">
                       <Sparkles size={14} className="text-primary" />
                    </div>
                  </div>
                  
                  <h4 className="text-xl font-black text-foreground mb-1">{owner.full_name}</h4>
                  <p className="text-xs font-black text-primary uppercase tracking-widest mb-6">Innovative Builder</p>
                  
                  <Link
                    href={`/dashboard/student/${project.student_id}`}
                    className="w-full flex items-center justify-center h-12 bg-primary text-primary-foreground rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-secondary transition-all shadow-xl"
                  >
                    View Network
                  </Link>
               </div>
            </div>
          )}

          {/* Social Proof / Stats */}
          <div className="bg-primary rounded-[2.5rem] p-8 text-primary-foreground relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground blur-[80px] opacity-20" />
             <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                <Heart size={20} className="text-primary-foreground" />
                Join the Mission
             </h3>
             <div className="space-y-6 mb-8">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                   <span className="text-xs font-bold text-primary-foreground/70">Collaboration</span>
                   <span className="text-xs font-black text-green-400">Available</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                   <span className="text-xs font-bold text-primary-foreground/70">Project Type</span>
                   <span className="text-xs font-black uppercase tracking-widest">{project.project_duration || 'Ongoing'}</span>
                </div>
             </div>
             <button 
               onClick={() => setOpenContribute(true)}
               className="w-full h-14 bg-card/10 hover:bg-card/20 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-black/10 transition-all flex items-center justify-center gap-3 border border-white/10"
             >
               Contribute Today
               <ExternalLink size={14} />
             </button>
          </div>
        </div>
      </div>

      <ContributeModal 
        isOpen={openContribute} 
        onClose={() => setOpenContribute(false)} 
        projectTitle={project.project_title} 
        githubUrl={project.github_repository} 
      />
    </div>
  );
}
