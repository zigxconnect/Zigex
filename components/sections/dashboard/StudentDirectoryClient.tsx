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
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-slate-900">ZigX Students</h1>
            {/* <Sparkles size={20} className="text-blue-500" /> */}
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder="Search students..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" 
            />
          </div>
        </div>
      </div>

      {/* Feed Container */}
      <div className="max-w-2xl mx-auto">
        {/* Trending Banner */}
        <div className="border-b border-gray-200 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-2">
            {/* <TrendingUp size={16} className="text-blue-600" /> */}
            <span className="text-sm font-semibold text-blue-900">
              {filtered.length} Students • Live Feed
            </span>
          </div>
        </div>

        {/* Student Feed */}
        <div className="divide-y divide-gray-200">
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