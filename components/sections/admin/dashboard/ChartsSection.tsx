"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  Area,
  AreaChart,
} from "recharts";
import { BarChart as ChartIcon, PieChart as PieIcon, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A helper function to filter chart data based on a selected time range.
 */
const filterDataByTimeRange = (data: any[] = [], timeFilter: string) => {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // The 'fullDate' property is provided by the backend function
  switch (timeFilter) {
    case "week":
      return data.filter((d) => new Date(d.fullDate) >= oneWeekAgo);
    case "month":
      return data.filter((d) => new Date(d.fullDate) >= oneMonthAgo);
    case "year":
    default:
      return data; // 'year' is our "All Time" option
  }
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
  <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-12">
    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
      <Icon className="w-8 h-8 text-gray-300" />
    </div>
    <h4 className="font-semibold text-gray-900">{title}</h4>
    <p className="text-sm mt-1 max-w-xs mx-auto text-gray-500">{message}</p>
  </div>
);

type ChartData = {
  hasData: boolean;
  data?: any[];
  emptyState?: { title: string; message: string };
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-100 shadow-xl rounded-xl">
        <p className="text-sm font-medium text-gray-500 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="font-semibold text-gray-900">{entry.value}</span>
            <span className="text-gray-500 capitalize">{entry.name}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
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
          "#3B82F6", // Blue
          "#8B5CF6", // Violet
          "#10B981", // Emerald
          "#F59E0B", // Amber
          "#EF4444", // Red
          "#06B6D4", // Cyan
        ][index % 6],
      }))
    : [];

  return (
    <div className="grid grid-cols-1 gap-6 h-full">
      {/* Applications Trend Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Applications Trend
            </h3>
            <p className="text-sm text-gray-500">Overview of application activity</p>
          </div>
          
          <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-100">
            {["week", "month", "year"].map((period) => (
              <button
                key={period}
                onClick={() => setTimeFilter(period)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 capitalize",
                  timeFilter === period
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                {period === "year" ? "All Time" : period}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-[300px]">
          {trendChartData.hasData && filteredTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredTrendData}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorHired" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#9ca3af" 
                  fontSize={12} 
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#9ca3af" 
                  fontSize={12} 
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="applications"
                  name="Applications"
                  stroke="#f97316"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorApps)"
                />
                <Area
                  type="monotone"
                  dataKey="interns"
                  name="Hired"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorHired)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChartState
              icon={ChartIcon}
              title={
                trendChartData.hasData
                  ? "No Data for this Period"
                  : (trendChartData.emptyState?.title ?? "No Data Available")
              }
              message={
                trendChartData.hasData
                  ? "Try selecting a different time range."
                  : (trendChartData.emptyState?.message ??
                    "There is no trend data to display.")
              }
            />
          )}
        </div>
      </div>

      {/* Applications by Field Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900">
            Applications by Field
          </h3>
          <p className="text-sm text-gray-500">Distribution across categories</p>
        </div>
        
        <div className="flex-1 min-h-[300px]">
          {breakdownChartData.hasData && pieChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  dataKey="value"
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  cornerRadius={5}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChartState
              icon={PieIcon}
              title={breakdownChartData.emptyState?.title ?? "No Data Available"}
              message={
                breakdownChartData.emptyState?.message ??
                "There is no breakdown data to display."
              }
            />
          )}
        </div>
        
        {/* Legend */}
        {breakdownChartData.hasData && pieChartData.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mt-4">
            {pieChartData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600 truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
