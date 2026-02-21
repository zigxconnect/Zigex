"use client";

import { cn } from "@/lib/utils";
import { addWeeks, eachDayOfInterval, endOfWeek, format, getDay, isSameDay, startOfWeek, subWeeks } from "date-fns";
import React, { useMemo } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Activity } from "lucide-react";

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
    
    if (count === 0) return "bg-slate-100 dark:bg-slate-800/50";
    if (count === 1) return "bg-blue-300 dark:bg-blue-800";
    if (count === 2) return "bg-blue-500 dark:bg-blue-600";
    return "bg-blue-700 dark:bg-blue-500";
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 sm:p-10 shadow-sm overflow-hidden relative group">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 dark:bg-blue-600/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 group-hover:bg-blue-500/10 transition-colors duration-500" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-6">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
              <Activity size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Deployment Activity</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Operational history • Last 5 Months</p>
            </div>
         </div>
         
         <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Intensity Marker</span>
            <div className="flex gap-1 ml-2">
              <div className="w-2.5 h-2.5 rounded-sm bg-slate-100 dark:bg-slate-800/50" />
              <div className="w-2.5 h-2.5 rounded-sm bg-blue-300 dark:bg-blue-800" />
              <div className="w-2.5 h-2.5 rounded-sm bg-blue-500 dark:bg-blue-600" />
              <div className="w-2.5 h-2.5 rounded-sm bg-blue-700 dark:bg-blue-500" />
            </div>
         </div>
      </div>
      
      {/* Graph Overflow Container */}
      <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex gap-1.5 min-w-max">
            {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1.5">
                {week.map((day, dIdx) => {
                    const contributionCount = (logs || []).filter(l => isSameDay(new Date(l.log_date), day)).length;
                    return (
                        <TooltipProvider key={day.toISOString()}>
                        <Tooltip delayDuration={100}>
                            <TooltipTrigger asChild>
                                <div 
                                    className={cn(
                                    "w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 rounded-[3px] transition-all hover:scale-125 hover:ring-2 hover:ring-blue-400 dark:hover:ring-blue-500 relative z-10",
                                    getColor(day)
                                    )}
                                />
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-900 text-white border-0 px-3 py-1.5 rounded-lg shadow-2xl">
                                <div className="text-[10px] font-black uppercase tracking-widest mb-1">{format(day, "MMM dd, yyyy")}</div>
                                <div className="text-xs font-bold text-blue-400">{contributionCount} Logs Captured</div>
                            </TooltipContent>
                        </Tooltip>
                        </TooltipProvider>
                    );
                })}
            </div>
            ))}
        </div>
      </div>
    </div>
  );
}
