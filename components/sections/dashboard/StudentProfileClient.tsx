"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Briefcase,
  Award,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Users,
  Github,
  Globe,
  MoreHorizontal,
  Rocket
} from "lucide-react";
import { motion } from "framer-motion";
import ConnectBar from "@/components/sections/dashboard/ConnectBar";
import SimilarStudentsSidebar from "@/components/sections/dashboard/SimilarStudentsSidebar";
import ProjectCard from "@/components/uiComponent/ProjectCard";
import AnimatedConnectButtons from "@/components/customButtons/AnimatedConnectButtons";
import NoProjectMessage from "@/components/sections/dashboard/NoProjectMessage";
import CreateProjectButton from "@/components/project/CreateProjectButton";
import ProfileStories from "@/components/sections/dashboard/ProfileStories";
import { ActiveInternshipActivityGraph } from "@/components/sections/profile/ActiveInternshipActivityGraph";
import QRCodeButton from "@/components/sections/dashboard/QRCodeButton";
import { EditProfileButton } from "@/components/sections/student-profile/EditProfileButton";
import { cn, slugifyUsername, normalizeImageSrc } from "@/lib/utils";

interface StudentProfileClientProps {
  data: any;
  stats: {
    internshipsApplied: number;
    programsApplied: number;
    eventsApplied: number;
  };
  projects: any[];
  activeStories: any[];
  similarStudents: any[];
  myProfile: any;
  username: string;
  applicationsList?: { type: string; status: string; title: string, id: string }[];
  activeInternshipInfo?: {
    internship: any;
    company: any;
    supervisor: any;
    logs: any[];
  } | null;
}

export default function StudentProfileClient({
  data,
  stats,
  projects,
  activeStories,
  similarStudents,
  myProfile,
  username,
  applicationsList = [],
  activeInternshipInfo = null
}: StudentProfileClientProps) {
  // Fallback images
  const defaultAvatar = "https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(data.full_name || "ZX");
  const defaultCover = "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&q=80";
  const avatarUrl = normalizeImageSrc(data.avatar_url, defaultAvatar);
  const coverImageUrl = normalizeImageSrc(data.cover_image, defaultCover);
  
  const linkedinUrl = data.linkedin_url;
  const whatsappUrl = data.phone ? `https://wa.me/${data.phone.replace(/\D/g, '')}` : null;
  const skills = data.hard_skills || [];
  const soft = data.soft_skills || [];
  
  const isOwner = myProfile?.id === data.id;
  const isSupervisor = data.role === "supervisor" || data.email?.includes("supervisor");

  const initials = (data.full_name || "Z")
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://www.zigexconnect.com/profile/${slugifyUsername(username)}`;

  return (
    <div className="flex flex-col xl:flex-row gap-6 pb-12 w-full max-w-[1400px] mx-auto px-4 sm:px-6 xl:px-8 pt-6">
      
      {/* ═══ Main Content Column ═══ */}
      <div className="flex-1 min-w-0 space-y-6">
        
        {/* ── Profile Header Card ── */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          {/* Cover Image */}
          <div className="h-24 md:h-32 relative bg-gradient-to-r from-blue-700 to-[#155DFC]">
            {coverImageUrl && (
              <Image src={coverImageUrl} fill className="object-cover" alt="Cover Image" priority />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            
            {/* Top Right Badges (Gamification) */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10 scale-90 sm:scale-100 origin-top-right">
              <div className="bg-emerald-500 text-white shadow-md border border-emerald-400/30 rounded-full px-2 py-1 text-[9px] sm:text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider backdrop-blur-md">
                <CheckCircle2 size={11} />
                <span className="hidden sm:inline">Seed 50 Days of Code</span>
                <span className="sm:hidden">50 Days</span>
              </div>
              <div className="bg-black/40 text-white border border-white/20 shadow-md rounded-full px-2 py-1 text-[9px] sm:text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider backdrop-blur-md hover:bg-black/60 transition-colors">
                <Award size={11} className="text-amber-400" />
                <span>Level 12 Voyager</span>
              </div>
            </div>
          </div>

          <div className="px-4 pb-4 sm:px-5 sm:pb-5 relative">
            {/* Avatar & Actions Row */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3 -mt-10 sm:-mt-12 mb-3">
              <div className="relative inline-block self-start">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[1.5rem] sm:rounded-[1.8rem] border-[3.5px] border-card bg-card overflow-hidden shadow-sm relative z-10">
                  {avatarUrl ? (
                    <Image src={avatarUrl} fill className="object-cover" alt={data.full_name || "Profile"} priority />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#155DFC] to-blue-800 text-white flex items-center justify-center font-bold text-2xl">
                      {initials}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-[3px] border-card shadow-sm z-20"></div>
              </div>

              {/* Action Buttons & Stats */}
              <div className="flex flex-col sm:items-end gap-2 z-10 mt-1 sm:mt-0">
                <div className="hidden sm:flex items-center gap-4 text-center mr-1 mb-1">
                   <div>
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Programs</p>
                      <p className="text-sm font-black text-foreground">{stats.programsApplied || 0}</p>
                   </div>
                   <div className="w-px h-6 bg-border"></div>
                   <div>
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Projects</p>
                      <p className="text-sm font-black text-[#155DFC]">{projects.length || 0}</p>
                   </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {isOwner ? (
                    <EditProfileButton
                      isOwner={true}
                      userId={myProfile?.user_id}
                      profileData={data}
                      className="px-4 py-2 rounded-lg border border-border bg-card hover:bg-secondary text-xs font-bold transition-all shadow-sm"
                    />
                  ) : (
                    <button className="px-4 py-2 bg-[#155DFC] text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm">
                      {isSupervisor ? "Follow Supervisor" : "Studio Portfolio"}
                    </button>
                  )}
                  <QRCodeButton
                    linkedinUrl={linkedinUrl}
                    whatsappUrl={whatsappUrl}
                    email={data.email}
                    fullName={data.full_name}
                    profileUrl={currentUrl}
                    isOwner={isOwner}
                  />
                  <button className="p-2 rounded-lg border border-border bg-card hover:bg-secondary text-foreground transition-all shadow-sm">
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {isOwner ? (
                        <>Good Afternoon, {data.full_name.split(' ')[0]}! <span className="text-amber-500">☀️</span></>
                      ) : (
                        data.full_name
                      )}
                    </h1>
                    {isSupervisor ? (
                      <ShieldCheck className="text-[#155DFC] w-4.5 h-4.5" title="Verified Supervisor" />
                    ) : (
                      <CheckCircle2 className="text-[#155DFC] w-4.5 h-4.5" title="Verified Intern" />
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-full border border-slate-100 dark:border-slate-800">
                      <MapPin size={10} className="text-[#155DFC]" />
                      <span>{data.university || "Global Cohort"}</span>
                    </div>
                    <div className="flex items-center gap-1 hover:text-foreground cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-full border border-slate-100 dark:border-slate-800">
                      <Users size={10} className="text-[#155DFC]" />
                      <span>{isSupervisor ? '24 Supervisees' : '156 Connections'}</span>
                    </div>
                  </div>
                </div>

                {/* IMMEDIATELY VISIBLE BADGES IN HERO PANEL (AS REQUESTED) */}
                <div className="flex items-center gap-2 bg-slate-50/80 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-850 rounded-xl px-3 py-2 shrink-0 self-start md:self-center shadow-sm">
                  <div className="text-left">
                    <p className="text-[7.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Unlocked Badges</p>
                    <p className="text-[9.5px] font-bold text-slate-800 dark:text-slate-200 mt-0.5">{isSupervisor ? "Senior Mentor" : "Pioneer Level 12"}</p>
                  </div>
                  <div className="w-px h-7 bg-slate-200 dark:bg-slate-800 mx-1" />
                  <div className="flex items-center -space-x-1">
                    <div className="group relative cursor-pointer" title="Bronze Pioneer Badge">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-white dark:border-slate-900 bg-white/85 backdrop-blur-sm shadow-sm transition-transform duration-300 hover:scale-125 hover:z-20">
                        <Image src="/badges/bronze.png" alt="Bronze Badge" width={40} height={40} className="w-full h-full object-contain" />
                      </div>
                    </div>
                    <div className="group relative cursor-pointer" title="Silver Catalyst Badge">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-white dark:border-slate-900 bg-white/85 backdrop-blur-sm shadow-sm transition-transform duration-300 hover:scale-125 hover:z-20">
                        <Image src="/badges/silver.png" alt="Silver Badge" width={40} height={40} className="w-full h-full object-contain" />
                      </div>
                    </div>
                    <div className="group relative cursor-pointer" title="Gold Innovator Badge">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-white dark:border-slate-900 bg-white/85 backdrop-blur-sm shadow-sm transition-transform duration-300 hover:scale-125 hover:z-20">
                        <Image src="/badges/gold.png" alt="Gold Badge" width={40} height={40} className="w-full h-full object-contain" />
                      </div>
                    </div>
                    <div className="group relative cursor-pointer" title="Diamond Supreme Badge">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-white dark:border-slate-900 bg-white/85 backdrop-blur-sm shadow-sm transition-transform duration-300 hover:scale-125 hover:z-20">
                        <Image src="/badges/diamond.png" alt="Diamond Badge" width={40} height={40} className="w-full h-full object-contain" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {data.about && (
                <div className="pt-1">
                  <div className="border-l-[2px] border-[#155DFC] pl-3 py-0.5">
                    <p className="text-[12px] sm:text-[13px] leading-relaxed text-slate-500 dark:text-slate-400 italic font-medium max-w-3xl">
                      "{data.about}"
                    </p>
                  </div>
                </div>
              )}
              
              {/* Quick Skills & Projects Row */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                {skills.slice(0, 3).map((skill: string, i: number) => (
                  <div key={i} className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm">
                    <Rocket size={10} className="text-[#155DFC]" />
                    {skill}
                  </div>
                ))}
                
                <a href="#projects" className="flex items-center gap-1 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 text-amber-700 dark:text-amber-500 rounded-full text-[9px] font-black uppercase tracking-wider hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors shadow-sm ml-auto sm:ml-0">
                  <Award size={11} />
                  My Projects
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── Active Role / Internship ── */}
        {activeInternshipInfo && (
          <div className="bg-card rounded-2xl border border-primary/20 overflow-hidden shadow-sm relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#155DFC]/5 rounded-bl-[100px] pointer-events-none" />
             <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center border border-border shadow-sm shrink-0 overflow-hidden">
                  {activeInternshipInfo.company?.logo_url ? (
                    <Image src={activeInternshipInfo.company.logo_url} alt="Company" width={64} height={64} className="w-full h-full object-cover" />
                  ) : (
                    <Briefcase size={26} className="text-[#155DFC]" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-[#155DFC] text-[10px] font-black uppercase tracking-widest">
                      Current Role
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{activeInternshipInfo.internship?.title}</h3>
                  <p className="text-sm font-medium text-muted-foreground mt-0.5">at {activeInternshipInfo.company?.company_name || "Company"}</p>
                </div>
                
                {/* Supervisor Snippet */}
                {activeInternshipInfo.supervisor && (
                  <div className="hidden md:flex items-center gap-3 pl-5 border-l border-border">
                    <Image 
                      src={activeInternshipInfo.supervisor.avatar_url || "/default-avatar.svg"} 
                      alt="Supervisor" 
                      width={40} height={40} 
                      className="rounded-full border-2 border-background"
                    />
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase">Supervised By</p>
                      <p className="text-sm font-bold text-foreground">{activeInternshipInfo.supervisor.full_name}</p>
                    </div>
                  </div>
                )}
             </div>
          </div>
        )}

        {/* ── Journey Track & Career Map (Unified Gamification Concept) ── */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#155DFC]/5 rounded-bl-[80px] pointer-events-none" />
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-1.5">
            <Globe size={14} className="text-[#155DFC]" />
            Zigex Venture Journey Map
          </h3>
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-4">
            {/* Background line */}
            <div className="absolute left-[15px] md:left-4 right-auto md:right-4 top-4 bottom-4 md:bottom-auto md:h-1 bg-slate-100 dark:bg-slate-800 z-0 hidden sm:block" />
            
            {/* Step 1 */}
            <div className="relative flex md:flex-col items-center md:items-start gap-4 md:gap-2 z-10">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-emerald-500/20 border-4 border-card">
                ✓
              </div>
              <div className="md:mt-1">
                <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider">1. Induction</p>
                <p className="text-[9px] font-medium text-slate-400">Cohort Admitted</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex md:flex-col items-center md:items-start gap-4 md:gap-2 z-10">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-emerald-500/20 border-4 border-card">
                ✓
              </div>
              <div className="md:mt-1">
                <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider">2. Build Phase</p>
                <p className="text-[9px] font-medium text-slate-400">Profile Initialized</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex md:flex-col items-center md:items-start gap-4 md:gap-2 z-10">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-4 border-card",
                projects.length > 0 
                  ? "bg-[#155DFC] text-white shadow-md shadow-blue-500/20" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400"
              )}>
                {projects.length > 0 ? "✓" : "3"}
              </div>
              <div className="md:mt-1">
                <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider">3. Pitch Night</p>
                <p className="text-[9px] font-medium text-slate-400">Project Creators</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative flex md:flex-col items-center md:items-start gap-4 md:gap-2 z-10">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-4 border-card",
                activeInternshipInfo 
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400"
              )}>
                {activeInternshipInfo ? "✓" : "4"}
              </div>
              <div className="md:mt-1">
                <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider">4. Industry</p>
                <p className="text-[9px] font-medium text-slate-400">Internship accepted</p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="relative flex md:flex-col items-center md:items-start gap-4 md:gap-2 z-10">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-xs border-4 border-card">
                5
              </div>
              <div className="md:mt-1">
                <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider">5. Graduation</p>
                <p className="text-[9px] font-medium text-slate-400">Ecosystem Alumnus</p>
              </div>
            </div>

          </div>
        </div>

        {/* ── Activity Heatmap & Badges (Gamification Details) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Heatmap Section */}
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[15px] font-bold text-foreground tracking-tight flex items-center gap-2">
                <Calendar size={18} className="text-[#155DFC]" />
                Contribution Graph
              </h3>
              <span className="text-xs font-semibold text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">Last 365 Days</span>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="w-full h-[140px] rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                {activeInternshipInfo && activeInternshipInfo.logs.length > 0 ? (
                  <div className="w-full h-full p-2">
                    <ActiveInternshipActivityGraph logs={activeInternshipInfo.logs} />
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                    Start committing tasks to build your activity graph.
                  </p>
                )}
              </div>
              
              {/* Legend */}
              <div className="flex justify-between items-center text-[11px] text-muted-foreground font-medium">
                <span>Learn how points are scored</span>
                <div className="flex items-center gap-1.5">
                  <span>Less</span>
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 rounded-sm bg-slate-100 dark:bg-slate-800"></div>
                    <div className="w-2.5 h-2.5 rounded-sm bg-blue-200 dark:bg-blue-900/40"></div>
                    <div className="w-2.5 h-2.5 rounded-sm bg-blue-400 dark:bg-blue-700/60"></div>
                    <div className="w-2.5 h-2.5 rounded-sm bg-blue-600 dark:bg-[#155DFC]/80"></div>
                    <div className="w-2.5 h-2.5 rounded-sm bg-[#155DFC]"></div>
                  </div>
                  <span>More</span>
                </div>
              </div>
            </div>
          </div>

          {/* Badges Section */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[15px] font-bold text-foreground tracking-tight flex items-center gap-2">
                <Award size={18} className="text-amber-500" />
                Achievements
              </h3>
              <Link href="#" className="text-xs text-[#155DFC] font-semibold hover:underline">View All</Link>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              <div className="aspect-square rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center shadow-sm border border-border transition-transform hover:scale-110 cursor-pointer" title="Ecosystem Pioneer (Bronze Badge)">
                <Image src="/badges/bronze.png" alt="Bronze Badge" width={48} height={48} className="object-contain" />
              </div>
              <div className="aspect-square rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center shadow-sm border border-border transition-transform hover:scale-110 cursor-pointer" title="Contribution Catalyst (Silver Badge)">
                <Image src="/badges/silver.png" alt="Silver Badge" width={48} height={48} className="object-contain" />
              </div>
              <div className="aspect-square rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center shadow-sm border border-border transition-transform hover:scale-110 cursor-pointer" title="Project Innovator (Gold Badge)">
                <Image src="/badges/gold.png" alt="Gold Badge" width={48} height={48} className="object-contain" />
              </div>
              <div className="aspect-square rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center shadow-sm border border-border transition-transform hover:scale-110 cursor-pointer" title="Supreme Architect (Diamond Badge)">
                <Image src="/badges/diamond.png" alt="Diamond Badge" width={48} height={48} className="object-contain" />
              </div>
            </div>
            <div className="mt-5 text-center">
              <p className="text-[11px] font-medium text-muted-foreground">Unlock badges by completing tasks and receiving 5-star reviews.</p>
            </div>
          </div>

        </div>

        {/* ── Skills & Competencies ── */}
        {(skills.length > 0 || soft.length > 0) && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-[15px] font-bold text-foreground tracking-tight mb-5">Core Competencies</h3>
            
            <div className="space-y-5">
              {skills.length > 0 && (
               <div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Technical Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-foreground text-[13px] font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[#155DFC]/50 transition-colors cursor-default">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {soft.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Soft Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {soft.map((skill: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-foreground text-[13px] font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[#155DFC]/50 transition-colors cursor-default">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Projects ── */}
        <div id="projects" className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border bg-slate-50/50 dark:bg-slate-900/20 flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-foreground tracking-tight">Projects & Portfolio</h3>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{projects.length} PROJECTS</span>
          </div>
          <div className="p-4 sm:p-6">
            {projects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {projects.map((p, index) => (
                    <motion.div 
                      key={p.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ProjectCard user={data} project={p} isVisitor={true} isOwner={isOwner} />
                    </motion.div>
                  ))}
                </div>
            ) : (
                <NoProjectMessage studentName={data.full_name} studentPhone={data.phone} />
            )}
          </div>
        </div>

      </div>

      {/* ═══ Sidebar Column (Similar Students) ═══ */}
      <div className="hidden xl:block w-[320px] shrink-0">
        <div className="sticky top-[88px] space-y-6">
          <SimilarStudentsSidebar students={similarStudents} />
        </div>
      </div>

      {/* Persistent Dock Bar (Mobile Interactions) */}
      <ConnectBar linkedin={linkedinUrl} whatsapp={whatsappUrl} x={data.twitter_url || data.x_url} email={data.email} />
      
      {/* Stories Tray */}
      <div className="fixed bottom-24 left-0 right-0 z-40 lg:hidden px-4 pointer-events-none">
         <div className="pointer-events-auto">
            <ProfileStories stories={activeStories} user={data} />
         </div>
      </div>

      {isOwner && <CreateProjectButton variant="floating" />}
    </div>
  );
}


