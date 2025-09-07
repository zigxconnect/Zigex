"use client";

import { useState, useEffect } from "react";
import {
  Users,
  FileText,
  TrendingUp,
  Calendar,
  Eye,
  Filter,
  Download,
  ChevronDown,
  Monitor,
  Smartphone,
  Shield,
  Cpu,
  Brain,
  Globe,
  Database,
  LucideIcon,
} from "lucide-react";
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

//================================================================================
// Sub-components
// These are presentation-focused and remain unchanged from your original file.
//================================================================================

const StatCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  trend,
  color = "blue",
}: {
  icon: LucideIcon;
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  trend?: number;
  color?: string;
}) => {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div>
          <div
            className={`w-12 h-12 rounded-xl ${colorClasses[color]} flex items-center justify-center mb-4`}
          >
            <Icon className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
        {trend && (
          <div className="flex items-center space-x-1 text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">+{trend}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

const FieldCard = ({
  field,
  applications,
  interns,
  icon: Icon,
  color,
}: {
  field: string;
  applications: number;
  interns: number;
  icon: LucideIcon;
  color: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const conversionRate = applications > 0 ? (interns / applications) * 100 : 0;

  return (
    <div
      className={`bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer transform ${
        isHovered ? "-translate-y-1" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center space-x-3 mb-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}20`, color: color }}
        >
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-semibold text-gray-900">{field}</h3>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Applications</span>
          <span className="font-semibold text-gray-900">{applications}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Hired Interns</span>
          <span className="font-semibold text-gray-900">{interns}</span>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Conversion Rate</span>
            <span>{Math.round(conversionRate)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{ width: `${conversionRate}%`, backgroundColor: color }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const AnimatedCounter = ({
  target,
  duration = 1500,
}: {
  target: number;
  duration?: number;
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(target * progress));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);

  return <>{count}</>;
};

export const DashboardClient = ({ initialData }: { initialData: any }) => {
  const [timeFilter, setTimeFilter] = useState("month");

  const pieChartData = initialData.fieldBreakdown.map(
    (field: any, index: number) => ({
      name: field.field,
      value: field.applications,
      color: ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#06B6D4"][
        index % 6
      ],
    })
  );

  const fieldIcons: Record<string, LucideIcon> = {
    "Web Development": Globe,
    "Machine Learning": Brain,
    "Mobile Development": Smartphone,
    Cybersecurity: Shield,
    "Embedded Systems": Cpu,
    "Data Science": Database,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800";
      case "reviewed":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Company Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Monitor your internship program performance
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Stats Overview - Uses `initialData` */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            title="Total Hired"
            value={<AnimatedCounter target={initialData.stats.totalHired} />}
            subtitle="All time"
            color="blue"
          />
          <StatCard
            icon={FileText}
            title="Total Applications"
            value={
              <AnimatedCounter target={initialData.stats.totalApplications} />
            }
            subtitle="All time"
            color="green"
          />
          <StatCard
            icon={Calendar}
            title="Active Postings"
            value={
              <AnimatedCounter target={initialData.stats.activePostings} />
            }
            subtitle="Currently running"
            color="orange"
          />
          <StatCard
            icon={TrendingUp}
            title="Completion Rate"
            value={initialData.stats.completionRate}
            subtitle="Of all postings"
            color="purple"
          />
        </div>

        {/* Charts Section - Uses `initialData` */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Applications Trend
              </h3>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="month">Monthly</option>
                <option value="week">Weekly</option>
                <option value="year">Yearly</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={initialData.applicationsTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
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
                  stroke="#f97316"
                  strokeWidth={3}
                  dot={{ fill: "#f97316", strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: "#f97316", strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="interns"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: "#3b82f6", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Applications by Field
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  dataKey="value"
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Field Statistics - Uses `initialData` */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Field Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialData.fieldBreakdown.map((field: any, index: number) => (
              <FieldCard
                key={index}
                {...field}
                icon={fieldIcons[field.field] || Monitor}
                color={pieChartData[index]?.color || "#6B7280"}
              />
            ))}
          </div>
        </div>

        {/* Recent Applications - Uses `initialData` */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Applications
              </h3>
              <button className="flex items-center space-x-2 px-3 py-1 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                <Eye className="w-4 h-4" />
                <span>View All</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Field
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Applied
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {initialData.recentApplications.map((app: any) => (
                  <tr
                    key={app.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {app.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {app.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {app.field}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {app.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          app.status
                        )}`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-orange-600 hover:text-orange-900 transition-colors">
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
