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
import { AiOutlineWechat } from "react-icons/ai";
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
      href: "/intern/workspace",
      icon: Briefcase,
      label: "Workspace",
     
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
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border lg:hidden z-50 safe-area-bottom">
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
                    className={cn(
                      "p-2.5 rounded-2xl transition-all duration-200 active:scale-90 flex items-center justify-center relative",
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                        : "text-slate-400 group-active:bg-slate-100"
                    )}
                  >
                    <Icon
                      size={24}
                      strokeWidth={isActive ? 2.5 : 2}
                      className="transition-transform duration-200"
                    />
                  </div>

                  {/* Notification Badge */}
                  {showBadge && (
                    <div className="absolute -top-1 -right-1 bg-white text-blue-600 text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-md border border-blue-600">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </div>
                  )}
                </div>

                <span
                  className={cn(
                    "text-[10px] font-semibold tracking-tight mt-1 transition-all duration-200",
                    isActive 
                      ? "text-blue-600 dark:text-blue-400 font-bold" 
                      : "text-slate-400"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

