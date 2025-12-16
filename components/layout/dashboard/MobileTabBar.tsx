"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  User,
  Upload,
  Briefcase,
  Users,
  Bell,
  Home,
  SearchCode,
  PersonStanding,
  LogOut,
  PersonStandingIcon,
  BrainCircuit,
} from "lucide-react";
import { AiOutlineWechat } from "react-icons/ai";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProjectsIcon } from "@sanity/icons";
import CreateProjectButton from "@/components/project/CreateProjectButton";

interface MobileTabBarProps {
  user: any;
}



interface TabItem {
  href: string;
  icon: any;
  label: string;
  isSpecial?: boolean;
  matchPaths?: string[];
  excludePaths?: string[];
}

export function MobileTabBar({ user }: MobileTabBarProps) {

  const tabItems = [
  // { href: "/dashboard/student/id", icon: PersonStanding, label: "Me" },
  { 
    href: "/feed", 
    icon: SearchCode, 
    label: "Browse",
    matchPaths: ["/feed", "/feed/"],
    excludePaths: ["/feed/projects"]
  },
  {
    href: "/dashboard/projects",
    icon: ProjectsIcon,
    label: "Projects",
    matchPaths: ["/dashboard/projects", "/dashboard/projects/", "/feed/projects/"],
  },
  { 
    href: "/dashboard/student", 
    icon: Users, 
    label: "Zigx",
    matchPaths: ["/dashboard/student", "/dashboard/student/"]
  },
  {
    href: `/profile/${user?.profile?.username || "username"}`,
    icon: PersonStandingIcon,
    label: "Profile",
    matchPaths: ["/profile/"],
  },
  {
    href: "/dashboard/fupro-ai",
    icon: BrainCircuit,
    label: "ZAi",
    matchPaths: ["/dashboard/fupro-ai", "/dashboard/fupro-ai/"],
    isSpecial: true
  },
  // { 
  //   href: "/notifications", 
  //   icon: Bell, 
  //   label: "Alerts",
  //   matchPaths: ["/notifications", "/notifications/"]
  // },
];
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // ... (existing helper functions) ...

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

  // ... (existing useEffects) ...

  // Unconditionally call hooks for data fetching
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

  // ... (handleLogout) ...

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-50 safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {tabItems.map((item: any) => {
            const Icon = item.icon;
            const isActive = isRouteActive(item.href, item.matchPaths, item.excludePaths);
            const showBadge = item.href === "/notifications" && unreadCount > 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center flex-1 py-2 px-1 relative group"
              >
                <div className="relative">
                  <div
                    className={`
                      p-2 rounded-xl transition-all duration-200
                      ${isActive 
                        ? item.isSpecial 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-600 group-active:bg-gray-100'
                      }
                    `}
                  >
                    <Icon 
                      size={20} 
                      className={`
                        ${isActive ? 'text-white' : 'text-gray-600 group-active:text-blue-600'}
                      `}
                    />
                  </div>
                  
                  {/* Notification Badge */}
                  {showBadge && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-md">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </div>
                  )}

                  {item.label === "ZAi" && (
                     <div className="absolute -top-3 -right-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-sm z-10 tracking-wide">
                      BETA
                    </div>
                  )}
                </div>
                
                <span
                  className={`
                    text-[10px] font-medium mt-1 transition-colors duration-200
                    ${isActive ? 'text-blue-600' : 'text-gray-600 group-active:text-blue-600'}
                  `}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* Search/Post FAB */}
      <CreateProjectButton variant="floating" />
    </>
  );
}

