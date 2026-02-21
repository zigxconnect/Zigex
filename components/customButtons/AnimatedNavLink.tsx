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
        "group relative flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
        isActive
          ? "bg-[#155DFC] text-white shadow-lg shadow-blue-500/20"
          : isSpecial
            ? "bg-[#155DFC]/5 border border-[#155DFC]/15 text-[#155DFC] hover:bg-[#155DFC] hover:text-white hover:border-transparent"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      )}
    >
      {/* Active background motion effect */}
      {isActive && (
        <motion.div
          layoutId="sidebar-active-bg"
          className="absolute inset-0 bg-[#155DFC] rounded-xl shadow-lg shadow-blue-500/25 -z-10"
          transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
        />
      )}
      {/* Icon Container */}
      <div
        className={cn(
          "relative flex items-center justify-center transition-all duration-300",
          isActive
            ? "text-white scale-105"
            : "text-slate-400 group-hover:text-[#155DFC] group-hover:scale-105"
        )}
      >
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
      </div>

      {/* Label */}
      <span className={cn(
        "flex-1 truncate tracking-tight transition-all duration-300",
        isActive 
          ? "font-bold text-white" 
          : "font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"
      )}>
        {label}
      </span>

      {/* Badge */}
      {badge && (
        <span
          className={cn(
            "px-2 py-0.5 text-[9px] font-bold rounded-lg transition-colors duration-200",
            isActive
              ? "bg-white/20 text-white"
              : "bg-[#155DFC] text-white"
          )}
        >
          {typeof badge === 'number' && badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}