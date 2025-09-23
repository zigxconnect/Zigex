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

// This component is perfectly designed. It takes a specific `stats` prop
// and doesn't care where it came from.
export const StatCardsGrid = ({ stats }: { stats: Stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <StatCard
      icon={Users}
      title="Total Hired"
      value={<AnimatedCounter target={stats.totalHired} />}
      subtitle="All time"
      color="blue"
    />
    <StatCard
      icon={FileText}
      title="Total Applications"
      value={<AnimatedCounter target={stats.totalApplications} />}
      subtitle="All time"
      color="green"
    />
    <StatCard
      icon={Calendar}
      title="Active Postings"
      value={<AnimatedCounter target={stats.activePostings} />}
      subtitle="Currently running"
      color="orange"
    />
    <StatCard
      icon={TrendingUp}
      title="Completion Rate"
      value={stats.completionRate}
      subtitle="Of all postings"
      color="purple"
    />
  </div>
);
