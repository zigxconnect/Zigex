// components/layout/dashboard/ProfileDropdown.tsx
"use client";

import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Shield,
  CreditCard,
  ExternalLink,
  Sun,
  Moon
} from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn, slugifyUsername } from "@/lib/utils";
import NameInitials from "@/components/NameInitials";

interface ProfileDropdownProps {
  user: any;
}

export const ProfileDropdown = ({ user }: ProfileDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userName = user?.name || user?.profile?.name || "Guest User";
  const userAvatar = user?.avatar || user?.profile?.avatar_url || user?.avatarUrl;
  const username = user?.profile?.username || user?.username || "";
  const role = user?.role || user?.profile?.role || "Student";
  const profileUrl = `/profile/${slugifyUsername(username) || ""}`;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { label: "My Profile", icon: User, href: profileUrl },
    { label: "Security", icon: Shield, href: "/settings/security" },
    { label: "Settings", icon: Settings, href: "/settings" },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "group relative flex items-center gap-3 cursor-pointer p-1 rounded-none bg-transparent transition-all duration-300 outline-none",
          isOpen ? "opacity-100" : "hover:opacity-80"
        )}
      >
        <div className="relative w-9 h-9 rounded-full overflow-hidden ring-1 ring-border shadow-sm transition-all duration-500 group-hover:ring-[#155DFC]/30">
          {userAvatar ? (
            <Image
              src={userAvatar}
              alt={userName}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <NameInitials name={userName} />
          )}
          {/* Status Dot */}
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-background" />
        </div>

        <div className="hidden sm:flex flex-col items-start gap-0">
          <span className="text-[11px] font-black text-slate-900 dark:text-white leading-none uppercase tracking-tighter">
            {userName}
          </span>
          <span className="text-[8px] font-bold text-[#155DFC] dark:text-slate-300 uppercase tracking-widest mt-0.5">
            {role}
          </span>
        </div>

        <ChevronDown
          size={12}
          strokeWidth={3}
          className={cn(
            "text-slate-300 transition-transform duration-500 ml-1",
            isOpen ? "rotate-180 text-[#155DFC]" : ""
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-4 w-60 bg-card border border-border shadow-[20px_40px_80px_rgba(0,0,0,0.15)] dark:shadow-none z-[100] rounded-2xl overflow-hidden"
          >
            {/* Header info */}
            <div className="px-6 py-5 border-b border-border bg-muted/20">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated As</p>
              <p className="text-xs font-black text-slate-900 dark:text-white truncate">{userName}</p>
            </div>

            <div className="py-2">
              {menuItems.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-6 py-3 text-[11px] font-bold text-muted-foreground hover:bg-muted/50 hover:text-[#155DFC] transition-all uppercase tracking-tight"
                >
                  <item.icon size={14} className="shrink-0" />
                  {item.label}
                </Link>
              ))}

              {mounted && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="w-full flex items-center justify-between px-6 py-3 text-[11px] font-bold text-muted-foreground hover:bg-muted/50 hover:text-[#155DFC] transition-all uppercase tracking-tight cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {theme === "dark" ? (
                      <Moon size={14} className="shrink-0 text-amber-500" />
                    ) : (
                      <Sun size={14} className="shrink-0 text-amber-500" />
                    )}
                    <span>Theme: {theme === "dark" ? "Dark" : "Light"}</span>
                  </div>
                  {/* Premium Switch Indicator */}
                  <div className="w-8 h-4.5 rounded-full bg-slate-200 dark:bg-slate-700 p-0.5 transition-colors duration-300 relative flex items-center">
                    <div
                      className={cn(
                        "w-3.5 h-3.5 rounded-full bg-white dark:bg-[#155DFC] shadow-sm transform duration-300 ease-out",
                        theme === "dark" ? "translate-x-3.5" : "translate-x-0"
                      )}
                    />
                  </div>
                </button>
              )}
            </div>

            <div className="border-t border-border mt-2">
              <button
                className="w-full flex items-center gap-3 px-6 py-4 text-[11px] font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all uppercase tracking-widest"
                onClick={() => {
                  // Add logout logic
                  setIsOpen(false);
                }}
              >
                <LogOut size={14} strokeWidth={3} />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
