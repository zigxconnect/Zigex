'use client';

import React from 'react';
import Image from 'next/image';
import { Lightbulb, Target, Rocket, Heart, Zap, Globe, Shield } from 'lucide-react';

const cards = [
    {
        title: "Innovation",
        description: "Leveraging technology to solve real problems in career development",
        icon: Rocket,
        color: "blue"
    },
    {
        title: "Integrity",
        description: "Building trust through transparency and verified partnerships",
        icon: Shield,
        color: "indigo"
    },
    {
        title: "Excellence",
        description: "Committed to quality in every opportunity and service we provide",
        icon: Target,
        color: "sky"
    },
    {
        title: "Impact",
        description: "Creating lasting positive change in careers and communities",
        icon: Globe,
        color: "purple"
    }
];

export const VisionMissionSection: React.FC = () => {
  return (
    <section id="mission" className="relative py-24 px-4 bg-slate-50 overflow-hidden">
      {/* Watermark Logo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-[0.03] pointer-events-none z-0">
         <img src="https://i.ibb.co/Cp502Yby/logo.png" alt="Zigex Watermark" className="w-full h-full object-contain" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-20">
        
        {/* Mission & Vision Row */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Vision */}
            <div className="group relative bg-white rounded-3xl p-10 shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300 border border-blue-50 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-bl-[100px] -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform duration-500 ease-out"/>
                
                <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform duration-300">
                        <Lightbulb className="w-7 h-7" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h3>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        To be the catalyst for a new era of professional excellence, where every aspiring talent in Bamenda and beyond has direct access to the opportunities that shape the future.
                    </p>
                </div>
            </div>

            {/* Mission */}
            <div className="group relative bg-white rounded-3xl p-10 shadow-xl shadow-indigo-900/5 hover:shadow-2xl hover:shadow-indigo-900/10 transition-all duration-300 border border-indigo-50 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-bl-[100px] -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform duration-500 ease-out"/>
                
                <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform duration-300">
                        <Target className="w-7 h-7" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h3>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        To bridge the gap between education and industry through an intelligent, community-driven platform that empowers students to launch meaningful careers and helps companies discover exceptional local talent.
                    </p>
                </div>
            </div>
        </div>

        {/* Core Values Grid */}
        <div className="relative">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Our Core Principles</h2>
                <div className="w-20 h-1.5 bg-blue-600 mx-auto mt-4 rounded-full"/>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                        <div className={`w-12 h-12 rounded-xl bg-${card.color}-100 flex items-center justify-center text-${card.color}-600 mb-4 group-hover:bg-${card.color}-600 group-hover:text-white transition-colors duration-300`}>
                             <card.icon className="w-6 h-6" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{card.description}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </section>
  );
};

export default VisionMissionSection;
