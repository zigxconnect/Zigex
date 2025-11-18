"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Share2, MapPin, Briefcase, CheckCircle2, MoreHorizontal, Linkedin, Zap } from "lucide-react";

interface StudentProps {
  id: string;
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
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 50) + 10);
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
  const timeAgo = ["2m", "5m", "12m", "1h", "3h", "5h"][Math.floor(Math.random() * 6)];

  // Fetch stats from API only if not provided by server
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

  // Intersection Observer for scroll animations
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

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMoreOptions = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const totalActivity = (stats?.internshipsApplied || 0) + 
                        (stats?.programsApplied || 0) + 
                        (stats?.eventsApplied || 0) + 
                        (stats?.projectsCreated || 0);

  return (
    <Link href={`/dashboard/student/${student.id}`} legacyBehavior>
      <a className="block no-underline">
        <div 
          ref={cardRef}
          className={`
            w-full bg-white border-b border-gray-200 hover:bg-linear-to-r hover:from-blue-50 hover:to-transparent transition-all duration-300 cursor-pointer group
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
          `}
        >
          <div className="w-full px-4 py-4">
            {/* Header - Profile Info */}
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="relative shrink-0">
                {student.avatar_url ? (
                  <img 
                    src={student.avatar_url} 
                    alt={student.full_name || "Student"} 
                    className="w-12 h-12 rounded-full object-cover hover:shadow-lg transition-shadow" 
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-md group-hover:shadow-lg transition-shadow">
                    {initials}
                  </div>
                )}
                {totalActivity > 5 && (
                  <div className="absolute -bottom-1 -right-1 bg-linear-to-r from-orange-400 to-red-500 rounded-full p-0.5 shadow-md">
                    <Zap size={14} className="text-white" />
                  </div>
                )}
              </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 flex-wrap">
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 text-[15px] transition-colors">
                    {student.full_name || "Unnamed Student"}
                  </h3>
                  <div className="shrink-0">
                    <CheckCircle2 size={18} className="text-blue-500" />
                  </div>
                  <span className="text-gray-400 text-[15px]">·</span>
                  <span className="text-gray-500 text-[13px]">{timeAgo}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <MapPin size={14} className="text-gray-400 shrink-0" />
                  <p className="text-[13px] text-gray-600 truncate">
                    {student.university || "University not specified"}
                  </p>
                </div>
              </div>

              {/* Connect Button & More */}
              <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
                {student.linkedin_url ? (
                  <Link
                    href={student.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    legacyBehavior
                  >
                    <a 
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-[13px] bg-[#0A66C2] text-white hover:bg-[#004182] transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <Linkedin size={14} />
                      <span>Connect</span>
                    </a>
                  </Link>
                ) : (
                  <button
                    disabled
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-[13px] bg-gray-100 text-gray-400 cursor-not-allowed"
                  >
                    <Linkedin size={14} />
                    <span>Connect</span>
                  </button>
                )}
                <button
                  onClick={handleMoreOptions}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <MoreHorizontal size={16} className="text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="mt-3 ml-[60px]">
          {/* Bio/Status */}
          <p className="text-[14px] text-gray-800 leading-relaxed mb-3">
            🎓 Passionate about technology and innovation. Currently exploring opportunities in {primarySkills[0] || 'tech'}. 
            {stats && totalActivity > 0 && ` Active across internships, programs, and events.`}
          </p>

          {/* Skills Container */}
          {(primarySkills.length > 0 || (student.soft_skills && student.soft_skills.length > 0)) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {primarySkills.map((skill, i) => (
                <span 
                  key={i} 
                  onClick={(e) => e.preventDefault()}
                  className="text-[12px] bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium hover:bg-blue-200 transition-colors"
                >
                  #{skill.replace(/\s+/g, '')}
                </span>
              ))}
              {student.soft_skills && student.soft_skills.length > 0 && (
                <span 
                  onClick={(e) => e.preventDefault()}
                  className="text-[12px] bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-medium hover:bg-purple-200 transition-colors"
                >
                  #{student.soft_skills[0].replace(/\s+/g, '')}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="mt-3 ml-[60px] flex items-center justify-between max-w-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 group/btn hover:bg-pink-50 px-2 py-1.5 rounded-full transition-all"
          >
            <Heart 
              size={16} 
              className={`transition-all ${isLiked 
                ? 'fill-pink-600 text-pink-600' 
                : 'text-gray-400 group-hover/btn:text-pink-600'
              }`}
            />
            <span className={`text-[12px] ${isLiked ? 'text-pink-600 font-medium' : 'text-gray-500'}`}>
              {likeCount}
            </span>
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="flex items-center gap-1.5 group/btn hover:bg-blue-50 px-2 py-1.5 rounded-full transition-all"
          >
            <MessageCircle size={16} className="text-gray-400 group-hover/btn:text-blue-600 transition-colors" />
            <span className="text-[12px] text-gray-500">
              {Math.floor(Math.random() * 20)}
            </span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 group/btn hover:bg-green-50 px-2 py-1.5 rounded-full transition-all"
          >
            <Share2 size={16} className="text-gray-400 group-hover/btn:text-green-600 transition-colors" />
          </button>
        </div>
      </div>
    </div>
  </a>
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