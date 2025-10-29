"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, Share2, MapPin, Briefcase, CheckCircle2, MoreHorizontal, Linkedin } from "lucide-react";

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
}

export const StudentCard: React.FC<{ student: StudentProps; stats?: StudentStats }> = ({ student, stats }) => {
  // Early return if student is undefined or null
  if (!student) {
    return null;
  }

  const [isLiked, setIsLiked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 50) + 10);
  const cardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const initials =
    student.full_name?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "ST";

  const primarySkills = (student.hard_skills || []).slice(0, 3);
  const timeAgo = ["2m", "5m", "12m", "1h", "3h", "5h"][Math.floor(Math.random() * 6)];

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

  const goToProfile = () => {
    if (student?.id) {
      router.push(`/dashboard/student/${student.id}`);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Share functionality
  };

  return (
    <div 
      ref={cardRef}
      className={`
        w-full bg-white border-b border-gray-200 hover:bg-gray-50/50 transition-all duration-500
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}
    >
      <div className="w-full px-4 py-3">
        {/* Header - Profile Info */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div 
            className="relative flex-shrink-0 cursor-pointer"
            onClick={goToProfile}
          >
            {student.avatar_url ? (
              <img 
                src={student.avatar_url} 
                alt={student.full_name || "Student"} 
                className="w-12 h-12 rounded-full object-cover hover:opacity-90 transition-opacity" 
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-base">
                {initials}
              </div>
            )}
          </div>

          {/* Name, University & Connect Button */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div 
                className="flex-1 min-w-0 cursor-pointer"
                onClick={goToProfile}
              >
                <div className="flex items-center gap-1 flex-wrap">
                  <h3 className="font-bold text-gray-900 hover:underline text-[15px]">
                    {student.full_name || "Unnamed Student"}
                  </h3>
                  <div className="flex-shrink-0">
                    <CheckCircle2 size={18} className="text-blue-500" />
                  </div>
                  <span className="text-gray-500 text-[15px]">·</span>
                  <span className="text-gray-500 text-[15px]">{timeAgo}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                  <p className="text-[13px] text-gray-600 truncate">
                    {student.university || "University not specified"}
                  </p>
                </div>
              </div>

              {/* Connect Button & More */}
              <div className="flex items-center gap-2">
                {student.linkedin_url ? (
                  <Link
                    href={student.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full font-bold text-[14px] bg-[#0A66C2] text-white hover:bg-[#004182] transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <Linkedin size={16} />
                    <span>Connect</span>
                  </Link>
                ) : (
                  <button
                    disabled
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full font-bold text-[14px] bg-gray-200 text-gray-400 cursor-not-allowed"
                  >
                    <Linkedin size={16} />
                    <span>Connect</span>
                  </button>
                )}
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 hover:bg-blue-50 rounded-full transition-colors"
                >
                  <MoreHorizontal size={18} className="text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div 
          className="mt-3 ml-[60px] cursor-pointer"
          onClick={goToProfile}
        >
          {/* Bio/Status */}
          <p className="text-[15px] text-gray-900 leading-relaxed mb-3">
            🎓 Passionate about technology and innovation. Currently exploring opportunities in {primarySkills[0] || 'tech'}. 
            Looking to connect with like-minded professionals and grow together! 
            {stats && stats.internshipsApplied > 0 && ` Applied to ${stats.internshipsApplied} internships recently.`}
          </p>

          {/* Skills Container */}
          {(primarySkills.length > 0 || (student.soft_skills && student.soft_skills.length > 0)) && (
            <div className="flex flex-wrap gap-2 mb-3">
              {primarySkills.map((skill, i) => (
                <span 
                  key={i} 
                  className="text-[13px] bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium hover:bg-blue-100 transition-colors"
                >
                  #{skill.replace(/\s+/g, '')}
                </span>
              ))}
              {student.soft_skills && student.soft_skills.length > 0 && (
                <span className="text-[13px] bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-medium hover:bg-purple-100 transition-colors">
                  #{student.soft_skills[0].replace(/\s+/g, '')}
                </span>
              )}
            </div>
          )}

          {/* Stats Card - Like an embedded card */}
          <div className="border border-gray-200 rounded-2xl p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">
                    {stats?.internshipsApplied ?? 0}
                  </div>
                  <div className="text-[11px] text-gray-500 font-medium">Internships</div>
                </div>
                
                <div className="w-px h-10 bg-gray-200"></div>
                
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">
                    {stats?.programsApplied ?? 0}
                  </div>
                  <div className="text-[11px] text-gray-500 font-medium">Programs</div>
                </div>
                
                <div className="w-px h-10 bg-gray-200"></div>
                
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">
                    {stats?.eventsApplied ?? 0}
                  </div>
                  <div className="text-[11px] text-gray-500 font-medium">Events</div>
                </div>
              </div>

              {student.linkedin_url && (
                <Link
                  href={student.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0A66C2] hover:bg-[#004182] transition-colors"
                >
                  <Briefcase size={14} className="text-white" />
                  <span className="text-[12px] font-semibold text-white">View Profile</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Action Bar - Twitter Style */}
        <div className="mt-3 ml-[60px] flex items-center justify-between max-w-md">
          {/* Like */}
          <button
            onClick={handleLike}
            className="flex items-center gap-2 group hover:bg-pink-50 px-3 py-2 rounded-full transition-all"
          >
            <Heart 
              size={18} 
              className={`transition-all ${isLiked 
                ? 'fill-pink-600 text-pink-600' 
                : 'text-gray-500 group-hover:text-pink-600'
              }`}
            />
            <span className={`text-[13px] ${isLiked ? 'text-pink-600 font-medium' : 'text-gray-500 group-hover:text-pink-600'}`}>
              {likeCount}
            </span>
          </button>

          {/* Message/Comment */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Message functionality
            }}
            className="flex items-center gap-2 group hover:bg-blue-50 px-3 py-2 rounded-full transition-all"
          >
            <MessageCircle size={18} className="text-gray-500 group-hover:text-blue-600 transition-colors" />
            <span className="text-[13px] text-gray-500 group-hover:text-blue-600">
              {Math.floor(Math.random() * 20)}
            </span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 group hover:bg-green-50 px-3 py-2 rounded-full transition-all"
          >
            <Share2 size={18} className="text-gray-500 group-hover:text-green-600 transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentCard;