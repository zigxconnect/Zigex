"use client";

import React from "react";
import { Download, Filter, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export const AnalyticsHeader = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
      <div>
        <h1 className="text-4xl font-heading font-black text-slate-900 tracking-tight">
          Performance <span className="text-primary italic">Intelligence</span>
        </h1>
        <p className="text-slate-500 mt-2 font-medium">
          Deep dive into your recruitment funnel and application data.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" className="rounded-2xl border-slate-200 bg-white shadow-sm hover:shadow-md transition-all h-12 px-6">
          <Calendar size={18} className="mr-2 text-primary" />
          <span className="text-sm font-bold">Last 30 Days</span>
        </Button>
        <Button variant="outline" className="rounded-2xl border-slate-200 bg-white shadow-sm hover:shadow-md transition-all h-12 px-6">
          <Filter size={18} className="mr-2 text-secondary" />
          <span className="text-sm font-bold">Filters</span>
        </Button>
        <Button className="rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200 transition-all h-12 px-6">
          <Download size={18} className="mr-2" />
          <span className="text-sm font-bold">Export Report</span>
        </Button>
      </div>
    </div>
  );
};
