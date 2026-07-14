"use client";

import React, { useState } from "react";
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
  Rocket,
  GraduationCap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
import type { ConnectionInfo, BadgeInfo } from "@/lib/actions/gamification.action";

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
  supervisorProfile?: any;
  superviseesCount?: number;
  connectionStats?: { count: number; peers: ConnectionInfo[]; supervisors: ConnectionInfo[] };
  badges?: BadgeInfo[];
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
  activeInternshipInfo = null,
  supervisorProfile = null,
  superviseesCount = 0,
  connectionStats = { count: 0, peers: [], supervisors: [] },
  badges = []
}: StudentProfileClientProps) {
  const [selectedBadge, setSelectedBadge] = useState<BadgeInfo | null>(null);
  const [isConnectionsDrawerOpen, setIsConnectionsDrawerOpen] = useState(false);

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
  const isSupervisor = data.role === "supervisor" || data.email?.includes("supervisor") || !!supervisorProfile;

  const unlockedBadges = badges.filter(b => b.unlocked);
  const levelText = isSupervisor
    ? "Senior Mentor"
    : unlockedBadges.length > 0
      ? `${unlockedBadges.length} Badge${unlockedBadges.length === 1 ? '' : 's'} Unlocked`
      : "Pioneer Level 1";

  const initials = (data.full_name || "Z")
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const pinnedItems: any[] = [];

  if (isSupervisor) {
    pinnedItems.push({
      type: "internship",
      title: "Zigex Supervisor & Mentor",
      organization: supervisorProfile?.role || "Zigex Ecosystem Team",
      status: "Active Role",
      description: `Responsible for overseeing engineering builds, project reviews, and professional development for ${superviseesCount} student builder${superviseesCount === 1 ? '' : 's'}.`,
      period: "Active Placement",
      tag: "Supervisor"
    });
  }

  if (activeInternshipInfo) {
    pinnedItems.push({
      type: "internship",
      title: activeInternshipInfo.internship?.title || "Active Internship Placement",
      organization: activeInternshipInfo.company?.company_name || "SEED Inc",
      status: "Active Role",
      description: activeInternshipInfo.internship?.description || "Collaborating on next-generation student developer ecosystems and build tracks.",
      period: "Q2 2026",
      tag: "Internship",
      supervisor: activeInternshipInfo.supervisor
    });
  }

  // Map dynamic programs & events
  applicationsList.forEach((app: any) => {
    pinnedItems.push({
      type: app.type,
      title: app.title,
      organization: "Zigex Ecosystem",
      status: app.status === "accepted" ? "Active" : "Completed",
      description: `Participating in our elite ${app.type} acceleration program to develop production-grade startup products.`,
      period: "Spring Cohort",
      tag: app.type === "program" ? "Acceleration" : "Ecosystem"
    });
  });



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

            </div>
          </div>

          <div className="px-4 pb-4 sm:px-5 sm:pb-5 relative">
            {/* Avatar & Actions Row */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3 -mt-10 sm:-mt-12 mb-3">
              <div className="relative inline-block self-start">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-[3.5px] border-card bg-card overflow-hidden shadow-sm relative z-10">
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
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Activities</p>
                    <p className="text-sm font-black text-[#155DFC] dark:text-slate-300">{pinnedItems.length || 2}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {isOwner && (
                    <EditProfileButton
                      isOwner={true}
                      userId={myProfile?.user_id}
                      profileData={data}
                      className="px-4 py-2 rounded-lg bg-[#155DFC] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/10 hover:shadow-md hover:-translate-y-0.5 active:scale-95"
                    />
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                      {isOwner ? (
                        <>Good Afternoon, {data.full_name.split(' ')[0]}! <span className="text-amber-500">☀️</span></>
                      ) : (
                        data.full_name
                      )}
                    </h1>
                    {isSupervisor ? (
                      <div className="flex items-center gap-1">
                        <ShieldCheck className="text-[#155DFC] dark:text-slate-300 w-4.5 h-4.5" title="Verified Supervisor" />
                        <span className="bg-[#155DFC]/10 dark:bg-[#155DFC]/20 text-[#155DFC] dark:text-slate-300 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-[#155DFC]/20">
                          Supervisor
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="text-[#155DFC] dark:text-slate-300 w-4.5 h-4.5" title="Verified Intern" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                    <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-full border border-border">
                      <MapPin size={10} className="text-[#155DFC] dark:text-slate-300" />
                      <span>{data.university || "Global Cohort"}</span>
                    </div>
                    <div
                      onClick={() => {
                        if (!isSupervisor && connectionStats && connectionStats.count > 0) {
                          setIsConnectionsDrawerOpen(true);
                        }
                      }}
                      className={cn(
                        "flex items-center gap-1 hover:text-foreground cursor-pointer transition-colors bg-muted/50 px-2 py-1 rounded-full border border-border",
                        (!isSupervisor && connectionStats && connectionStats.count > 0) && "hover:bg-muted active:scale-95"
                      )}
                    >
                      <Users size={10} className="text-[#155DFC] dark:text-slate-300" />
                      <span>{isSupervisor ? `${superviseesCount} Supervisees` : `${connectionStats?.count || 0} Connections`}</span>
                    </div>
                  </div>
                  {isSupervisor && (
                    <div className="mt-2 text-[10px] font-extrabold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 bg-blue-50/50 dark:bg-blue-950/20 px-2.5 py-1 rounded-lg border border-blue-100/50 dark:border-blue-900/10 w-fit">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      <span>Actively supervising <strong className="text-[#155DFC] dark:text-slate-300 font-black">{superviseesCount}</strong> {superviseesCount === 1 ? 'student builder' : 'student builders'} at Zigex</span>
                    </div>
                  )}
                </div>

                {/* IMMEDIATELY VISIBLE BADGES IN HERO PANEL (AS REQUESTED) */}
                <div
                  className="flex items-center gap-2 bg-muted/40 border border-border rounded-xl px-3 py-2 shrink-0 self-start md:self-center shadow-sm cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => setSelectedBadge(unlockedBadges[0] || badges[0] || null)}
                >
                  <div className="text-left">
                    <p className="text-[7.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Unlocked Badges</p>
                    <p className="text-[9.5px] font-bold text-slate-800 dark:text-slate-200 mt-0.5">{levelText}</p>
                  </div>
                  <div className="w-px h-7 bg-border mx-1" />
                  <div className="flex items-center -space-x-1" onClick={(e) => e.stopPropagation()}>
                    {unlockedBadges.length > 0 ? (
                      unlockedBadges.slice(0, 4).map((b, i) => (
                        <div key={i} className="group relative cursor-pointer" title={`${b.title} (${b.tier} Badge)`} onClick={() => setSelectedBadge(b)}>
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-border bg-background/80 backdrop-blur-sm shadow-sm transition-transform duration-300 hover:scale-125 hover:z-20">
                            <Image src={b.icon} alt={b.title} width={40} height={40} className="w-full h-full object-contain" />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[9px] font-medium text-slate-400 pl-2">No badges unlocked yet</p>
                    )}
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

              {/* Quick Skills & Cohorts Row */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                {skills.slice(0, 3).map((skill: string, i: number) => (
                  <div key={i} className="flex items-center gap-1 px-2.5 py-1 bg-muted border border-border text-foreground rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm">
                    <Rocket size={10} className="text-[#155DFC] dark:text-slate-300" />
                    {skill}
                  </div>
                ))}

                <a href="#accepted-roles" className="flex items-center gap-1 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 text-amber-700 dark:text-amber-500 rounded-full text-[9px] font-black uppercase tracking-wider hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors shadow-sm ml-auto sm:ml-0">
                  <Award size={11} />
                  My Cohorts
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── Accepted Programs, Internships & Cohorts (GitHub Pin Layout) ── */}
        <div id="accepted-roles" className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="p-4 sm:p-5 border-b border-border bg-muted/30 flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-extrabold text-foreground tracking-tight flex items-center gap-2">
              <Award size={16} className="text-[#155DFC] dark:text-slate-300" />
              Accepted Programs, Internships & Cohorts
            </h3>
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
              {pinnedItems.length} Pinned Tracks
            </span>
          </div>

          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pinnedItems.map((item, index) => {
                const Icon = item.type === "internship"
                  ? Briefcase
                  : item.type === "program"
                    ? GraduationCap
                    : Calendar;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-card border border-border rounded-xl p-4 flex flex-col justify-between hover:border-[#155DFC]/40 hover:shadow-sm hover:shadow-blue-500/5 transition-all duration-300 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#155DFC]/5 rounded-bl-[40px] pointer-events-none group-hover:bg-[#155DFC]/10 transition-colors" />

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Icon size={14} className="text-[#155DFC] dark:text-slate-300" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">{item.tag}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 text-[8px] font-black uppercase tracking-wider">
                          {item.status}
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-black text-foreground group-hover:text-[#155DFC] dark:text-slate-300 transition-colors leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-[10px] font-bold text-muted-foreground mt-0.5">
                        at {item.organization}
                      </p>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Supervisor Snippet */}
                      {item.supervisor && (
                        <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-dashed border-border">
                          <Image
                            src={item.supervisor.avatar_url || "/default-avatar.svg"}
                            alt="Supervisor"
                            width={24} height={24}
                            className="rounded-full border border-background shadow-sm"
                          />
                          <div>
                            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-tight">Supervised By</p>
                            <p className="text-[10px] font-black text-foreground">{item.supervisor.full_name}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-3 mt-4">
                      <span className="text-[9px] font-bold text-muted-foreground">
                        🗓️ {item.period}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#155DFC]" />
                        <span className="text-[9px] font-bold text-[#155DFC] dark:text-slate-300 uppercase tracking-wider">Zigex Verified</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Journey Track & Career Map (Unified Gamification Concept) ── */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#155DFC]/5 rounded-bl-[80px] pointer-events-none" />
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-1.5">
            <Globe size={14} className="text-[#155DFC] dark:text-slate-300" />
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[14px] font-extrabold text-foreground tracking-tight flex items-center gap-2">
                <Calendar size={16} className="text-[#155DFC] dark:text-slate-300" />
                Cohort & Developer Logs Activity Heatmap
              </h3>
              <span className="text-[10px] font-black text-muted-foreground bg-secondary px-2 py-0.5 rounded-full uppercase tracking-wider">365-Day Timeline</span>
            </div>

            <div className="flex flex-col gap-3">
              {/* Vibrant interactive blue contribution map grid */}
              <div className="w-full rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-150 dark:border-slate-800/80 p-3 sm:p-4 overflow-x-auto">
                <div className="min-w-[580px] flex flex-col gap-1">
                  <div className="grid grid-flow-col grid-rows-7 gap-1">
                    {Array.from({ length: 364 }).map((_, i) => {
                      // Custom sine-based wave to distribute heat shades beautifully
                      const noise = Math.sin(i * 0.08) + Math.cos(i * 0.04) + (i % 7 === 0 ? 0.8 : -0.2);
                      let level = 0;
                      if (noise > 1.3) level = 4;
                      else if (noise > 0.6) level = 3;
                      else if (noise > -0.1) level = 2;
                      else if (noise > -0.8) level = 1;

                      const bgClasses = [
                        "bg-slate-150 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800",
                        "bg-blue-100/60 dark:bg-blue-950/20 hover:scale-110",
                        "bg-blue-300/70 dark:bg-blue-900/40 hover:scale-110",
                        "bg-blue-500/80 dark:bg-blue-600/70 hover:scale-110 hover:shadow-[0_0_6px_rgba(59,130,246,0.3)]",
                        "bg-[#155DFC] hover:scale-115 hover:shadow-[0_0_8px_rgba(21,93,252,0.4)] z-10"
                      ];

                      let title = "No developer activity logged";
                      if (level === 1) title = "Cohort checkpoint completed successfully";
                      else if (level === 2) title = "2 supervisor active logs submitted";
                      else if (level === 3) title = "4 development tasks synced";
                      else if (level === 4) title = "Milestone induction verified & 5-star score";

                      return (
                        <div
                          key={i}
                          className={cn(
                            "w-[8px] h-[8px] sm:w-[9px] sm:h-[9px] rounded-[1.5px] transition-all duration-200 cursor-pointer",
                            bgClasses[level]
                          )}
                          title={title}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex justify-between items-center text-[10px] text-muted-foreground font-bold uppercase tracking-wide">
                <span>Total 187 active learning logs</span>
                <div className="flex items-center gap-1">
                  <span>Less</span>
                  <div className="flex gap-0.5 mx-1">
                    <div className="w-2 h-2 rounded-sm bg-slate-150 dark:bg-slate-900/80"></div>
                    <div className="w-2 h-2 rounded-sm bg-blue-100/60 dark:bg-blue-950/20"></div>
                    <div className="w-2 h-2 rounded-sm bg-blue-300/70 dark:bg-blue-900/40"></div>
                    <div className="w-2 h-2 rounded-sm bg-blue-500/80 dark:bg-blue-600/70"></div>
                    <div className="w-2 h-2 rounded-sm bg-[#155DFC]"></div>
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
              <span className="text-[10px] text-muted-foreground font-bold">{unlockedBadges.length} / {badges.length} Unlocked</span>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {(badges || []).map((b, i) => (
                <div
                  key={i}
                  className={cn(
                    "aspect-square rounded-full flex items-center justify-center shadow-sm border border-border transition-all hover:scale-110 cursor-pointer relative group bg-slate-50 dark:bg-slate-900 overflow-hidden",
                    !b.unlocked && "filter grayscale opacity-30 hover:opacity-60"
                  )}
                  title={`${b.title}: ${b.description} (${b.unlocked ? "Unlocked" : "Locked"})`}
                  onClick={() => setSelectedBadge(b)}
                >
                  <Image src={b.icon} alt={b.title} width={40} height={40} className="object-contain" />
                </div>
              ))}
            </div>
            <div className="mt-5 text-center">
              <p className="text-[11px] font-medium text-muted-foreground">Unlock badges by completing tasks, attending cohorts and receiving 5-star reviews.</p>
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



      </div>

      {/* ═══ Sidebar Column (Similar Students) ═══ */}
      <div className="hidden xl:block w-[320px] shrink-0">
        <div className="sticky top-[88px] space-y-6">
          <SimilarStudentsSidebar students={similarStudents} />
        </div>
      </div>



      {/* Stories Tray */}
      <div className="fixed bottom-24 left-0 right-0 z-40 lg:hidden px-4 pointer-events-none">
        <div className="pointer-events-auto">
          <ProfileStories stories={activeStories} user={data} />
        </div>
      </div>

      {/* ── Badges Explanation Modal ── */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[500px] max-h-[85vh] relative"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            {/* Left Side: Badge List sidebar */}
            <div className="w-full md:w-[240px] shrink-0 border-b md:border-b-0 md:border-r border-border bg-slate-50/50 dark:bg-slate-900/30 p-4 overflow-x-auto md:overflow-y-auto flex flex-row md:flex-col justify-between max-h-[72px] md:max-h-none zigex-scrollbar select-none">
              <div className="flex flex-row md:flex-col gap-1.5 md:w-full items-center md:items-stretch">
                <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0 md:mb-3 mr-3 md:mr-0 shrink-0">
                  Zigex Badges
                </h4>
                <div className="flex flex-row md:flex-col gap-1.5 md:space-y-1.5 overflow-x-auto md:overflow-x-visible pb-1 md:pb-0 shrink-0">
                  {badges.map((b) => {
                    const isSelected = selectedBadge.badge === b.badge;
                    return (
                      <button
                        key={b.badge}
                        onClick={() => setSelectedBadge(b)}
                        className={cn(
                          "flex items-center gap-2 p-1.5 md:p-2 rounded-xl text-left transition-all shrink-0 select-none",
                          isSelected
                            ? "bg-[#155DFC] text-white shadow-md shadow-blue-500/10 font-bold"
                            : "bg-secondary/40 hover:bg-secondary text-slate-700 dark:text-slate-350 text-xs"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 md:w-6 md:h-6 rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-white/10",
                          !b.unlocked && "opacity-40 grayscale"
                        )}>
                          <Image src={b.icon} alt={b.title} width={20} height={20} className="object-contain" />
                        </div>
                        <span className="truncate text-[10px] md:text-xs font-semibold pr-1 md:pr-0">{b.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-border hidden md:block w-full">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                  <Award size={12} className="text-[#155DFC] dark:text-slate-300" />
                  <span>Gamification Engine</span>
                </div>
              </div>
            </div>

            {/* Right Side: Detail Panel */}
            <div className="flex-1 p-5 md:p-8 overflow-y-auto flex flex-col justify-between bg-card zigex-scrollbar">
              <div className="space-y-6">
                {/* Badge Header Area with dynamic border glow based on tier */}
                <div className="flex flex-col items-center text-center pb-5 border-b border-border/80">
                  <div className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center p-3 mb-3 bg-slate-50 dark:bg-slate-900 border-2 relative group",
                    selectedBadge.unlocked ? "shadow-md" : "opacity-45 grayscale",
                    selectedBadge.tier === "bronze" && "border-amber-700 shadow-amber-700/10",
                    selectedBadge.tier === "silver" && "border-slate-400 shadow-slate-400/10",
                    selectedBadge.tier === "gold" && "border-amber-400 shadow-amber-400/10",
                    selectedBadge.tier === "diamond" && "border-cyan-400 shadow-cyan-400/10"
                  )}>
                    <Image
                      src={selectedBadge.icon}
                      alt={selectedBadge.title}
                      width={70}
                      height={70}
                      className="object-contain"
                    />
                  </div>

                  <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                    {selectedBadge.title}
                  </h3>

                  <div className="flex items-center gap-2 mt-2">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border",
                      selectedBadge.tier === "bronze" && "bg-amber-100/50 dark:bg-amber-950/20 text-amber-700 border-amber-200 dark:border-amber-900/30",
                      selectedBadge.tier === "silver" && "bg-slate-100/50 dark:bg-slate-800/20 text-slate-700 border-slate-200 dark:border-slate-700",
                      selectedBadge.tier === "gold" && "bg-amber-50/50 dark:bg-amber-900/10 text-amber-600 border-amber-200/50 dark:border-amber-800/20",
                      selectedBadge.tier === "diamond" && "bg-cyan-50/50 dark:bg-cyan-950/20 text-cyan-600 border-cyan-200/50 dark:border-cyan-900/20"
                    )}>
                      {selectedBadge.tier} Tier
                    </span>
                    {selectedBadge.unlocked ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 border border-emerald-500/20 text-[8px] font-black uppercase tracking-wider">
                        Unlocked
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 text-[8px] font-black uppercase tracking-wider border border-border">
                        Locked
                      </span>
                    )}
                  </div>
                </div>

                {/* Requirements and Description */}
                <div className="space-y-4">
                  <div>
                    <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                      Badge Description
                    </h5>
                    <p className="text-xs leading-relaxed text-slate-655 dark:text-slate-350">
                      {selectedBadge.description}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                      Ecosystem Significance & Requirement
                    </h5>
                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-450 font-medium">
                      {selectedBadge.badge === "first_spark" && "AWARDED FOR: Initiating development tracker sync. Submit your very first weekly learning log or project build to get started."}
                      {selectedBadge.badge === "clockwork" && "AWARDED FOR: 5 days of verified active attendance. Consistency is the primary marker of venture-ready builders."}
                      {selectedBadge.badge === "networker" && "AWARDED FOR: Connecting with 5 fellow builders/supervisors in your cohort. Collaborative engagement is key to building durable ventures."}
                      {selectedBadge.badge === "flawless_execution" && "AWARDED FOR: 3 tasks reviewed and accepted. Quality of code, attention to detail, and timely commits approved by a supervisor."}
                      {selectedBadge.badge === "rising_star" && "AWARDED FOR: High ratings. Receive a 4-star or higher weekly overall evaluation score from your supervisor."}
                      {selectedBadge.badge === "the_grinder" && "AWARDED FOR: Sustained productivity. Submitting logs or active attendance for 14 total days."}
                      {selectedBadge.badge === "excellence_vanguard" && "AWARDED FOR: Flawless milestone delivery. Achieve a perfect 5-star evaluation rating from your supervisor."}
                      {selectedBadge.badge === "unbroken_focus" && "AWARDED FOR: Long-term quality. Keep a high evaluation average of 4.0+ across 4 or more evaluation reviews."}
                      {selectedBadge.badge === "alumni_shield" && "AWARDED FOR: Graduation. Successfully complete the full internship program with 20+ verified days of attendance."}
                      {selectedBadge.badge === "program_valedictorian" && "AWARDED FOR: Cohort Excellence. Reach top 5% standing with an evaluation average of 4.5+ across 3+ evaluations."}
                    </p>
                  </div>

                  {selectedBadge.unlocked && selectedBadge.earnedAt && (
                    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-150 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between">
                      <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Earned On</span>
                      <span className="text-[10px] text-foreground font-black">
                        {new Date(selectedBadge.earnedAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Connections Slide-over Drawer ── */}
      {isConnectionsDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsConnectionsDrawerOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-screen max-w-md bg-card border-l border-border shadow-2xl flex flex-col h-full"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30 shrink-0">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase">
                    Mutual Connections
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-wider">
                    Builders & Supervisors in your Cohorts
                  </p>
                </div>
                <button
                  onClick={() => setIsConnectionsDrawerOpen(false)}
                  className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              {/* Connections List (scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 zigex-scrollbar">
                {/* Supervisors section */}
                {connectionStats.supervisors.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-black text-[#155DFC] dark:text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-1">
                      <span>Supervisors Assigned</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#155DFC]" />
                    </h4>
                    <div className="space-y-3">
                      {connectionStats.supervisors.map((sup) => (
                        <div key={sup.id} className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-800/60 rounded-xl hover:border-blue-500/20 transition-all hover:shadow-sm">
                          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center font-bold text-slate-700 relative border border-border">
                            {sup.avatarUrl ? <Image src={sup.avatarUrl} alt={sup.name} fill className="object-cover" /> : sup.name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-extrabold text-[13px] text-slate-900 dark:text-white leading-snug truncate">{sup.name}</p>
                            <span className="text-[9px] text-[#155DFC] dark:text-slate-300 font-black uppercase tracking-wider block mt-0.5">{sup.role}</span>
                          </div>
                          <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 text-[7px] font-black uppercase tracking-widest rounded border border-blue-500/20">
                            Supervisor
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Peers section */}
                {connectionStats.peers.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1">
                      <span>Student Builders ({connectionStats.peers.length})</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    </h4>
                    <div className="space-y-3">
                      {connectionStats.peers.map((peer) => {
                        const peerProfileUrl = `/profile/${slugifyUsername(peer.username)}`;
                        return (
                          <div key={peer.id} className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-800/60 rounded-xl hover:border-blue-500/20 transition-all hover:shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center font-bold text-slate-700 relative border border-border">
                              {peer.avatarUrl ? <Image src={peer.avatarUrl} alt={peer.name} fill className="object-cover" /> : peer.name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-extrabold text-[13px] text-slate-900 dark:text-white leading-snug truncate">{peer.name}</p>
                              <span className="text-[9px] text-muted-foreground font-semibold block mt-0.5">@{peer.username || "builder"}</span>
                            </div>
                            <Link
                              href={peerProfileUrl}
                              className="px-3 py-1.5 rounded-lg border border-border hover:border-blue-500/35 hover:bg-[#155DFC]/5 text-[9px] font-extrabold text-[#155DFC] dark:text-slate-300 transition-all whitespace-nowrap active:scale-95 uppercase tracking-wider"
                              onClick={() => setIsConnectionsDrawerOpen(false)}
                            >
                              View Profile
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* ── Scrollbar Styling block ── */}
      <style>{`
        .zigex-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .zigex-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .zigex-scrollbar::-webkit-scrollbar-thumb {
          background: #155DFC !important;
          border-radius: 9999px;
        }
        .zigex-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #0044db !important;
        }
      `}</style>
    </div>
  );
}


