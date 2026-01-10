'use client';

import React from 'react';
import { Calendar, MessageCircle, Activity, Award } from 'lucide-react';
import Link from 'next/link';

interface NoProjectMessageProps {
  studentName: string;
  studentPhone?: string;
}

export default function NoProjectMessage({ studentName, studentPhone }: NoProjectMessageProps) {
  const firstName = studentName?.split(' ')[0] || 'This student';

  const whatsappMessage = `Hi ${firstName}! 👋

I checked your profile on ZigX and noticed you haven't posted a monthly project yet. 

Your project is a great way to showcase your skills and get noticed by top companies and programs! 

Would you mind sharing your latest project? I'd love to see what you've been working on!

Post your project on ZigX: https://zigexconnect.com`;

  const whatsappUrl = studentPhone
    ? `https://wa.me/${studentPhone.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`
    : null;

  return (
    <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-200 w-full overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
        <Activity size={200} />
      </div>

      <div className="flex flex-col items-center justify-center text-center space-y-8 relative z-10">
        {/* Visual Cue */}
        <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center border border-slate-100 shadow-inner">
          <Award size={48} className="text-slate-300" />
        </div>

        {/* Main Message */}
        <div className="space-y-3 max-w-lg">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            No Projects Started Yet
          </h2>
          <p className="text-lg text-slate-500 font-medium">
            <span className="text-blue-600 font-bold">{firstName}</span> is currently brewing something amazing. Check back soon for their next big showcase!
          </p>
        </div>

        {/* Info Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
          <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 text-left">
            <div className="flex gap-3 mb-2">
              <Calendar size={20} className="text-blue-600" />
              <p className="font-bold text-slate-800">Why Projects?</p>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Monthly highlights document the learning journey and prove real-world competence to recruiters.
            </p>
          </div>

          <div className="bg-amber-50/50 rounded-2xl p-6 border border-amber-100 text-left">
            <div className="flex gap-3 mb-2">
              <Activity size={20} className="text-amber-600" />
              <p className="font-bold text-slate-800">Visibility</p>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Projects are the fastest way to get featured on the ZigX main feed and gain network traction.
            </p>
          </div>
        </div>

        {/* Contact Button */}
        {whatsappUrl && (
          <div className="pt-4 flex flex-col items-center gap-4">
            <Link
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 px-8 py-4 bg-[#25D366] hover:bg-[#1EBE57] text-white font-black rounded-2xl transition-all duration-300 shadow-xl shadow-green-200 hover:scale-105 uppercase text-xs tracking-widest"
            >
              <MessageCircle size={18} />
              <span>Request Project Showcase</span>
            </Link>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
              Encourage them to share their work
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
