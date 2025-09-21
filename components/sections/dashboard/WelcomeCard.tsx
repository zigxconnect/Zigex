"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Edit,
  Github,
  Link2,
  LocationEdit,
  User,
  User2,
  UserCheck2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { UserProfile } from "@/app/types/type";
import { useState } from "react";
import { EditProfileModal } from "./EditProfileModal";

interface WelcomeCardProps {
  user: UserProfile;
  onProfileUpdated: () => void;
}

export const WelcomeCard = ({ user, onProfileUpdated }: WelcomeCardProps) => {
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const [isSkillsExpanded, setIsSkillsExpanded] = useState(false);
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  // Use the correct properties from your API response
  const avatarUrl = user.profile.avatar_url || "/gita.png";
  const coverImageUrl = user.profile.cover_image || "/ar.png"; // Changed from user.coverImageUrl to user.profile.cover_image

  return (
    <div className="relative bg-white md:rounded-2xl md:w-full mx-auto shadow-lg md:border md:border-gray-200 overflow-hidden">
      {/* Cover Image - Reduced Height */}
      <div className="relative h-32 md:h-36 lg:h-40 w-full">
        <Image
          src={coverImageUrl} // Use the correct property
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


        {/* Skills and About Cards positioned over background - Flex Layout */}
        <div className="absolute top-2 right-2 lg:top-4 lg:right-4 flex flex-col lg:flex-row gap-2 lg:gap-3 max-w-[320px] lg:max-w-none">
          {/* Skills Section */}
          {user.skills && user.skills.length > 0 && (
            <div className="bg-white/95 backdrop-blur-sm rounded-lg lg:rounded-xl p-2 lg:p-3 shadow-lg border border-white/20 lg:min-w-[140px]">
              <div className="flex items-center gap-1 lg:gap-2 mb-1 lg:mb-2">
                <div className="w-4 h-4 lg:w-6 lg:h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <User2 size={10} className="lg:w-3 lg:h-3 text-white" />
                </div>
                <h3 className="text-[9px] lg:text-xs font-semibold text-blue-900 uppercase tracking-wide">
                  Skills
                </h3>
              </div>
              <div className="text-[9px] lg:text-xs text-blue-800">
                {isSkillsExpanded ? (
                  <div>
                    <p className="break-words leading-relaxed">
                      {user.skills.join(", ")}
                    </p>
                    <button
                      onClick={() => setIsSkillsExpanded(false)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mt-1 transition-colors"
                    >
                      <span className="text-[8px] lg:text-[10px] font-medium">
                        Show less
                      </span>
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
                        <span className="text-[8px] lg:text-[10px] font-medium">
                          Read more
                        </span>
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
                <h3 className="text-[9px] lg:text-xs font-semibold text-gray-900 uppercase tracking-wide">
                  About Me
                </h3>
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
                      <span className="text-[8px] lg:text-[10px] font-medium">
                        Show less
                      </span>
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
                        <span className="text-[8px] lg:text-[10px] font-medium">
                          Read more
                        </span>
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

      {/* Avatar with Edit Hover Effect - Adjusted Position */}
      <div className="absolute top-20 md:top-24 lg:top-28 left-4 lg:left-6">
        <div
          className="relative group cursor-pointer"
          onMouseEnter={() => setIsAvatarHovered(true)}
          onMouseLeave={() => setIsAvatarHovered(false)}
          onClick={() => setIsEditModalOpen(true)}
        >
          <div className="w-20 h-20 md:w-24 md:h-24 lg:w-20 lg:h-20 rounded-full border-[3px] lg:border-4 border-white shadow-lg overflow-hidden bg-white transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105">
            <Image
              src={avatarUrl}
              src={user.profile.avatar_url || "/gita.png"}
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
          <Link href="/dashboard/edit-profile">
            <div
              className={`
              absolute inset-0 rounded-full bg-black/60 flex items-center justify-center
              transition-all duration-300 ease-in-out backdrop-blur-sm
              ${
                isAvatarHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }
            `}
          >
            <div className="flex flex-col items-center gap-1 text-white">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                <Edit size={12} className="lg:w-4 lg:h-4" />
              ${
                isAvatarHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }
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
              <span className="text-[10px] lg:text-xs font-medium tracking-wide">
                Edit
              </span>
            </div>
          </div>

          </Link>

          {/* Animated Ring */}
          <div
            className={`
            absolute inset-0 rounded-full border-2 border-blue-500
            transition-all duration-300 ease-in-out
            ${isAvatarHovered ? "scale-110 opacity-100" : "scale-100 opacity-0"}
          `}
          />
        </div>
      </div>

      {/* Reduced Content Area Height */}
      <div className="pt-12 md:pt-14 lg:pt-8 px-4 lg:px-6 pb-4 lg:pb-6">
        {/* User Info and Social Links */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 lg:gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 shadow-md p-2 lg:p-2 hover:shadow-lg rounded-lg lg:rounded-lg px-2 transition-all duration-200 border border-blue-200">
              <div className="flex items-center justify-center bg-blue-700 text-white p-1.5 lg:p-2 rounded-full shadow-sm">
                <UserCheck2 size={9} className="lg:w-2 lg:h-2" />
              </div>
              <p className="text-xs lg:text-[12px] font-semibold text-blue-900">
                {user.name}
              </p>
            </div>
            <div className="flex items-center gap-2 shadow-md p-2 lg:p-2 hover:shadow-lg rounded-lg lg:rounded-lg px-2 transition-all duration-200 border border-blue-200">
              <div className="flex items-center justify-center bg-gray-700 text-white p-1.5 lg:p-2 rounded-full shadow-sm">
                <LocationEdit size={8} className="lg:w-2 lg:h-2" />
              </div>
              <p className="text-xs lg:text-[12px] font-medium text-gray-800">
                {user.university}
              </p>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-2 lg:gap-3">
            {user.profile.linkedin_url ? (
              <Link
                href={user.profile.linkedin_url}
                className="flex items-center gap-1.5 lg:gap-2 shadow-md p-2 lg:p-2 hover:shadow-lg hover:scale-105 rounded-lg lg:rounded-md transition-all duration-200 border border-blue-200 group"
              >
                <div className="flex items-center justify-center bg-blue-700 text-white p-1.5 lg:p-2 rounded-full shadow-sm group-hover:bg-blue-600">
                  <Link2 size={8} className="lg:w-2 lg:h-2" />
                </div>
                <p className="text-xs lg:text-[12px] font-medium text-blue-800 group-hover:text-blue-900">
                  Portfolio
                </p>
              </Link>
            ) : null}
            {user.profile.github_url ? (
              <Link
                href={user.profile.github_url}
                className="flex items-center gap-1.5 lg:gap-2 bg-gradient-to-r from-gray-800 to-gray-900 shadow-md p-2 lg:p-2 hover:shadow-lg hover:scale-105 rounded-lg lg:rounded-md transition-all duration-200 border border-gray-700 group"
              >
                <div className="flex items-center justify-center bg-white text-gray-900 p-1.5 lg:p-2 rounded-full shadow-sm group-hover:bg-gray-100">
                  <Github size={12} className="lg:w-2 lg:h-2" />
                </div>
                <p className="text-xs lg:text-[12px] font-medium text-white group-hover:text-gray-100">
                  Github
                </p>
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userId={user.profile.user_id}
        currentAvatarUrl={avatarUrl}
        currentCoverImageUrl={coverImageUrl} // Use the correct property
        onProfileUpdated={onProfileUpdated}
      />
    </div>
  );
};
