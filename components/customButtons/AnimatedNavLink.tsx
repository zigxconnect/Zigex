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
        "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
          : isSpecial
            ? "bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-md hover:border-primary transition-all duration-300"
            : "text-muted-foreground hover:bg-muted hover:text-foreground hover:shadow-sm"
      )}
    >
      {/* Icon Container */}
      <div
        className={cn(
          "relative flex items-center justify-center p-1.5 rounded-lg transition-colors duration-200",
          isActive
            ? "bg-white/20 text-white"
            : isSpecial
              ? "bg-primary/10 text-primary group-hover:bg-white/20 group-hover:text-white"
              : "bg-transparent text-muted-foreground group-hover:text-primary group-hover:bg-background"
        )}
      >
        <Icon size={18} strokeWidth={2} />
      </div>

      {/* Label */}
      <span className="flex-1 truncate font-medium">{label}</span>

      {/* Badge */}
      {badge && (
        <span
          className={cn(
            "px-2 py-0.5 text-[10px] font-bold rounded-full",
            isActive
              ? "bg-white/20 text-white"
              : "bg-muted text-primary"
          )}
        >
          {typeof badge === 'number' && badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}