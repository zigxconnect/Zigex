"use client";

import { cn } from "@/lib/utils";
import { addWeeks, eachDayOfInterval, endOfWeek, format, getDay, isSameDay, startOfWeek, subWeeks } from "date-fns";
import React, { useMemo } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Activity, BarChart3 } from "lucide-react";

interface InternActivityGraphProps {
  logs: any[];
}

export function InternActivityGraph({ logs }: InternActivityGraphProps) {
  // Use useMemo to avoid recalculating on every render
  const { weeks, days } = useMemo(() => {
    const today = new Date();
    // Show last 20 weeks (approx 5 months)
    const weeksToDisplay = 20; 
    const startDate = startOfWeek(subWeeks(today, weeksToDisplay)); 
    const endDate = endOfWeek(today); 
    
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    // Group into weeks for column-based layout
    const weeksData: Date[][] = [];
    let currentWeek: Date[] = [];
    
    allDays.forEach(day => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeksData.push(currentWeek);
        currentWeek = [];
      }
    });

    return { weeks: weeksData, days: allDays };
  }, []);

  const getColor = (date: Date) => {
    // Find logs for this specific date
    const dayLogs = (logs || []).filter(log => {
        const logDate = new Date(log.log_date);
        return isSameDay(logDate, date);
    });
    
    const count = dayLogs.length; 
    
    if (count === 0) return "bg-slate-100 dark:bg-slate-800/40";
    if (count === 1) return "bg-blue-200 dark:bg-blue-900/60";
    if (count === 2) return "bg-blue-400 dark:bg-blue-700/80";
    if (count >= 3) return "bg-blue-600 dark:bg-blue-500";
    return "bg-slate-100 dark:bg-slate-800/40";
  };

  return (
    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm overflow-hidden relative group">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-6">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
              <BarChart3 size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Performance History</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Real-time activity tracking over 5 months</p>
            </div>
         </div>
         
         <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Activity Intensity</span>
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-slate-100 dark:bg-slate-800/40" />
              <div className="w-2.5 h-2.5 rounded-sm bg-blue-200 dark:bg-blue-900/60" />
              <div className="w-2.5 h-2.5 rounded-sm bg-blue-400 dark:bg-blue-700/80" />
              <div className="w-2.5 h-2.5 rounded-sm bg-blue-600 dark:bg-blue-500" />
            </div>
         </div>
      </div>
      
      {/* Graph Overflow Container */}
      <div className="w-full overflow-x-auto pb-4 hide-scrollbar">
        <div className="flex gap-1.5 min-w-max">
            {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1.5">
                {week.map((day, dIdx) => {
                    const contributionCount = (logs || []).filter(l => isSameDay(new Date(l.log_date), day)).length;
                    return (
                        <TooltipProvider key={day.toISOString()}>
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <div 
                                    className={cn(
                                    "w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[2px] transition-all hover:scale-125 hover:z-20 cursor-crosshair",
                                    getColor(day)
                                    )}
                                />
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-900 text-white border-slate-800 px-3 py-2 rounded-xl shadow-2xl">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{format(day, "EEEE, MMM dd")}</p>
                                <p className="text-xs font-black text-white">{contributionCount} {contributionCount === 1 ? 'Activity Log' : 'Activity Logs'}</p>
                            </TooltipContent>
                        </Tooltip>
                        </TooltipProvider>
                    );
                })}
            </div>
            ))}
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-900 flex items-center justify-between">
         <div className="flex items-center gap-6">
            <div className="flex flex-col">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Reports</span>
               <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{logs.length} Logs</span>
            </div>
            <div className="w-px h-6 bg-slate-100 dark:bg-slate-800" />
            <div className="flex flex-col">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Consistency</span>
               <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                 {Math.round((logs.length / days.length) * 100)}%
               </span>
            </div>
         </div>
         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Verified by Zila Intelligence</p>
      </div>
    </div>
  );
}
