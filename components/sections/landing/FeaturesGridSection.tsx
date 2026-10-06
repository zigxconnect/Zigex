'use client';

import React from 'react';
import { Briefcase, Zap, Shield, BarChart } from 'lucide-react';
import { landingContainer, landingSectionLead, landingSectionTitle } from './landing-ui';

const features = [
  {
    icon: <Briefcase className="w-5 h-5" aria-hidden="true" />,
    title: 'Smart Matching',
    description: 'Our AI finds the roles that fit your skills perfectly.'
  },
  {
    icon: <Zap className="w-5 h-5" aria-hidden="true" />,
    title: 'Instant Apply',
    description: 'Apply to multiple companies with a single profile.'
  },
  {
    icon: <Shield className="w-5 h-5" aria-hidden="true" />,
    title: 'Verified Companies',
    description: 'We vet every employer to ensure high quality.'
  },
  {
    icon: <BarChart className="w-5 h-5" aria-hidden="true" />,
    title: 'Career Analytics',
    description: 'Track your application progress in real-time.'
  }
];

const FeaturesGridSection: React.FC = () => {
  return (
    <section id="features" className="py-20 sm:py-24 bg-white scroll-mt-20">
      <div className={landingContainer}>
        <div className="mb-12">
            <h2 className={landingSectionTitle}>What you get with Zigex</h2>
            <p className={landingSectionLead}>Everything you need to find, apply to and complete an internship.</p>
        </div>
        {/* One blue tint for every icon: the colors blend instead of competing. */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
          {features.map((feature) => (
            <div key={feature.title}>
              <div className="w-11 h-11 rounded-xl bg-[#F3F7FF] text-[#155DFC] ring-1 ring-[#DCE5F5] flex items-center justify-center mb-5">
                {feature.icon}
              </div>
              <h3 className="font-heading text-lg font-semibold text-[#0B1B3F] mb-2">{feature.title}</h3>
              <p className="text-[15px] text-[#4A5670] leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGridSection;
