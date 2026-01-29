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
    blue: "bg-blue-50/50 text-blue-600 border-blue-100/50 shadow-blue-500/5",
    emerald: "bg-emerald-50/50 text-emerald-600 border-emerald-100/50 shadow-emerald-500/5",
    amber: "bg-amber-50/50 text-amber-600 border-amber-100/50 shadow-amber-500/5",
    indigo: "bg-indigo-50/50 text-indigo-600 border-indigo-100/50 shadow-indigo-500/5",
    rose: "bg-rose-50/50 text-rose-600 border-rose-100/50 shadow-rose-500/5",
  };

  return (
    <Card className="group relative overflow-hidden bg-white/70 backdrop-blur-xl border border-indigo-100/50 p-6 rounded-[2.5rem] shadow-xl shadow-indigo-100/20 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2">
      <div className="flex justify-between items-start mb-6">
        <div
          className={`w-14 h-14 rounded-2xl ${colorVariants[color]} border flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-lg`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex flex-col items-end">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-2">{title}</p>
          <div className="flex gap-1">
             <div className="w-1 h-1 rounded-full bg-slate-100" />
             <div className="w-4 h-1 rounded-full bg-primary/20" />
          </div>
        </div>
      </div>
      
      <div className="relative z-10">
        <div className="text-4xl font-heading font-black text-slate-900 tracking-tighter group-hover:text-primary transition-colors duration-500">
          {value}
        </div>
        {subtitle && (
          <div className="mt-3 flex items-center gap-2">
             <span className="px-2 py-0.5 rounded-lg bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">
               {subtitle}
             </span>
             <div className="h-px flex-1 bg-gradient-to-r from-slate-100 to-transparent" />
          </div>
        )}
      </div>

      {/* Decorative background grid/mesh */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_70%)] opacity-[0.03] -mr-16 -mt-16 group-hover:opacity-[0.08] transition-all duration-700 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-[radial-gradient(circle_at_center,_var(--secondary)_0%,_transparent_70%)] opacity-[0.02] -ml-12 -mb-12 group-hover:opacity-[0.05] transition-all duration-700 pointer-events-none" />
    </Card>
  );
};

