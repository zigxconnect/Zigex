// components/layout/dashboard/DashboardHeader.tsx
"use client";

import { Search, ChevronDown, Command } from "lucide-react";
import Image from "next/image";
import { NotificationDropdown } from "./NotificationDropdown";
import { ProfileDropdown } from "./ProfileDropdown";
import Link from "next/link";
import { cn, slugifyUsername } from "@/lib/utils";

interface DashboardHeaderProps {
  user?: any;
  onMenuClick: () => void;
}

export const DashboardHeader = ({
  user,
  onMenuClick,
}: DashboardHeaderProps) => {
  const userName = user?.name || user?.profile?.name || "Guest User";
  const userAvatar =
    user?.avatar ||
    user?.profile?.avatar_url ||
    user?.avatarUrl;

  const username = user?.profile?.username || user?.username || "";
  const role = user?.role || user?.profile?.role || "Student";
  const profileUrl = `/profile/${slugifyUsername(username) || ""}`;

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100/50 dark:border-slate-800/30 transition-all duration-700">
      <div className="flex items-center justify-between px-4 lg:px-12 py-3 max-w-[2000px] mx-auto gap-4">
        
        {/* Left Side: Logo & Global Search */}
        <div className="flex items-center gap-6 lg:gap-12 flex-1">
           {/* Branding: Always Visible */}
           <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
             <div className="relative w-8 h-8">
               <Image src="/zigex.png" alt="Zigex" fill className="object-contain" />
             </div>
             <span className="hidden sm:block text-lg font-black text-slate-900 dark:text-white tracking-tighter uppercase">Zigex</span>
           </Link>

           {/* Global Intelligence Trigger */}
           <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-sm group cursor-pointer hover:border-[#155DFC]/20 transition-all duration-500 max-w-sm w-full">
              <Search className="text-slate-400 group-hover:text-[#155DFC] transition-colors" size={14} strokeWidth={3} />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Neural Discovery</span>
              <div className="ml-auto flex items-center gap-1 px-1 py-0.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                 <Command size={9} className="text-slate-300" />
                 <span className="text-[8px] font-black text-slate-300">K</span>
              </div>
           </div>
        </div>

        {/* Right Side: Identity & Signals */}
        <div className="flex items-center gap-3 lg:gap-8">
          
          {/* Signal Node */}
          <NotificationDropdown />

          {/* Vertical Separator */}
          <div className="h-6 w-[1px] bg-slate-100 dark:bg-slate-800 mx-1 hidden sm:block" />

          {/* Identity Protocol Dropdown */}
          <ProfileDropdown user={user} />
        </div>
      </div>
    </header>
  );
};
