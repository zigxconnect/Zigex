"use client";

import Link from "next/link";
import { Linkedin, MessageCircle } from "lucide-react";

interface AnimatedConnectButtonsProps {
  linkedinUrl?: string | null;
  whatsappUrl?: string | null;
}

export default function AnimatedConnectButtons({
  linkedinUrl,
  whatsappUrl,
}: AnimatedConnectButtonsProps) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {/* LinkedIn Connect Button */}
        {linkedinUrl ? (
          <Link
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0A66C2] to-[#004182] text-white text-sm font-semibold rounded-lg shadow-lg shadow-[#0A66C2]/30 hover:shadow-xl hover:shadow-[#0A66C2]/40 transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            {/* Animated background pulse */}
            <span className="absolute inset-0 bg-[#0A66C2] opacity-0 group-hover:opacity-20 group-hover:animate-ping" />

            {/* Shimmer effect */}
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-shimmer" />

            {/* Content */}
            <span className="relative z-10 flex items-center gap-2">
              <Linkedin size={16} className="group-hover:animate-bounce" />
              <span className="hidden sm:inline">LinkedIn</span>
            </span>

            {/* Particle effects */}
            <span className="absolute top-0 left-1/4 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-particle-1" />
            <span className="absolute top-0 right-1/4 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-particle-2" />
            <span className="absolute bottom-0 left-1/3 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-particle-3" />
          </Link>
        ) : (
          <button
            disabled
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-400 text-sm font-semibold rounded-lg cursor-not-allowed"
          >
            <Linkedin size={16} />
            <span className="hidden sm:inline">LinkedIn</span>
          </button>
        )}

        {/* WhatsApp Message Button */}
        {whatsappUrl ? (
          <Link
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#25D366] to-[#1da851] text-white text-sm font-semibold rounded-lg shadow-lg shadow-[#25D366]/30 hover:shadow-xl hover:shadow-[#25D366]/40 transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            {/* Animated background pulse */}
            <span className="absolute inset-0 bg-[#25D366] opacity-0 group-hover:opacity-20 group-hover:animate-ping" />

            {/* Shimmer effect */}
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-shimmer" />

            {/* Content */}
            <span className="relative z-10 flex items-center gap-2">
              <MessageCircle size={16} className="group-hover:animate-wiggle" />
              <span className="hidden sm:inline">WhatsApp</span>
            </span>

            {/* Particle effects */}
            <span className="absolute top-0 left-1/4 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-particle-1" />
            <span className="absolute top-0 right-1/4 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-particle-2" />
            <span className="absolute bottom-0 left-1/3 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-particle-3" />
          </Link>
        ) : (
          <button
            disabled
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-400 text-sm font-semibold rounded-lg cursor-not-allowed"
          >
            <MessageCircle size={16} />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>
        )}
      </div>

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

        @keyframes wiggle {
          0%,
          100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-10deg);
          }
          75% {
            transform: rotate(10deg);
          }
        }

        @keyframes particle-1 {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-10px, -20px) scale(0);
            opacity: 0;
          }
        }

        @keyframes particle-2 {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(10px, -20px) scale(0);
            opacity: 0;
          }
        }

        @keyframes particle-3 {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(5px, 20px) scale(0);
            opacity: 0;
          }
        }

        :global(.animate-shimmer) {
          animation: shimmer 2s infinite;
        }

        :global(.animate-wiggle) {
          animation: wiggle 0.5s ease-in-out;
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