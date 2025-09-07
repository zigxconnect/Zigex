const SkeletonCard = () => (
  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
    <div className="animate-pulse flex flex-col">
      <div className="w-12 h-12 rounded-xl bg-gray-200 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

const SkeletonChart = () => (
  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 min-h-[400px]">
    <div className="animate-pulse flex flex-col h-full">
      <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
      <div className="flex-grow bg-gray-200 rounded-lg"></div>
    </div>
  </div>
);

const SkeletonTable = () => (
  <div className="bg-white rounded-xl shadow-lg border border-gray-100">
    <div className="p-6 border-b border-gray-100">
      <div className="animate-pulse h-6 bg-gray-200 rounded w-1/3"></div>
    </div>
    <div className="p-6 space-y-4">
      <div className="animate-pulse flex items-center space-x-4">
        <div className="h-8 w-8 rounded-full bg-gray-200"></div>
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
      <div className="animate-pulse flex items-center space-x-4">
        <div className="h-8 w-8 rounded-full bg-gray-200"></div>
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SkeletonChart />
      <SkeletonChart />
    </div>
    <SkeletonTable />
  </div>
);
