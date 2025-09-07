"use client";
import { Filter, Download, ChevronDown } from "lucide-react";

export const DashboardHeader = () => (
  <div className="flex justify-between items-center mb-8">
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Company Dashboard</h1>
      <p className="text-gray-600 mt-1">
        Monitor your internship program performance
      </p>
    </div>
    <div className="flex space-x-3">
      <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
        <Filter className="w-4 h-4" />
        <span>Filter</span>
        <ChevronDown className="w-4 h-4" />
      </button>
      <button className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
        <Download className="w-4 h-4" />
        <span>Export</span>
      </button>
    </div>
  </div>
);
