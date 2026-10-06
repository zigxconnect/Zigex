"use client";

import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  ChevronRight,
  ExternalLink,
  Award,
  Rocket,
  ShieldCheck,
  Sun,
  Moon,
  Sunset
} from "lucide-react";
import { UserProfile } from "@/app/types/type";
import { useState, useEffect } from "react";
import { cn, slugifyUsername } from "@/lib/utils";
import { motion } from "framer-motion";

interface WelcomeCardProps {
  user: UserProfile | any;
  onProfileUpdated?: () => void;
  profile?: any;
  stats?: {
    projectsCreated: number;
    programsApplied: number;
    currentProgram?: string;
  };
}

export const WelcomeCard = ({ user, onProfileUpdated, profile, stats }: WelcomeCardProps) => {
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);
  const [greeting, setGreeting] = useState({ text: "Welcome back", icon: Sun, color: "text-amber-500" });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting({ text: "Good Morning", icon: Sun, color: "text-amber-500" });
    } else if (hour < 18) {
      setGreeting({ text: "Good Afternoon", icon: Sun, color: "text-orange-500" });
    } else {
      setGreeting({ text: "Good Evening", icon: Moon, color: "text-indigo-400" });
    }
  }, []);

  const avatarUrl =
    user?.profile?.avatar_url ||
    user?.profile?.avatarUrl ||
    user?.avatar_url ||
    user?.avatarUrl;
    
  const coverImageUrl = user?.profile?.cover_image || "https://i.ibb.co/9kLrm6KY/og-image-2x-100-1.jpg";
  const username = user?.profile?.username || user?.username || "student";
  const GreetingIcon = greeting.icon;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative bg-white rounded-[2rem] md:rounded-[3rem] w-full mx-auto shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden group/card"
    >
      {/* 1. Immersive Cover Header */}
      <div className="relative h-32 sm:h-44 md:h-52 lg:h-60 w-full overflow-hidden">
        <Image
          src={coverImageUrl}
          alt="Cover image"
          fill
          className="object-cover transition-transform duration-1000 group-hover/card:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />
        
        {/* Top Badges / Level Indicator */}
        <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-2 md:gap-3">
           {stats?.currentProgram && (
             <div className="bg-green-500/90 backdrop-blur-xl border border-green-400/30 px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl flex items-center gap-2 shadow-2xl">
                <ShieldCheck size={14} className="text-white" />
                <span className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-widest truncate max-w-[150px]">
                  {stats.currentProgram}
                </span>
             </div>
           )}
           <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl flex items-center gap-2 shadow-2xl">
              <ShieldCheck size={12} className="text-amber-400 md:hidden" />
              <ShieldCheck size={14} className="text-amber-400 hidden md:block" />
              <span className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-widest">Level 12 Voyager</span>
           </div>
        </div>
      </div>

      {/* 2. Identity Section */}
      <div className="px-5 md:px-8 lg:px-12 pb-6 md:pb-10 relative">
        
        {/* Floating Avatar - adjusted size and negative margin for mobile */}
        <div className="relative -mt-12 sm:-mt-16 md:-mt-20 mb-4 md:mb-6 flex justify-between items-end">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            className="relative"
            onMouseEnter={() => setIsAvatarHovered(true)}
            onMouseLeave={() => setIsAvatarHovered(false)}
          >
            <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-[2rem] md:rounded-[3rem] border-[6px] md:border-8 border-white shadow-lg overflow-hidden bg-white ring-1 ring-slate-100">
              <Image
                src={avatarUrl || "https://i.ibb.co/8n8d37H4/white-logo-4x.png"}
                alt={`${user.name}`}
                width={160}
                height={160}
                className={cn(
                  "w-full h-full object-cover transition-all duration-700",
                  !avatarUrl && "bg-gradient-to-br from-blue-600 to-indigo-700 p-6"
                )}
                priority
              />
            </div>
            {/* Active Glow */}
            <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 w-4 h-4 md:w-6 md:h-6 bg-green-500 border-[3px] md:border-4 border-white rounded-full shadow-lg" />
          </motion.div>

          {/* Quick Stats Grid over body - hidden on smallest screens, visible on md+ */}
          <div className="hidden md:flex items-center gap-6 mb-2">
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Programs</p>
                <p className="text-2xl font-black text-slate-900 leading-none">{stats?.programsApplied || 0}</p>
             </div>
             <div className="w-px h-10 bg-slate-100" />
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Projects</p>
                <p className="text-2xl font-black text-blue-600 leading-none">{stats?.projectsCreated || 0}</p>
             </div>
          </div>
        </div>

        {/* 3. Welcome Text & Primary Info */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 md:gap-8">
          <div className="space-y-3 md:space-y-4 max-w-2xl">
            <div>
              <div className="flex items-center gap-2 md:gap-3 mb-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">
                  {greeting.text}, {(user.name || "Student").split(' ')[0]}!
                </h1>
                 <div className="p-1.5 md:p-2 bg-slate-50 rounded-lg md:rounded-xl">
                    <GreetingIcon size={18} className={cn("w-5 h-5 md:w-6 md:h-6", greeting.color)} fill="currentColor" />
                 </div>
              </div>
              <div className="flex items-center gap-2 text-slate-500 font-bold uppercase text-[9px] md:text-[10px] tracking-[0.2em] bg-slate-50 w-fit px-3 py-1 md:px-4 md:py-1.5 rounded-full border border-slate-100">
                <MapPin size={10} className="text-blue-500" />
                <span>{user.university || "Zigex Student"}</span>
              </div>
            </div>

            <p className="text-slate-500 text-sm md:text-lg font-medium leading-relaxed italic border-l-4 border-blue-600 pl-4 md:pl-6 py-1">
               {user.profile?.about ? `"${user.profile.about.slice(0, 100)}..."` : `"You're shaping the future of African technology. Your journey continues here."`}
            </p>
          </div>

          {/* 4. Action Center */}
          <div className="flex flex-wrap items-center gap-3 mt-2 md:mt-0">
             <Link
               href={`/profile/${slugifyUsername(username)}`}
               className="flex-1 sm:flex-none group flex items-center justify-center gap-2 md:gap-3 px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl md:rounded-[1.5rem] font-black text-[10px] md:text-xs uppercase tracking-widest transition-all hover:brightness-110 hover:shadow-2xl hover:shadow-blue-200 shadow-lg shadow-blue-200/50 active:scale-95 border border-blue-500/50"
             >
               <span>Studio Portfolio</span>
               <div className="p-0.5 md:p-1 bg-white/20 rounded md:rounded-lg group-hover:translate-x-1 transition-transform">
                  <ExternalLink size={12} className="md:w-[14px] md:h-[14px]" />
               </div>
             </Link>
             
             <button className="flex items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-2xl md:rounded-[1.5rem] bg-slate-50 text-slate-400 border border-slate-100 hover:bg-white hover:text-blue-600 hover:border-blue-200 transition-all active:scale-90">
                <div className="relative">
                   <div className="absolute -top-1 -right-1 w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500 rounded-full border-2 border-white" />
                   <ChevronRight className="rotate-90 w-4 h-4 md:w-6 md:h-6" />
                </div>
             </button>
          </div>
        </div>

        {/* 5. Personal Quick-Links / Identity Tags */}
        <div className="mt-8 md:mt-12 flex flex-wrap gap-2 md:gap-3">
           {user.skills && user.skills.slice(0, 5).map((skill: string, i: number) => (
              <div key={i} className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-5 md:py-2.5 bg-white border border-slate-100 rounded-xl md:rounded-2xl shadow-sm hover:border-blue-200 hover:shadow-md transition-all cursor-default group/skill">
                 <Rocket size={12} className="text-blue-500 group-hover/skill:scale-110 transition-transform md:w-[14px] md:h-[14px]" />
                 <span className="text-[9px] md:text-[10px] font-black text-slate-900 uppercase tracking-widest">{skill}</span>
              </div>
           ))}
           <Link href={`/dashboard/student/${slugifyUsername(username)}`} className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-5 md:py-2.5 bg-amber-50 border border-amber-100 rounded-xl md:rounded-2xl shadow-sm hover:bg-amber-100 transition-all group/projects">
              <Award size={12} className="text-amber-600 group-hover/projects:rotate-12 transition-transform md:w-[14px] md:h-[14px]" />
              <span className="text-[9px] md:text-[10px] font-black text-amber-900 uppercase tracking-widest">My Projects</span>
           </Link>
        </div>
      </div>

      <style jsx>{`
        .bg-studio-gradient {
          background: linear-gradient(135deg, #2563eb 0%, #4338ca 100%);
        }
      `}</style>
    </motion.div>
  );
};