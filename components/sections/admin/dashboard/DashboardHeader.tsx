"use client";
import { Filter, Download, ChevronDown } from "lucide-react";

export const DashboardHeader = () => (
  <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
        Company Dashboard
      </h1>
      <p className="text-gray-600 mt-1 text-sm sm:text-base">
        Monitor your internship program performance
      </p>
    </div>
    <div className="flex-shrink-0 flex items-center space-x-2 sm:space-x-3">
      <button className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
        <Filter className="w-4 h-4" />
        <span>Filter</span>
        <ChevronDown className="w-4 h-4" />
      </button>
      <button className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm">
        <Download className="w-4 h-4" />
        <span>Export</span>
      </button>
    </div>
  </div>
);
