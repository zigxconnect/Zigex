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
} from "recharts";
import { BarChart as ChartIcon, PieChart as PieIcon } from "lucide-react";

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
  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 py-10">
    <Icon className="w-16 h-16 text-gray-300 mb-4" />
    <h4 className="font-semibold text-gray-700">{title}</h4>
    <p className="text-sm mt-1 max-w-xs mx-auto">{message}</p>
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
          "#3B82F6",
          "#8B5CF6",
          "#10B981",
          "#F59E0B",
          "#EF4444",
          "#06B6D4",
        ][index % 6],
      }))
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Applications Trend Chart */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100 min-h-[400px] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Applications Trend
          </h3>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            disabled={!trendChartData.hasData}
          >
            <option value="month">Last 30 Days</option>
            <option value="week">Last 7 Days</option>
            <option value="year">All Time</option>
          </select>
        </div>

        {/* This condition now correctly checks the filtered data length */}
        {trendChartData.hasData && filteredTrendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="applications"
                name="Applications"
                stroke="#f97316"
                strokeWidth={3}
              />
              <Line
                type="monotone"
                dataKey="interns"
                name="Hired"
                stroke="#3b82f6"
                strokeWidth={3}
              />
            </LineChart>
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
                ? "Try selecting a different time range, like 'All Time'."
                : (trendChartData.emptyState?.message ??
                  "There is no trend data to display.")
            }
          />
        )}
      </div>

      {/* Applications by Field Chart */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100 min-h-[400px] flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Applications by Field
        </h3>
        {breakdownChartData.hasData && pieChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                dataKey="value"
                data={pieChartData}
                cx="50%"
                cy="50%"
                outerRadius={110}
                innerRadius={50}
                paddingAngle={2}
                labelLine={false}
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {pieChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={entry.color}
                  />
                ))}
              </Pie>
              <Tooltip />
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
    </div>
  );
};
