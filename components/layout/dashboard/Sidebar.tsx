"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

import {
  LogOut,
  X,
  Users,
  TrendingUp,
  User,
  Bell,
  NewspaperIcon,
} from "lucide-react";
import { AiOutlineWechat } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import AnimatedNavLink from "@/components/customButtons/AnimatedNavLink";
// import AnimatedNavLink from "@/components/sections/dashboard/AnimatedNavLink";

interface SidebarProps {
  user: any;
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
}

// Notifications nav item
const notificationsItem = {
  href: "/notifications",
  icon: Bell,
  label: "Notifications",
  matchPaths: ["/notifications", "/notifications"],
};

// Regular navigation items
const navItems = [
  { href: "/dashboard", icon: User, label: "Home" },
  {
    href: "/dashboard/student",
    icon: Users,
    label: "Connection",
    matchPaths: ["/dashboard/student"],
  },
  {
    href: "/dashboard/track-progress",
    icon: TrendingUp,
    label: "Track Progress",
  },
  {
    href: "/dashboard/blog",
    icon: NewspaperIcon,
    label: "News",
  },
];

// Special navigation item for AI chat
const aiChatItem = {
  href: "/dashboard/fupro-ai",
  icon: AiOutlineWechat,
  label: "Chat with Agent ZAi",
};

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen = false,
  onClose,
  onToggle,
  user
}) => {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Extract user data with fallbacks
  const userName = user?.name || user?.profile?.name || "Guest User";
  const userRole = user?.role || user?.profile?.role || "Student";
  const userAvatar =
    user?.avatar ||
    user?.profile?.avatar_url ||
    user?.avatarUrl ||
    "/default-avatar.png";
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

  const isRouteActive = (href: string, matchPaths?: string[]) => {
    const normalize = (p: string | undefined) => (p ? p.replace(/\/+$|^\s+|\s+$/g, "") : "");
    const path = normalize(pathname);
    const target = normalize(href);

    if (!target) return false;

    // Check explicit matchPaths first
    if (matchPaths) {
      return matchPaths.some((p: string) => {
        const normalized = normalize(p);
        return path === normalized || path.startsWith(normalized + "/");
      });
    }

    // Special-case root dashboard exact match
    if (target === "/dashboard") {
      return path === "/dashboard";
    }

    // exact match or prefix match for nested/dynamic routes
    return path === target || path.startsWith(target + "/");
  };

  // Handle nav item click
  const handleNavClick = () => {
    if (window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };

  // Fetch unread notifications count and poll every 30s
  useEffect(() => {
    let mounted = true;
    const fetchCount = async () => {
      try {
        const res = await fetch('/api/students/notifications/unread-count');
        const data = await res.json();
        if (mounted) setUnreadCount(data.unreadCount || 0);
      } catch (e) {
        console.error('Failed to fetch unread count', e);
      }
    };
    fetchCount();
    const iv = setInterval(fetchCount, 30000);
    return () => { mounted = false; clearInterval(iv); };
  }, []);

  return (
    <>
      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #3b82f6 #dbeafe;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #1d4ed8;
        }
      `}</style>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] w-80 bg-white border-r border-gray-200 shadow-lg z-40
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 flex flex-col
        `}
      >
        {/* Header with User Profile - Fixed at top */}
        <div className="flex-shrink-0 p-4 lg:p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-3 border-white shadow-lg flex-shrink-0">
              <Image
                src={userAvatar}
                alt={`${userName}'s Avatar`}
                width={64}
                height={64}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 truncate text-base">
                {userName}
              </h3>
              <p className="text-sm text-gray-600">{userRole}</p>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
                <span
                  className={`text-xs font-medium ${
                    isOnline ? "text-green-600" : "text-gray-600"
                  }`}
                >
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/50 transition-colors flex-shrink-0"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Main Navigation Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Regular Navigation Items */}
          <div className="flex-1 px-4 py-4 overflow-y-auto custom-scrollbar">
            <div className="space-y-2">
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
                  Navigation
                </h4>
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <AnimatedNavLink
                      key={item.href}
                      href={item.href}
                      icon={item.icon}
                      label={item.label}
                      isActive={isRouteActive(item.href, item.matchPaths)}
                      onClick={handleNavClick}
                    />
                  ))}
                  
                  {/* Notifications with badge */}
                  <AnimatedNavLink
                    href={notificationsItem.href}
                    icon={notificationsItem.icon}
                    label={notificationsItem.label}
                    isActive={isRouteActive(notificationsItem.href, notificationsItem.matchPaths)}
                    onClick={handleNavClick}
                    badge={unreadCount > 0 ? unreadCount : undefined}
                  />
                </div>
              </div>

              {/* AI Assistant Section - Always Visible */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3 px-1">
                  AI Assistant
                </h4>
                <div className="relative">
                  <AnimatedNavLink
                    href={aiChatItem.href}
                    icon={aiChatItem.icon}
                    label={aiChatItem.label}
                    isActive={isRouteActive(aiChatItem.href)}
                    onClick={handleNavClick}
                    isSpecial={true}
                  />
                  {/* AI Badge */}
                  <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-lg z-50">
                    AI
                  </div>
                </div>
              </div>

              {/* Quick Stats Card - Desktop Only */}
              <div className="hidden lg:block mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3 text-sm flex items-center gap-2">
                  <TrendingUp size={16} />
                  Quick Stats
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">Applications</span>
                    <span className="font-bold text-blue-900 bg-blue-200 px-2 py-1 rounded-full text-xs">
                      {applicationsCount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">Profile Views</span>
                    <span className="font-bold text-blue-900 bg-blue-200 px-2 py-1 rounded-full text-xs">
                      {profileViews}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sign Out Button - Always Visible at Bottom */}
          <div className="flex-shrink-0 p-4 border-t border-gray-100 bg-gray-50/50">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 text-gray-700 hover:text-red-600 hover:bg-red-50 hover:border-red-300 border-gray-300 transition-all duration-200 py-3 font-medium"
              onClick={handleSignOut}
            >
              <div className="p-1.5 rounded-lg bg-gray-100 hover:bg-red-100 transition-colors flex-shrink-0">
                <LogOut
                  size={16}
                  className="text-gray-600 hover:text-red-600"
                />
              </div>
              <span>Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Mobile Stats - Show on mobile only */}
        <div className="lg:hidden flex-shrink-0 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-t border-gray-100">
          <div className="flex justify-around text-center">
            <div>
              <div className="font-bold text-blue-600 text-lg">
                {applicationsCount}
              </div>
              <div className="text-xs text-gray-600">Applications</div>
            </div>
            <div className="w-px bg-gray-300"></div>
            <div>
              <div className="font-bold text-purple-600 text-lg">
                {profileViews}
              </div>
              <div className="text-xs text-gray-600">Profile Views</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};