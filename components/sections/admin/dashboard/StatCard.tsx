"use client";
import { TrendingUp, LucideIcon } from "lucide-react";

type StatCardProps = {
  icon: LucideIcon;
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  trend?: number;
  color?: string;
};

export const StatCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  trend,
  color = "blue",
}: StatCardProps) => {
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
