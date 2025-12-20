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
  variant?: "default" | "success" | "destructive";
}

interface DetailsSidebarProps {
  details: DetailItem[];
}

export function DetailsSidebar({ details }: DetailsSidebarProps) {
  if (details.length === 0) return null;

  const getVariantStyles = (variant?: "default" | "success" | "destructive") => {
    switch (variant) {
      case "success":
        return {
          bg: "bg-success/10 group-hover:bg-success",
          icon: "text-success",
        };
      case "destructive":
        return {
          bg: "bg-destructive/10 group-hover:bg-destructive",
          icon: "text-destructive",
        };
      default:
        return {
          bg: "bg-primary/5 group-hover:bg-primary",
          icon: "text-primary",
        };
    }
  };

  return (
    <Card className="overflow-hidden border border-border shadow-lg bg-card rounded-[2rem]">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border flex items-center gap-3 bg-muted/20">
        <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_8px_rgba(21,93,252,0.4)]" />
        <h3 className="font-bold text-lg text-foreground uppercase tracking-tight">Details</h3>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {details.map((detail, index) => {
          const IconComponent = ICON_MAP[detail.icon] || Calendar;
          const styles = getVariantStyles(detail.variant);
          
          return (
            <div
              key={index}
              className="flex items-start gap-4 group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:text-white ${styles.bg}`}>
                <IconComponent size={20} className={`transition-colors group-hover:text-white ${styles.icon}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground uppercase tracking-widest mb-1 opacity-70">
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
