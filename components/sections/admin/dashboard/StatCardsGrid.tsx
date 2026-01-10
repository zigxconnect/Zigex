"use client";
import { Users, FileText, Calendar, TrendingUp } from "lucide-react";
import { StatCard } from "./StatCard";
import { AnimatedCounter } from "./AnimatedCounter";

type Stats = {
  totalHired: number;
  totalApplications: number;
  activePostings: number;
  completionRate: string;
};

export const StatCardsGrid = ({ stats }: { stats: Stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100">
    <StatCard
      icon={Users}
      title="Total Hired"
      value={<AnimatedCounter target={stats.totalHired} />}
      subtitle="Lifetime hires"
      color="indigo"
    />
    <StatCard
      icon={FileText}
      title="Submissions"
      value={<AnimatedCounter target={stats.totalApplications} />}
      subtitle="Pending review"
      color="blue"
    />
    <StatCard
      icon={Calendar}
      title="Live Events"
      value={<AnimatedCounter target={stats.activePostings} />}
      subtitle="Ongoing programs"
      color="amber"
    />
    <StatCard
      icon={TrendingUp}
      title="Success Rate"
      value={stats.completionRate}
      subtitle="Fulfillment"
      color="emerald"
    />
  </div>
);

