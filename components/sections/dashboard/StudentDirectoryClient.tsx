"use client";

import React, { useMemo, useState } from "react";
import StudentCard from "./StudentCard";
import { Search, TrendingUp, Filter, Users, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface StudentStats {
  internshipsApplied?: number;
  programsApplied?: number;
  eventsApplied?: number;
  projectsCreated?: number;
  currentProgram?: string;
}

interface RawUserProfile {
  id: string;
  username?: string;
  full_name?: string | null;
  avatar_url?: string | null;
  university?: string | null;
  hard_skills?: string[] | null;
  soft_skills?: string[] | null;
  linkedin_url?: string | null;
  about?: string | null;
  cover_image?: string | null;
  stats?: StudentStats;
}

export const StudentDirectoryClient: React.FC<{ profiles: RawUserProfile[] }> = ({ profiles }) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter((p) => {
      const name = p.full_name?.toLowerCase() || "";
      const uni = p.university?.toLowerCase() || "";
      const skills = (p.hard_skills || []).join(" ").toLowerCase();
      const user = p.username?.toLowerCase() || "";
      return name.includes(q) || uni.includes(q) || skills.includes(q) || user.includes(q);
    });
  }, [profiles, query]);

  return (
    <div className="relative overflow-hidden space-y-4">
      {/* 1. Navigation & Search */}
      <div className="sticky top-4 z-35 transition-all duration-300">
        <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] overflow-hidden">
          <div className="px-5 py-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                 <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/10">
                    <Users size={16} />
                 </div>
                 <div>
                    <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-none">Zigex Universe</h1>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Student Directory</p>
                 </div>
              </div>
              
              {/* Search Experience */}
              <div className="relative flex-1 max-w-md group">
                <div className={cn(
                   "absolute inset-0 bg-blue-600 opacity-0 blur-xl transition-opacity duration-500 rounded-xl",
                   isFocused && "opacity-10"
                )} />
                <div className={cn(
                  "relative flex items-center bg-white dark:bg-slate-900 border rounded-xl transition-all duration-300",
                  isFocused ? "border-blue-500 shadow-md shadow-blue-500/5 scale-[1.01]" : "border-slate-150 dark:border-slate-800 shadow-sm"
                )}>
                  <div className="pl-4 pr-2 text-slate-400">
                    <Search size={14} className={cn("transition-colors", isFocused && "text-blue-500")} />
                  </div>
                  <input 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)} 
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Search by name, skillset or campus..." 
                    className="w-full py-2.5 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-medium focus:outline-none bg-transparent" 
                  />
                  <div className="pr-3 flex items-center gap-1.5">
                     <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-md text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                        <Filter size={8} />
                        Filter
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Compact Community Pulse Banner */}
      <motion.div 
         initial={{ opacity: 0, scale: 0.99 }}
         animate={{ opacity: 1, scale: 1 }}
         className="relative rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 group"
      >
         <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity" />
         <div className="relative px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white dark:bg-slate-900 rounded-xl shadow border border-slate-100 dark:border-slate-800 flex items-center justify-center text-blue-600 rotate-0 group-hover:rotate-6 transition-transform duration-500">
                <TrendingUp size={16} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white tracking-tight text-xs mb-0.5">Community Pulse</h3>
                <div className="flex items-center gap-1.5 text-blue-600 font-black text-[9px] uppercase tracking-widest">
                  <Users size={10} />
                  <span>{filtered.length} Talent Profiles Active Now</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
               <div className="flex -space-x-2 mr-2">
                  {profiles.slice(0, 5).map((p, i) => (
                     <div key={i} className="w-7 h-7 rounded-full border border-white dark:border-slate-950 overflow-hidden bg-slate-100 shadow-sm relative" style={{ zIndex: 10 - i }}>
                        <img 
                          src={p.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(p.full_name || 'U')}`} 
                          alt="Talent" 
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(p.full_name || 'U')}`; }}
                        />
                     </div>
                  ))}
                  <div className="w-7 h-7 rounded-full border border-white dark:border-slate-950 bg-slate-900 flex items-center justify-center text-white text-[8px] font-black shadow-sm relative z-0">
                     +{Math.max(0, profiles.length - 5)}
                  </div>
               </div>
               <div className="w-px h-6 bg-slate-200 dark:bg-slate-850 mx-1 hidden sm:block" />
               <LayoutGrid className="text-slate-300 dark:text-slate-700 hidden sm:block" size={14} />
            </div>
         </div>
      </motion.div>

      {/* 3. The Responsive Sleek Grid (Zoomed Out Layout) */}
      <AnimatePresence mode="popLayout">
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {filtered.length > 0 ? (
            filtered.map((s, index) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                layout
              >
                <StudentCard 
                  student={s} 
                  stats={s.stats}
                />
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-20 px-8 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm"
            >
              <div className="w-14 h-14 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                 <Search size={24} className="text-slate-300" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight mb-1">Universe Ghosted</h3>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">No students match your signal</p>
              <button 
                 onClick={() => setQuery("")}
                 className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-blue-500/10"
              >
                 Reset Frequency
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* 4. Footer Pagination / Load More Sentiment */}
      {filtered.length > 0 && (
        <div className="mt-12 py-6 text-center border-t border-slate-100 dark:border-slate-800/60">
           <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-full shadow-sm">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-ping" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">End of Transmission</span>
           </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default StudentDirectoryClient;