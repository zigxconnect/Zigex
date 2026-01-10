"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Eye, MousePointer2, Percent } from "lucide-react";

interface PostingPerformanceProps {
  postings: {
    title: string;
    views: number;
    applications: number;
    conversion: string;
  }[];
}

export const PostingPerformance = ({ postings }: PostingPerformanceProps) => {
  return (
    <Card className="p-8 rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Content <span className="text-secondary">Efficiency</span></h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Top performing postings by conversion</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-50">
              <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">Opportunity</th>
              <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 text-center">Impressions</th>
              <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 text-center">Submissions</th>
              <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 text-right">Conversion Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {postings.map((post, i) => (
              <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                <td className="py-5 px-4">
                  <span className="text-sm font-bold text-slate-900 line-clamp-1">{post.title}</span>
                </td>
                <td className="py-5 px-4">
                  <div className="flex items-center justify-center gap-2">
                    <Eye size={14} className="text-slate-300" />
                    <span className="text-sm font-medium text-slate-600 font-mono tracking-tight">{post.views.toLocaleString()}</span>
                  </div>
                </td>
                <td className="py-5 px-4">
                   <div className="flex items-center justify-center gap-2">
                    <MousePointer2 size={14} className="text-slate-300" />
                    <span className="text-sm font-medium text-slate-600 font-mono tracking-tight">{post.applications.toLocaleString()}</span>
                  </div>
                </td>
                <td className="py-5 px-4 text-right">
                  <div className="inline-flex items-center gap-2 bg-slate-100/50 px-3 py-1 rounded-full group-hover:bg-primary/10 transition-colors">
                    <span className="text-sm font-black text-slate-900 group-hover:text-primary">{post.conversion}</span>
                    <Percent size={12} className="text-slate-400 group-hover:text-primary/70" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {postings.length === 0 && (
        <div className="text-center py-20 text-slate-400 italic">
          No posting performance data available yet.
        </div>
      )}
    </Card>
  );
};
