"use client";

import React, { useMemo, useState } from "react";
import StudentCard from "./StudentCard";
import { Search } from "lucide-react";

interface RawUserProfile {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  university?: string | null;
  hard_skills?: string[] | null;
  soft_skills?: string[] | null;
  linkedin_url?: string | null;
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Meet Our Bright ZigX</h1>
          <p className="text-slate-600 mt-1">Discover and connect with fellow students — follow profiles you want to keep an eye on.</p>
        </header>
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search students by name, university, or skill..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((s) => {
            // deterministic dummy stats based on id string
            const seed = s.id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
            const internshipsApplied = (seed % 5) + 0; // 0-4
            const programsApplied = (seed % 3) + 0; // 0-2
            const eventsApplied = (seed % 4) + 0; // 0-3

            const stats = {
              internshipsApplied,
              programsApplied,
              eventsApplied,
            };

            return <StudentCard key={s.id} student={s} stats={stats} />;
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">No students found.</div>
        )}
      </div>
    </div>
  );
};

export default StudentDirectoryClient;
