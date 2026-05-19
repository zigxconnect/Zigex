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
  Globe,
  LogOut,
  BrainCircuit,
  MessageSquare,
  Newspaper,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
    {
      href: "/feed",
      icon: Globe,
      label: "Browse",
      matchPaths: ["/feed", "/feed/", "/programs/"],
      excludePaths: ["/feed/projects"]
    },
    {
      href: "/student/workspace",
      icon: Briefcase,
      label: "Workspace",
      matchPaths: ["/student/workspace/"]
    },
     {
              href: "/dashboard/blog",
              icon: Newspaper,
              label: "News",
              matchPaths: ["/dashboard/blog", "/dashboard/blog/"],
            },
    {
      href: "/dashboard/student",
      icon: Users,
      label: "ZigX",
      matchPaths: ["/dashboard/student", "/dashboard/student/"]
    },
    {
      href: "/dashboard/community",
      icon: MessageSquare,
      label: "Group",
      matchPaths: ["/dashboard/community", "/dashboard/community/"]
    },
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
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 lg:hidden z-50 safe-area-bottom shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around px-2 py-3">
          {tabItems.map((item: any) => {
            const Icon = item.icon;
            const isActive = isRouteActive(item.href, item.matchPaths, item.excludePaths);
            const showBadge = item.href === "/notifications" && unreadCount > 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center flex-1 py-1 transition-all duration-300",
                  isActive ? "text-blue-600" : "text-slate-400"
                )}
              >
                <div className="relative p-2.5 z-10 flex flex-col items-center">
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 3 : 2.5}
                    className={cn(
                      "transition-all duration-300",
                      isActive 
                        ? "text-white scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" 
                        : "text-blue-500/70"
                    )}
                  />
                  
                  {isActive && (
                    <motion.div
                      layoutId="mobile-tab-pill"
                      className="absolute inset-0 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30 -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </div>

                <span className={cn(
                  "text-[9px] font-bold tracking-tight mt-1 transition-all duration-300",
                  isActive ? "text-blue-600 dark:text-blue-500" : "text-slate-500"
                )}>
                  {item.label}
                </span>

                {/* Notification Badge */}
                {showBadge && (
                  <div className="absolute top-1 right-1/2 translate-x-4 bg-rose-500 text-white text-[9px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg border-2 border-white ring-4 ring-blue-50/10 z-20">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

