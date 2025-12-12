"use client";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  icon: LucideIcon;
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  color?: "blue" | "green" | "orange" | "purple";
  trend?: string;
};

export const StatCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  color = "blue",
  trend,
}: StatCardProps) => {
  const colorStyles = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      ring: "group-hover:ring-blue-100",
    },
    green: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      ring: "group-hover:ring-emerald-100",
    },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-600",
      ring: "group-hover:ring-orange-100",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      ring: "group-hover:ring-purple-100",
    },
  };

  const styles = colorStyles[color];
  const isPositiveTrend = trend && !trend.startsWith("-");

  return (
    <div className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300",
            styles.bg,
            styles.text
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
              isPositiveTrend
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            )}
          >
            {isPositiveTrend ? (
              <ArrowUpRight size={12} />
            ) : (
              <ArrowDownRight size={12} />
            )}
            {trend}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="text-2xl font-bold text-gray-900 tracking-tight">
          {value}
        </div>
      </div>

      {subtitle && (
        <p className="text-xs font-medium text-gray-400 mt-2">{subtitle}</p>
      )}
    </div>
  );
};
