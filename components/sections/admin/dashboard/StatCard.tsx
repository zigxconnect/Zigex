"use client";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

type StatCardProps = {
  icon: LucideIcon;
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  color?: "blue" | "emerald" | "amber" | "indigo" | "rose";
};

export const StatCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  color = "blue",
}: StatCardProps) => {
  const colorVariants: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-100/50",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100/50",
    amber: "bg-amber-50 text-amber-600 border-amber-100/50",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100/50",
    rose: "bg-rose-50 text-rose-600 border-rose-100/50",
  };

  const iconColors: Record<string, string> = {
    blue: "text-blue-600",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    indigo: "text-indigo-600",
    rose: "text-rose-600",
  };

  return (
    <Card className="group relative overflow-hidden bg-white border-slate-200/60 p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div
          className={`w-12 h-12 rounded-2xl ${colorVariants[color]} border flex items-center justify-center transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex flex-col items-end">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{title}</p>
          <div className="h-1 w-8 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full w-1/2 rounded-full animate-gradient-xy ${color === 'emerald' ? 'bg-emerald-400' : 'bg-primary'}`} />
          </div>
        </div>
      </div>
      
      <div className="relative z-10">
        <div className="text-3xl font-heading font-black text-slate-900 tracking-tight group-hover:text-primary transition-colors duration-300">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs font-medium text-slate-500 mt-2 flex items-center gap-1.5 uppercase tracking-wide">
             <span className={`w-1.5 h-1.5 rounded-full ${colorVariants[color].split(' ')[0]}`} />
             {subtitle}
          </p>
        )}
      </div>

      {/* Decorative background circle */}
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 ${colorVariants[color].split(' ')[0]}`} />
    </Card>
  );
};

