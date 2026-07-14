import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col xl:flex-row gap-6 pb-12 animate-in fade-in duration-500">
      {/* ═══ Main Content Column ═══ */}
      <div className="flex-1 min-w-0 space-y-6">
        
        {/* ── Hero Banner Skeleton ── */}
        <section className="relative overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900/50 h-[220px]">
          <div className="p-7 sm:p-8 space-y-4">
            <div className="space-y-3">
              <Skeleton className="h-10 w-2/3 rounded-xl bg-slate-200 dark:bg-slate-800" />
              <Skeleton className="h-4 w-1/2 rounded-lg bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-32 rounded-full bg-slate-200 dark:bg-slate-800" />
              <Skeleton className="h-10 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:block">
             <Skeleton className="h-[150px] w-[220px] rounded-2xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </section>

        {/* ── Stories Skeleton ── */}
        <div className="flex gap-4 overflow-hidden pb-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2 shrink-0">
              <Skeleton className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-900/50" />
              <Skeleton className="h-2 w-10 rounded bg-slate-100 dark:bg-slate-900/50" />
            </div>
          ))}
        </div>

        {/* ── Feed Content Skeleton ── */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48 bg-slate-100 dark:bg-slate-900/50" />
              <Skeleton className="h-3 w-64 bg-slate-100 dark:bg-slate-900/50" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-2xl bg-slate-100 dark:bg-slate-900/50" />
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Right Sidebar Column ═══ */}
      <div className="w-full xl:w-80 shrink-0 space-y-6">
        <Skeleton className="h-40 w-full rounded-2xl bg-slate-100 dark:bg-slate-900/50" />
        <Skeleton className="h-64 w-full rounded-2xl bg-slate-100 dark:bg-slate-900/50" />
        <Skeleton className="h-48 w-full rounded-2xl bg-slate-100 dark:bg-slate-900/50" />
      </div>
    </div>
  );
}
