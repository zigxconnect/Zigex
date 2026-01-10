"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Heart, 
  MapPin, 
  CheckCircle2, 
  Linkedin, 
  Briefcase, 
  Calendar, 
  Award, 
  Rocket,
  ExternalLink,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { slugifyUsername, cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface StudentProps {
  id: string;
  username?: string;
  full_name?: string | null;
  avatar_url?: string | null;
  cover_image?: string | null;
  university?: string | null;
  hard_skills?: string[] | null;
  soft_skills?: string[] | null;
  linkedin_url?: string | null;
  about?: string | null;
}

interface StudentStats {
  internshipsApplied?: number;
  programsApplied?: number;
  eventsApplied?: number;
  projectsCreated?: number;
}

const StudentCard: React.FC<{ student: StudentProps; stats?: StudentStats }> = ({ student, stats: initialStats }) => {
  if (!student) return null;

  const [isLiked, setIsLiked] = useState(false);
  const [stats, setStats] = useState<StudentStats>(initialStats || {});
  
  const studentColor = "from-blue-600 to-indigo-700";
  const primarySkills = (student.hard_skills || []).slice(0, 3);
  const username = slugifyUsername(student.username) || (student.full_name ? student.full_name.toLowerCase().replace(/\s+/g, '') : "student");
  const profileLink = `/dashboard/student/${slugifyUsername(student.username || student.id)}`;

  useEffect(() => {
    if (initialStats) {
      setStats(initialStats);
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/students/stats/${student.id}`);
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch student stats:', error);
      }
    };

    if (student.id) fetchStats();
  }, [student.id, initialStats]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className="w-full mb-8 last:mb-0"
    >
      <div className="group relative bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.12)] hover:border-blue-100 transition-all duration-500 overflow-hidden">
        
        {/* 1. Immersive Header Container */}
        <Link href={profileLink} className="block relative aspect-[21/9] sm:aspect-[3.5/1] overflow-hidden">
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br transition-all duration-700 group-hover:scale-110 opacity-90",
            studentColor
          )} />
          <img 
            src={student.cover_image || "https://i.ibb.co/9kLrm6KY/og-image-2x-100-1.jpg"} 
            alt="Cover" 
            className="w-full h-full object-cover mix-blend-overlay group-hover:scale-110 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          
          {/* Top Floating Actions */}
          <div className="absolute top-4 right-4 flex gap-2 z-10" onClick={(e) => e.preventDefault()}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.preventDefault(); setIsLiked(!isLiked); }}
              className={cn(
                "w-10 h-10 rounded-2xl backdrop-blur-md flex items-center justify-center transition-all duration-300",
                isLiked 
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/40" 
                  : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
              )}
            >
              <Heart size={18} className={isLiked ? "fill-current" : ""} />
            </motion.button>
            <motion.a
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              href={student.linkedin_url || "#"}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
              className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md text-white border border-white/20 flex items-center justify-center hover:bg-blue-600 hover:border-blue-500 transition-all duration-300 shadow-sm"
            >
              <Linkedin size={18} />
            </motion.a>
          </div>
        </Link>

        {/* 2. Content Body */}
        <div className="px-8 pb-8 relative">
          
          {/* Dynamic Avatar Overlap */}
          <div className="relative -mt-14 sm:-mt-18 mb-6">
            <Link href={profileLink} className="inline-block relative group/avatar">
              <motion.div 
                 whileHover={{ rotate: 5, scale: 1.05 }}
                 className="w-28 h-28 sm:w-36 sm:h-36 rounded-[2.8rem] border-8 border-white shadow-2xl overflow-hidden bg-white ring-1 ring-slate-100 transition-all duration-500"
              >
                <img
                  src={student.avatar_url || "https://i.ibb.co/8n8d37H4/white-logo-4x.png"}
                  alt={student.full_name || "Talent"}
                  className={cn(
                    "w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-110",
                    !student.avatar_url && "bg-gradient-to-br from-blue-600 to-indigo-700 p-6"
                  )}
                />
              </motion.div>
              <div className="absolute bottom-4 right-4 w-5 h-5 bg-green-500 border-4 border-white rounded-full shadow-lg" />
            </Link>
          </div>

          <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-10">
            
            {/* 3. Identity & Pitch */}
            <div className="flex-1 min-w-0 space-y-4">
              <div className="space-y-1">
                <Link href={profileLink} className="inline-flex items-center gap-2 group/name">
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter group-hover/name:text-blue-600 transition-colors">
                    {student.full_name || "Studio Member"}
                  </h3>
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle2 size={12} className="text-white fill-current" />
                  </div>
                </Link>
                <div className="flex items-center gap-3">
                   <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">@{username}</p>
                   <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <MapPin size={10} className="text-blue-500" />
                      {student.university || "Global Ecosystem"}
                   </div>
                </div>
              </div>

              <div className="relative">
                 <div className="absolute left-0 top-0 w-1 h-full bg-blue-100 rounded-full" />
                 <p className="text-slate-600 text-base md:text-lg font-medium leading-relaxed italic pl-6 py-1 line-clamp-2">
                    "{student.about || `Building the future of the African tech landscape through ${primarySkills[0] || 'Technical Innovation'}.`}"
                 </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {primarySkills.map((skill, i) => (
                  <div
                    key={i}
                    className="px-5 py-2 bg-slate-900 text-white text-[9px] font-black rounded-xl uppercase tracking-widest hover:bg-blue-600 transition-all duration-300 shadow-sm cursor-default"
                  >
                    {skill}
                  </div>
                ))}
                <div className="flex items-center gap-1.5 px-5 py-2 bg-white border border-slate-100 text-slate-400 text-[9px] font-black rounded-xl uppercase tracking-widest group-hover:border-blue-100 transition-all group-hover:text-blue-600">
                    <Sparkles size={10} />
                    Member
                </div>
              </div>
            </div>

            {/* 4. Stats & Interactive Dock */}
            <div className="xl:w-60 shrink-0 space-y-4">
               <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50/80 rounded-[1.8rem] p-4 border border-slate-100 hover:bg-white hover:border-blue-100 hover:shadow-xl hover:shadow-blue-50/50 transition-all duration-500 group/stat">
                     <div className="flex items-center gap-2 mb-2">
                        <Rocket size={14} className="text-amber-500 group-hover/stat:rotate-12 transition-transform" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Impact</span>
                     </div>
                     <p className="text-2xl font-black text-slate-900 leading-none">{stats?.projectsCreated || 0}</p>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Projects</p>
                  </div>
                  <div className="bg-slate-50/80 rounded-[1.8rem] p-4 border border-slate-100 hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-500 group/stat">
                     <div className="flex items-center gap-2 mb-2">
                        <Briefcase size={14} className="text-indigo-500 group-hover/stat:scale-110 transition-transform" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Experience</span>
                     </div>
                     <p className="text-2xl font-black text-slate-900 leading-none">{stats?.internshipsApplied || 0}</p>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Events</p>
                  </div>
               </div>

               <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between px-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                     <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-blue-400" />
                        <span>{stats?.eventsApplied || 0} Attended</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <Award size={12} className="text-purple-400" />
                        <span>{stats?.programsApplied || 0} Badges</span>
                     </div>
                  </div>
                  <Link 
                     href={profileLink}
                     className="w-full py-4 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-100 hover:bg-blue-600 hover:shadow-blue-200 transition-all duration-300 group/btn"
                  >
                     <span>Open Portfolio</span>
                     <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" strokeWidth={3} />
                  </Link>
               </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StudentCard;