"use client";

import React from "react";
// Imports restored to resolve ReferenceError
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Briefcase,
  Calendar,
  Share2,
  CheckCircle2,
  Rocket,
  Globe,
  ChevronRight,
  AtSign,
  GraduationCap,
  LayoutGrid,
  Clock,
  Edit
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
import { cn, slugifyUsername } from "@/lib/utils";

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
  // Fallback images using more reliable sources
  const defaultAvatar = "https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(data.full_name || "ZX");
  const defaultCover = "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&q=80";
  const avatarUrl = data.avatar_url || defaultAvatar;
  const coverImageUrl = data.cover_image || defaultCover;
  const linkedinUrl = data.linkedin_url;
  const whatsappUrl = data.phone ? `https://wa.me/${data.phone.replace(/\D/g, '')}` : null;
  const skills = data.hard_skills || [];
  const soft = data.soft_skills || [];
  const isOwner = myProfile?.id === data.id;

  const participatingPrograms = applicationsList.filter(a => a.type === 'program' && a.status === 'accepted');
  const participatingEvents = applicationsList.filter(a => a.type === 'event' && a.status === 'accepted'); // or 'registered' if applicable, assuming 'accepted' for now
  const pendingApplications = applicationsList.filter(a => a.status === 'pending');

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${data.full_name} - Zigex Profile`,
          text: `Check out ${data.full_name}'s profile on Zigex!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing", error);
      }
    } else {
       navigator.clipboard.writeText(window.location.href);
       // Optional: Add toast notification "Copied to clipboard"
    }
  };


  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-40">
      {/* 1. Header Banner */}
      <div className="relative h-[160px] sm:h-[240px] md:h-[320px] w-full overflow-hidden bg-slate-900">
        <Image src={coverImageUrl} alt="Cover" fill className="object-cover opacity-90" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        
        {/* Top Navbar */}
        <div className="absolute top-4 sm:top-8 left-4 right-4 sm:left-8 sm:right-8 flex justify-between items-center z-10 transition-all">
          <Link href="/dashboard/student" className="p-2 sm:p-3 bg-white/20 backdrop-blur-md rounded-xl sm:rounded-2xl text-white border border-white/20 hover:bg-white/30 transition-all flex items-center gap-2 group">
             <ChevronRight className="rotate-180 group-hover:-translate-x-1 transition-transform" size={18} />
             <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest">Directory</span>
          </Link>
          <div className="flex gap-2 sm:gap-3">
             <button onClick={handleShare} className="p-2 sm:p-3 bg-white/20 backdrop-blur-md rounded-xl sm:rounded-2xl text-white border border-white/20 hover:bg-white/30 transition-all">
                <Share2 size={18} />
             </button>
          </div>
        </div>
      </div>

      {/* 2. Profile Identity Section (LinkedIn Style) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative">
        <div className="flex flex-col md:flex-row gap-6 md:items-end -mt-16 sm:-mt-20 md:-mt-24 mb-6">
           
           {/* Avatar */}
           <motion.div 
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="relative z-20 shrink-0 mx-auto md:mx-0"
           >
             <div className={cn(
               "w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full bg-white border-[4px] border-white shadow-xl overflow-hidden relative",
               activeStories.length > 0 && "ring-4 ring-offset-4 ring-blue-500"
             )}>
                <Image 
                  src={avatarUrl} 
                  alt={data.full_name} 
                  fill 
                  className="object-cover" 
                />
             </div>
             {/* Verification Badge */}
             <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 bg-white rounded-full p-1 shadow-md">
                <CheckCircle2 size={20} className="text-blue-600 fill-blue-50" />
             </div>
           </motion.div>

           {/* Name & Headline - Frosted glass overlay on desktop for contrast */}
           <div className="flex-1 pt-2 md:pb-2 text-center md:text-left min-w-0 bg-white md:bg-white/80 md:backdrop-blur-md rounded-2xl md:rounded-2xl p-4 md:p-5 shadow-lg md:shadow-xl border border-slate-100 md:border-white/50">
             <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
               <div className="flex-1">
                  <div className="flex items-center justify-center md:justify-start gap-4">
                      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                        {data.full_name}
                      </h1>
                  </div>
                  <p className="text-sm sm:text-base font-medium text-slate-600 mt-2 max-w-2xl mx-auto md:mx-0 leading-relaxed">
                    {data.about || "Building in the African tech ecosystem."}
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 mt-4 text-sm text-slate-500 font-medium">
                     <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md">
                        <MapPin size={14} />
                        <span>{data.university || "Global Ecosystem"}</span>
                     </div>
                     <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                        <AtSign size={14} />
                        <span>{data.username || "student"}</span>
                     </div>
                     {linkedinUrl && (
                        <a href={linkedinUrl} target="_blank" className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 transition-colors">
                           <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                           LinkedIn
                        </a>
                     )}
                  </div>

                  {/* Mobile Edit Button */}
                  {isOwner && (
                    <div className="mt-5 md:hidden flex justify-center">
                        <Link 
                          href="/create-profile" 
                          className="flex items-center gap-2 px-6 py-2 w-full justify-center bg-white border border-slate-300 text-slate-700 rounded-full font-bold hover:bg-slate-50 transition-all shadow-sm"
                        >
                          <Edit size={16} />
                          <span>Edit profile</span>
                        </Link>
                    </div>
                  )}
               </div>
               
               {/* Desktop Actions (Right Side) */}
               <div className="hidden md:flex gap-3 shrink-0 pt-2">
                  {isOwner ? (
                       <Link 
                         href="/create-profile" 
                         className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-full font-bold hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm group"
                       >
                         <Edit size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                         <span>Edit profile</span>
                       </Link>
                  ) : (
                       <AnimatedConnectButtons linkedinUrl={linkedinUrl} whatsappUrl={whatsappUrl} />
                  )}
               </div>
             </div>
           </div>
        </div>

        {/* Mobile Stats Summary (Visible only on mobile/tablet) */}
        <div className="grid grid-cols-2 gap-3 mb-8 md:hidden">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
               <span className="text-2xl font-bold text-slate-900">{projects.length}</span>
               <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Projects</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
               <span className="text-2xl font-bold text-slate-900">{stats.eventsApplied + stats.programsApplied + stats.internshipsApplied}</span>
               <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Activities</span>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative items-start">
          
          {/* Sidebar Column (Mobile: Top, Desktop: Right) */}
          <div className="lg:col-span-4 lg:order-2 space-y-8">
             <div className="sticky top-24">
                <SimilarStudentsSidebar students={similarStudents} />
             </div>
          </div>

          {/* Main Content Column */}
          <div className="lg:col-span-8 lg:order-1 flex flex-col gap-8">
            
            {/* About Section */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                     <Globe size={20} />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">About</h2>
               </div>
               <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                 {data.about || "This user hasn't written a bio yet, but they are an active member of the Zigex ecosystem, participating in events and building projects."}
               </p>
            </section>

             {/* ===== ACTIVE INTERNSHIP SECTION ===== */}
             {activeInternshipInfo && (
               <section className="bg-white rounded-3xl border border-blue-200 shadow-lg overflow-hidden">
                 {/* Internship Header */}
                 <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white relative">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-12 -mt-12" />
                   <div className="relative z-10 flex items-center gap-4">
                     <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg overflow-hidden">
                       {activeInternshipInfo.company?.logo_url ? (
                         <Image src={activeInternshipInfo.company.logo_url} alt="Company" width={56} height={56} className="w-full h-full object-cover" />
                       ) : (
                         <Briefcase size={24} className="text-white" />
                       )}
                     </div>
                     <div>
                       <p className="text-[10px] font-bold uppercase tracking-widest text-blue-100 mb-0.5">Currently Interning At</p>
                       <h2 className="text-lg sm:text-xl font-black tracking-tight">{activeInternshipInfo.company?.company_name || "Company"}</h2>
                       <p className="text-xs font-medium text-blue-100 mt-0.5">{activeInternshipInfo.internship?.title}</p>
                     </div>
                   </div>
                 </div>

                 {/* Supervisor Info */}
                 {activeInternshipInfo.supervisor && (
                   <div className="p-5 border-b border-slate-100 flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shadow-md">
                       <Image 
                         src={activeInternshipInfo.supervisor.avatar_url || "/default-avatar.svg"} 
                         alt={activeInternshipInfo.supervisor.full_name} 
                         width={48} 
                         height={48} 
                         className="w-full h-full object-cover" 
                       />
                     </div>
                     <div className="flex-1">
                       <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Supervised By</p>
                       <h4 className="text-base font-bold text-slate-900">{activeInternshipInfo.supervisor.full_name}</h4>
                       <p className="text-xs font-medium text-slate-500">{activeInternshipInfo.supervisor.role || "Lead Supervisor"}</p>
                     </div>
                   </div>
                 )}

                 {/* Activity Graph */}
                 <div className="p-5">
                   <ActiveInternshipActivityGraph logs={activeInternshipInfo.logs} />
                 </div>
               </section>
             )}

             {/* Engagement Status Section */}
             {(participatingPrograms.length > 0 || participatingEvents.length > 0 || pendingApplications.length > 0) && (
                <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                         <Rocket size={20} />
                      </div>
                      <h2 className="text-lg font-bold text-slate-900">Current Engagement</h2>
                   </div>
                   
                   <div className="space-y-4">
                      {participatingPrograms.map((p, i) => (
                         <Link href={`/programs/${p.id}/updates`} key={`p-${i}`} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors group/prog">
                            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600 group-hover/prog:scale-110 transition-transform">
                               <CheckCircle2 size={24} />
                            </div>
                            <div>
                               <h4 className="font-bold text-slate-900 group-hover/prog:text-blue-600 transition-colors">{p.title}</h4>
                               <p className="text-xs font-bold text-green-600 uppercase tracking-wider mt-1">Participating Program</p>
                            </div>
                         </Link>
                      ))}
                      {participatingEvents.map((e, i) => (
                         <div key={`e-${i}`} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                               <Calendar size={24} />
                            </div>
                            <div>
                               <h4 className="font-bold text-slate-900">{e.title}</h4>
                               <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mt-1">Attending Event</p>
                            </div>
                         </div>
                      ))}
                      {pendingApplications.map((a, i) => (
                         <div key={`pen-${i}`} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 opacity-80">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                               <Clock size={24} />
                            </div>
                            <div>
                               <h4 className="font-bold text-slate-900">{a.title}</h4>
                               <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mt-1">Application Pending</p>
                            </div>
                         </div>
                      ))}
                   </div>
                </section>
             )}

            {/* Connect Buttons Duplicate for Mobile */}
            <div className="md:hidden">
               <AnimatedConnectButtons linkedinUrl={linkedinUrl} whatsappUrl={whatsappUrl} />
            </div>

            {/* Stats Dock (Desktop) */}
            <div className="hidden md:grid grid-cols-4 gap-4">
               <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-center group">
                 <div className="w-8 h-8 mx-auto bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mb-2 group-hover:scale-110 transition-transform">
                   <Rocket size={16} />
                 </div>
                 <div className="text-2xl font-black text-slate-900">{projects.length}</div>
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Projects</div>
               </div>
               <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-center group">
                 <div className="w-8 h-8 mx-auto bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-2 group-hover:scale-110 transition-transform">
                   <Briefcase size={16} />
                 </div>
                 <div className="text-2xl font-black text-slate-900">{stats.internshipsApplied}</div>
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Internships</div>
               </div>
               <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-center group">
                 <div className="w-8 h-8 mx-auto bg-purple-50 rounded-full flex items-center justify-center text-purple-600 mb-2 group-hover:scale-110 transition-transform">
                   <GraduationCap size={16} />
                 </div>
                 <div className="text-2xl font-black text-slate-900">{stats.programsApplied}</div>
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Programs</div>
               </div>
               <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-center group">
                  <div className="w-8 h-8 mx-auto bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-2 group-hover:scale-110 transition-transform">
                     <Calendar size={16} />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stats.eventsApplied}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Events</div>
               </div>
            </div>

            {/* Skills & Interests */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                     <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center text-blue-600"><Rocket size={12} /></div>
                     Interests & Skills
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">Areas of expertise or topics they&apos;re passionate about</p>
                  <div className="flex flex-wrap gap-2">
                     {skills.map((s: string, i: number) => (
                        <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-xs font-semibold hover:border-blue-300 transition-colors">
                          {s}
                        </span>
                     ))}
                     {skills.length === 0 && <p className="text-sm text-slate-400 italic">No interests added yet.</p>}
                  </div>
               </div>
               <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                     <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center text-purple-600"><LayoutGrid size={12} /></div>
                     Personality & Strengths
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">Traits and qualities that define them</p>
                  <div className="flex flex-wrap gap-2">
                     {soft.map((s: string, i: number) => (
                        <span key={i} className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-lg text-xs font-semibold">
                          {s}
                        </span>
                     ))}
                      {soft.length === 0 && <p className="text-sm text-slate-400 italic">No strengths added yet.</p>}
                  </div>
               </div>
            </div>

            {/* Projects */}
            <section className="space-y-6">
               <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">Projects & Portfolio</h2>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{projects.length} PROJECTS</span>
               </div>

               {projects.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     {projects.map((p, index) => (
                        <motion.div 
                          key={p.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <ProjectCard user={data} project={p} isVisitor={true} isOwner={isOwner} />
                        </motion.div>
                     ))}
                  </div>
               ) : (
                  <NoProjectMessage studentName={data.full_name} studentPhone={data.phone} />
               )}
            </section>
          </div>

        </div>
      </div>

      {/* Persistent Dock Bar (Mobile Interactions) */}
      <ConnectBar linkedin={data.linkedin_url} whatsapp={data.phone} x={data.twitter_url || data.x_url} email={data.email} />
      
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
