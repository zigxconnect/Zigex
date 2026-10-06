"use client";

import React, { useState, useTransition } from "react";
import { toggleFollow } from "@/lib/actions/gamification.action";
import { UserPlus, UserMinus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  targetProfileId: string;
  initialIsFollowing: boolean;
  isSupervisor?: boolean;
}

export function FollowButton({ targetProfileId, initialIsFollowing, isSupervisor }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, startTransition] = useTransition();

  const handleFollow = () => {
    // Optimistic UI update
    const nextState = !isFollowing;
    setIsFollowing(nextState);

    startTransition(async () => {
      const res = await toggleFollow(targetProfileId);
      if (!res.success) {
        // Rollback on error
        setIsFollowing(!nextState);
      }
    });
  };

  return (
    <button
      onClick={handleFollow}
      disabled={isPending}
      className={cn(
        "px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95 disabled:opacity-70",
        isFollowing
          ? "bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700"
          : "bg-[#155DFC] text-white hover:bg-blue-700 shadow-blue-500/10 hover:shadow-md hover:-translate-y-0.5"
      )}
    >
      {isFollowing ? (
        <>
          <UserMinus size={12} />
          <span>Unfollow</span>
        </>
      ) : (
        <>
          <UserPlus size={12} />
          <span>{isSupervisor ? "Follow Supervisor" : "Follow Student"}</span>
        </>
      )}
    </button>
  );
}
