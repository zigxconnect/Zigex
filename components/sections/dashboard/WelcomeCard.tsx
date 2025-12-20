"use client";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  User2,
  ChevronDown,
  ChevronUp,
  MapPin,
  UserCircle2,
} from "lucide-react";
import { UserProfile } from "@/app/types/type";
import { useState } from "react";

interface WelcomeCardProps {
  user: UserProfile | any;
  onProfileUpdated?: () => void;
  profile?: any;
}

export const WelcomeCard = ({ user, onProfileUpdated, profile }: WelcomeCardProps) => {
  console.log("User in WelcomeCard:", user);
  if (user?.profile) {
    console.log("Profile keys:", Object.keys(user.profile));
    console.log("LinkedIn URL:", user.profile.linkedin_url);
    console.log("GitHub URL:", user.profile.github_url);
  }
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const [isSkillsExpanded, setIsSkillsExpanded] = useState(false);
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);

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

  const avatarUrl = user.profile.avatar_url || "/https://i.ibb.co/CpS0wpjC/z3.jpg";
  const coverImageUrl = user.profile.cover_image || "https://i.ibb.co/vv3sgJwd/n8.jpg";

  return (
    <div className="relative bg-white rounded-2xl w-full mx-auto shadow-lg border border-gray-200 overflow-hidden">
      {/* Cover Image */}
      <div className="relative h-32 md:h-36 lg:h-40 w-full">
        <Image
          src={coverImageUrl}
          alt="Cover image"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0" />

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
          <div className="flex flex-col items-start gap-1">
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
            
          <div className="flex flex-col gap-1 text-gray-600">
            <div className="flex items-center gap-1.5 text-gray-600">
              <MapPin size={16} className="lg:w-[18px] lg:h-[18px]" />
              <p className="text-sm lg:text-base font-medium">
                {user.university}
              </p>
            </div>
          </div>
          </div>

          {/* Social Links & My Profile Button */}
          <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
              <Link
                href={user?.profile?.linkedin_url || user?.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn"
                className="flex items-center justify-center w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all border border-blue-100"
              >
                <div className="w-5 h-5">
                  <svg fill="currentColor" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <path d="M28.778 1.004h-25.56c-0.008-0-0.017-0-0.027-0-1.199 0-2.172 0.964-2.186 2.159v25.672c0.014 1.196 0.987 2.161 2.186 2.161 0.010 0 0.019-0 0.029-0h25.555c0.008 0 0.018 0 0.028 0 1.2 0 2.175-0.963 2.194-2.159l0-0.002v-25.67c-0.019-1.197-0.994-2.161-2.195-2.161-0.010 0-0.019 0-0.029 0h0.001zM9.9 26.562h-4.454v-14.311h4.454zM7.674 10.293c-1.425 0-2.579-1.155-2.579-2.579s1.155-2.579 2.579-2.579c1.424 0 2.579 1.154 2.579 2.578v0c0 0.001 0 0.002 0 0.004 0 1.423-1.154 2.577-2.577 2.577-0.001 0-0.002 0-0.003 0h0zM26.556 26.562h-4.441v-6.959c0-1.66-0.034-3.795-2.314-3.795-2.316 0-2.669 1.806-2.669 3.673v7.082h-4.441v-14.311h4.266v1.951h0.058c0.828-1.395 2.326-2.315 4.039-2.315 0.061 0 0.121 0.001 0.181 0.003l-0.009-0c4.5 0 5.332 2.962 5.332 6.817v7.855z"></path>
                  </svg>
                </div>
              </Link>

              <Link
                href={user?.profile?.github_url || user?.github_url}
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub"
                className="flex items-center justify-center w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-neutral-50 text-neutral-900 hover:bg-neutral-100 transition-all border border-neutral-200"
              >
                <div className="w-5 h-5">
                  <svg xmlns="http://www.w3.org/2000/svg" aria-label="GitHub" role="img" viewBox="0 0 512 512" className="w-full h-full">
                    <rect width="512" height="512" rx="15%" fill="#1B1817"/><path fill="#ffffff" d="M335 499c14 0 12 17 12 17H165s-2-17 12-17c13 0 16-6 16-12l-1-50c-71 16-86-28-86-28-12-30-28-37-28-37-24-16 1-16 1-16 26 2 40 26 40 26 22 39 59 28 74 22 2-17 9-28 16-35-57-6-116-28-116-126 0-28 10-51 26-69-3-6-11-32 3-67 0 0 21-7 70 26 42-12 86-12 128 0 49-33 70-26 70-26 14 35 6 61 3 67 16 18 26 41 26 69 0 98-60 120-117 126 10 8 18 24 18 48l-1 70c0 6 3 12 16 12z"/>
                  </svg>
                </div>
              </Link>

            {/* My Profile Button - Enhanced Interactive Version */}
            {/* My Profile Button - Clean Version */}
            <Link
              href={`/profile/${user.profile.username}`}
              className="
                flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg font-semibold text-xs lg:text-sm
                transition-all duration-300
                bg-primary text-white hover:bg-primary/90
                shadow-sm hover:shadow-md
                active:scale-95
              "
            >
              <span className="flex items-center gap-1.5">
                <UserCircle2
                  size={16}
                  className="lg:w-[18px] lg:h-[18px]"
                />
                <span className="font-bold">My Profile</span>
              </span>
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};