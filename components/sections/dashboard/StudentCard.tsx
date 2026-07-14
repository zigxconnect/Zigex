"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Heart, 
  MapPin, 
  Linkedin, 
  Rocket,
  Users,
  Briefcase,
  Award
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
  
  const studentColor = "from-[#155DFC] to-blue-800";
  const primarySkills = (student.hard_skills || []).slice(0, 3);

  const nameSlug = student.full_name ? student.full_name.trim().replace(/\s+/g, '_').toLowerCase() : '';
  const usernameSlug = slugifyUsername(student.username);
  
  const finalSlug = nameSlug || usernameSlug || student.id;
  const profileLink = `/dashboard/student/${finalSlug}`;

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
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      className="w-full"
    >
      <Link href={profileLink} className="block group relative bg-white dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-800 shadow-[0_1px_5px_-1px_rgba(0,0,0,0.03)] hover:shadow-md hover:shadow-blue-900/5 hover:-translate-y-0.5 hover:border-blue-100 dark:hover:border-blue-900/20 transition-all duration-300 overflow-hidden">
        
        {/* Banner with Top Right Mini-Badges */}
        <div className="relative h-16 sm:h-20 w-full overflow-hidden">
          <div className={cn(
            "absolute inset-0 bg-gradient-to-r transition-all duration-700 opacity-90",
            studentColor
          )} />
          <img 
            src={student.cover_image || "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80"} 
            alt="Cover" 
            className="w-full h-full object-cover mix-blend-overlay group-hover:scale-105 transition-transform duration-700"
            onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          
          {/* Top Right Mini Badges - Glowing & Gamified */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10 scale-[0.8] origin-top-right">
            <div className="bg-emerald-500 text-white shadow-md rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wider flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
              Seed 50
            </div>
            <div className="bg-black/40 text-white border border-white/20 shadow-md rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wider flex items-center gap-1 backdrop-blur-sm">
              <span>Lvl 12 Voyager</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="px-3.5 pb-3.5 relative">
          
          <div className="flex gap-3">
            {/* Avatar overlapping banner */}
            <div className="-mt-6 flex-shrink-0 relative z-10">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-[2.5px] border-white dark:border-slate-950 shadow-md overflow-hidden bg-white dark:bg-slate-900">
                 <img
                   src={student.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(student.full_name || 'ZX')}`}
                   alt={student.full_name || "Talent"}
                   className="w-full h-full object-cover"
                   onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(student.full_name || 'ZX')}`; }}
                 />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-950 shadow-sm z-20"></div>
            </div>

            {/* Info Section */}
            <div className="flex-1 pt-1 min-w-0">
               <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-tight group-hover:text-[#155DFC] transition-colors flex flex-wrap items-center gap-1">
                      <span>{student.full_name || "Studio Member"}</span>
                      <span className="text-[9px] font-semibold text-slate-400">@{usernameSlug || nameSlug || "student"}</span>
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500">
                         <MapPin size={9} className="text-[#155DFC]" />
                         <span className="truncate max-w-[120px]">{student.university || "Global Ecosystem"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions / Stats Right side */}
                  <div className="flex items-center gap-3 shrink-0">
                     {/* Mini stats */}
                     <div className="hidden sm:flex items-center gap-3 text-center mr-1">
                        <div>
                           <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Programs</p>
                           <p className="text-[10px] font-black text-slate-800 dark:text-slate-200">{stats?.programsApplied || 0}</p>
                        </div>
                        <div className="w-px h-4 bg-slate-100 dark:bg-slate-800"></div>
                        <div>
                           <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Projects</p>
                           <p className="text-[10px] font-black text-[#155DFC]">{stats?.projectsCreated || 0}</p>
                        </div>
                     </div>

                     <div className="flex items-center gap-1">
                        <button 
                           onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsLiked(!isLiked); }}
                           className={cn(
                             "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                             isLiked ? "bg-rose-50 text-rose-500" : "bg-slate-50 dark:bg-slate-900 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                           )}
                        >
                           <Heart size={11} className={isLiked ? "fill-current" : ""} />
                        </button>
                        {student.linkedin_url && (
                          <a
                            href={student.linkedin_url}
                            target="_blank"
                            onClick={(e) => e.stopPropagation()}
                            className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950/30 text-[#155DFC] flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                          >
                            <Linkedin size={11} />
                          </a>
                        )}
                     </div>
                  </div>
               </div>

               {/* Bio Quote Style */}
               {student.about && (
                 <div className="mt-2 border-l-2 border-[#155DFC] pl-2 py-0.5">
                   <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 italic font-medium leading-normal">
                      "{student.about}"
                   </p>
                 </div>
               )}

               {/* Skills & Action Trigger with Real Achievement Badges */}
               <div className="mt-2.5 flex items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-900/50 pt-2.5">
                  <div className="flex items-center gap-1.5">
                    {primarySkills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-[8px] font-black uppercase tracking-wider rounded"
                      >
                        {skill}
                      </span>
                    ))}
                    {(student.hard_skills?.length || 0) > 3 && (
                      <span className="px-1.5 py-0.5 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-slate-400 text-[8px] font-bold rounded">
                        +{(student.hard_skills?.length || 0) - 3}
                      </span>
                    )}
                  </div>
                  
                  {/* Real mini dynamic badges shown on card */}
                  <div className="flex items-center -space-x-1 shrink-0 bg-slate-50/50 dark:bg-slate-900/30 px-1.5 py-0.5 rounded-full border border-slate-100 dark:border-slate-800">
                    <img src="/badges/bronze.png" alt="Bronze" className="w-3.5 h-3.5 object-contain" title="Pioneer" />
                    <img src="/badges/silver.png" alt="Silver" className="w-3.5 h-3.5 object-contain" title="Catalyst" />
                    <img src="/badges/gold.png" alt="Gold" className="w-3.5 h-3.5 object-contain" title="Innovator" />
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