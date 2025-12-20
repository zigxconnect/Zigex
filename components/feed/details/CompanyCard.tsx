// components/feed/detail/DetailsSidebar.tsx
"use client";

import { Card } from "@/components/ui/card";
import { MapPin, Clock, Calendar, Users, Briefcase } from "lucide-react";

const ICON_MAP = {
  MapPin,
  Clock,
  Calendar,
  Users,
  Briefcase,
} as const;

interface DetailItem {
  label: string;
  value: string;
  icon: keyof typeof ICON_MAP;
}

interface DetailsSidebarProps {
  details: DetailItem[];
}

export function DetailsSidebar({ details }: DetailsSidebarProps) {
  if (details.length === 0) return null;

  return (
    <Card className="overflow-hidden border border-border shadow-lg bg-card rounded-[2rem]">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border flex items-center gap-3 bg-muted/20">
        <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_8px_rgba(21,93,252,0.4)]" />
        <h3 className="font-black text-lg text-foreground uppercase tracking-tight">Details</h3>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {details.map((detail, index) => {
          const IconComponent = ICON_MAP[detail.icon] || Calendar;
          return (
            <div
              key={index}
              className="flex items-start gap-4 group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <IconComponent size={20} className="text-primary group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-70">
                  {detail.label}
                </p>
                <p className="text-sm font-bold text-foreground leading-tight">
                  {detail.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
