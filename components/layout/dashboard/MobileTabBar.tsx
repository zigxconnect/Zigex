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
import { getUnreadCount } from "@/lib/api/notifications-client";

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
      label: "Explore",
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
      label: "Students",
      matchPaths: ["/dashboard/student", "/dashboard/student/"]
    },
    {
      href: "/dashboard/community",
      icon: MessageSquare,
      label: "Groups",
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
        const count = await getUnreadCount();
        if (mounted) setUnreadCount(count);
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
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#DCE5F5] bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="flex h-16 items-stretch">
        {tabItems.map((item: any) => {
          const Icon = item.icon;
          const isActive = isRouteActive(item.href, item.matchPaths, item.excludePaths);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                  isActive ? "text-[#155DFC]" : "text-[#7B869C] hover:text-[#0B1B3F]"
                )}
              >
                <span className={cn("flex h-7 w-12 items-center justify-center rounded-full", isActive && "bg-[#EEF3FF]")}>
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 2} aria-hidden="true" />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

