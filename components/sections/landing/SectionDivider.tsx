'use client';

import React from 'react';

interface SectionDividerProps {
  variant?: 'default' | 'wave' | 'gradient';
}

export const SectionDivider: React.FC<SectionDividerProps> = ({ variant = 'default' }) => {
  return (
    <>
      {variant === 'default' && (
        <div className="relative py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
          </div>
        </div>
      )}

      {variant === 'wave' && (
        <div className="relative h-32 bg-gradient-to-b from-white via-blue-50 to-white">
          <svg
            className="absolute w-full h-full"
            viewBox="0 0 1200 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgb(59, 130, 246)', stopOpacity: 0.1 }} />
                <stop offset="100%" style={{ stopColor: 'rgb(99, 102, 241)', stopOpacity: 0.05 }} />
              </linearGradient>
            </defs>
            <path
              d="M0,30 Q300,50 600,30 T1200,30 L1200,100 L0,100 Z"
              fill="url(#waveGradient)"
            />
          </svg>
        </div>
      )}

      {variant === 'gradient' && (
        <div className="relative py-8 px-4 bg-gradient-to-r from-transparent via-blue-100 to-transparent">
          <div className="max-w-7xl mx-auto h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
        </div>
      )}

      <style jsx global>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </>
  );
};

export default SectionDivider;
