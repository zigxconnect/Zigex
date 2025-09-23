'use client';
import React from 'react';

interface ProgressUpdateProps {}

const ProgressTrackingPage: React.FC<ProgressUpdateProps> = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Track Progress</h1>
          <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            Weekly Progress Log
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Progress Tree */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Progress Tree</h2>
              
              {/* Progress Circle */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative w-32 h-32 mb-4">
                  {/* Background Circle */}
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="#f3f4f6"
                      strokeWidth="8"
                      fill="none"
                    />
                    {/* Progress Circle */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="#EA580C"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${85 * 3.14159} ${(100 - 85) * 3.14159}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">85</span>
                    <span className="text-sm text-gray-500">/ 100 pts</span>
                  </div>
                </div>
                
                {/* Tree Icon */}
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L8 8h3v4H8l4 6 4-6h-3V8h3L12 2z"/>
                  </svg>
                </div>
                
                {/* Base */}
                <div className="w-12 h-3 bg-green-400 rounded-full"></div>
              </div>
            </div>

            {/* This Week's Tasks */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">This Week's Tasks</h2>
              <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors w-full">
                View Assigned Tasks
              </button>
            </div>
          </div>

          {/* Right Column - Weekly Progress Log */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-6">
              {/* Week 3 Update */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Week 3 Update</h3>
                <p className="text-sm text-gray-500 mb-3">March 15, 2024</p>
                
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">What I learned:</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Completed advanced JavaScript concepts including closures, async/await, and ES6 modules. Built a weather app using API integration and learned about error handling in asynchronous code.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Comments from Mentor</h4>
                  
                  {/* Mentor Comment 1 */}
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      SJ
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm text-gray-900">Dr. Sarah Johnson</span>
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">+1 Point</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Excellent progress on JavaScript fundamentals! Your weather app shows solid understanding of API integration.
                      </p>
                    </div>
                  </div>

                  {/* Mentor Comment 2 */}
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      MC
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm text-gray-900">Prof. Mike Chen</span>
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">+2 Points</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Keep up the great work! Your code structure is improving significantly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Week 2 Update */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Week 2 Update</h3>
                <p className="text-sm text-gray-500 mb-3">March 8, 2024</p>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">What I learned:</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Focused on React fundamentals including components, props, and state management. Created my first interactive application with user input handling.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTrackingPage;