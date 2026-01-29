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
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <Calendar size={14} className="text-primary" />
          </div>
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{currentDate}</span>
        </div>
        <h1 className="text-4xl lg:text-5xl font-heading font-black text-slate-900 tracking-tighter leading-tight">
          Performance <span className="text-primary italic">Intelligence</span>
        </h1>
        <p className="text-slate-400 mt-2 text-sm max-w-lg font-medium leading-relaxed">
          Monitor your specialized recruitment metrics and accelerate your talent acquisition pipeline with real-time insights.
        </p>
      </div>
      
      <div className="flex items-center gap-3 w-full md:w-auto">
        <Button variant="outline" className="flex-1 md:flex-none border-indigo-100 bg-white/50 backdrop-blur-sm rounded-2xl h-12 px-6 gap-2 hover:bg-white hover:border-primary/30 text-slate-600 transition-all font-bold active:scale-95 text-[11px] uppercase tracking-wider shadow-sm">
          <Filter className="w-4 h-4 text-primary" />
          <span>Filters</span>
        </Button>
        <Button className="flex-1 md:flex-none bg-slate-900 rounded-2xl h-12 px-8 gap-2 hover:bg-black text-white transition-all shadow-xl shadow-slate-200 font-bold active:scale-95 text-[11px] uppercase tracking-wider">
          <Download className="w-4 h-4" />
          <span>Export</span>
        </Button>
      </div>
    </div>
  );
};

