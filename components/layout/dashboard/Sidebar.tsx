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
  PersonStanding,
  IceCreamCone,
  PersonStandingIcon,
  Zap,
} from "lucide-react";
import { AiOutlineWechat } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import AnimatedNavLink from "@/components/customButtons/AnimatedNavLink";
import { ProjectsIcon } from "@sanity/icons";
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
  href: "/dashboard/fupro-ai",
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
  const navItems = [
  { 
    href: "/feed", 
    icon: IceCreamCone, 
    label: "Browse",
    matchPaths: ["/feed", "/feed/"],
    excludePaths: ["/feed/projects"]
  },
  {
    href: "/dashboard/student",
    icon: Users,
    label: "zigx",
    matchPaths: ["/dashboard/student", "/dashboard/student/"],
  },
   {
    href: `/profile/${user?.profile?.username || "username"}`,
    icon: PersonStandingIcon,
    label: "My Profile",
    matchPaths: ["/profile/"],
  },
  // {
  //   href: "/dashboard/track-progress",
  //   icon: TrendingUp,
  //   label: "Track Progress",
  //   matchPaths: ["/dashboard/track-progress", "/dashboard/track-progress/"],
  // },
{
    href: "/dashboard/projects",
    icon: ProjectsIcon,
    label: "projects",
    matchPaths: ["/dashboard/projects", "/dashboard/projects/", "/feed/projects/"],
  },
  {
    href: "/dashboard/blog",
    icon: NewspaperIcon,
    label: "News",
    matchPaths: ["/dashboard/blog", "/dashboard/blog/"],
  },
  // Upload Live item is intentionally omitted above; add it here when allowed
];

  if (showUploadLive) {
    navItems.push({
      href: "/upload-live",
      icon: Zap,
      label: "Upload Live",
      matchPaths: ["/upload-live", "/upload-live/"],
    });
  }

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
          fixed top-20 lg:top-16 left-0 h-[calc(100vh-5rem)] lg:h-[calc(100vh-4rem)] w-80 bg-sidebar border-r border-sidebar-border shadow-lg z-40
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 flex flex-col
        `}
      >
        {/* Header with User Profile - Fixed at top */}
        <div className="flex-shrink-0 p-4 lg:p-6 border-b border-sidebar-border bg-sidebar-accent/20">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-3 border-card shadow-lg flex-shrink-0">
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
              <h3 className="font-bold text-sidebar-foreground truncate text-base">
                {userName}
              </h3>
              <p className="text-sm text-muted-foreground">{userRole}</p>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? "bg-success" : "bg-muted"
                  }`}
                />
                <span
                  className={`text-xs font-medium ${
                    isOnline ? "text-success" : "text-muted-foreground"
                  }`}
                >
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors flex-shrink-0"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Main Navigation Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-sidebar">
          {/* Regular Navigation Items */}
          <div className="flex-1 px-4 py-4 overflow-y-auto custom-scrollbar">
            <div className="space-y-2">
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                  Navigation
                </h4>
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <AnimatedNavLink
                      key={item.href}
                      href={item.href}
                      icon={item.icon}
                      label={item.label}
                      isActive={isRouteActive(item.href, item.matchPaths, item.excludePaths)}
                      onClick={handleNavClick}
                    />
                  ))}
                </div>
              </div>

              {/* AI Assistant Section - Always Visible */}
              {/* AI Assistant Section */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3 px-1">
                  AI Assistant
                </h4>
                <AnimatedNavLink
                  href={aiChatItem.href}
                  icon={aiChatItem.icon}
                  label={aiChatItem.label}
                  isActive={isRouteActive(aiChatItem.href)}
                  onClick={handleNavClick}
                  isSpecial={true}
                  badge="Beta"
                />
              </div>

              {/* Quick Stats Card - Desktop Only */}
              <div className="hidden lg:block mt-6 p-4 bg-sidebar-accent/10 rounded-xl border border-sidebar-border">
                <h4 className="font-semibold text-primary mb-3 text-sm flex items-center gap-2">
                  <TrendingUp size={16} />
                  Quick Stats
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Applications</span>
                    <span className="font-bold text-primary bg-primary/10 px-2 py-1 rounded-full text-xs">
                      {applicationsCount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Profile Views</span>
                    <span className="font-bold text-primary bg-primary/10 px-2 py-1 rounded-full text-xs">
                      {profileViews}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sign Out Button - Always Visible at Bottom */}
          <div className="flex-shrink-0 p-4 border-t border-sidebar-border bg-sidebar/50">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 border-sidebar-border transition-all duration-200 py-3 font-medium"
              onClick={handleSignOut}
            >
              <div className="p-1.5 rounded-lg bg-muted hover:bg-destructive/20 transition-colors flex-shrink-0">
                <LogOut
                  size={16}
                  className="text-muted-foreground hover:text-destructive"
                />
              </div>
              <span>Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Mobile Stats - Show on mobile only */}
        <div className="lg:hidden flex-shrink-0 p-4 bg-sidebar-accent/20 border-t border-sidebar-border">
          <div className="flex justify-around text-center">
            <div>
              <div className="font-bold text-primary text-lg">
                {applicationsCount}
              </div>
              <div className="text-xs text-muted-foreground">Applications</div>
            </div>
            <div className="w-px bg-border"></div>
            <div>
              <div className="font-bold text-secondary text-lg">
                {profileViews}
              </div>
              <div className="text-xs text-muted-foreground">Profile Views</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};