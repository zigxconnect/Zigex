"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

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
    <>
      <Link
        href={href}
        onClick={onClick}
        className={`
          group relative overflow-hidden flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300
          ${
            isSpecial
              ? // Special styling for AI Chat
                isActive
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg hover:shadow-xl"
                : "bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 hover:border-blue-300 shadow-sm"
              : // Regular styling for other items
                isActive
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg hover:shadow-xl"
                : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
          }
          transform hover:scale-[1.02] active:scale-[0.98]
        `}
      >
        {/* Animated background pulse on hover */}
        <span
          className={`
            absolute inset-0 
            ${isActive ? "bg-blue-500" : isSpecial ? "bg-blue-100" : "bg-blue-50"}
            opacity-0 group-hover:opacity-20 transition-opacity duration-300
            ${!isActive && "group-hover:animate-pulse-slow"}
          `}
        />

        {/* Shimmer effect on hover */}
        <span
          className={`
            absolute inset-0 -translate-x-full
            bg-gradient-to-r from-transparent via-white/30 to-transparent
            group-hover:animate-shimmer
          `}
        />

        {/* Icon Container */}
        <div
          className={`
            relative z-10 p-2 rounded-lg transition-all duration-300 flex-shrink-0
            ${
              isSpecial
                ? isActive
                  ? "bg-white/20 group-hover:bg-white/30"
                  : "bg-blue-50 group-hover:bg-blue-100 group-hover:scale-110"
                : isActive
                  ? "bg-blue-700 group-hover:bg-blue-800"
                  : "bg-gray-100 group-hover:bg-blue-50 group-hover:scale-110"
            }
          `}
        >
          <Icon
            size={18}
            className={`
              transition-all duration-300
              ${
                isSpecial
                  ? isActive
                    ? "text-white group-hover:rotate-12"
                    : "text-blue-600 group-hover:text-blue-700 group-hover:rotate-12"
                  : isActive
                    ? "text-white group-hover:rotate-12"
                    : "text-gray-600 group-hover:text-blue-600 group-hover:rotate-12"
              }
            `}
          />
        </div>

        {/* Label */}
        <span className="relative z-10 flex-1 truncate font-medium">
          {label}
        </span>

        {/* Badge */}
        {badge && (
          <span
            className={`
              relative z-10 px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0
              transition-all duration-300 transform
              ${
                isActive
                  ? "bg-white/20 text-white group-hover:scale-110"
                  : "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110"
              }
            `}
          >
            {typeof badge === 'number' && badge > 99 ? '99+' : badge}
          </span>
        )}

        {/* Particle effects on hover */}
        <span className="absolute top-1/4 left-1/4 w-1 h-1 bg-white/40 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-particle-1" />
        <span className="absolute top-1/4 right-1/4 w-1 h-1 bg-white/40 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-particle-2" />
        <span className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-white/40 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-particle-3" />

        {/* Bottom border shine effect */}
        <span
          className={`
            absolute bottom-0 left-0 right-0 h-0.5
            ${isActive ? "bg-white/50" : "bg-blue-500"}
            transform scale-x-0 group-hover:scale-x-100
            transition-transform duration-300 origin-left
          `}
        />
      </Link>

      {/* Scoped Styles */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.4;
          }
        }

        @keyframes particle-1 {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-20px, -20px) scale(0);
            opacity: 0;
          }
        }

        @keyframes particle-2 {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(20px, -20px) scale(0);
            opacity: 0;
          }
        }

        @keyframes particle-3 {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(10px, 20px) scale(0);
            opacity: 0;
          }
        }

        :global(.animate-shimmer) {
          animation: shimmer 2s infinite;
        }

        :global(.animate-pulse-slow) {
          animation: pulse-slow 2s ease-in-out infinite;
        }

        :global(.animate-particle-1) {
          animation: particle-1 0.8s ease-out forwards;
        }

        :global(.animate-particle-2) {
          animation: particle-2 0.8s ease-out forwards;
          animation-delay: 0.1s;
        }

        :global(.animate-particle-3) {
          animation: particle-3 0.8s ease-out forwards;
          animation-delay: 0.2s;
        }
      `}</style>
    </>
  );
}