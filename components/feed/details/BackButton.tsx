"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

export function BackButton() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleBack = () => {
    // Try to go back in history, fallback to /feed if no history
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/feed");
    }
  };

  return (
    <button
      onClick={handleBack}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="
        relative overflow-hidden flex items-center gap-2 
        px-4 py-2 rounded-lg font-semibold text-sm 
        transition-all duration-300 
        bg-gradient-to-r from-gray-100 to-gray-200
        hover:from-gray-200 hover:to-gray-300
        text-gray-700 hover:text-gray-900
        shadow-md hover:shadow-lg
        transform hover:scale-105 active:scale-95
        group mb-6
      "
    >
      {/* Animated background pulse */}
      <span
        className={`
          absolute inset-0 bg-gray-300
          ${isHovered ? "animate-ping opacity-20" : "opacity-0"}
        `}
      />

      {/* Shimmer effect */}
      <span
        className={`
          absolute inset-0 -translate-x-full
          bg-gradient-to-r from-transparent via-white/40 to-transparent
          ${isHovered ? "animate-shimmer" : ""}
        `}
        style={{
          animation: isHovered ? "shimmer 2s infinite" : "none",
        }}
      />

      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        <ArrowLeft 
          size={16} 
          className={`
            transition-all duration-300
            ${isHovered ? "-translate-x-1" : ""}
          `}
          strokeWidth={2.5}
        />
        <span className="font-semibold">Back</span>
      </span>

      {/* Particle effect on hover */}
      {isHovered && (
        <>
          <span className="absolute top-1/4 left-1/4 w-1 h-1 bg-gray-400 rounded-full animate-particle-1" />
          <span className="absolute top-1/3 right-1/4 w-1 h-1 bg-gray-400 rounded-full animate-particle-2" />
          <span className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-gray-400 rounded-full animate-particle-3" />
        </>
      )}

     
    </button>
  );
}