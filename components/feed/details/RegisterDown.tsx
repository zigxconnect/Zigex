"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDown } from "lucide-react";

export function RegisterGoDown({ href, label }: { href: string; label?: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={"#"+href}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="
        relative overflow-hidden flex items-center gap-2 
        px-4 py-2 rounded-lg font-semibold text-sm 
        transition-all duration-300 
        bg-primary
        hover:bg-secondary
        text-white
        shadow-md hover:shadow-lg
        transform hover:scale-105 active:scale-95
        group mb-6
      "
    >
      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        <span className="font-semibold">{label || "Register"}</span>
        <ArrowDown
          size={16}
          className={`
            transition-all duration-300
            ${isHovered ? "-translate-y-1" : ""}
          `}
          strokeWidth={2.5}
        />
      </span>
    </Link>
  );
}
