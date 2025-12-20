"use client";

import React from "react";
import { Star, GitFork, Activity, Trophy, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProjectGamificationProps {
  stars: number;
  forks: number;
  lastUpdate?: string; // ISO date string
}

export default function ProjectGamification({ stars, forks, lastUpdate }: ProjectGamificationProps) {
  // Simple "Gamification" Logic
  const momentumScore = Math.min((stars * 10) + (forks * 20), 100);
  const level = Math.floor(momentumScore / 20) + 1;
  
  let statusColor = "bg-blue-500";
  let statusText = "Rising Star";
  let statusIcon = <Zap className="w-5 h-5 text-yellow-400" />;

  if (momentumScore > 80) {
    statusColor = "bg-purple-500";
    statusText = "Legendary";
    statusIcon = <Trophy className="w-5 h-5 text-purple-200" />;
  } else if (momentumScore > 50) {
    statusColor = "bg-green-500";
    statusText = "Trending";
    statusIcon = <Activity className="w-5 h-5 text-green-200" />;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
           <Trophy className="w-5 h-5 text-yellow-500" /> Project Momentum
        </h3>
        <span className={`text-xs font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200`}>
           Lvl {level}
        </span>
      </div>

      {/* Main Health / Momentum Bar */}
      <div className="space-y-2 mb-6">
         <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1">
               {statusIcon} {statusText}
            </span>
            <span>{momentumScore}/100 XP</span>
         </div>
         <Progress value={momentumScore} className="h-3 bg-slate-100" />
         <p className="text-xs text-slate-400 text-right">Based on interaction metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
         <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-100 flex flex-col items-center justify-center text-center">
            <Star className="w-6 h-6 text-amber-500 mb-1 fill-amber-500" />
            <span className="text-2xl font-bold text-slate-800">{stars}</span>
            <span className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Stars</span>
         </div>

         <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 flex flex-col items-center justify-center text-center">
            <GitFork className="w-6 h-6 text-blue-500 mb-1" />
            <span className="text-2xl font-bold text-slate-800">{forks}</span>
            <span className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Forks</span>
         </div>
      </div>
    </div>
  );
}
