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
        bg-muted
        hover:bg-muted/80
        text-foreground
        shadow-sm hover:shadow-md
        transform hover:scale-105 active:scale-95
        group mb-6
      "
    >
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
    </button>
  );
}