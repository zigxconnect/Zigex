"use client";

import { cn } from "@/lib/utils";
import { addWeeks, eachDayOfInterval, endOfWeek, format, getDay, isSameDay, startOfWeek, subWeeks } from "date-fns";
import React, { useMemo } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ActiveInternshipActivityGraphProps {
  logs: { id: string; log_date: string }[];
}

export function ActiveInternshipActivityGraph({ logs }: ActiveInternshipActivityGraphProps) {
  const { weeks } = useMemo(() => {
    const today = new Date();
    const weeksToDisplay = 16; // ~4 months
    const startDate = startOfWeek(subWeeks(today, weeksToDisplay)); 
    const endDate = endOfWeek(today); 
    
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    const weeksData: Date[][] = [];
    let currentWeek: Date[] = [];
    
    allDays.forEach(day => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeksData.push(currentWeek);
        currentWeek = [];
      }
    });

    return { weeks: weeksData };
  }, []);

  const getColor = (date: Date) => {
    const dayLogs = logs.filter(log => {
        const logDate = new Date(log.log_date);
        return isSameDay(logDate, date);
    });
    
    const count = dayLogs.length; 
    
    // Brand Blue Scale
    if (count === 0) return "bg-slate-100 dark:bg-slate-800/50";
    if (count === 1) return "bg-blue-300 dark:bg-blue-800";
    if (count === 2) return "bg-blue-500 dark:bg-blue-600";
    return "bg-blue-700 dark:bg-blue-500";
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
         <div>
            <h3 className="text-base font-bold text-foreground">Contribution Activity</h3>
            <p className="text-xs text-muted-foreground font-medium">Your daily logs over the last 4 months</p>
         </div>
      </div>
      
      {/* Graph Overflow Container */}
      <div className="w-full overflow-x-auto pb-3 custom-scrollbar">
        <div className="flex gap-1 min-w-max">
            {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1">
                {week.map((day) => {
                    const contributionCount = logs.filter(l => isSameDay(new Date(l.log_date), day)).length;
                    return (
                        <TooltipProvider key={day.toISOString()}>
                        <Tooltip delayDuration={100}>
                            <TooltipTrigger asChild>
                                <div 
                                    className={cn(
                                    "w-3 h-3 rounded-[2px] transition-colors hover:ring-2 hover:ring-primary/30",
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
      <div className="flex items-center justify-end gap-2 text-[10px] text-muted-foreground mt-1 font-medium">
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
