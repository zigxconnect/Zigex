"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Github,
  Link2,
  MapPin,
  Briefcase,
  Award,
  Calendar,
  Mail,
  Linkedin,
  Heart,
  Share2,
  Activity,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Rocket,
  Globe,
  ChevronRight,
  AtSign,
  GraduationCap
} from "lucide-react";
import { motion } from "framer-motion";
import ConnectBar from "@/components/sections/dashboard/ConnectBar";
import QRCodeButton from "@/components/sections/dashboard/QRCodeButton";
import SimilarStudentsSidebar from "@/components/sections/dashboard/SimilarStudentsSidebar";
import ProjectCard from "@/components/uiComponent/ProjectCard";
import AnimatedConnectButtons from "@/components/customButtons/AnimatedConnectButtons";
import NoProjectMessage from "@/components/sections/dashboard/NoProjectMessage";
import CreateProjectButton from "@/components/project/CreateProjectButton";
import ProfileStories from "@/components/sections/dashboard/ProfileStories";
import { cn } from "@/lib/utils";

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
}

export default function StudentProfileClient({
  data,
  stats,
  projects,
  activeStories,
  similarStudents,
  myProfile,
  username
}: StudentProfileClientProps) {
  const avatarUrl = data.avatar_url || "https://i.ibb.co/8n8d37H4/white-logo-4x.png";
  const coverImageUrl = data.cover_image || "https://i.ibb.co/9kLrm6KY/og-image-2x-100-1.jpg";
  const linkedinUrl = data.linkedin_url;
  const whatsappUrl = data.phone ? `https://wa.me/${data.phone.replace(/\D/g, '')}` : null;
  const skills = data.hard_skills || [];
  const soft = data.soft_skills || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* 1. Immersive Header Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-[40vh] min-h-[300px] w-full lg:rounded-b-[4rem] overflow-hidden shadow-2xl"
      >
        <Image src={coverImageUrl} alt="Cover" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
        
        {/* Top Floating Actions */}
        <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-10">
          <Link href="/dashboard/student" className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white border border-white/20 hover:bg-white/20 transition-all flex items-center gap-2 group">
             <ChevronRight className="rotate-180 group-hover:-translate-x-1 transition-transform" size={18} />
             <span className="text-xs font-black uppercase tracking-widest">Directory</span>
          </Link>
          <div className="flex gap-3">
             <button className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white border border-white/20 hover:bg-white/20 transition-all">
                <Share2 size={18} />
             </button>
             {myProfile?.id === data.id && (
                <Link href={`/profile/${data.username}`} className="p-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">
                   Settings
                </Link>
             )}
          </div>
        </div>

        {/* Profile Identity Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 lg:px-16 lg:pb-12 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end gap-6 md:gap-10">
            {/* Avatar with Story Ring */}
            <motion.div 
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ type: "spring", delay: 0.2 }}
               className="relative group"
            >
               <div className={cn(
                  "w-32 h-32 md:w-44 md:h-44 rounded-[3.5rem] bg-white border-4 border-white shadow-2xl relative z-10 overflow-hidden",
                  activeStories.length > 0 && "p-1.5 bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600"
               )}>
                 <div className="w-full h-full rounded-[2.8rem] overflow-hidden bg-white">
                    <Image src={avatarUrl} alt={data.full_name} width={200} height={200} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                 </div>
               </div>
               <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-white shadow-xl z-20" />
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex-1 pb-2"
            >
              <div className="flex items-center gap-3 mb-2">
                 <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter drop-shadow-md">
                   {data.full_name}
                 </h1>
                 <div className="bg-blue-600 rounded-full p-1 shadow-lg">
                    <CheckCircle2 size={16} className="text-white fill-current" />
                 </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-white/80 font-bold tracking-wide">
                 <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
                    <MapPin size={16} className="text-blue-400" />
                    <span className="text-sm">{data.university || "Global Innovator"}</span>
                 </div>
                 <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 uppercase text-[10px] tracking-[0.2em]">
                    <AtSign size={14} className="text-purple-400" />
                    <span>@{data.username || "student"}</span>
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 lg:px-16 py-12 lg:pr-[28rem] relative">
        <div className="grid grid-cols-1 gap-12">
          
          {/* 2. Stats Engagement Dock */}
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
             <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-4 group-hover:scale-110 transition-transform">
                  <Rocket size={20} />
                </div>
                <div className="text-3xl font-black text-slate-900 leading-none mb-1">{projects.length}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Projects</div>
             </div>
             <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                  <Briefcase size={20} />
                </div>
                <div className="text-3xl font-black text-slate-900 leading-none mb-1">{stats.internshipsApplied}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Experience</div>
             </div>
             <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="w-10 h-10 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                  <GraduationCap size={20} />
                </div>
                <div className="text-3xl font-black text-slate-900 leading-none mb-1">{stats.programsApplied}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Programs</div>
             </div>
             <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                  <Calendar size={20} />
                </div>
                <div className="text-3xl font-black text-slate-900 leading-none mb-1">{stats.eventsApplied}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Events</div>
             </div>
          </motion.div>

          {/* 3. About Section */}
          <motion.section 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />
             <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-slate-100">
                    <Globe size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Personal Manifesto</h2>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1">Journey and Vision</p>
                  </div>
                </div>
                <p className="text-slate-600 text-lg md:text-xl font-medium leading-relaxed italic border-l-4 border-blue-600 pl-8 py-2 bg-slate-50/50 rounded-r-3xl">
                  "{data.about || "I am a builder focused on creating impactful digital solutions. My journey at Zigex is defined by continuous learning, engineering excellence, and the drive to solve complex problems for the African tech ecosystem."}"
                </p>
             </div>
          </motion.section>

          {/* 4. Skills Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <motion.section 
               initial={{ x: -20, opacity: 0 }}
               whileInView={{ x: 0, opacity: 1 }}
               viewport={{ once: true }}
               className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm"
             >
                <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                   <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600"><Rocket size={16} /></div>
                   Engineering Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                   {skills.map((s: string, i: number) => (
                      <span key={i} className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors shadow-sm cursor-default">
                        {s}
                      </span>
                   ))}
                </div>
             </motion.section>
             <motion.section 
               initial={{ x: 20, opacity: 0 }}
               whileInView={{ x: 0, opacity: 1 }}
               viewport={{ once: true }}
               className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm"
             >
                <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                   <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600"><Sparkles size={16} /></div>
                   Soft Capabilities
                </h3>
                <div className="flex flex-wrap gap-2">
                   {soft.map((s: string, i: number) => (
                      <span key={i} className="px-5 py-2.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-default">
                        {s}
                      </span>
                   ))}
                </div>
             </motion.section>
          </div>

          {/* 5. Projects Section */}
          <section className="space-y-8">
             <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-amber-500 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-amber-100">
                    <Award size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active Initiatives</h2>
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mt-1">{projects.length} CREATIONS DISCOVERED</p>
                  </div>
                </div>
             </div>

             {projects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                   {projects.map((p, index) => (
                      <motion.div 
                        key={p.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <ProjectCard user={data} project={p} isVisitor={true} isOwner={myProfile?.id === data.id} />
                      </motion.div>
                   ))}
                </div>
             ) : (
                <NoProjectMessage studentName={data.full_name} studentPhone={data.phone} />
             )}
          </section>
        </div>

        {/* Floating Sidebar (Desktop Only) */}
        <div className="hidden lg:block fixed top-32 right-12 w-[24rem]">
           <SimilarStudentsSidebar students={similarStudents} />
           
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.5 }}
             className="mt-8 bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-200"
           >
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-600/30 rounded-full blur-[60px]" />
              <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-6">
                    <CheckCircle2 size={16} className="text-blue-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Zigex Verified</span>
                 </div>
                 <h4 className="text-2xl font-black leading-tight mb-4 tracking-tighter">Ready to build something world-class?</h4>
                 <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">Connect directly via secure channels to discuss collaborations or mentorship.</p>
                 <AnimatedConnectButtons linkedinUrl={linkedinUrl} whatsappUrl={whatsappUrl} />
              </div>
           </motion.div>
        </div>
      </div>

      {/* Persistent Dock Bar */}
      <ConnectBar linkedin={data.linkedin_url} whatsapp={data.phone} x={data.twitter_url || data.x_url} email={data.email} />
      
      {/* 6. Stories Tray at Bottom for Mobile */}
      <div className="fixed bottom-24 left-0 right-0 z-40 lg:hidden px-6">
         <ProfileStories stories={activeStories} user={data} />
      </div>

      {myProfile?.id === data.id && <CreateProjectButton variant="floating" />}
    </div>
  );
}
