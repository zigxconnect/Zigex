'use client';

import React from 'react';
import { Calendar, MessageCircle, Activity, Award, Rocket } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="bg-white rounded-[3.5rem] p-10 md:p-16 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 w-full overflow-hidden relative group"
    >
      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-100/50 transition-colors duration-700" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-50/50 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 group-hover:bg-amber-100/30 transition-colors duration-700" />
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
        <Rocket size={400} />
      </div>

      <div className="flex flex-col items-center justify-center text-center space-y-10 relative z-10">
        {/* Visual Cue - Icon with Animated Ring */}
        <div className="relative">
          <div className="w-28 h-28 bg-white rounded-[2.5rem] flex items-center justify-center border border-slate-100 shadow-xl relative z-10">
            <Award size={52} className="text-slate-300 group-hover:text-blue-500 transition-colors duration-500" />
          </div>
          <motion.div 
             animate={{ rotate: 360 }}
             transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
             className="absolute inset-0 -m-4 border-2 border-dashed border-blue-200/50 rounded-[3.5rem]" 
          />
        </div>

        {/* Main Message */}
        <div className="space-y-4 max-w-xl">
          <div className="flex items-center justify-center gap-2 mb-2">
             <Activity size={16} className="text-blue-500" />
             <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Incubating Talent</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
            Brewing Something Great
          </h2>
          <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed">
            <span className="text-slate-900 font-bold">{firstName}</span> is currently engineering their next big showcase. Check back soon to witness their latest evolution!
          </p>
        </div>

        {/* Dynamic Insight Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-slate-50/50 backdrop-blur-sm rounded-[2rem] p-8 border border-slate-100 text-left group/card"
          >
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-200 group-hover/card:scale-110 transition-transform">
              <Activity size={20} />
            </div>
            <p className="font-black text-slate-900 uppercase text-xs tracking-widest mb-2">The Proof of Skill</p>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Monthly projects are the "Proof of Work" that validates technical competence to top-tier engineering teams.
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-slate-50/50 backdrop-blur-sm rounded-[2rem] p-8 border border-slate-100 text-left group/card"
          >
            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-amber-200 group-hover/card:scale-110 transition-transform">
              <Calendar size={20} />
            </div>
            <p className="font-black text-slate-900 uppercase text-xs tracking-widest mb-2">Network Velocity</p>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Sharing progress increases visibility by 14x. Projects are the fastest bridge between learners and leaders.
            </p>
          </motion.div>
        </div>

        {/* Contact/CTA Section */}
        {whatsappUrl && (
          <div className="pt-8 flex flex-col items-center gap-5">
            <Link
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group/btn relative flex items-center justify-center gap-4 px-10 py-5 bg-[#25D366] text-white font-black rounded-3xl transition-all duration-300 shadow-[0_20px_40px_-10px_rgba(37,211,102,0.3)] hover:shadow-[0_25px_50px_-10px_rgba(37,211,102,0.5)] active:scale-95 uppercase text-[10px] tracking-[0.2em]"
            >
              <MessageCircle size={18} className="group-hover/btn:rotate-12 transition-transform" />
              <span>Prompt Project Update</span>
            </Link>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 Direct Connection Available
               </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>

  );
}
