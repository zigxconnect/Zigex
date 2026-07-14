import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="w-full h-full min-h-[60vh] flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Skeleton for Header/Title */}
      <div className="space-y-3">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
        <div className="h-4 w-48 bg-slate-100 dark:bg-slate-900 rounded-lg animate-pulse" />
      </div>

      {/* Skeleton for Stories (if on feed) */}
      <div className="flex gap-4 overflow-hidden py-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div 
            key={i} 
            className="flex-none w-24 h-40 sm:w-[140px] sm:h-[220px] bg-slate-200 dark:bg-slate-800 rounded-xl sm:rounded-2xl animate-pulse" 
          />
        ))}
      </div>

      {/* Skeleton for Feed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="space-y-2">
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-2 w-16 bg-slate-100 dark:bg-slate-900 rounded animate-pulse" />
              </div>
            </div>
            <div className="aspect-video w-full bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-900 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
