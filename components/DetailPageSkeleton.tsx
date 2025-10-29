"use client";

import { Card } from "@/components/ui/card";

export function DetailPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card className="relative h-64 sm:h-80 overflow-hidden animate-pulse bg-gray-200" />

            {/* Main Content Card */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <aside>
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded animate-pulse" />
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                  </div>
                </div>
                <div className="h-10 bg-gray-200 rounded animate-pulse" />
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}