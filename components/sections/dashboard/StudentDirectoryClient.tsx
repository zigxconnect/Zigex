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
    <div className="min-h-screen bg-[#F8FAFC] relative overflow-hidden">
      {/* Background Studio Motifs */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
      
      {/* 1. Immersive Navigation & Search */}
      <div className="sticky top-0 z-30 transition-all duration-300">
        <div className="bg-white/80 backdrop-blur-2xl border-b border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                    <Users size={20} />
                 </div>
                 <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tighter leading-none">Zigex Universe</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Student Directory</p>
                 </div>
              </div>
              
              {/* Search Experience */}
              <div className="relative flex-1 max-w-lg group">
                <div className={cn(
                   "absolute inset-0 bg-blue-600 opacity-0 blur-xl transition-opacity duration-500 rounded-2xl",
                   isFocused && "opacity-10"
                )} />
                <div className={cn(
                  "relative flex items-center bg-white border rounded-2xl transition-all duration-300",
                  isFocused ? "border-blue-500 shadow-xl shadow-blue-100 scale-[1.02]" : "border-slate-100 shadow-sm"
                )}>
                  <div className="pl-5 pr-3 text-slate-400">
                    <Search size={18} className={cn("transition-colors", isFocused && "text-blue-500")} />
                  </div>
                  <input 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)} 
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Search by name, skillset or campus..." 
                    className="w-full py-4 text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-medium focus:outline-none bg-transparent" 
                  />
                  <div className="pr-4 flex items-center gap-2">
                     <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        <Filter size={10} />
                        Filter
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Feed Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Dynamic Activity Banner */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.98 }}
           animate={{ opacity: 1, scale: 1 }}
           className="relative rounded-3xl mb-12 overflow-hidden border border-blue-100 group"
        >
           <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-5 group-hover:opacity-10 transition-opacity" />
           <div className="relative px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-lg border border-blue-50 flex items-center justify-center text-blue-600 rotate-0 group-hover:rotate-12 transition-transform duration-500">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 tracking-tight text-lg mb-0.5">Community Pulse</h3>
                  <div className="flex items-center gap-1.5 text-blue-600 font-black text-[10px] uppercase tracking-widest">
                    <Users size={12} />
                    <span>{filtered.length} Talent Profiles Active Now</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <div className="flex -space-x-3 mr-4">
                    {profiles.slice(0, 5).map((p, i) => (
                       <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-slate-100 shadow-sm relative" style={{ zIndex: 10 - i }}>
                          <img 
                            src={p.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(p.full_name || 'U')}`} 
                            alt="Talent" 
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(p.full_name || 'U')}`; }}
                          />
                       </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-900 flex items-center justify-center text-white text-[10px] font-black shadow-sm relative z-0">
                       +{Math.max(0, profiles.length - 5)}
                    </div>
                 </div>
                 <div className="w-px h-10 bg-slate-200 mx-2 hidden md:block" />
                 <LayoutGrid className="text-slate-200" size={20} />
              </div>
           </div>
        </motion.div>

        {/* 3. The Feed Grid */}
        <AnimatePresence mode="popLayout">
          <motion.div 
            layout
            className="space-y-8"
          >
            {filtered.length > 0 ? (
              filtered.map((s, index) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
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
                className="text-center py-32 px-10 bg-white rounded-[3rem] border border-slate-100 shadow-sm"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                   <Search size={40} className="text-slate-200" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Universe Ghosted</h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No students match your signal</p>
                <button 
                   onClick={() => setQuery("")}
                   className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
                   Reset Frequency
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* 4. Footer Pagination / Load More Sentiment */}
        {filtered.length > 0 && (
          <div className="mt-20 py-10 text-center border-t border-slate-200/50">
             <div className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-slate-100 rounded-full shadow-sm">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">End of Transmission</span>
             </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 20px;
        }

        @keyframes float {
           0% { transform: translateY(0px); }
           50% { transform: translateY(-10px); }
           100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
};

export default StudentDirectoryClient;