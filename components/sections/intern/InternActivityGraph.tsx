"use client";

import { cn } from "@/lib/utils";
import { addWeeks, eachDayOfInterval, endOfWeek, format, getDay, isSameDay, startOfWeek, subWeeks } from "date-fns";
import React, { useMemo } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
    // Note: logs date format in DB is typically YYYY-MM-DD string
    const dayLogs = logs.filter(log => {
        const logDate = new Date(log.log_date);
        return isSameDay(logDate, date);
    });
    
    const count = dayLogs.length; 
    
    // Zigex Blue Scale
    if (count === 0) return "bg-slate-100 dark:bg-slate-800/50";
    if (count === 1) return "bg-blue-300 dark:bg-blue-800";
    if (count === 2) return "bg-blue-500 dark:bg-blue-600";
    return "bg-blue-700 dark:bg-blue-500";
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-blue-50 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
         <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Activity Log</h3>
            <p className="text-sm text-slate-500 font-medium">Your contribution history over the last 5 months</p>
         </div>
      </div>
      
      {/* Graph Overflow Container */}
      <div className="w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
        <div className="flex gap-1 min-w-max mx-auto sm:mx-0">
            {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1">
                {week.map((day, dIdx) => {
                    const contributionCount = logs.filter(l => isSameDay(new Date(l.log_date), day)).length;
                    return (
                        <TooltipProvider key={day.toISOString()}>
                        <Tooltip delayDuration={100}>
                            <TooltipTrigger asChild>
                                <div 
                                    className={cn(
                                    "w-3 h-3 sm:w-4 sm:h-4 rounded-[2px] transition-colors hover:ring-2 hover:ring-blue-200 dark:hover:ring-blue-900",
                                    getColor(day)
                                    )}
                                />
                            </TooltipTrigger>
                            <TooltipContent className="text-xs font-semibold">
                                {contributionCount} logs on {format(day, "MMM dd, yyyy")}
                            </TooltipContent>
                        </Tooltip>
                        </TooltipProvider>
                    );
                })}
            </div>
            ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-end gap-2 text-xs text-slate-400 mt-2 font-medium">
           <span>Less</span>
           <div className="flex gap-1">
             <div className="w-3 h-3 rounded-[2px] bg-slate-100 dark:bg-slate-800/50" />
             <div className="w-3 h-3 rounded-[2px] bg-blue-300 dark:bg-blue-800" />
             <div className="w-3 h-3 rounded-[2px] bg-blue-500 dark:bg-blue-600" />
             <div className="w-3 h-3 rounded-[2px] bg-blue-700 dark:bg-blue-500" />
           </div>
           <span>More</span>
      </div>
    </div>
  );
}
