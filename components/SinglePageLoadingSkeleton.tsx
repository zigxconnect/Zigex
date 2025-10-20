import React from 'react';

export const InternshipDetailsLoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="lg:p-8 pb-20 lg:pb-8">
        <div className="lg:max-w-7xl lg:mx-auto">
          
          {/* Mobile: Stack layout, Desktop: Grid layout */}
          <div className="flex flex-col lg:grid lg:grid-cols-3 lg:gap-8">
            
            {/* Main Content Skeleton */}
            <div className="lg:col-span-2">
              <div className="bg-white lg:rounded-2xl overflow-hidden shadow-sm">
                
                {/* Header/Banner Section */}
                <div className="relative h-64 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer">
                  {/* Company Logo Placeholder */}
                  <div className="absolute bottom-6 left-6 w-24 h-24 rounded-2xl bg-white/80 shimmer-pulse shadow-lg" />
                  
                  {/* Badge Placeholder */}
                  <div className="absolute top-6 right-6 w-28 h-8 rounded-full bg-white/50 shimmer-pulse" />
                </div>

                {/* Content Section */}
                <div className="p-6 lg:p-8 space-y-6">
                  
                  {/* Title Section */}
                  <div className="space-y-3">
                    <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer rounded-lg w-3/4" />
                    <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer rounded-lg w-1/2" />
                  </div>

                  {/* Company Info */}
                  <div className="flex items-center gap-4 pt-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer" />
                    <div className="space-y-2 flex-1">
                      <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer rounded w-48" />
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer rounded w-32" />
                    </div>
                  </div>

                  {/* Meta Info Pills */}
                  <div className="flex flex-wrap gap-3 pt-4">
                    <div className="h-10 w-36 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer rounded-xl" />
                    <div className="h-10 w-32 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer rounded-xl" />
                    <div className="h-10 w-40 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer rounded-xl" />
                    <div className="h-10 w-28 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer rounded-xl" />
                  </div>

                  <div className="border-t border-gray-200 my-6" />

                  {/* Description Section */}
                  <div className="space-y-4">
                    <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer rounded-lg w-48" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer rounded w-full" />
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer rounded w-full" />
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer rounded w-5/6" />
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer rounded w-full" />
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer rounded w-4/5" />
                    </div>
                  </div>

                  <div className="pt-4 space-y-4">
                    {/* Requirements Section */}
                    <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer rounded-lg w-40" />
                    <div className="space-y-2">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer" />
                          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer rounded flex-1" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 space-y-4">
                    {/* Responsibilities Section */}
                    <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer rounded-lg w-44" />
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer" />
                          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer rounded flex-1" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Desktop Sidebar Skeleton - Hidden on mobile */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8 space-y-6">
                
                {/* Apply Button Skeleton */}
                <div className="h-12 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 bg-shimmer rounded-xl w-full" />

                <div className="border-t border-gray-200" />

                {/* Info Items */}
                <div className="space-y-5">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer rounded w-24" />
                      <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer rounded w-full" />
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200" />

                {/* Tags Section */}
                <div className="space-y-3">
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer rounded w-20" />
                  <div className="flex flex-wrap gap-2">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-7 w-20 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer rounded-full" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button Skeleton - Mobile Only */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg lg:hidden z-30">
        <div className="h-12 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 bg-shimmer rounded-lg w-full" />
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .bg-shimmer {
          background-size: 2000px 100%;
          animation: shimmer 2s infinite linear;
        }

        .shimmer-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

// Demo to show the skeleton in action
// export default function Demo() {
//   return <InternshipDetailsLoadingSkeleton />;
// }