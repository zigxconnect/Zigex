"use client";

import React from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CalendarHeader = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
      <div>
        <h1 className="text-4xl font-heading font-black text-slate-900 tracking-tight">
          Interview <span className="text-primary italic">Schedules</span>
        </h1>
        <p className="text-slate-500 mt-2 font-medium">
          Manage your upcoming interviews and recruitment events.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center bg-white rounded-2xl border border-slate-100 p-1 shadow-sm">
           <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-slate-500 hover:text-primary transition-colors">
              <ChevronLeft size={20} />
           </Button>
           <div className="px-4 text-sm font-black text-slate-900 uppercase tracking-widest">
              January 2026
           </div>
           <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-slate-500 hover:text-primary transition-colors">
              <ChevronRight size={20} />
           </Button>
        </div>
        
        <Button className="rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all h-12 px-6 group">
          <Plus size={18} className="mr-2 group-hover:rotate-90 transition-transform" />
          <span className="text-sm font-bold">New Interview</span>
        </Button>
      </div>
    </div>
  );
};
