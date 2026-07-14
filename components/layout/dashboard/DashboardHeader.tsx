// components/layout/dashboard/DashboardHeader.tsx
"use client";

import { Search, ChevronDown, Command, Menu } from "lucide-react";
import Image from "next/image";
import { NotificationDropdown } from "./NotificationDropdown";
import { ProfileDropdown } from "./ProfileDropdown";
import Link from "next/link";
import { cn, slugifyUsername } from "@/lib/utils";
import { Logo } from "@/components/layout/Logo";

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
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border transition-all duration-700 lg:pl-72">
      <div className="flex items-center justify-between px-4 lg:px-10 py-3 max-w-[2000px] mx-auto gap-4">
        
        {/* Left Side: Personalized Greeting Identity */}
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile Hamburger & Logo */}
          <div className="flex lg:hidden items-center gap-3">
            <button
              onClick={onMenuClick}
              className="p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
            >
              <Menu size={20} />
            </button>
            <Link href="/feed" className="flex items-center gap-2">
              <div className="relative w-8 h-8">
                <Logo className="w-full h-full" />
              </div>
              <span className="font-extrabold text-lg text-foreground tracking-tight">ZIGEX</span>
            </Link>
          </div>

          {/* Desktop Greeting */}
           <div className="hidden lg:flex items-center gap-2">
              <span className="text-[14px] font-black text-[#155DFC] dark:text-slate-300 uppercase tracking-tighter leading-none">
                {new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening"},
              </span>
              <h2 className="text-[14px] font-black text-foreground uppercase tracking-tighter truncate max-w-[200px] leading-none">
                {userName.split(' ')[0]}
              </h2>
           </div>
        </div>

        {/* Right Side: Identity & Signals */}
        <div className="flex items-center gap-3 lg:gap-8">
          
          {/* Signal Node */}
          <NotificationDropdown />

          {/* Vertical Separator */}
          <div className="h-6 w-[1px] bg-border mx-1 hidden sm:block" />

          {/* Identity Protocol Dropdown */}
          <ProfileDropdown user={user} />
        </div>
      </div>
    </header>
  );
};
