"use client";

import React, { useMemo, useState } from "react";
import StudentCard from "./StudentCard";
import { Search, TrendingUp, Sparkles } from "lucide-react";

interface StudentStats {
  internshipsApplied?: number;
  programsApplied?: number;
  eventsApplied?: number;
  projectsCreated?: number;
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
  stats?: StudentStats;
}

export const StudentDirectoryClient: React.FC<{ profiles: RawUserProfile[] }> = ({ profiles }) => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter((p) => {
      const name = p.full_name?.toLowerCase() || "";
      const uni = p.university?.toLowerCase() || "";
      const skills = (p.hard_skills || []).join(" ").toLowerCase();
      return name.includes(q) || uni.includes(q) || skills.includes(q);
    });
  }, [profiles, query]);

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-2xl font-extrabold text-blue-950 tracking-tight">
              Student <span className="text-blue-600">Network</span>
            </h1>
            
            {/* Search Bar - Enhanced */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 transition-colors group-focus-within:text-blue-600" />
              <input 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                placeholder="Search by name, university or skills..." 
                className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500 transition-all shadow-sm" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Feed Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Trending Banner */}
        <div className="rounded-2xl mb-8 border border-blue-100 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm">
          <div className="flex items-center gap-3">
            <TrendingUp size={18} className="text-blue-600" />
            <span className="text-sm md:text-base font-bold text-blue-900">
              {filtered.length} Students Currently Active • Live Feed
            </span>
          </div>
        </div>

        {/* Student Feed */}
        <div className="space-y-6">
          {filtered.map((s) => (
            <StudentCard 
              key={s.id} 
              student={s} 
              stats={s.stats}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 px-4">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-500">Try adjusting your search</p>
          </div>
        )}

        {/* End of Feed */}
        {filtered.length > 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            You've reached the end of the feed
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDirectoryClient;