"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { Card } from "@/components/ui/card";

const COLORS = ["#155DFC", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#06B6D4"];

interface ChartProps {
  statusData: { name: string; value: number }[];
  categoryData: { name: string; applications: number; hires: number }[];
  growthData: { date: string; cumulativeApplications: number }[];
}

export const AnalyticsCharts = ({ statusData, categoryData, growthData }: ChartProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Growth Trend */}
      <Card className="lg:col-span-8 p-8 rounded-[2.5rem] border-none shadow-sm bg-white">
        <div className="mb-8">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Growth <span className="text-primary">Trajectory</span></h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Cumulative Audience Growth</p>
        </div>
        
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#155DFC" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#155DFC" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="cumulativeApplications" 
                stroke="#155DFC" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#growthGradient)" 
                name="Total Candidates"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Status Breakdown */}
      <Card className="lg:col-span-4 p-8 rounded-[2.5rem] border-none shadow-sm bg-white">
        <div className="mb-8">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Status <span className="text-secondary">Distribution</span></h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Current Funnel State</p>
        </div>

        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3 mt-4">
          {statusData.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-xs font-bold text-slate-600">{item.name}</span>
              </div>
              <span className="text-xs font-black text-slate-900">{item.value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Category Performance */}
      <Card className="lg:col-span-12 p-8 rounded-[2.5rem] border-none shadow-sm bg-white">
        <div className="mb-8">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Category <span className="text-emerald-500">Performance</span></h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Applications vs Hires by Field</p>
        </div>

        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                dx={-10}
              />
              <Tooltip />
              <Legend verticalAlign="top" align="right" height={36}/>
              <Bar dataKey="applications" fill="#155DFC" radius={[10, 10, 0, 0]} name="Applications" />
              <Bar dataKey="hires" fill="#10B981" radius={[10, 10, 0, 0]} name="Hires" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
