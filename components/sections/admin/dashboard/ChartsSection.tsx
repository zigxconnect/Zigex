"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
} from "recharts";
import { BarChart as ChartIcon, PieChart as PieIcon, Info } from "lucide-react";
import { Card } from "@/components/ui/card";

/**
 * A helper function to filter chart data based on a selected time range.
 */
const filterDataByTimeRange = (data: any[] = [], timeFilter: string) => {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  switch (timeFilter) {
    case "week":
      return data.filter((d) => new Date(d.fullDate) >= oneWeekAgo);
    case "month":
      return data.filter((d) => new Date(d.fullDate) >= oneMonthAgo);
    case "year":
    default:
      return data;
  }
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-2xl shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <div className="flex justify-between gap-8 w-full">
                <span className="text-sm font-medium text-slate-600">{entry.name}</span>
                <span className="text-sm font-bold text-slate-900">{entry.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const EmptyChartState = ({
  title,
  message,
  icon: Icon,
}: {
  title: string;
  message: string;
  icon: React.ElementType;
}) => (
  <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 py-12 px-6">
    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
       <Icon className="w-8 h-8 text-slate-200" />
    </div>
    <h4 className="font-bold text-slate-700">{title}</h4>
    <p className="text-xs mt-2 max-w-[200px] leading-relaxed italic">{message}</p>
  </div>
);

type ChartData = {
  hasData: boolean;
  data?: any[];
  emptyState?: { title: string; message: string };
};

export const ChartsSection = ({
  trendChartData,
  breakdownChartData,
}: {
  trendChartData: ChartData;
  breakdownChartData: ChartData;
}) => {
  const [timeFilter, setTimeFilter] = useState("month");

  const filteredTrendData = trendChartData.hasData
    ? filterDataByTimeRange(trendChartData.data, timeFilter)
    : [];

  const pieChartData = breakdownChartData.hasData
    ? breakdownChartData.data!.map((field: any, index: number) => ({
        name: field.field,
        value: field.applications,
        color: [
          "#155DFC", // Zigex Blue
          "#8B5CF6", // Purple
          "#10B981", // Emerald
          "#F59E0B", // Amber
          "#EF4444", // Rose
          "#06B6D4", // Cyan
        ][index % 6],
      }))
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
      {/* Applications Trend Chart */}
      <Card className="lg:col-span-8 bg-white rounded-[2.5rem] p-8 shadow-sm border-slate-100 flex flex-col min-h-[480px]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h3 className="text-xl font-heading font-black text-slate-900 tracking-tight">
              Recruitment <span className="text-primary">Velocity</span>
            </h3>
            <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wide">Application & conversion rate over time</p>
          </div>
          
          <div className="flex items-center bg-slate-50 p-1 rounded-2xl border border-slate-100">
            {['week', 'month', 'year'].map((period) => (
               <button
                 key={period}
                 onClick={() => setTimeFilter(period)}
                 className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all ${
                   timeFilter === period 
                    ? "bg-white text-primary shadow-sm" 
                    : "text-slate-400 hover:text-slate-600"
                 }`}
               >
                 {period === 'year' ? 'All Time' : `Last ${period === 'week' ? '7' : '30'} Days`}
               </button>
            ))}
          </div>
        </div>

        <div className="flex-1 mt-4">
          {trendChartData.hasData && filteredTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={filteredTrendData}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#155DFC" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#155DFC" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                   dataKey="date" 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                   dy={15}
                />
                <YAxis 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                   allowDecimals={false}
                   dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="applications"
                  name="Applications"
                  stroke="#155DFC"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorApps)"
                  animationDuration={2000}
                />
                <Area
                  type="monotone"
                  dataKey="interns"
                  name="Hired"
                  stroke="#10B981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fillOpacity={1}
                  fill="url(#colorHires)"
                  animationDuration={2500}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChartState
              icon={ChartIcon}
              title={trendChartData.hasData ? "No Data for Period" : (trendChartData.emptyState?.title ?? "No Data")}
              message={trendChartData.hasData ? "Select 'All Time' to see activity." : (trendChartData.emptyState?.message ?? "N/A")}
            />
          )}
        </div>
      </Card>

      {/* Applications by Field Chart */}
      <Card className="lg:col-span-4 bg-white rounded-[2.5rem] p-8 shadow-sm border-slate-100 flex flex-col min-h-[480px]">
        <div className="mb-10">
          <h3 className="text-xl font-heading font-black text-slate-900 tracking-tight">
            Category <span className="text-secondary">Mix</span>
          </h3>
          <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wide text-nowrap">Breakdown by Industry/Field</p>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center">
          {breakdownChartData.hasData && pieChartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={260}>
                <RechartsPieChart>
                  <Pie
                    dataKey="value"
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={65}
                    paddingAngle={8}
                    stroke="none"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        className="outline-none"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </RechartsPieChart>
              </ResponsiveContainer>
              
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 w-full mt-8">
                {pieChartData.slice(0, 4).map((entry, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-[10px] font-bold text-slate-600 truncate uppercase tracking-wide">
                      {entry.name}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyChartState
              icon={PieIcon}
              title={breakdownChartData.emptyState?.title ?? "No Data"}
              message={breakdownChartData.emptyState?.message ?? "N/A"}
            />
          )}
        </div>
        
        <div className="mt-8 p-4 bg-slate-50 rounded-[1.5rem] flex items-start gap-3">
          <Info size={16} className="text-primary mt-0.5" />
          <p className="text-[10px] text-slate-500 leading-normal font-medium italic">
            Visualizing interest distribution helps optimize your next recruitment focus.
          </p>
        </div>
      </Card>
    </div>
  );
};

