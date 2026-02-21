"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

import {
  Newspaper,
  Briefcase,
  Globe,
  Zap,
  Users,
  TrendingUp,
  User,
  Bell,
  X,
  LogOut,
  MessageSquare,
  ShieldCheck,
  LayoutDashboard,
} from "lucide-react";
import { AiOutlineWechat } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import AnimatedNavLink from "@/components/customButtons/AnimatedNavLink";
import NameInitials from "@/components/NameInitials";
import { slugifyUsername, cn } from "@/lib/utils";

interface SidebarProps {
  user: any;
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
  showUploadLive?: boolean;
}

// Special navigation item for AI chat
const aiChatItem = {
  href: "/dashboard/zigagent-ai",
  icon: AiOutlineWechat,
  label: "Chat With Agent Zai",
};

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen = false,
  onClose,
  onToggle,
  user,
  showUploadLive = false,
}) => {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  // Extract user data with fallbacks
  const userName = user?.name || user?.profile?.name || "Guest User";
  const userRole = user?.role || user?.profile?.role || "Student";
  const userAvatar =
    user?.avatar ||
    user?.profile?.avatar_url ||
    user?.avatarUrl
  const isOnline = user?.isOnline ?? true;
  const applicationsCount =
    user?.applicationsCount || user?.stats?.applications || 0;
  const profileViews = user?.profileViews || user?.stats?.profileViews || 0;

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  };

  const isRouteActive = (href: string, matchPaths?: string[], excludePaths?: string[]) => {
    // Remove trailing slashes for comparison but preserve leading slash
    const normalize = (p: string | undefined) => {
      if (!p) return "";
      return p.replace(/\/+$/, ""); // Remove trailing slashes only
    };

    const path = normalize(pathname);
    const target = normalize(href);

    if (!target) return false;

    // Check if path matches any exclude patterns (with prefix matching for all)
    if (excludePaths && excludePaths.length > 0) {
      const isExcluded = excludePaths.some((p: string) => {
        const normalized = normalize(p);
        // Always do prefix matching for excludePaths
        return path === normalized || path.startsWith(normalized + "/");
      });
      if (isExcluded) return false;
    }

    // Check explicit matchPaths first
    if (matchPaths && matchPaths.length > 0) {
      return matchPaths.some((p: string) => {
        // Check if original matchPath ends with "/" (prefix match)
        if (p.endsWith("/")) {
          const normalized = normalize(p);
          // Prefix match: /feed matches /feed/123, /feed/projects/123, etc.
          return path === normalized || path.startsWith(normalized + "/");
        } else {
          // Exact match
          return path === normalize(p);
        }
      });
    }

    // Default: exact match only (no prefix matching)
    return path === target;
  };

  // Handle nav item click
  const handleNavClick = () => {
    if (window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`
          fixed top-20 lg:top-16 left-0 h-[calc(100vh-5rem)] lg:h-[calc(100vh-4rem)] w-72 bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-800/50 transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 flex flex-col z-50 shadow-[12px_0_30px_-15px_rgba(0,0,0,0.04)]
        `}
      >
        {/* Header with User Profile - Fixed at top */}
        <div className="flex-shrink-0 p-4 lg:p-5 border-b border-slate-50 dark:border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-white dark:border-slate-800 shadow-lg flex-shrink-0">
              <Image
                src={userAvatar || "https://i.ibb.co/8n8d37H4/white-logo-4x.png"}
                alt={`${userName}'s Avatar`}
                width={48}
                height={48}
                className={cn(
                  "w-full h-full object-cover",
                  !userAvatar && "bg-gradient-to-br from-[#155DFC] to-[#1A3CB9] p-2.5"
                )}
                priority
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 dark:text-white truncate text-sm tracking-tight">
                {userName}
              </h3>
              <p className="text-[9px] font-bold text-slate-400 tracking-wider">{userRole}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                />
                <span
                  className={`text-[8px] font-bold tracking-widest ${isOnline ? "text-emerald-500" : "text-slate-400"
                    }`}
                >
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors flex-shrink-0"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Main Navigation Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-950">
          <div className="flex-1 px-3 py-6 space-y-7 overflow-y-auto custom-scrollbar">
            {/* Main Navigation */}
            <div className="space-y-2.5">
              <h3 className="px-3 text-[8px] font-bold tracking-[0.25em] text-slate-300 dark:text-slate-600">
                Discover
              </h3>
              <div className="space-y-1">
                <AnimatedNavLink
                  href="/feed"
                  icon={Globe}
                  label="Browse"
                  isActive={isRouteActive("/feed")}
                  onClick={handleNavClick}
                />
                <AnimatedNavLink
                  href="/dashboard/projects"
                  icon={Briefcase}
                  label="Projects"
                  isActive={isRouteActive("/dashboard/projects")}
                  onClick={handleNavClick}
                />
                <AnimatedNavLink
                  href="/dashboard/blog"
                  icon={Newspaper}
                  label="News"
                  isActive={isRouteActive("/dashboard/blog")}
                  onClick={handleNavClick}
                />
              </div>
            </div>

            {/* Collaboration Section */}
            <div className="space-y-2.5">
              <h3 className="px-3 text-[8px] font-bold tracking-[0.25em] text-slate-300 dark:text-slate-600">
                Network
              </h3>
              <div className="space-y-1">
                <AnimatedNavLink
                  href="/dashboard/student"
                  icon={Users}
                  label="Zigx"
                  isActive={isRouteActive("/dashboard/student")}
                  onClick={handleNavClick}
                />
                <AnimatedNavLink
                  href="/dashboard/community"
                  icon={MessageSquare}
                  label="Group"
                  isActive={isRouteActive("/dashboard/community")}
                  onClick={handleNavClick}
                />
              </div>
            </div>

            {/* Workspace Section */}
            <div className="space-y-2.5">
              <h3 className="px-3 text-[8px] font-bold tracking-[0.25em] text-slate-300 dark:text-slate-600">
                Workspace
              </h3>
              <div className="space-y-1">
                {user?.permissions?.isIntern && (
                  <AnimatedNavLink
                    href="/intern/workspace"
                    icon={LayoutDashboard}
                    label="Workspace"
                    isActive={isRouteActive("/intern/workspace")}
                    badge={unreadCount > 0 ? unreadCount : undefined}
                    onClick={handleNavClick}
                  />
                )}
                {user?.permissions?.isSupervisor && (
                  <AnimatedNavLink
                    href="/supervisor"
                    icon={ShieldCheck}
                    label="Supervisor Hub"
                    isActive={isRouteActive("/supervisor")}
                    onClick={handleNavClick}
                  />
                )}
                <AnimatedNavLink
                  href="/buddy"
                  icon={AiOutlineWechat}
                  label="Ziggy Ai"
                  isActive={isRouteActive("/buddy")}
                  isSpecial
                  onClick={handleNavClick}
                />
              </div>
            </div>

            {/* Account Section */}
            <div className="space-y-2.5">
              <h3 className="px-3 text-[8px] font-bold tracking-[0.25em] text-slate-300 dark:text-slate-600">
                Account
              </h3>
              <div className="space-y-1">
                <AnimatedNavLink
                  href="/profile"
                  icon={User}
                  label="Profile"
                  isActive={isRouteActive("/profile")}
                  onClick={handleNavClick}
                />
                <AnimatedNavLink
                  href="/notifications"
                  icon={Bell}
                  label="Notifications"
                  isActive={isRouteActive("/notifications")}
                  onClick={handleNavClick}
                />
              </div>
            </div>

            {/* Quick Stats Card - Desktop Only */}
            <div className="hidden lg:block pt-2">
              <div className="p-4 bg-[#155DFC]/5 dark:bg-[#155DFC]/5 rounded-xl border border-[#155DFC]/10 dark:border-[#155DFC]/10">
                <h4 className="text-[8px] font-bold text-[#155DFC] tracking-widest mb-3 flex items-center gap-1.5">
                  <TrendingUp size={12} />
                  Quick Stats
                </h4>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400">Applications</span>
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      {applicationsCount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400">Network Reach</span>
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      {profileViews}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sign Out Button - Always Visible at Bottom */}
          <div className="p-3 border-t border-slate-50 dark:border-slate-800/50">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 rounded-xl border-slate-100 dark:border-slate-800 font-bold text-xs text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-100 transition-all duration-300 py-5"
              onClick={handleSignOut}
            >
              <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 transition-colors">
                <LogOut size={16} />
              </div>
              <span className="font-bold text-[10px] tracking-wider">Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Mobile Stats - Show on mobile only */}
        <div className="lg:hidden flex-shrink-0 p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
          <div className="flex justify-around text-center">
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">
                {applicationsCount}
              </div>
              <div className="text-[8px] font-bold text-slate-400 tracking-widest">Applications</div>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 my-auto"></div>
            <div>
              <div className="font-bold text-[#155DFC] text-lg tracking-tight">
                {profileViews}
              </div>
              <div className="text-[8px] font-bold text-slate-400 tracking-widest">Reach</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};