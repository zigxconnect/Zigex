"use client";

import { Menu, Bell, Briefcase, Newspaper, MessageSquare, Layout } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { NotificationDropdown } from "./NotificationDropdown";
import { Logo } from "@/components/layout/Logo";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import NameInitials from "@/components/NameInitials";
import { slugifyUsername, cn } from "@/lib/utils";

interface DashboardHeaderProps {
  user?: any;
  onMenuClick: () => void;
}

export const DashboardHeader = ({
  user,
  onMenuClick,
}: DashboardHeaderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const userName = user?.name || user?.profile?.name || "Guest User";
  const userRole = user?.role || user?.profile?.role || "Student";
  const userAvatar =
    user?.avatar ||
    user?.profile?.avatar_url ||
    user?.avatarUrl

  const middleNavItems = [
    ...(user?.permissions?.isSupervisor ? [{ href: "/supervisor", label: "Supervisor", icon: Newspaper }] : []),
    { href: "/dashboard/community", label: "Community", icon: MessageSquare },
    ...(user?.permissions?.isIntern ? [{ href: "/intern/workspace", label: "Workspace", icon: Briefcase }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3 max-w-full mx-auto">
        {/* Left Side - Mobile Menu & Logo */}
        <div className="flex items-center gap-3 lg:gap-4 flex-1">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-muted text-muted-foreground hover:text-primary rounded-xl transition-colors lg:hidden flex-shrink-0"
            aria-label="Toggle menu"
          >
            <Menu size={22} />
          </button>

          {/* Logo/Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 group flex-shrink-0"
          >
            <div className="relative w-10 h-10 lg:w-12 lg:h-12 transition-transform group-hover:scale-105">
              <Logo className="w-full h-full" />
            </div>
          </Link>
        </div>

        {/* Middle Section - Desktop Navigation */}
        <nav className="hidden xl:flex items-center justify-center gap-2 flex-1">
          {middleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300",
                  isActive 
                    ? "bg-primary text-white shadow-md shadow-primary/25" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon size={18} className={cn(isActive ? "text-white" : "text-muted-foreground group-hover:text-primary")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Side - Notifications, User & Logout */}
        <div className="flex items-center gap-3 lg:gap-4 flex-1 justify-end">
          {/* Notifications Dropdown */}
          <div className="flex-shrink-0">
            <NotificationDropdown />
          </div>

          {/* User Profile */}
          <Link
            href={`/profile/${slugifyUsername(user?.profile?.username) || ""}`}
            className="flex items-center gap-3 pl-2 lg:pl-3 border-l-2 border-border flex-shrink-0 group"
          >
            <div className="relative w-9 h-9 lg:w-10 lg:h-10 rounded-full border-2 border-background ring-2 ring-muted group-hover:ring-primary/30 shadow-sm overflow-hidden transition-all duration-300">
              {userAvatar ? (
                <Image
                  src={userAvatar}
                  alt={userName}
                  fill
                  className="object-cover"
                />
              ) : (
                <NameInitials name={userName} />
              )}
            </div>
            <div className="hidden md:flex flex-col">
              <p className="text-sm font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                {userName}
              </p>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide leading-tight">{userRole}</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};
