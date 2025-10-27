"use client";

import React from 'react';
import { Lock } from 'lucide-react';

interface ExpiredOverlayProps {
  type: 'program' | 'event' | 'internship';
  endDate: string;
}

export const ExpiredOverlay: React.FC<ExpiredOverlayProps> = ({ type, endDate }) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 rounded-xl z-10 animate-fade-in">
      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
        <Lock className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-white text-xl font-semibold mb-2">
        This {type} has ended
      </h3>
      <p className="text-gray-300 mb-4">
        Registration period closed on {formatDate(endDate)}
      </p>
      <div className="max-w-sm text-gray-400 text-sm">
        Don&apos;t worry! Follow us to get notified when similar opportunities become available.
      </div>
    </div>
  );
};

// Helper function to check if something has expired
export const hasExpired = (endDate: string | undefined): boolean => {
  if (!endDate) return false;
  const end = new Date(endDate);
  const now = new Date();
  return end < now;
};