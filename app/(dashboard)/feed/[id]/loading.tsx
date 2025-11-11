// app/(dashboard)/feed/[id]/loading.tsx
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeedDetailLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header Skeleton */}
        <div className="relative w-full overflow-hidden rounded-3xl bg-gray-200 animate-pulse">
          <div className="px-6 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
            <Skeleton className="h-6 w-24 mb-4 bg-gray-300" />
            <Skeleton className="h-12 w-3/4 mb-6 bg-gray-300" />
            <div className="flex gap-4">
              <Skeleton className="h-8 w-32 bg-gray-300 rounded-full" />
              <Skeleton className="h-8 w-32 bg-gray-300 rounded-full" />
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Card Skeleton */}
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="w-20 h-20 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </Card>

            {/* Description Skeleton */}
            <Card className="p-6 sm:p-8">
              <Skeleton className="h-8 w-64 mb-6" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </Card>

            {/* Map Skeleton */}
            <Card className="overflow-hidden">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-72 w-full" />
            </Card>
          </div>

          {/* Right Column */}
          <aside className="lg:col-span-1">
            <div className="space-y-6">
              {/* Details Skeleton */}
              <Card className="overflow-hidden">
                <Skeleton className="h-16 w-full" />
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3 pb-4">
                      <Skeleton className="w-10 h-10 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Button Skeleton */}
              <Skeleton className="h-14 w-full rounded-2xl" />

              {/* Info Card Skeleton */}
              <Card className="p-6">
                <Skeleton className="h-6 w-32 mb-3" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}