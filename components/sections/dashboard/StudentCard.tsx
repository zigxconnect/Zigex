"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Heart, 
  MapPin, 
  CheckCircle2, 
  Linkedin, 
  Rocket,
  ChevronRight,
  Target,
  Users
} from "lucide-react";
import { slugifyUsername, cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
  currentProgram?: string;
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
      className="w-full mb-6 last:mb-0"
    >
      <Link href={profileLink} className="block group relative bg-white rounded-3xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 hover:border-blue-100 transition-all duration-300 overflow-hidden">
        
        {/* 1. Compact Header */}
        <div className="relative h-24 sm:h-32 w-full overflow-hidden">
          <div className={cn(
            "absolute inset-0 bg-gradient-to-r transition-all duration-700 opacity-90",
            studentColor
          )} />
          <img 
            src={student.cover_image || "https://i.ibb.co/9kLrm6KY/og-image-2x-100-1.jpg"} 
            alt="Cover" 
            className="w-full h-full object-cover mix-blend-overlay group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* 2. Content Body */}
        <div className="px-5 pb-5 sm:px-8 sm:pb-8 relative">
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            {/* Avatar - Left aligned overlapping */}
            <div className="-mt-10 sm:-mt-12 flex-shrink-0 relative z-10">
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl border-[4px] border-white shadow-md overflow-hidden bg-white">
                 <img
                   src={student.avatar_url || "https://i.ibb.co/8n8d37H4/white-logo-4x.png"}
                   alt={student.full_name || "Talent"}
                   className={cn(
                     "w-full h-full object-cover",
                     !student.avatar_url && "p-4 bg-slate-50"
                   )}
                 />
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 pt-1 sm:pt-4 min-w-0">
               <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg sm:text-2xl font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                      {student.full_name || "Studio Member"}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs sm:text-sm font-medium text-slate-500">@{username}</p>
                      <div className="w-1 h-1 rounded-full bg-slate-300" />
                      <div className="flex items-center gap-1 text-xs sm:text-sm font-medium text-slate-500">
                         <MapPin size={12} className="text-slate-400" />
                         <span className="truncate max-w-[150px]">{student.university || "Global Ecosystem"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions (Desktop) */}
                  <div className="hidden sm:flex items-center gap-2">
                     <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsLiked(!isLiked); }}
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                          isLiked ? "bg-rose-50 text-rose-500" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                        )}
                     >
                        <Heart size={16} className={isLiked ? "fill-current" : ""} />
                     </button>
                     {student.linkedin_url && (
                       <a
                         href={student.linkedin_url}
                         target="_blank"
                         onClick={(e) => e.stopPropagation()}
                         className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                       >
                         <Linkedin size={16} />
                       </a>
                     )}
                  </div>
               </div>

               {/* Bio Snippet */}
               <p className="mt-3 text-sm text-slate-600 line-clamp-2 leading-relaxed">
                  {student.about || `Building the future of the African tech landscape through ${primarySkills[0] || 'Innovation'}.`}
               </p>

               {/* Current Program Badge */}
               {stats?.currentProgram && (
                 <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-100 rounded-lg">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-bold text-green-700 uppercase tracking-wide">
                      Attending {stats.currentProgram}
                    </span>
                 </div>
               )}

               {/* Skills & Stats Row */}
               <div className="mt-4 flex flex-wrap items-center gap-y-3 gap-x-4">
                  <div className="flex flex-wrap gap-2">
                    {primarySkills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-slate-50 border border-slate-100 text-slate-600 text-[10px] sm:text-xs font-semibold rounded-lg uppercase tracking-wider"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex-1 border-t border-slate-100 min-w-[50px] sm:hidden" />
                  
                  {/* Compact Stats */}
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 ml-auto sm:ml-0">
                     <div className="flex items-center gap-1.5" title="Projects Created">
                        <Rocket size={14} className="text-amber-500" />
                        <span>{stats?.projectsCreated || 0}</span>
                     </div>
                     <div className="flex items-center gap-1.5" title="Events Attended">
                        <Users size={14} className="text-blue-500" />
                        <span>{stats?.eventsApplied || 0}</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default StudentCard;