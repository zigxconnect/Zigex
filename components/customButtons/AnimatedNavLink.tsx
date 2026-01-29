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
          ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
          : isSpecial
            ? "bg-blue-500/10 border border-blue-500/20 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-transparent"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      )}
    >
      {/* Active background motion effect */}
      {isActive && (
        <motion.div
          layoutId="sidebar-active-bg"
          className="absolute inset-0 bg-blue-600 rounded-full -z-10"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      {/* Icon Container */}
      <div
        className={cn(
          "relative flex items-center justify-center transition-all duration-200",
          isActive
            ? "text-white scale-110"
            : "text-slate-400 group-hover:text-blue-600 group-hover:scale-110"
        )}
      >
        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
      </div>

      {/* Label */}
      <span className={cn(
        "flex-1 truncate tracking-tight transition-all duration-200",
        isActive 
          ? "font-black text-white" 
          : "font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200"
      )}>
        {label}
      </span>

      {/* Badge */}
      {badge && (
        <span
          className={cn(
            "px-2 py-0.5 text-[10px] font-bold rounded-full transition-colors duration-200",
            isActive
              ? "bg-white text-blue-600"
              : "bg-blue-600 text-white"
          )}
        >
          {typeof badge === 'number' && badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}