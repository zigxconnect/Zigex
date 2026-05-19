// components/layout/dashboard/ProfileDropdown.tsx
"use client";

import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Shield,
  CreditCard,
  ExternalLink
} from "lucide-react";
import Image from "next/image";
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
        <div className="relative w-9 h-9 rounded-full overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800 shadow-sm transition-all duration-500 group-hover:ring-[#155DFC]/30">
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
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900" />
        </div>

        <div className="hidden sm:flex flex-col items-start gap-0">
          <span className="text-[11px] font-black text-slate-900 dark:text-white leading-none uppercase tracking-tighter">
            {userName}
          </span>
          <span className="text-[8px] font-bold text-[#155DFC] uppercase tracking-widest mt-0.5">
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
            className="absolute right-0 top-full mt-4 w-60 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-[20px_40px_80px_rgba(0,0,0,0.15)] z-[100] rounded-none overflow-hidden"
          >
            {/* Header info */}
            <div className="px-6 py-5 border-b border-slate-50 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-900/10">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated As</p>
              <p className="text-xs font-black text-slate-900 dark:text-white truncate">{userName}</p>
            </div>

            <div className="py-2">
              {menuItems.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-6 py-3 text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-[#155DFC] transition-all uppercase tracking-tight"
                >
                  <item.icon size={14} className="shrink-0" />
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="border-t border-slate-50 dark:border-slate-900 mt-2">
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
