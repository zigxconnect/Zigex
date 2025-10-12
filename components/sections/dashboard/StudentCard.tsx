"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, UserPlus, MapPin, Briefcase, CheckCircle2 } from "lucide-react";

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
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const initials =
    student.full_name?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "ST";

  const primarySkills = (student.hard_skills || []).slice(0, 3);
  const router = useRouter();

  const goToProfile = () => router.push(`/dashboard/student/${student.id}`);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFollowing(!isFollowing);
    goToProfile()
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      goToProfile();
    }
  };

  return (
    <div 
      tabIndex={0} 
      role="button" 
      onKeyDown={onKeyDown} 
      onClick={goToProfile} 
      className="block group"
    >
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 hover:-translate-y-1">
        
        {/* Header Section with Avatar and Name */}
        <div className="p-5 pb-3">
          <div className="flex items-start gap-3">
            {/* Avatar with Online Status */}
            <div className="relative flex-shrink-0">
              {student.avatar_url ? (
                <img 
                  src={student.avatar_url} 
                  alt={student.full_name || "Student"} 
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-gray-100 group-hover:ring-blue-400 transition-all" 
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br  text-white flex items-center bg-blue-600 justify-center font-bold text-lg ring-2 ring-gray-100 group-hover:ring-blue-400 transition-all">
                  {initials}
                </div>
              )}
              {/* Online indicator */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white shadow-md"></div>
            </div>

            {/* Name and University */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-gray-900 truncate text-base">
                      {student.full_name || "Unnamed Student"}
                    </h3>
                    {/* Verification Badge */}
                    <div className="flex-shrink-0 bg-blue-500 rounded-full p-0.5">
                      <CheckCircle2 size={14} className="text-white" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <MapPin size={12} className="text-gray-400 flex-shrink-0" />
                    <p className="text-sm text-gray-600 truncate">
                      {student.university || "University not specified"}
                    </p>
                  </div>
                </div>

                {/* Follow Button */}
                <button
                  onClick={handleFollow}
                  className={`
                    flex-shrink-0 px-4 cursor-pointer py-1.5 rounded-full font-semibold text-sm transition-all duration-200 
                    ${isFollowing 
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                    }
                  `}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            </div>
          </div>

          {/* Skills Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {primarySkills.map((skill, i) => (
              <span 
                key={i} 
                className="text-xs bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-3 py-1.5 rounded-full font-medium border border-blue-100 hover:border-blue-300 transition-colors"
              >
                {skill}
              </span>
            ))}

            {student.soft_skills && student.soft_skills.length > 0 && (
              <span className="text-xs bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 px-3 py-1.5 rounded-full font-medium border border-amber-100 hover:border-amber-300 transition-colors">
                {student.soft_skills[0]}
              </span>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-5"></div>

        {/* Stats Section */}
        <div className="px-5 py-3">
          <div className="flex items-center justify-around">
            <div className="flex flex-col items-center group/stat cursor-pointer">
              <span className="text-lg font-bold text-gray-900 group-hover/stat:text-blue-600 transition-colors">
                {stats?.internshipsApplied ?? 0}
              </span>
              <span className="text-[11px] text-gray-500 font-medium">Internships</span>
            </div>

            <div className="w-px h-8 bg-gray-200"></div>

            <div className="flex flex-col items-center group/stat cursor-pointer">
              <span className="text-lg font-bold text-gray-900 group-hover/stat:text-purple-600 transition-colors">
                {stats?.programsApplied ?? 0}
              </span>
              <span className="text-[11px] text-gray-500 font-medium">Programs</span>
            </div>

            <div className="w-px h-8 bg-gray-200"></div>

            <div className="flex flex-col items-center group/stat cursor-pointer">
              <span className="text-lg font-bold text-gray-900 group-hover/stat:text-green-600 transition-colors">
                {stats?.eventsApplied ?? 0}
              </span>
              <span className="text-[11px] text-gray-500 font-medium">Events</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-5"></div>

        {/* Action Buttons - Instagram/TikTok Style */}
        <div className="px-5 py-3 flex items-center justify-between">
          {/* Like Button */}
          <button
            onClick={handleLike}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all group/like"
          >
            <Heart 
              size={20} 
              className={`transition-all ${isLiked 
                ? 'fill-red-500 text-red-500 scale-110' 
                : 'text-gray-600 group-hover/like:text-red-500 group-hover/like:scale-110'
              }`}
            />
            <span className={`text-sm font-medium ${isLiked ? 'text-red-500' : 'text-gray-700'}`}>
              {isLiked ? 'Liked' : 'Like'}
            </span>
          </button>

          {/* Message Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Add message functionality
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all group/msg"
          >
            <MessageCircle size={20} className="text-gray-600 group-hover/msg:text-blue-600 transition-colors" />
            <span className="text-sm font-medium text-gray-700 group-hover/msg:text-blue-600">Message</span>
          </button>

          {/* View Profile Link */}
          {student.linkedin_url && (
            <Link
            
              href={student.linkedin_url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-blue-50 transition-all group/link"
            >
              <Briefcase size={20} className="text-gray-600 group-hover/link:text-blue-600 transition-colors" />
              <span className="text-sm font-medium text-gray-700 group-hover/link:text-blue-600">LinkedIn</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentCard;