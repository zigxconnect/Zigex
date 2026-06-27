"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

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
  Search,
  ChevronRight,
  Settings,
  MoreVertical,
} from "lucide-react";
import { AiOutlineWechat } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import AnimatedNavLink from "@/components/customButtons/AnimatedNavLink";
import NameInitials from "@/components/NameInitials";
import { slugifyUsername, cn } from "@/lib/utils";
import { Logo } from "@/components/layout/Logo";
import { createClient } from "@/lib/supabase/client";

interface SidebarProps {
  user: any;
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
  showUploadLive?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen = false,
  onClose,
  onToggle,
  user,
  showUploadLive = false,
}) => {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Extract user data with fallbacks
  const userName = user?.name || user?.profile?.name || "Guest User";
  const userRole = user?.role || user?.profile?.role || "Student";
  const userAvatar =
    user?.avatar ||
    user?.profile?.avatar_url ||
    user?.avatarUrl;

  const username = user?.profile?.username || user?.username || "";
  const profileLink = username ? `/profile/${slugifyUsername(username)}` : "/profile";

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isRouteActive = (href: string, matchPaths?: string[]) => {
    const normalize = (p: string | undefined) => {
      if (!p) return "";
      return p.replace(/\/+$/, "");
    };

    const path = normalize(pathname);
    const target = normalize(href);

    if (!target) return false;

    if (matchPaths && matchPaths.length > 0) {
      return matchPaths.some((p: string) => {
        const normalized = normalize(p);
        return path === normalized || path.startsWith(normalized + "/");
      });
    }

    return path === target || (target !== "" && path.startsWith(target + "/"));
  };

  const handleNavClick = () => {
    if (window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen w-72 bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-800/50 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-50 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "shadow-[20px_0_40px_-20px_rgba(0,0,0,0.05)] dark:shadow-none"
        )}
      >
        {/* Header/Logo Section */}
        <div className="p-6 pb-2 flex items-center justify-between">
          <Link href="/feed" className="flex items-center gap-2 group">
            <div className="relative w-10 h-10 transition-transform duration-500 group-hover:rotate-12">
              <Logo className="w-full h-full" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                ZIGEX
              </span>
              <span className="text-[10px] font-bold text-[#155DFC] tracking-[0.2em] uppercase leading-none mt-1">
                Platform
              </span>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar - Sleek Version */}
        <div className="px-6 py-4">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#155DFC] transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-transparent focus:border-[#155DFC]/20 rounded-2xl text-xs font-bold outline-none transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Navigation Area */}
        <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar space-y-8">
          {/* Main Group */}
          <div className="space-y-2">
            <h3 className="px-4 text-[10px] font-black tracking-[0.15em] text-slate-300 dark:text-slate-600 uppercase">
              Discover
            </h3>
            <div className="space-y-1">
              <AnimatedNavLink
                href="/feed"
                icon={Globe}
                label="Explore"
                isActive={isRouteActive("/feed")}
                onClick={handleNavClick}
              />
              <AnimatedNavLink
                href="/dashboard/programs"
                icon={Briefcase}
                label="Programs"
                isActive={isRouteActive("/dashboard/programs")}
                onClick={handleNavClick}
              />
              <AnimatedNavLink
                href="/dashboard/blog"
                icon={Newspaper}
                label="Announcements"
                isActive={isRouteActive("/dashboard/blog")}
                onClick={handleNavClick}
              />
            </div>
          </div>

          {/* Network Group */}
          <div className="space-y-2">
            <h3 className="px-4 text-[10px] font-black tracking-[0.15em] text-slate-300 dark:text-slate-600 uppercase">
              Network
            </h3>
            <div className="space-y-1">
              <AnimatedNavLink
                href="/dashboard/student"
                icon={Users}
                label="Network"
                isActive={isRouteActive("/dashboard/student")}
                onClick={handleNavClick}
              />
              <AnimatedNavLink
                href="/dashboard/community"
                icon={MessageSquare}
                label="Communities"
                isActive={isRouteActive("/dashboard/community")}
                onClick={handleNavClick}
              />
            </div>
          </div>

          {/* Workspace Group */}
          <div className="space-y-2">
            <h3 className="px-4 text-[10px] font-black tracking-[0.15em] text-slate-300 dark:text-slate-600 uppercase">
              Workspace
            </h3>
            <div className="space-y-1">
              {user?.permissions?.isIntern && (
                <AnimatedNavLink
                  href="/student/workspace"
                  icon={LayoutDashboard}
                  label="My Learning"
                  isActive={isRouteActive("/student/workspace")}
                  onClick={handleNavClick}
                />
              )}
              {user?.permissions?.isSupervisor && (
                <AnimatedNavLink
                  href="/supervisor"
                  icon={ShieldCheck}
                  label="Mentorship"
                  isActive={isRouteActive("/supervisor")}
                  onClick={handleNavClick}
                />
              )}
              <AnimatedNavLink
                href="/dashboard/zigagent-ai/docs"
                icon={AiOutlineWechat}
                label="Zila AI"
                isActive={isRouteActive("/dashboard/zigagent-ai")}
                isSpecial
                onClick={handleNavClick}
              />
            </div>
          </div>

          {/* Become a Superstar Promo Card */}

        </div>

        {/* Bottom User Profile Section */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-950">
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-300 group"
            >
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-slate-100 dark:ring-slate-800 group-hover:ring-[#155DFC]/30 transition-all">
                  {userAvatar ? (
                    <Image src={userAvatar} alt={userName} fill className="object-cover" />
                  ) : (
                    <NameInitials name={userName} />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950 shadow-sm" />
              </div>

              <div className="flex-1 text-left min-w-0">
                <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                  {userName}
                </p>
                <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-wider">
                  {userRole}
                </p>
              </div>

              <MoreVertical size={16} className="text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
            </button>

            {/* Profile Menu Popup */}
            <AnimatePresence>
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-none p-2 z-50"
                  >
                    <Link
                      href={profileLink}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User size={16} className="text-slate-400 group-hover:text-[#155DFC]" />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">View Profile</span>
                    </Link>
                    <Link
                      href="/profile-settings"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Settings size={16} className="text-slate-400 group-hover:text-[#155DFC]" />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Settings</span>
                    </Link>
                    <div className="h-px bg-slate-50 dark:bg-slate-800 my-1 mx-2" />
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors group"
                    >
                      <LogOut size={16} />
                      <span className="text-xs font-bold">Sign Out</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>
    </>
  );
};
