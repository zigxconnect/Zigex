"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedNavLinkProps {
  href: string;
  icon: LucideIcon;
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
        "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
        isActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/25 active:scale-95"
          : isSpecial
            ? "bg-sidebar-accent/50 border border-sidebar-border text-sidebar-primary hover:bg-sidebar-primary hover:text-sidebar-primary-foreground hover:shadow-lg hover:border-transparent transition-all duration-300 active:scale-95"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground hover:shadow-sm"
      )}
    >
      {/* Icon Container */}
      <div
        className={cn(
          "relative flex items-center justify-center p-2 rounded-lg transition-all duration-300",
          isActive
            ? "bg-white/10 text-white backdrop-blur-md shadow-inner"
            : isSpecial
              ? "bg-sidebar-primary/10 text-sidebar-primary group-hover:bg-white/20 group-hover:text-white group-hover:scale-110"
              : "bg-sidebar-accent/50 text-sidebar-foreground/60 group-hover:text-sidebar-primary group-hover:bg-sidebar-primary/10 group-hover:scale-110"
        )}
      >
        <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
      </div>

      {/* Label */}
      <span className={cn(
        "flex-1 truncate font-semibold tracking-tight transition-colors duration-200",
        isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground"
      )}>
        {label}
      </span>

      {/* Badge */}
      {badge && (
        <span
          className={cn(
            "px-2 py-0.5 text-[10px] font-bold rounded-full transition-colors duration-200",
            isActive
              ? "bg-white/20 text-white"
              : "bg-sidebar-accent text-sidebar-primary"
          )}
        >
          {typeof badge === 'number' && badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}