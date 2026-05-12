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
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100/50 dark:border-slate-800/30 transition-all duration-700 lg:pl-72">
      <div className="flex items-center justify-between px-4 lg:px-10 py-3 max-w-[2000px] mx-auto gap-4">
        
        {/* Left Side: Personalized Greeting Identity */}
        <div className="flex items-center gap-4 flex-1">
           <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] leading-none">
                {new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening"},
              </span>
              <h2 className="text-[14px] font-black text-slate-900 dark:text-white uppercase tracking-tighter truncate max-w-[150px] leading-none">
                {userName.split(' ')[0]}
              </h2>
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
