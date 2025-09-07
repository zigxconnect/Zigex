"use client"
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Edit, Github, Link2, LocationEdit, User, User2, UserCheck2, ChevronDown, ChevronUp } from "lucide-react";
import { UserProfile } from "@/app/types/type";
import { useState } from "react";

interface WelcomeCardProps {
  user: UserProfile;
}

export const WelcomeCard = ({ user }: WelcomeCardProps) => {
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const [isSkillsExpanded, setIsSkillsExpanded] = useState(false);
  
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const truncateSkills = (skills: string[], maxLength: number) => {
    const skillsText = skills.join(", ");
    if (skillsText.length <= maxLength) return skillsText;
    return skillsText.substring(0, maxLength) + "...";
  };

  return (
    <div className="relative bg-white md:rounded-2xl md:w-full mx-auto shadow-lg md:border md:border-gray-200 overflow-hidden">
      {/* Cover Image with Dark Overlay */}
      <div className="relative h-40 md:h-32 w-full overflow-hidden">
        <Image
          src="/ar.png" // Replace with your cover image path
          alt="Cover image"
          fill
          className="object-cover"
          priority
        />
        {/* <div className="absolute inset-0 bg-black bg-opacity-10" /> */}
        {/* <div className="absolute inset-0 bg-blue-800 bg-opacity-60" /> */}
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start -mt-20 md:-mt-17">
          {/* Avatar with Hover Edit Effect */}
          <Link href="/profile-settings" className="relative group">
            <div className="w-18 h-18 md:w-19 md:h-19 rounded-full border-4 border-white shadow-md flex-shrink-0 overflow-hidden relative">
              <Image
                src="/gita.png"
                alt={`${user.name}'s profile picture`}
                width={128}
                height={128}
                className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-75"
                priority
              />
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex flex-col items-center text-white">
                  <Edit size={16} className="mb-1" />
                  <span className="text-xs font-medium">Edit</span>
                </div>
              </div>
            </div>
          </Link>

          <div className="flex gap-3 items-center flex-1 justify-end">
            {/* Skills Section */}
            <h2>SKILLS</h2>
            {user.skills && user.skills.length > 0 && (
              <div className="bg-gray-50 rounded-md p-2 max-w-[200px] min-w-[150px]">
                <div className="text-[10px] text-black leading-tight">
                  {isSkillsExpanded ? (
                    <div>
                      <p className="break-words">{user.skills.join(", ")}</p>
                      <button
                        onClick={() => setIsSkillsExpanded(false)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mt-1"
                      >
                        <span className="text-[9px]">Show less</span>
                        <ChevronUp size={10} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="break-words">{truncateSkills(user.skills, 39)}</p>
                      {user.skills.join(", ").length > 39 && (
                        <button
                          onClick={() => setIsSkillsExpanded(true)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mt-1"
                        >
                          <span className="text-[9px]">Read more</span>
                          <ChevronDown size={10} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* About Me Section */}
            {user.profile.about && (
              <div className="bg-gray-50 rounded-md p-2 max-w-[200px] min-w-[150px]">
                <div className="text-[10px] text-gray-700 leading-tight">
                  {isAboutExpanded ? (
                    <div>
                      <p className="break-words">{user.profile.about}</p>
                      <button
                        onClick={() => setIsAboutExpanded(false)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mt-1"
                      >
                        <span className="text-[9px]">Show less</span>
                        <ChevronUp size={10} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="break-words">{truncateText(user.profile.about, 39)}</p>
                      {user.profile.about.length > 39 && (
                        <button
                          onClick={() => setIsAboutExpanded(true)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mt-1"
                        >
                          <span className="text-[9px]">Read more</span>
                          <ChevronDown size={10} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-1 md:gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-gray-200 shadow-xl p-2 hover:bg-gray-100 hover:shadow-2xl rounded-md">
            <div className="flex items-center justify-center bg-blue-700 text-white p-1 rounded-full">
              <UserCheck2 size={10} className="md:w-4 md:h-4" />
            </div>
            <p className="text-[10px] md:text-[12px] font-bold text-blue-900">{user.name} |</p>
          </div>
          
          <div className="flex items-center gap-1 bg-gray-200 shadow-xl p-2 hover:bg-gray-100 hover:shadow-2xl rounded-md">
            <div className="flex items-center justify-center bg-blue-700 text-white p-1 rounded-full">
              <LocationEdit size={10} className="md:w-4 md:h-4" />
            </div>
            <p className="text-[10px] md:text-[14px] text-blue-800">{user.university} |</p>
          </div>
          <Link href={user.profile.linkedin_url || ""} className="flex items-center gap-1 bg-gray-200 shadow-xl p-2 hover:bg-gray-100 hover:shadow-2xl rounded-md">
            <div className="flex items-center justify-center bg-blue-700 text-white p-1 rounded-full">
              <Link2 size={6} className="md:w-4 md:h-4" /> 
            </div>
            <p className="text-[10px] md:text-[12px] text-blue-800">Portfolio</p>
          </Link>
          <Link href={user.profile.linkedin_url || ""} className="flex items-center gap-1 bg-gray-200 shadow-xl p-2 hover:bg-gray-100 hover:shadow-2xl rounded-md">
            <div className="flex items-center justify-center bg-blue-700 text-white p-1 rounded-full">
              <Github size={6} className="md:w-4 md:h-4" /> 
            </div>
            <p className="text-[10px] md:text-[12px] text-blue-800">Github</p>
          </Link>
        </div>
      </div>
    </div>
  );
};