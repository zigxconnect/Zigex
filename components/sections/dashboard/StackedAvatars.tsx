"use client";

import React from "react";
import Image from "next/image";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
}

export default function StackedAvatars({ 
  avatars, 
  maxVisible = 3,
  moreCount = 0,
  onClick
}: { 
  avatars: AvatarProps[];
  maxVisible?: number;
  moreCount?: number;
  onClick?: () => void;
}) {
  const visibleAvatars = avatars.slice(0, maxVisible);
  const remainingCount = moreCount || (avatars.length - maxVisible);

  return (
    <button
      onClick={onClick}
      className="flex items-center -space-x-3 hover:space-x-1 transition-all duration-300 group"
      title="View similar profiles"
    >
      {visibleAvatars.map((avatar, i) => (
        <div
          key={i}
          className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden transform transition-transform group-hover:scale-110"
          style={{ zIndex: visibleAvatars.length - i }}
        >
          {avatar.src ? (
            <Image
              src={avatar.src}
              alt={avatar.name || "User"}
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          ) : (
            (avatar.name || "?").split(" ").map(n => n[0]).slice(0,2).join("")
          )}
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div 
          className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600 transform transition-transform group-hover:scale-110"
          style={{ zIndex: 0 }}
        >
          +{remainingCount}
        </div>
      )}
      
      <span className="ml-6 text-[12px] font-medium text-gray-600 group-hover:text-blue-600">
        Useful Connections
      </span>
    </button>
  );
}