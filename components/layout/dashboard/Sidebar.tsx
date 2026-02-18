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
// import AnimatedNavLink from "@/components/sections/dashboard/AnimatedNavLink";

interface SidebarProps {
  user: any;
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
  showUploadLive?: boolean;
}

// // Notifications nav item
// const notificationsItem = {
//   href: "/notifications",
//   icon: Bell,
//   label: "Notifications",
//   matchPaths: ["/notifications", "/notifications"],
// };

// Regular navigation items
// const navItems = [
//   { href: "/feed", icon: IceCreamCone, label: "Browse" },
//   {
//     href: "/dashboard/student",
//     icon: Users,
//     label: "zigx",
//     matchPaths: ["/dashboard/student/"],
//   },
//    {
//     href: "/dashboard/student/id",
//     icon: PersonStandingIcon,
//     label: "For Me",
//     matchPaths: ["/dashboard/student/id"],
//   },
//   {
//     href: "/dashboard/track-progress",
//     icon: TrendingUp,
//     label: "Track Progress",
//   },
//   {
//     href: "/dashboard/blog",
//     icon: NewspaperIcon,
//     label: "News",
//   },


//   //  {
//   //   href: "/dashboard/track-progress",
//   //   icon: PersonStanding,
//   //   label: "Me",
//   // },
// ];

// Special navigation item for AI chat
const aiChatItem = {
  href: "/dashboard/zigagent-ai",
  icon: AiOutlineWechat,
  label: "Chat with Agent ZAi",
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

  // Fetch unread notifications count and poll every 30s
  // useEffect(() => {
  //   let mounted = true;
  //   const fetchCount = async () => {
  //     try {
  //       const res = await fetch('/api/students/notifications/unread-count');
  //       const data = await res.json();
  //       if (mounted) setUnreadCount(data.unreadCount || 0);
  //     } catch (e) {
  //       console.error('Failed to fetch unread count', e);
  //     }
  //   };
  //   fetchCount();
  //   const iv = setInterval(fetchCount, 30000);
  //   return () => { mounted = false; clearInterval(iv); };
  // }, []);

  return (
    <>
      {/* Custom Scrollbar Styles */}


      {/* Sidebar */}
      <aside
        className={`
          fixed top-20 lg:top-16 left-0 h-[calc(100vh-5rem)] lg:h-[calc(100vh-4rem)] w-80 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 flex flex-col z-50 shadow-[20px_0_40px_-15px_rgba(0,0,0,0.03)]
        `}
      >
        {/* Header with User Profile - Fixed at top */}
        <div className="flex-shrink-0 p-4 lg:p-6 border-b border-slate-50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-800/20">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white dark:border-slate-700 shadow-xl flex-shrink-0">
              <Image
                src={userAvatar || "https://i.ibb.co/8n8d37H4/white-logo-4x.png"}
                alt={`${userName}'s Avatar`}
                width={64}
                height={64}
                className={cn(
                  "w-full h-full object-cover",
                  !userAvatar && "bg-gradient-to-br from-blue-600 to-indigo-700 p-3"
                )}
                priority
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-slate-900 dark:text-white truncate text-base tracking-tight">
                {userName}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 tracking-wider">{userRole}</p>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                />
                <span
                  className={`text-[9px] font-bold tracking-widest ${isOnline ? "text-emerald-500" : "text-slate-400"
                    }`}
                >
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors flex-shrink-0"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Main Navigation Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900">
          <div className="flex-1 px-4 py-8 space-y-10 overflow-y-auto custom-scrollbar">
            {/* Main Navigation - High Fidelity Links */}
            <div className="space-y-4">
              <h3 className="px-4 text-[9px] font-bold tracking-[0.25em] text-slate-400 dark:text-slate-500">
                Discover
              </h3>
              <div className="space-y-2">
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
            <div className="space-y-4">
              <h3 className="px-4 text-[9px] font-bold tracking-[0.25em] text-slate-400 dark:text-slate-500">
                Network
              </h3>
              <div className="space-y-2">
                <AnimatedNavLink
                  href="/dashboard/student"
                  icon={Users}
                  label="ZigX"
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
            <div className="space-y-4">
              <h3 className="px-4 text-[9px] font-bold tracking-[0.25em] text-slate-400 dark:text-slate-500">
                Workspace
              </h3>
              <div className="space-y-2">
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
                  label="Ziggy AI"
                  isActive={isRouteActive("/buddy")}
                  isSpecial
                  onClick={handleNavClick}
                />
              </div>
            </div>

            {/* Account Section */}
            <div className="space-y-4">
              <h3 className="px-4 text-[9px] font-bold tracking-[0.25em] text-slate-400 dark:text-slate-500">
                Account
              </h3>
              <div className="space-y-2">
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
            <div className="hidden lg:block pt-4">
              <div className="p-6 bg-blue-50/50 dark:bg-blue-600/5 rounded-3xl border border-blue-100/50 dark:border-blue-900/20">
                <h4 className="text-[9px] font-bold text-blue-600 dark:text-blue-400 tracking-widest mb-4 flex items-center gap-2">
                  <TrendingUp size={14} />
                  Stats
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-500">Applications</span>
                    <span className="font-black text-slate-900 dark:text-white text-xs">
                      {applicationsCount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-500">Network Reach</span>
                    <span className="font-black text-slate-900 dark:text-white text-xs">
                      {profileViews}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sign Out Button - Always Visible at Bottom */}
          <div className="p-4 border-t border-slate-50 dark:border-slate-800/50">
            <Button
              variant="outline"
              className="w-full justify-start gap-4 rounded-2xl border-slate-100 dark:border-slate-800 font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-100 transition-all duration-300 py-6"
              onClick={handleSignOut}
            >
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-rose-100 transition-colors">
                <LogOut size={18} />
              </div>
              <span className="font-bold text-[11px] tracking-widest">Logout</span>
            </Button>
          </div>
        </div>

        {/* Mobile Stats - Show on mobile only */}
        <div className="lg:hidden flex-shrink-0 p-6 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800">
          <div className="flex justify-around text-center">
            <div>
              <div className="font-black text-slate-900 dark:text-white text-xl tracking-tighter">
                {applicationsCount}
              </div>
              <div className="text-[9px] font-bold text-slate-400 tracking-widest">Applications</div>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 my-auto"></div>
            <div>
              <div className="font-black text-blue-600 text-xl tracking-tighter">
                {profileViews}
              </div>
              <div className="text-[9px] font-bold text-slate-400 tracking-widest">Reach</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};