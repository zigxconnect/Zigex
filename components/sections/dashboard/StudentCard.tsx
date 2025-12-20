"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Heart, MapPin, CheckCircle2, Linkedin } from "lucide-react";

interface StudentProps {
  id: string;
  username?: string;
  full_name?: string | null;
  avatar_url?: string | null;
  university?: string | null;
  hard_skills?: string[] | null;
  soft_skills?: string[] | null;
  linkedin_url?: string | null;
}

interface StudentStats {
  internshipsApplied?: number;
  programsApplied?: number;
  eventsApplied?: number;
  projectsCreated?: number;
}

const StudentCard: React.FC<{ student: StudentProps; stats?: StudentStats }> = ({ student, stats: initialStats }) => {
  if (!student) {
    return null;
  }

  const [isLiked, setIsLiked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [stats, setStats] = useState<StudentStats>(initialStats || {});
  const [isLoadingStats, setIsLoadingStats] = useState(!initialStats);
  const cardRef = useRef<HTMLDivElement>(null);

  const initials =
    student.full_name?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "ST";

  const primarySkills = (student.hard_skills || []).slice(0, 3);

  useEffect(() => {
    if (initialStats) {
      setStats(initialStats);
      setIsLoadingStats(false);
      return;
    }

    if (!student.id) {
      setIsLoadingStats(false);
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
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, [student.id, initialStats]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => setIsVisible(true), Math.random() * 200);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  return (
    <Link href={`/dashboard/student/${student.username || student.id}`} className="block no-underline mb-6 last:mb-0">
      <div 
        ref={cardRef}
        className={`
          relative w-full bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-500 overflow-hidden group
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
        `}
      >
        {/* Decorative Background Element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-16 -mt-16 transition-all duration-500 group-hover:scale-150 group-hover:bg-blue-100 opacity-50" />
        
        <div className="flex flex-col md:flex-row items-center md:items-stretch gap-6 p-6">
          {/* Avatar Section - Larger and with nice border */}
          <div className="relative shrink-0">
            <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden border-4 border-white shadow-lg ring-1 ring-gray-100 group-hover:ring-blue-400 transition-all duration-300">
              {student.avatar_url ? (
                <img 
                  src={student.avatar_url} 
                  alt={student.full_name || "Student"} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-3xl">
                  {initials}
                </div>
              )}
            </div>
            {/* Status Indicator */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full shadow-sm" />
          </div>

          {/* Content Section */}
          <div className="flex-1 flex flex-col min-w-0 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                    {student.full_name || student.username || "Unnamed Student"}
                  </h3>
                  <CheckCircle2 size={20} className="text-blue-500 shrink-0" />
                </div>
                
                <div className="flex items-center justify-center md:justify-start gap-1.5 text-gray-500 mb-2">
                  <MapPin size={16} className="shrink-0 text-blue-400" />
                  <p className="text-sm md:text-base font-medium truncate">
                    {student.university || "University not specified"}
                  </p>
                </div>
              </div>

              {/* Socials & Connect */}
              <div className="flex items-center justify-center md:justify-end gap-3" onClick={(e) => e.preventDefault()}>
                {student.linkedin_url && (
                  <Link
                    href={student.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 border border-blue-100 hover:border-blue-600 hover:-translate-y-1 shadow-sm"
                    title="Connect on LinkedIn"
                  >
                    <Linkedin size={20} />
                  </Link>
                )}
                <button
                  onClick={handleLike}
                  className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 border hover:-translate-y-1 shadow-sm ${
                    isLiked 
                    ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white hover:border-red-600' 
                    : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-red-50 hover:text-red-600 hover:border-red-100'
                  }`}
                >
                  <Heart size={20} className={isLiked ? "fill-current" : ""} />
                </button>
              </div>
            </div>

            {/* Bio Snippet */}
            <p className="text-sm md:text-base text-gray-600 mt-3 leading-relaxed max-w-2xl line-clamp-2 italic">
              "Passionate innovator from {student.university?.split(' ')[0] || 'the academy'}. Building a career in {primarySkills[0] || 'modern technology'} and making an impact."
            </p>

            {/* Bottom Meta Bar */}
            <div className="mt-auto pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-t border-gray-50 mt-6">
              {/* Skills container */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                {primarySkills.map((skill, i) => (
                  <span 
                    key={i} 
                    className="px-3 py-1 bg-blue-50/50 text-blue-700 text-[11px] font-bold rounded-lg border border-blue-100/50 uppercase tracking-wider"
                  >
                    {skill}
                  </span>
                ))}
                {student.soft_skills?.[0] && (
                  <span className="px-3 py-1 bg-indigo-50/50 text-indigo-700 text-[11px] font-bold rounded-lg border border-indigo-100/50 uppercase tracking-wider">
                    {student.soft_skills[0]}
                  </span>
                )}
              </div>

              {/* Stats Highlights */}
              <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
                <div className="text-center min-w-[60px]">
                  <p className="text-base sm:text-lg font-bold text-gray-900 leading-none">{stats?.projectsCreated || 0}</p>
                  <p className="text-[9px] sm:text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-1">Projects</p>
                </div>
                <div className="hidden sm:block w-px h-8 bg-gray-100" />
                <div className="text-center min-w-[60px]">
                  <p className="text-base sm:text-lg font-bold text-gray-900 leading-none">{stats?.internshipsApplied || 0}</p>
                  <p className="text-[9px] sm:text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-1">Exp</p>
                </div>
                <div className="hidden sm:block w-px h-8 bg-gray-100" />
                <div className="text-center min-w-[60px]">
                  <p className="text-base sm:text-lg font-bold text-gray-900 leading-none">{stats?.eventsApplied || 0}</p>
                  <p className="text-[9px] sm:text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-1">Events</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

interface StatItemProps {
  value: number;
  label: string;
  color?: string;
}

const StatItem: React.FC<StatItemProps> = ({ value, label, color = "text-gray-600" }) => (
  <div className="text-center">
    <div className={`text-lg font-bold ${color}`}>
      {value}
    </div>
    <div className="text-[10px] text-gray-500 font-medium">{label}</div>
  </div>
);

export default StudentCard;