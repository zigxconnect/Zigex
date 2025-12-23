'use client';

import React from 'react';
import { Calendar, MessageCircle, Smartphone } from 'lucide-react';
import Link from 'next/link';

interface NoProjectMessageProps {
  studentName: string;
  studentPhone?: string;
}

export default function NoProjectMessage({ studentName, studentPhone }: NoProjectMessageProps) {
  const firstName = studentName?.split(' ')[0] || 'This student';

  // Pre-built WhatsApp message encouraging them to post a project
  const whatsappMessage = `Hi ${firstName}! 👋

I checked your profile on ZigX and noticed you haven't posted a monthly project yet. 

Your project is a great way to showcase your skills and get noticed by top companies and programs! 🚀

Would you mind sharing your latest project? I'd love to see what you've been working on!

Post your project on ZigX: https://www.zigexconnect.com`;

  const whatsappUrl = studentPhone
    ? `https://wa.me/${studentPhone.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`
    : null;

  return (
    <div className="bg-white rounded-lg sm:rounded-2xl p-4 sm:p-8 md:p-12 shadow-sm border border-gray-200 w-full">
      <div className="flex flex-col items-center justify-center text-center space-y-3 sm:space-y-4 md:space-y-6">
        {/* Sad Emoji */}
        <div className="text-7xl sm:text-8xl md:text-9xl animate-bounce">
          😔
        </div>

        {/* Main Message */}
        <div className="space-y-1 sm:space-y-2 px-2">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            No Project Posted Yet
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-700 break">
            Please <span className="font-semibold text-blue-600">{firstName}</span> has not yet posted a monthly project.
          </p>
        </div>

        {/* Description - Mobile optimized */}
        <div className="bg-blue-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-blue-200 w-full max-w-md mx-2 sm:mx-0">
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            Monthly projects are a fantastic way to showcase skills, document your learning journey, and get noticed by recruiters on ZigX! 🌟
          </p>
        </div>

        {/* Contact Button - Full width on mobile */}
        {whatsappUrl && (
          <div className="pt-2 sm:pt-4 w-full px-2 sm:px-0">
            <Link
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto sm:inline-flex px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-green-500 hover:bg-green-600 active:scale-95 text-white font-semibold rounded-lg sm:rounded-xl transition-all duration-200 hover:shadow-lg sm:hover:scale-105 touch-manipulation"
            >
              <MessageCircle size={18} className="sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base truncate">WhatsApp Message</span>
            </Link>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3">
              Send a friendly reminder to post their first project
            </p>
          </div>
        )}

        {/* Info Box - Mobile optimized */}
        <div className="bg-amber-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 border border-amber-200 w-full max-w-md mx-2 sm:mx-0 text-left">
          <div className="flex gap-2 sm:gap-3">
            <Calendar size={18} className="sm:w-5 sm:h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="font-semibold text-amber-900 mb-1 text-sm sm:text-base">Why Post a Project?</p>
              <ul className="text-xs sm:text-sm text-amber-800 space-y-0.5 sm:space-y-1">
                <li>✨ Stand out to employers and programs</li>
                <li>📈 Build your professional portfolio</li>
                <li>🎯 Increase visibility on ZigX</li>
                <li>💡 Document your learning</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Encouragement Message */}
        <p className="text-gray-600 text-sm sm:text-base italic max-w-md px-2 sm:px-0">
          "Great things are coming soon! Share your journey with the ZigX community. 🚀"
        </p>

        {/* Mobile-specific info */}
        <div className="text-xs text-gray-500 mt-2 sm:hidden flex items-center gap-1 justify-center">
          <Smartphone size={14} />
          <span>Tap WhatsApp to send a message</span>
        </div>
      </div>
    </div>
  );
}
