import React from "react";

export const DashboardSkeleton: React.FC = () => (
  <div className="text-gray-900 font-sans space-y-6 pb-8 animate-pulse min-h-screen">
    {/* Welcome Banner Skeleton */}
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="space-y-3 w-full max-w-md">
        <div className="h-8 bg-gray-200 rounded-lg w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded-md w-1/2"></div>
      </div>
    </div>

    {/* Counters Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-gray-100 rounded-xl w-12 h-12 shrink-0"></div>
          <div className="space-y-2 w-full">
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3 mt-1"></div>
          </div>
        </div>
      ))}
    </div>

    {/* Charts Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="w-full bg-white rounded-2xl border border-gray-100 p-5 flex flex-col h-[390px]">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="flex-1 bg-gray-50 rounded-xl"></div>
        </div>
      ))}
    </div>

    {/* Additional Charts Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="w-full bg-white rounded-2xl border border-gray-100 p-5 flex flex-col h-[390px]">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="flex-1 bg-gray-50 rounded-xl"></div>
        </div>
      ))}
    </div>
  </div>
);

export default DashboardSkeleton;
