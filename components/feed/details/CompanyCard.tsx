// components/feed/detail/DetailsSidebar.tsx
"use client";

import { Card } from "@/components/ui/card";
import { MapPin, Clock, Calendar, Users, Briefcase } from "lucide-react";

interface DetailItem {
  label: string;
  value: string;
  icon: React.ElementType;
}

interface DetailsSidebarProps {
  details: DetailItem[];
}

export function DetailsSidebar({ details }: DetailsSidebarProps) {
  if (details.length === 0) return null;

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <h3 className="font-bold text-lg text-white">Details</h3>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {details.map((detail, index) => (
          <div
            key={index}
            className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
              <detail.icon size={18} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                {detail.label}
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {detail.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
