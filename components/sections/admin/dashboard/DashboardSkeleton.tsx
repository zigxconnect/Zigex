const SkeletonCard = () => (
  <div className="bg-white rounded-[2rem] p-6 border border-slate-100/50 shadow-sm animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="w-12 h-12 rounded-2xl bg-slate-100"></div>
      <div className="w-12 h-2 bg-slate-100 rounded-full"></div>
    </div>
    <div className="h-8 bg-slate-100 rounded-xl w-1/2 mb-3"></div>
    <div className="h-3 bg-slate-50 rounded-lg w-1/3"></div>
  </div>
);

const SkeletonChart = ({ className }: { className?: string }) => (
  <div className={`bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm min-h-[480px] animate-pulse ${className}`}>
    <div className="flex justify-between items-center mb-10">
      <div className="space-y-2">
        <div className="h-6 bg-slate-100 rounded-lg w-40"></div>
        <div className="h-3 bg-slate-50 rounded-lg w-64"></div>
      </div>
      <div className="w-32 h-10 bg-slate-50 rounded-2xl"></div>
    </div>
    <div className="flex-grow bg-slate-50/50 rounded-3xl h-[280px]"></div>
  </div>
);

const SkeletonTable = () => (
  <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm animate-pulse overflow-hidden">
    <div className="p-8 pb-4">
      <div className="h-7 bg-slate-100 rounded-lg w-48 mb-2"></div>
      <div className="h-3 bg-slate-50 rounded-lg w-64"></div>
    </div>
    <div className="p-8 space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 rounded-2xl bg-slate-100"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-100 rounded w-32"></div>
              <div className="h-3 bg-slate-50 rounded w-20"></div>
            </div>
          </div>
          <div className="h-8 w-24 bg-slate-100 rounded-xl"></div>
        </div>
      ))}
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-12 max-w-[1600px] mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <SkeletonChart className="lg:col-span-8" />
      <SkeletonChart className="lg:col-span-4" />
    </div>
    <SkeletonTable />
  </div>
);

