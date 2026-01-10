"use client";

import Link from "next/link";
import Image from "next/image";
import {
  User,
  MapPin,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Award,
  Rocket,
  ShieldCheck,
  Zap
} from "lucide-react";
import { UserProfile } from "@/app/types/type";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface WelcomeCardProps {
  user: UserProfile | any;
  onProfileUpdated?: () => void;
  profile?: any;
}

export const WelcomeCard = ({ user, onProfileUpdated, profile }: WelcomeCardProps) => {
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);

  const avatarUrl =
    user?.profile?.avatar_url ||
    user?.profile?.avatarUrl ||
    user?.avatar_url ||
    user?.avatarUrl;
    
  const coverImageUrl = user?.profile?.cover_image || "https://i.ibb.co/9kLrm6KY/og-image-2x-100-1.jpg";
  const username = user?.profile?.username || user?.username || "student";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative bg-white rounded-[3rem] w-full mx-auto shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden mb-12 group/card"
    >
      {/* 1. Immersive Cover Header */}
      <div className="relative h-44 md:h-52 lg:h-60 w-full overflow-hidden">
        <Image
          src={coverImageUrl}
          alt="Cover image"
          fill
          className="object-cover transition-transform duration-1000 group-hover/card:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
        
        {/* Top Badges / Level Indicator */}
        <div className="absolute top-6 right-6 flex items-center gap-3">
           <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-2xl">
              <Zap size={14} className="text-amber-400 fill-amber-400" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Level 12 Voyager</span>
           </div>
           <div className="bg-blue-600/80 backdrop-blur-xl border border-blue-400/30 w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <ShieldCheck size={20} />
           </div>
        </div>
      </div>

      {/* 2. Identity Section */}
      <div className="px-8 lg:px-12 pb-10 relative">
        
        {/* Floating Avatar */}
        <div className="relative -mt-16 sm:-mt-20 mb-6 flex justify-between items-end">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            className="relative"
            onMouseEnter={() => setIsAvatarHovered(true)}
            onMouseLeave={() => setIsAvatarHovered(false)}
          >
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[3rem] border-8 border-white shadow-[0_20px_40px_-5px_rgba(0,0,0,0.15)] overflow-hidden bg-white ring-1 ring-slate-100">
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
            <div className="absolute bottom-4 right-4 w-6 h-6 bg-green-500 border-4 border-white rounded-full shadow-lg" />
          </motion.div>

          {/* Quick Stats Grid over body */}
          <div className="hidden md:flex items-center gap-6 mb-2">
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ecosystem Rank</p>
                <p className="text-2xl font-black text-slate-900 leading-none">#42</p>
             </div>
             <div className="w-px h-10 bg-slate-100" />
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Points</p>
                <p className="text-2xl font-black text-blue-600 leading-none">8.4k</p>
             </div>
          </div>
        </div>

        {/* 3. Welcome Text & Primary Info */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">
                  Welcome back, {user.name.split(' ')[0]}!
                </h1>
                <motion.div 
                   animate={{ rotate: [0, 20, 0] }}
                   transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                   <Sparkles className="text-amber-500 w-8 h-8" fill="currentColor" />
                </motion.div>
              </div>
              <div className="flex items-center gap-2 text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] bg-slate-50 w-fit px-4 py-1.5 rounded-full border border-slate-100">
                <MapPin size={12} className="text-blue-500" />
                <span>{user.university || "Zigex Student"}</span>
              </div>
            </div>

            <p className="text-slate-500 text-lg font-medium leading-relaxed italic border-l-4 border-blue-600 pl-6 py-1">
               {user.profile.about ? `"${user.profile.about.slice(0, 100)}..."` : `"You're shaping the future of African technology. Your journey continues here."`}
            </p>
          </div>

          {/* 4. Action Center */}
          <div className="flex items-center gap-3">
             <Link
               href={`/profile/${username}`}
               className="group flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-200 shadow-xl shadow-slate-100 active:scale-95"
             >
               <span>Studio Portfolio</span>
               <div className="p-1 bg-white/20 rounded-lg group-hover:translate-x-1 transition-transform">
                  <ExternalLink size={14} />
               </div>
             </Link>
             
             <button className="flex items-center justify-center w-14 h-14 rounded-[1.5rem] bg-slate-50 text-slate-400 border border-slate-100 hover:bg-white hover:text-blue-600 hover:border-blue-200 transition-all active:scale-90">
                <div className="relative">
                   <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                   <ChevronRight className="rotate-90" size={24} />
                </div>
             </button>
          </div>
        </div>

        {/* 5. Personal Quick-Links / Identity Tags */}
        <div className="mt-12 flex flex-wrap gap-3">
           {user.skills && user.skills.slice(0, 5).map((skill: string, i: number) => (
              <div key={i} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-blue-200 hover:shadow-md transition-all cursor-default group/skill">
                 <Rocket size={14} className="text-blue-500 group-hover/skill:scale-110 transition-transform" />
                 <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{skill}</span>
              </div>
           ))}
           <Link href="/dashboard/projects" className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 border border-amber-100 rounded-2xl shadow-sm hover:bg-amber-100 transition-all group/projects">
              <Award size={14} className="text-amber-600 group-hover/projects:rotate-12 transition-transform" />
              <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest">My Projects</span>
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