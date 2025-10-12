"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  User,
  Upload,
  Briefcase,
  Users,
  Bell,
} from "lucide-react";
import { AiOutlineWechat } from "react-icons/ai";
import { useState, useEffect } from "react";

interface MobileTabBarProps {
  user: any;
}

const tabItems = [
  { href: "/dashboard", icon: User, label: "Profile" },
  { href: "/dashboard/applied-intenships", icon: Briefcase, label: "Applied" },
  { href: "/dashboard/fupro-ai", icon: AiOutlineWechat, label: "AI Chat", isSpecial: true },
  { href: "/dashboard/student-directory", icon: Users, label: "Students" },
  { href: "/notifications", icon: Bell, label: "Alerts" },
];

export function MobileTabBar({ user }: MobileTabBarProps) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const isRouteActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  // Fetch unread notifications count
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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-50 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {tabItems.map((item) => {
          const Icon = item.icon;
          const isActive = isRouteActive(item.href);
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
  );
}