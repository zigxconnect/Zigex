"use client";
import { Filter, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export const DashboardHeader = () => {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Calendar size={14} className="text-primary" />
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{currentDate}</span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-heading font-bold text-slate-900 tracking-tight">
          Performance <span className="text-primary">Overview</span>
        </h1>
        <p className="text-slate-500 mt-2 text-sm max-w-md font-medium">
          Track metrics, manage applications, and optimize your recruitment funnel in real-time.
        </p>
      </div>
      
      <div className="flex items-center gap-3 w-full md:w-auto">
        <Button variant="outline" className="flex-1 md:flex-none border-slate-200 rounded-xl h-11 px-6 gap-2 hover:bg-slate-50 text-slate-600 transition-all font-semibold active:scale-95 text-xs">
          <Filter className="w-4 h-4" />
          <span>Advanced Filter</span>
        </Button>
        <Button className="flex-1 md:flex-none bg-slate-900 border-slate-900 rounded-xl h-11 px-6 gap-2 hover:bg-slate-800 text-white transition-all shadow-lg shadow-slate-200 font-semibold active:scale-95 text-xs">
          <Download className="w-4 h-4" />
          <span>Export Reports</span>
        </Button>
      </div>
    </div>
  );
};

