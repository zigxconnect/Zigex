"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AnimatedNavLinkProps {
  href: string;
  icon: any;
  label: string;
  isActive: boolean;
  onClick?: () => void;
  badge?: number | string;
  isSpecial?: boolean;
}

export default function AnimatedNavLink({
  href,
  icon: Icon,
  label,
  isActive,
  onClick,
  badge,
  isSpecial = false,
}: AnimatedNavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-4 px-4 py-3 rounded-full text-[15px] font-medium transition-all duration-200",
        isActive
          ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
          : isSpecial
            ? "bg-sidebar-accent/50 border border-sidebar-border text-sidebar-primary hover:bg-blue-50 hover:text-blue-600 hover:border-transparent"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      )}
    >
      {/* Icon Container */}
      <div
        className={cn(
          "relative flex items-center justify-center transition-all duration-200",
          isActive
            ? "text-blue-600 dark:text-blue-400 scale-110"
            : "text-slate-400 group-hover:text-blue-600 group-hover:scale-110"
        )}
      >
        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
      </div>

      {/* Label */}
      <span className={cn(
        "flex-1 truncate tracking-tight transition-all duration-200",
        isActive 
          ? "font-black" 
          : "font-medium"
      )}>
        {label}
      </span>

      {/* Badge */}
      {badge && (
        <span
          className={cn(
            "px-2 py-0.5 text-[10px] font-bold rounded-full transition-colors duration-200",
            isActive
              ? "bg-blue-600 text-white"
              : "bg-slate-200 text-slate-600"
          )}
        >
          {typeof badge === 'number' && badge > 99 ? '99+' : badge}
        </span>
      )}

      {/* Twitter-style active indicator indicator (optional, but clean) */}
      {isActive && (
        <motion.div 
          layoutId="sidebar-active"
          className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
    </Link>
  );
}