'use client';

import React from 'react';
import { Calendar, MessageCircle } from 'lucide-react';
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

Post your project on ZigX: https://zigex.vercel.app`;

  const whatsappUrl = studentPhone
    ? `https://wa.me/${studentPhone.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`
    : null;

  return (
    <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-200">
      <div className="flex flex-col items-center justify-center text-center space-y-6">
        {/* Sad Calendar Emoji */}
        <div className="text-8xl md:text-9xl animate-bounce">
          😔
        </div>

        {/* Main Message */}
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            No Project Posted Yet
          </h2>
          <p className="text-lg md:text-xl text-gray-700">
            Please <span className="font-semibold text-blue-600">{firstName}</span> has not yet posted a monthly project.
          </p>
        </div>

        {/* Description */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 max-w-md">
          <p className="text-gray-700 leading-relaxed">
            Monthly projects are a fantastic way to showcase your skills, document your learning journey, and get noticed by recruiters and companies on ZigX! 🌟
          </p>
        </div>

        {/* Contact Button */}
        {whatsappUrl && (
          <div className="pt-4">
            <Link
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3 md:px-8 md:py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105"
            >
              <MessageCircle size={20} />
              <span>Send Message on WhatsApp</span>
            </Link>
            <p className="text-xs md:text-sm text-gray-500 mt-3">
              Send a friendly reminder to post their first project
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-amber-50 rounded-xl p-5 border border-amber-200 max-w-md text-left">
          <div className="flex gap-3">
            <Calendar size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 mb-1">Why Post a Project?</p>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>✨ Stand out to employers and program directors</li>
                <li>📈 Build your professional portfolio</li>
                <li>🎯 Increase visibility on ZigX</li>
                <li>💡 Document your learning and growth</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Encouragement Message */}
        <p className="text-gray-600 text-base italic max-w-md">
          "Great things are coming soon! Share your journey with the ZigX community. 🚀"
        </p>
      </div>
    </div>
  );
}
