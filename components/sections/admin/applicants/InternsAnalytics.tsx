"use client";

import React, { useMemo } from "react";
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
  Legend,
  TooltipProps
} from "recharts";
import { Card } from "@/components/ui/card";
import { Applicant } from "@/lib/types/applicants";
import { format, subDays, startOfDay, isSameDay } from "date-fns";
import { 
  Users, 
  CreditCard, 
  Building2, 
  TrendingUp, 
  GraduationCap,
  Sparkles,
  PieChart as PieIcon,
  BarChart3,
  CalendarDays,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = ["#155DFC", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#06B6D4", "#EC4899", "#82ca9d"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-100 shadow-xl ring-1 ring-slate-900/5">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <p className="text-sm font-black text-slate-900">
              {entry.name}: <span className="text-[#155DFC]">{entry.value}</span>
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

interface InternsAnalyticsProps {
  applicants: Applicant[];
}

export const InternsAnalytics = ({ applicants }: InternsAnalyticsProps) => {
  // 1. Application Trend (Last 30 days)
  const trendData = useMemo(() => {
    const days = Array.from({ length: 30 }, (_, i) => subDays(new Date(), 29 - i));
    return days.map(day => {
      const count = applicants.filter(app => isSameDay(new Date(app.appliedDate), day)).length;
      return {
        date: format(day, "MMM dd"),
        count
      };
    });
  }, [applicants]);

  // 2. Departmental Breakdown (by domain)
  const domainData = useMemo(() => {
    const counts: Record<string, number> = {};
    applicants.forEach(app => {
      const domain = app.domain || "Unspecified";
      counts[domain] = (counts[domain] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [applicants]);

  // 3. Detailed Payment Analytics
  const paymentAnalytics = useMemo(() => {
    let paid = 0;
    let advances = 0;
    let completed = 0;
    let totalPaidAmount = 0;
    let remainingAmount = 0;

    applicants.forEach(app => {
      if (app.isPaid) paid++;
      
      app.paymentLedger?.forEach(record => {
        if (record.status === 'paid') {
          totalPaidAmount += record.amount;
          if (record.type === 'advance') advances++;
          if (record.type === 'completed') completed++;
        } else {
          remainingAmount += record.amount;
        }
      });
    });

    return {
      overview: [
        { name: "Fully Cleared", value: paid, color: "#10B981" },
        { name: "In Progress", value: applicants.length - paid, color: "#F59E0B" }
      ],
      types: [
        { name: "Advance Payments", value: advances },
        { name: "Full Completions", value: completed }
      ],
      financials: {
        totalPaid: totalPaidAmount,
        totalRemaining: remainingAmount
      }
    };
  }, [applicants]);

  // 4. Payment Histogram (Amount distribution)
  const paymentHistogram = useMemo(() => {
    const bins: Record<string, number> = {
      "0-10k": 0, "10k-50k": 0, "50k-100k": 0, "100k+": 0
    };
    applicants.forEach(app => {
      const total = app.paymentLedger?.reduce((sum, r) => sum + (r.status === 'paid' ? r.amount : 0), 0) || 0;
      if (total === 0) return;
      if (total < 10000) bins["0-10k"]++;
      else if (total < 50000) bins["10k-50k"]++;
      else if (total < 100000) bins["50k-100k"]++;
      else bins["100k+"]++;
    });
    return Object.entries(bins).map(([name, value]) => ({ name, value }));
  }, [applicants]);

  // 4. Status Breakdown
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    applicants.forEach(app => {
      const status = app.status.charAt(0).toUpperCase() + app.status.slice(1);
      counts[status] = (counts[status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [applicants]);

  // 5. School Distribution
  const schoolData = useMemo(() => {
    const counts: Record<string, number> = {};
    applicants.forEach(app => {
      const school = app.school || "Other";
      counts[school] = (counts[school] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [applicants]);

  // 6. Experience Level Distribution
  const experienceData = useMemo(() => {
    const counts: Record<string, number> = {
      "Beginner": 0,
      "Intermediate": 0,
      "Advanced": 0,
      "Expert": 0
    };
    applicants.forEach(app => {
      const level = app.experienceLevel || "Beginner";
      if (counts[level] !== undefined) {
        counts[level]++;
      } else {
        counts["Other"] = (counts["Other"] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [applicants]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Top Header Section */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Intelligence <span className="text-[#155DFC]">Dashboard</span>
            <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
          </h2>
          <p className="text-sm font-medium text-slate-400">Deep behavioral analytics of your intern ecosystem</p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-slate-100 p-1 rounded-4xl border border-slate-200">
          <div className="px-4 py-2 bg-white rounded-xl shadow-sm text-xs font-bold text-[#155DFC]">Last 30 Days</div>
          <div className="px-4 py-2 text-xs font-bold text-slate-400">All Time</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Application Velocity - Main Chart */}
        <Card className="lg:col-span-8 p-10 rounded-[3rem] border-none shadow-2xl shadow-blue-500/5 bg-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
            <TrendingUp size={120} className="text-[#155DFC]" />
          </div>
          
          <div className="relative z-10 mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#155DFC]">
                <CalendarDays size={20} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Application <span className="text-[#155DFC]">Velocity</span></h3>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">New submissions trend over the last month</p>
            <div className="p-4 bg-blue-50/30 rounded-2xl border border-blue-100/50">
              <p className="text-[10px] font-medium text-blue-600 leading-relaxed">
                <span className="font-black uppercase tracking-wider mr-2">Guide:</span> 
                This graph shows how many new people applied each day. A rising line means your internship is gaining interest and becoming more popular!
              </p>
            </div>
          </div>
          
          <div className="h-[380px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#155DFC" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#155DFC" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="8 8" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} 
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#155DFC', strokeWidth: 2, strokeDasharray: '4 4' }} />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#155DFC" 
                  strokeWidth={5} 
                  fillOpacity={1} 
                  fill="url(#velocityGradient)" 
                  name="Applications"
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Payment Health - Side Chart */}
        <Card className="lg:col-span-4 p-10 rounded-[3rem] border-none shadow-2xl shadow-blue-500/5 bg-white flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50/50 rounded-full blur-3xl" />
          
          <div className="text-center mb-8 relative z-10 w-full">
            <div className="w-16 h-16 bg-blue-50 rounded-4xl flex items-center justify-center text-[#155DFC] mx-auto mb-4 border border-blue-100/50 shadow-inner">
              <CreditCard size={28} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">Payment <span className="text-[#155DFC]">Status</span></h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 bg-slate-50 py-1 px-3 rounded-full inline-block">Overall Compliance</p>
          </div>

          <div className="h-[260px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentAnalytics.overview}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={105}
                  paddingAngle={8}
                  dataKey="value"
                  animationBegin={500}
                  animationDuration={1500}
                >
                  {paymentAnalytics.overview.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(255,255,255,0.4)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-3xl font-black text-slate-900 tracking-tight">
                {Math.round((paymentAnalytics.overview[0].value / (applicants.length || 1)) * 100)}%
              </p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Cleared</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full mt-4 relative z-10">
            <div className="bg-emerald-50/50 p-4 rounded-4xl border border-emerald-100 group/fin">
              <p className="text-[9px] font-black text-emerald-600 uppercase mb-1">Paid Full</p>
              <p className="text-xl font-black text-emerald-700 leading-none">{paymentAnalytics.overview[0].value}</p>
            </div>
            <div className="bg-amber-50/50 p-4 rounded-4xl border border-amber-100">
              <p className="text-[9px] font-black text-amber-600 uppercase mb-1">Remaining</p>
              <p className="text-xl font-black text-amber-700 leading-none">{applicants.length - paymentAnalytics.overview[0].value}</p>
            </div>
          </div>

          <div className="w-full mt-6 pt-6 border-t border-slate-100 relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Advances Issued</span>
              <span className="text-xs font-black text-slate-900">{paymentAnalytics.types[0].value}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Collection</span>
              <span className="text-xs font-black text-[#155DFC]">₦{paymentAnalytics.financials.totalPaid.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        {/* Payment Histogram - Financial Distribution */}
        <Card className="lg:col-span-12 p-10 rounded-[3rem] border-none shadow-2xl shadow-blue-500/5 bg-white relative overflow-hidden group">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <TrendingUp size={20} />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Financial <span className="text-emerald-600">Histogram</span></h3>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Distribution of total amount paid per student</p>
            </div>
            <div className="px-5 py-3 bg-emerald-50 rounded-2xl border border-emerald-100">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">Total Revenue Stream</p>
              <p className="text-xl font-black text-emerald-700 leading-none font-mono">₦{paymentAnalytics.financials.totalPaid.toLocaleString()}</p>
            </div>
          </div>

          <div className="h-[280px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentHistogram}>
                <CartesianGrid vertical={false} strokeDasharray="8 8" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#475569', fontSize: 11, fontWeight: 800 }} 
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar 
                  dataKey="value" 
                  fill="#10B981" 
                  radius={[12, 12, 0, 0]} 
                  barSize={60}
                  animationDuration={1500}
                >
                  {paymentHistogram.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? "#8B5CF6" : index === 1 ? "#155DFC" : index === 2 ? "#10B981" : "#F59E0B"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-8 p-6 bg-slate-50 rounded-4xl border border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
              <span className="font-black text-slate-900 uppercase tracking-wider mr-2">Note:</span>
              This histogram categorizes interns based on the <span className="text-[#155DFC] font-bold underline decoration-blue-200">Total Capital Contributed</span>. 
              It helps identify groups that have only made minor advances versus those who have completed high-tier payments.
            </p>
          </div>
        </Card>

        {/* Domain Distribution - Full Width Bottom */}
        <Card className="lg:col-span-7 p-10 rounded-[3rem] border-none shadow-2xl shadow-blue-500/5 bg-white relative overflow-hidden group">
          <div className="relative z-10 mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
                <Building2 size={20} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Domain <span className="text-violet-600">Saturation</span></h3>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Top fields of professional expertise</p>
            <p className="mt-3 text-[10px] text-slate-400 font-medium italic bg-violet-50/50 py-1.5 px-3 rounded-full inline-block border border-violet-100/50">
              * Identifies the most populated career paths in your current intake.
            </p>
          </div>

          <div className="h-[320px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={domainData} layout="vertical">
                <CartesianGrid horizontal={false} strokeDasharray="8 8" stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#475569', fontSize: 11, fontWeight: 800 }}
                  width={140}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar 
                  dataKey="value" 
                  fill="#8B5CF6" 
                  radius={[0, 15, 15, 0]} 
                  barSize={24}
                  animationDuration={1500}
                >
                  {domainData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Status Funnel */}
        <Card className="lg:col-span-5 p-10 rounded-[3rem] border-none shadow-2xl shadow-blue-500/5 bg-white relative overflow-hidden group">
          <div className="relative z-10 mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <BarChart3 size={20} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Processing <span className="text-emerald-600">Funnel</span></h3>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Application lifecycle distribution</p>
            <p className="mt-3 text-[10px] text-slate-400 font-medium italic">
              * Tracks candidates from initial submission to final onboarding.
            </p>
          </div>

          <div className="space-y-6 relative z-10">
            {statusData.map((item, i) => {
              const maxCount = Math.max(...statusData.map(d => d.count));
              const percentage = (item.count / (applicants.length || 1)) * 100;
              return (
                <div key={i} className="space-y-2 group/item">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider">{item.name}</span>
                    <span className="text-sm font-black text-slate-900">{item.count} <span className="text-slate-300 font-bold ml-1">({Math.round(percentage)}%)</span></span>
                  </div>
                  <div className="h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100 flex items-center px-1">
                    <div 
                      className={cn(
                        "h-2 rounded-full transition-all duration-1000 ease-out flex items-center justify-end px-2",
                        i === 0 ? "bg-[#155DFC]" : i === 1 ? "bg-amber-400" : "bg-emerald-500"
                      )}
                      style={{ 
                        width: `${(item.count / maxCount) * 100}%`,
                        opacity: 1
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 p-6 bg-slate-50 rounded-4xl border border-slate-100 flex items-center gap-4 group-hover:scale-[1.02] transition-transform duration-500">
            <div className="w-12 h-12 rounded-4xl bg-white shadow-sm flex items-center justify-center text-[#155DFC]">
              <Users size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Controlled Population</p>
              <p className="text-2xl font-black text-slate-900 leading-none">{applicants.length}</p>
            </div>
          </div>
        </Card>

        {/* School Ranking */}
        <Card className="lg:col-span-12 p-10 rounded-[3rem] border-none shadow-2xl shadow-blue-500/5 bg-white relative overflow-hidden group">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                  <GraduationCap size={20} />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Institutional <span className="text-orange-600">Pipeline</span></h3>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Primary source of candidates by organization</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
            {schoolData.map((school, idx) => (
              <div key={idx} className="bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 p-8 rounded-[2.5rem] border border-slate-100 group/card text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg",
                  idx === 0 ? "bg-[#155DFC] scale-110" : "bg-slate-200 text-slate-400"
                )}>
                  {idx + 1}
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1 truncate px-2">{school.name}</p>
                <p className="text-2xl font-black text-slate-900 tracking-tight">{school.count}</p>
                <div className="mt-4 h-1 w-12 bg-slate-200 mx-auto rounded-full overflow-hidden group-hover/card:w-20 transition-all duration-500">
                  <div className="h-full bg-[#155DFC] transition-all duration-1000" style={{ width: `${(school.count / applicants.length) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        {/* Experience Level & Additional Stats */}
        <Card className="lg:col-span-12 p-10 rounded-[3rem] border-none shadow-2xl shadow-blue-500/5 bg-white relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Sparkles size={20} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Experience <span className="text-amber-600">Profiles</span></h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {experienceData.map((exp, i) => (
              <div key={i} className="relative p-6 bg-slate-50 rounded-4xl border border-slate-100 overflow-hidden group/item hover:bg-white hover:shadow-xl transition-all duration-500">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/item:opacity-10 transition-opacity">
                  <Star size={40} className="text-[#155DFC]" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{exp.name}</p>
                <p className="text-3xl font-black text-slate-900 tracking-tighter">{exp.value}</p>
                <div className="mt-4 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#155DFC] rounded-full transition-all duration-1000" 
                    style={{ width: `${(exp.value / (applicants.length || 1)) * 100}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
             <p className="text-[10px] text-slate-400 font-medium italic">Data based on applicant self-assessment during registration.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};
