"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { 
  Users, 
  Briefcase, 
  Target, 
  Clock, 
  TrendingUp, 
  ArrowUpRight 
} from "lucide-react";

interface KPIProps {
  kpis: {
    totalApplications: number;
    totalPostings: number;
    acceptanceRate: string;
    avgTimePerHire: string;
  };
}

export const DetailedKPIs = ({ kpis }: KPIProps) => {
  const stats = [
    {
      label: "Total Pipeline",
      value: kpis.totalApplications,
      icon: Users,
      color: "bg-blue-500",
      trend: "+12%",
      description: "Candidates in funnel"
    },
    {
      label: "Active Roles",
      value: kpis.totalPostings,
      icon: Briefcase,
      color: "bg-purple-500",
      trend: "+2",
      description: "Live opportunities"
    },
    {
      label: "Success Rate",
      value: kpis.acceptanceRate,
      icon: Target,
      color: "bg-emerald-500",
      trend: "+0.5%",
      description: "Applied to Hired"
    },
    {
      label: "Time to Hire",
      value: kpis.avgTimePerHire,
      icon: Clock,
      color: "bg-amber-500",
      trend: "-2 days",
      description: "Avg. process duration"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <Card 
          key={i} 
          className="p-6 rounded-[2rem] border-none shadow-sm bg-white hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 group overflow-hidden relative"
        >
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.color} text-white shadow-lg`}>
                <stat.icon size={24} />
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-50 border border-slate-100">
                <TrendingUp size={12} className="text-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-600 uppercase">{stat.trend}</span>
              </div>
            </div>
            
            <h4 className="text-3xl font-black text-slate-900 mb-1">{stat.value}</h4>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-[10px] text-slate-400 mt-2 font-medium italic">{stat.description}</p>
          </div>
          
          <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
             <stat.icon size={120} />
          </div>
        </Card>
      ))}
    </div>
  );
};
