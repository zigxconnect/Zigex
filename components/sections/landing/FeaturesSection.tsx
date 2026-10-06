'use client';

import React, { useState } from 'react';
import { CheckCircle2, Briefcase, GraduationCap, Users } from 'lucide-react';
import Link from 'next/link';
import { landingButton, landingContainer, landingSectionLead, landingSectionTitle } from './landing-ui';

type ActivityType = 'internship' | 'program' | 'event';

const ActivitiesSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActivityType>('internship');

  const content = {
    internship: {
      title: 'Internships',
      headline: 'Launch your career',
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
      headline: 'Accelerate your growth',
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
      headline: 'Connect and get inspired',
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
    <section id="services" className="py-20 sm:py-24 bg-white relative overflow-hidden scroll-mt-20">
      <div className={`${landingContainer} relative z-10`}>
        
        {/* Header */}
        <div className="mb-10">
          <h2 className={landingSectionTitle}>Internships, programs and events</h2>
          <p className={landingSectionLead}>
            Three ways to grow, connect and succeed in your professional journey.
          </p>
        </div>

        {/* Tab Navigation */}
        {/* UX: tabs must fit a 375px screen; with px-8 the third tab was clipped off. */}
        <div className="flex mb-8">
          <div role="tablist" aria-label="Services" className="grid grid-cols-3 sm:inline-flex w-full sm:w-auto max-w-md sm:max-w-none p-1 bg-[#F3F7FF] rounded-xl ring-1 ring-[#DCE5F5]">
            {(['internship', 'program', 'event'] as ActivityType[]).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                id={`services-tab-${tab}`}
                aria-selected={activeTab === tab}
                aria-controls="services-panel"
                onClick={() => setActiveTab(tab)}
                className={`h-10 px-3 sm:px-5 rounded-lg text-sm hover:cursor-pointer font-semibold transition-colors duration-150 capitalize flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] ${
                  activeTab === tab
                    ? 'bg-white text-[#0B1B3F] shadow-sm ring-1 ring-[#DCE5F5]'
                    : 'text-[#4A5670] hover:text-[#0B1B3F]'
                }`}
              > 
                {tab === 'internship' && <Briefcase className="hidden sm:block w-4 h-4" aria-hidden="true" />}
                {tab === 'program' && <GraduationCap className="hidden sm:block w-4 h-4" aria-hidden="true" />}
                {tab === 'event' && <Users className="hidden sm:block w-4 h-4" aria-hidden="true" />}
                {tab}s
              </button>
            ))}
          </div>
        </div>

        {/* Content Display */}
        <div id="services-panel" role="tabpanel" aria-labelledby={`services-tab-${activeTab}`} className="bg-white rounded-3xl ring-1 ring-[#DCE5F5] p-5 sm:p-8 md:p-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Text Content */}
            <div className="space-y-8 order-2 lg:order-1">
              <div>
                <h3 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-[#0B1B3F] mb-4">
                  {activeContent.headline}
                </h3>
                <p className="text-[#4A5670] text-lg leading-relaxed">
                  {activeContent.description}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {activeContent.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#155DFC] mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <span className="text-[#0B1B3F] text-[15px]">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link
                  href={activeContent.ctaLink}
                  className={landingButton("primary", "lg")}
                >
                  {activeContent.ctaText}
                </Link>
              </div>
            </div>

            {/* Visual */}
            <div className="relative order-1 lg:order-2">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#E8EFFE]">
                 <img 
                    src={activeContent.image} 
                    alt={`${activeContent.title} at Zigex`} 
                    className="w-full h-full object-cover"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B3F]/40 to-transparent" />
                 
                 {/* Floating Badge */}
                 <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl border border-white/20 shadow-lg flex items-center justify-between">
                       <span className="font-bold text-gray-900">{activeContent.title}</span>
                       <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center p-1">
                          <img src="https://i.ibb.co/Cp502Yby/logo.png" alt="" aria-hidden="true" className="w-full h-full object-contain" />
                       </div>
                    </div>
                 </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ActivitiesSection;