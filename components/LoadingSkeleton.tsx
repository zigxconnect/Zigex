"use client"
import React from 'react';
// import { load } from 'yamljs';

 export const LoadingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl shadow-md overflow-hidden animate-fadeIn"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Card Header with shimmer */}
          <div className="relative h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer">
            {/* Icon placeholder */}
            <div className="absolute top-4 left-4 w-16 h-16 rounded-xl bg-white/50 shimmer-pulse" />
            
            {/* Badge placeholder */}
            <div className="absolute top-4 right-4 w-20 h-6 rounded-full bg-white/50 shimmer-pulse" />
          </div>

          {/* Card Body */}
          <div className="p-6 space-y-4">
            {/* Title placeholder */}
            <div className="space-y-2">
              <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer rounded-lg w-3/4" />
              <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer rounded-lg w-1/2" />
            </div>

            {/* Company/Info placeholder */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer" />
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer rounded w-32" />
            </div>

            {/* Description lines */}
            <div className="space-y-2">
              <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer rounded w-full" />
              <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer rounded w-5/6" />
              <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer rounded w-4/6" />
            </div>

            {/* Tags placeholder */}
            <div className="flex gap-2 flex-wrap pt-2">
              <div className="h-6 w-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer rounded-full" />
              <div className="h-6 w-20 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer rounded-full" />
              <div className="h-6 w-24 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer rounded-full" />
            </div>

            {/* Button placeholder */}
            <div className="pt-2">
              <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer rounded-xl w-full" />
            </div>
          </div>
        </div>
      ))}

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

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .bg-shimmer {
          background-size: 2000px 100%;
          animation: shimmer 2s infinite linear;
        }

        .shimmer-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export const NotificationSkeleton = ({ count = 4 }: { count?: number }) => {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 animate-fadeIn" style={{ animationDelay: `${i * 80}ms` }}>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer shimmer-pulse flex-shrink-0" />
            <div className="flex-1">
              <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer rounded w-1/3 mb-2" />
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer rounded w-3/4" />
              <div className="mt-3 flex items-center justify-between">
                <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer rounded w-24" />
                <div className="h-8 w-24 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-shimmer rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// // Demo to show the skeleton in action
// export default function Demo() {
//   return (
//     <div className="min-h-screen bg-gray-50 p-8">
//       <div className="max-w-6xl mx-auto">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">Loading Opportunities</h1>
//           <p className="text-gray-600">Fetching the latest internships, programs, and events...</p>
//         </div>
//         <LoadingSkeleton />
//       </div>
//     </div>
//   );
// }

// export default  LoadingSkeleton