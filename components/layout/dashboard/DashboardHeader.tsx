"use client";

import { Menu, Bell, Briefcase, Newspaper, MessageSquare, Layout } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { NotificationDropdown } from "./NotificationDropdown";
import { Logo } from "@/components/layout/Logo";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import NameInitials from "@/components/NameInitials";
import { slugifyUsername, cn } from "@/lib/utils";

interface DashboardHeaderProps {
  user?: any;
  onMenuClick: () => void;
}

export const DashboardHeader = ({
  user,
  onMenuClick,
}: DashboardHeaderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const userName = user?.name || user?.profile?.name || "Guest User";
  const userRole = user?.role || user?.profile?.role || "Student";
  const userAvatar =
    user?.avatar ||
    user?.profile?.avatar_url ||
    user?.avatarUrl

  const middleNavItems = [
    ...(user?.permissions?.isSupervisor ? [{ href: "/supervisor", label: "Supervisor", icon: Newspaper }] : []),
    { href: "/dashboard/community", label: "Community", icon: MessageSquare },
    ...(user?.permissions?.isIntern ? [{ href: "/intern/workspace", label: "Workspace", icon: Briefcase }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800/50 shadow-sm shadow-slate-100/50 dark:shadow-none transition-all duration-300">
      <div className="flex items-center justify-between px-4 lg:px-6 py-2.5 max-w-full mx-auto">
        {/* Left Side - Mobile Menu & Logo */}
        <div className="flex items-center gap-3 lg:gap-4 flex-1">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-[#155DFC] rounded-xl transition-all lg:hidden flex-shrink-0"
            aria-label="Toggle Menu"
          >
            <Menu size={22} />
          </button>

          {/* Logo/Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 group flex-shrink-0"
          >
            <div className="relative w-10 h-10 lg:w-11 lg:h-11 transition-transform group-hover:scale-105">
              <Logo className="w-full h-full" />
            </div>
          </Link>
        </div>

        {/* Middle Section - Desktop Navigation */}
        <nav className="hidden xl:flex items-center justify-center gap-1.5 flex-1">
          {middleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-300",
                  isActive 
                    ? "bg-[#155DFC] text-white shadow-lg shadow-blue-500/20" 
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                <Icon size={16} className={cn(isActive ? "text-white" : "text-slate-400")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Side - Notifications, User & Logout */}
        <div className="flex items-center gap-3 lg:gap-4 flex-1 justify-end">
          {/* Notifications Dropdown */}
          <div className="flex-shrink-0">
            <NotificationDropdown />
          </div>

          {/* User Profile */}
          <Link
            href={`/profile/${slugifyUsername(user?.profile?.username) || ""}`}
            className="flex items-center gap-3 pl-3 lg:pl-4 border-l border-slate-100 dark:border-slate-800 flex-shrink-0 group"
          >
            <div className="relative w-9 h-9 lg:w-10 lg:h-10 rounded-xl border-2 border-white dark:border-slate-800 ring-2 ring-slate-100 dark:ring-slate-800 group-hover:ring-[#155DFC]/30 shadow-sm overflow-hidden transition-all duration-300">
              {userAvatar ? (
                <Image
                  src={userAvatar}
                  alt={userName}
                  fill
                  className="object-cover"
                />
              ) : (
                <NameInitials name={userName} />
              )}
            </div>
            <div className="hidden md:flex flex-col">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight group-hover:text-[#155DFC] transition-colors tracking-tight">
                {userName}
              </p>
              <p className="text-[9px] font-bold text-slate-400 tracking-wider leading-tight">{userRole}</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};
