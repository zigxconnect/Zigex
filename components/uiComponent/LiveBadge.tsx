"use client";

import React from "react";

export const LiveBadge: React.FC<{
  onClick?: () => void;
  className?: string;
}> = ({ onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      aria-label="Live video"
      className={"flex items-center gap-2 bg-black/60 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md backdrop-blur-sm " + className}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 animate-ping" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
      </span>
       Click to watch live
    </button>
  );
};

export default LiveBadge;
