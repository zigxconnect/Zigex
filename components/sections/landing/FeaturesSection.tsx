'use client';

import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Briefcase, GraduationCap, Users } from 'lucide-react';
import Link from 'next/link';

type ActivityType = 'internship' | 'program' | 'event';

const ActivitiesSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActivityType>('internship');

  const content = {
    internship: {
      title: 'Internships',
      headline: 'Launch Your Career',
      description: 'Our internship program is designed to bridge the gap between academic learning and professional ecosystem. We partner with top-tier companies to offer roles that provide real-world experience, mentorship, and the chance to work on impactful projects.',
      benefits: [
        'Access to exclusive paid and unpaid roles',
        'Mentorship from industry veterans',
        'Certificate of completion and recommendation letters',
        'Potential for full-time employment offers'
      ],
      image: 'https://i.ibb.co/C4tg26k/woc.jpg',
      ctaLink: '/feed',
      ctaText: 'Find Internships'
    },
    program: {
      title: 'Programs',
      headline: 'Accelerate Your Growth',
      description: 'Join our intensive bootcamps, fellowships, and skill-building cohorts. Whether you are looking to master Data Science, Web Development, or Entrepreneurship, our programs are curated to fast-track your mastery.',
      benefits: [
        'Structured curriculum designed by experts',
        'Peer-to-peer learning environment',
        'Hands-on capstone projects',
        'Career support and resume reviews'
      ],
      image: 'https://i.ibb.co/C4tg26k/woc.jpg', 
      ctaLink: '/feed',
      ctaText: 'Explore Programs'
    },
    event: {
      title: 'Events',
      headline: 'Connect and Inspire',
      description: 'Immerse yourself in our vibrant community through hackathons, career fairs, and tech talks. Our events are the heartbeat of Zigex, bringing together talent, recruiters, and innovators.',
      benefits: [
        'Networking with potential employers',
        'Workshops and live coding sessions',
        'Panel discussions with tech leaders',
        'Community meetups and mixers'
      ],
      image: 'https://i.ibb.co/4ZFCPV5W/n5-2.jpg',
      ctaLink: '/feed',
      ctaText: 'Upcoming Events'
    }
  };

  const activeContent = content[activeTab];

  return (
    <section id="services" className="py-20 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our <span className="text-blue-600">Services</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Everything you need to grow, connect, and succeed in your professional journey.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1.5 bg-gray-100 rounded-full border border-gray-200 shadow-inner">
            {(['internship', 'program', 'event'] as ActivityType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-full text-sm hover:cursor-pointer font-bold transition-all duration-300 capitalize flex items-center gap-2 ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                }`}
              > 
                {tab === 'internship' && <Briefcase className="w-4 h-4" />}
                {tab === 'program' && <GraduationCap className="w-4 h-4" />}
                {tab === 'event' && <Users className="w-4 h-4" />}
                {tab}s
              </button>
            ))}
          </div>
        </div>

        {/* Content Display */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 md:p-12 shadow-2xl shadow-gray-100/50 transition-all duration-500">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Text Content */}
            <div className="space-y-8 order-2 lg:order-1">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {activeContent.headline}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {activeContent.description}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {activeContent.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-700 text-sm font-medium">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link href={activeContent.ctaLink}>
                  <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer">
                    {activeContent.ctaText}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Visual */}
            <div className="relative order-1 lg:order-2">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-gray-100">
                 <img 
                    src={activeContent.image} 
                    alt={activeContent.title} 
                    className="w-full h-full object-cover"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent" />
                 
                 {/* Floating Badge */}
                 <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl border border-white/20 shadow-lg flex items-center justify-between">
                       <span className="font-bold text-gray-900">{activeContent.title}</span>
                       <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center p-1">
                          <img src="https://i.ibb.co/Cp502Yby/logo.png" alt="Zigex" className="w-full h-full object-contain" />
                       </div>
                    </div>
                 </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50 -z-10" />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-50 -z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ActivitiesSection;