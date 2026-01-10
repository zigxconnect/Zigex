"use client";

import React from "react";
import { Card } from "@/components/ui/card";

export const CalendarGrid = () => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Create a grid of 35 days (5 weeks)
  const calendarDays = Array.from({ length: 31 }, (_, i) => ({
    day: i + 1,
    isCurrentMonth: true,
    isToday: (i + 1) === 4, // Mock today as Jan 4
    events: (i + 1) === 6 ? [{ title: "Product Designer Interview", time: "10:00 AM", type: "interview" }] : 
            (i + 1) === 12 ? [{ title: "UX Intern Review", time: "2:30 PM", type: "review" }] : 
            (i + 1) === 15 ? [{ title: "Frontend Workshop", time: "11:00 AM", type: "event" }] : []
  }));

  return (
    <Card className="p-8 rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
      <div className="grid grid-cols-7 gap-px bg-slate-100 border border-slate-100 rounded-3xl overflow-hidden shadow-inner">
        {days.map((day) => (
          <div key={day} className="bg-slate-50 py-4 text-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{day}</span>
          </div>
        ))}
        
        {/* Padding for Jan 1 start day (Thursday) */}
        {Array.from({ length: 4 }).map((_, i) => (
           <div key={`pad-${i}`} className="bg-white/50 h-32 p-4" />
        ))}

        {calendarDays.map((date) => (
          <div 
            key={date.day} 
            className={`bg-white h-32 p-4 relative group hover:bg-slate-50 transition-colors cursor-pointer ${date.isToday ? "ring-2 ring-primary ring-inset z-10" : ""}`}
          >
            <div className="flex justify-between items-start">
              <span className={`text-sm font-black ${date.isToday ? "text-primary" : "text-slate-400"} group-hover:text-slate-900 transition-colors`}>
                {date.day}
              </span>
              {date.isToday && (
                <span className="bg-primary/10 text-primary text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md">Today</span>
              )}
            </div>
            
            <div className="mt-2 space-y-1">
              {date.events.map((event, j) => (
                <div 
                  key={j} 
                  className={`p-1.5 rounded-lg text-[9px] font-bold truncate transition-all hover:scale-[1.02] ${
                    event.type === 'interview' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                    event.type === 'review' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                    'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  }`}
                >
                  <span className="block opacity-70 mb-0.5">{event.time}</span>
                  {event.title}
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {/* Padding for Jan 31 end day (Saturday, so 0 padding) */}
      </div>
    </Card>
  );
};
