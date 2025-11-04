"use client";
import Link from "next/link";
import Image from "next/image";
import {
  Edit,
  Github,
  Link2,
  User,
  User2,
  ChevronDown,
  ChevronUp,
  MapPin,
  UserCircle2,
} from "lucide-react";
import { UserProfile } from "@/app/types/type";
import { useState } from "react";
import { EditProfileModal } from "./EditProfileModal";

interface WelcomeCardProps {
  user: UserProfile;
  onProfileUpdated: () => void;
  profile?: any;
}

export const WelcomeCard = ({ user, onProfileUpdated, profile }: WelcomeCardProps) => {
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const [isSkillsExpanded, setIsSkillsExpanded] = useState(false);
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProfileBtnHovered, setIsProfileBtnHovered] = useState(false);

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const truncateSkills = (skills: string[], maxLength: number) => {
    if (!skills || skills.length === 0) return "";
    const skillsText = skills.join(", ");
    if (skillsText.length <= maxLength) return skillsText;
    return skillsText.substring(0, maxLength) + "...";
  };

  const avatarUrl = user.profile.avatar_url || "/gita.png";
  const coverImageUrl = user.profile.cover_image || "/ar.png";

  return (
    <div className="relative bg-white md:rounded-2xl md:w-full mx-auto shadow-lg md:border md:border-gray-200 overflow-hidden">
      {/* Cover Image */}
      <div className="relative h-32 md:h-36 lg:h-40 w-full">
        <Image
          src={coverImageUrl}
          alt="Cover image"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />

        {/* Edit Cover Image Button */}
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors duration-200 z-10"
          aria-label="Edit Cover Image"
        >
          <Edit size={16} />
        </button>

        {/* Skills and About Cards positioned over background */}
        <div className="absolute top-2 right-2 lg:top-4 lg:right-4 flex flex-col lg:flex-row gap-2 lg:gap-3 max-w-[320px] lg:max-w-none">
          {/* Skills Section */}
          {user.skills && user.skills.length > 0 && (
            <div className="bg-white/95 backdrop-blur-sm rounded-lg lg:rounded-xl p-2 lg:p-3 shadow-lg border border-white/20 lg:min-w-[140px]">
              <div className="flex items-center gap-1 lg:gap-2 mb-1 lg:mb-2">
                <div className="w-4 h-4 lg:w-6 lg:h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <User2 size={10} className="lg:w-3 lg:h-3 text-white" />
                </div>
                <h3 className="text-[9px] lg:text-xs font-semibold text-blue-900 uppercase tracking-wide">Skills</h3>
              </div>
              <div className="text-[9px] lg:text-xs text-blue-800">
                {isSkillsExpanded ? (
                  <div>
                    <p className="break-words leading-relaxed">{user.skills.join(", ")}</p>
                    <button
                      onClick={() => setIsSkillsExpanded(false)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mt-1 transition-colors"
                    >
                      <span className="text-[8px] lg:text-[10px] font-medium">Show less</span>
                      <ChevronUp size={8} className="lg:w-2.5 lg:h-2.5" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="break-words leading-relaxed">
                      {truncateSkills(user.skills, 40)}
                    </p>
                    {user.skills.join(", ").length > 40 && (
                      <button
                        onClick={() => setIsSkillsExpanded(true)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mt-1 transition-colors"
                      >
                        <span className="text-[8px] lg:text-[10px] font-medium">Read more</span>
                        <ChevronDown size={8} className="lg:w-2.5 lg:h-2.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* About Me Section */}
          {user.profile.about && (
            <div className="bg-white/95 backdrop-blur-sm rounded-lg lg:rounded-xl p-2 lg:p-3 shadow-lg border border-white/20 lg:min-w-[140px]">
              <div className="flex items-center gap-1 lg:gap-2 mb-1 lg:mb-2">
                <div className="w-4 h-4 lg:w-6 lg:h-6 bg-gray-600 rounded-full flex items-center justify-center">
                  <User size={10} className="lg:w-3 lg:h-3 text-white" />
                </div>
                <h3 className="text-[9px] lg:text-xs font-semibold text-gray-900 uppercase tracking-wide">About Me</h3>
              </div>
              <div className="text-[9px] lg:text-xs text-gray-700">
                {isAboutExpanded ? (
                  <div>
                    <p className="break-words leading-relaxed">
                      {user.profile.about}
                    </p>
                    <button
                      onClick={() => setIsAboutExpanded(false)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mt-1 transition-colors"
                    >
                      <span className="text-[8px] lg:text-[10px] font-medium">Show less</span>
                      <ChevronUp size={8} className="lg:w-2.5 lg:h-2.5" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="break-words leading-relaxed">
                      {truncateText(user.profile.about, 50)}
                    </p>
                    {user.profile.about.length > 50 && (
                      <button
                        onClick={() => setIsAboutExpanded(true)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mt-1 transition-colors"
                      >
                        <span className="text-[8px] lg:text-[10px] font-medium">Read more</span>
                        <ChevronDown size={8} className="lg:w-2.5 lg:h-2.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Avatar with Edit Hover Effect */}
      <div className="absolute top-20 md:top-24 lg:top-28 left-4 lg:left-6">
        <div
          className="relative group cursor-pointer"
          onMouseEnter={() => setIsAvatarHovered(true)}
          onMouseLeave={() => setIsAvatarHovered(false)}
          onClick={() => setIsEditModalOpen(true)}
        >
          <div className="w-20 h-20 md:w-24 md:h-24 lg:w-20 lg:h-20 rounded-full border-3 lg:border-4 border-white shadow-lg overflow-hidden bg-white transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105">
            <Image
              src={avatarUrl}
              alt={`${user.name}'s profile picture`}
              width={112}
              height={112}
              className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-75"
              priority
            />
          </div>
          
          {/* Edit Overlay */}
          <div
            className={`
              absolute inset-0 rounded-full bg-black/60 flex items-center justify-center
              transition-all duration-300 ease-in-out backdrop-blur-sm
              ${isAvatarHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"}
            `}
          >
            <div className="flex flex-col items-center gap-1 text-white">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                <Edit size={12} className="lg:w-4 lg:h-4" />
              </div>
              <span className="text-[10px] lg:text-xs font-medium tracking-wide">
                Edit
              </span>
            </div>
          </div>

          {/* Animated Ring */}
          <div className={`
            absolute inset-0 rounded-full border-2 border-blue-500
            transition-all duration-300 ease-in-out
            ${isAvatarHovered ? 'scale-110 opacity-100' : 'scale-100 opacity-0'}
          `} />
        </div>
      </div>

      {/* Content Area */}
      <div className="pt-12 md:pt-14 lg:pt-8 px-4 lg:px-6 pb-4 lg:pb-6">
        {/* User Info and Social Links */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 lg:gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <p className="text-base lg:text-lg font-bold text-gray-900">
                {user.name}
              </p>
              <div className="flex items-center justify-center bg-blue-500 rounded-full p-0.5">
                <svg 
                  viewBox="0 0 24 24" 
                  className="w-4 h-4 lg:w-5 lg:h-5 fill-white"
                  aria-label="Verified"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 text-gray-600">
              <MapPin size={16} className="lg:w-[18px] lg:h-[18px]" />
              <p className="text-sm lg:text-base font-medium">
                {user.university}
              </p>
            </div>
          </div>

          {/* Social Links & My Profile Button */}
          <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
            <Link
              href={user.profile.linkedin_url || ""}
              className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              <Link2 size={14} className="lg:w-4 lg:h-4" />
              <p className="text-sm lg:text-base font-medium">
                LinkedIn
              </p>
            </Link>

            <Link
              href={user.profile.github_url || "#"}
              target={user.profile.github_url ? "_blank" : undefined}
              rel={user.profile.github_url ? "noopener noreferrer" : undefined}
              className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              <Github size={14} className="lg:w-4 lg:h-4" />
              <p className="text-sm lg:text-base font-medium">
                Github
              </p>
            </Link>

            {/* My Profile Button - Enhanced Interactive Version */}
            <Link
              href={`/dashboard/student/${user.profile.id}`}
              onMouseEnter={() => setIsProfileBtnHovered(true)}
              onMouseLeave={() => setIsProfileBtnHovered(false)}
              className={`
                relative overflow-hidden flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg font-semibold text-xs lg:text-sm
                transition-all duration-300 transform
                bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30 
                hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105
                active:scale-95
              `}
            >
              {/* Animated background pulse */}
              <span
                className={`
                  absolute inset-0 bg-blue-400
                  ${isProfileBtnHovered ? "animate-ping opacity-20" : "opacity-0"}
                `}
              />

              {/* Shimmer effect */}
              <span
                className={`
                  absolute inset-0 -translate-x-full
                  bg-gradient-to-r from-transparent via-white/30 to-transparent
                  ${isProfileBtnHovered ? "animate-shimmer" : ""}
                `}
                style={{
                  animation: isProfileBtnHovered ? "shimmer 2s infinite" : "none",
                }}
              />

              {/* Content */}
              <span className="relative z-10 flex items-center gap-1.5">
                <UserCircle2
                  size={16}
                  className={`lg:w-[18px] lg:h-[18px] ${isProfileBtnHovered ? "animate-bounce" : ""}`}
                />
                <span className="font-bold">My Profile</span>
              </span>

              {/* Particle effect on hover */}
              {isProfileBtnHovered && (
                <>
                  <span className="absolute top-0 left-1/4 w-1 h-1 bg-white rounded-full animate-particle-1" />
                  <span className="absolute top-0 right-1/4 w-1 h-1 bg-white rounded-full animate-particle-2" />
                  <span className="absolute bottom-0 left-1/3 w-1 h-1 bg-white rounded-full animate-particle-3" />
                </>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userId={user.profile.id}
        currentAvatarUrl={avatarUrl}
        currentCoverImageUrl={coverImageUrl}
        onProfileUpdated={onProfileUpdated}
      />

      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes particle-1 {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-10px, -20px) scale(0);
            opacity: 0;
          }
        }

        @keyframes particle-2 {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(10px, -20px) scale(0);
            opacity: 0;
          }
        }

        @keyframes particle-3 {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(5px, 20px) scale(0);
            opacity: 0;
          }
        }

        .animate-particle-1 {
          animation: particle-1 0.8s ease-out forwards;
        }

        .animate-particle-2 {
          animation: particle-2 0.8s ease-out forwards;
          animation-delay: 0.1s;
        }

        .animate-particle-3 {
          animation: particle-3 0.8s ease-out forwards;
          animation-delay: 0.2s;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};