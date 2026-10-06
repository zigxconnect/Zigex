'use client';

import React from 'react';
import { Lightbulb, Target, Rocket, Globe, Shield } from 'lucide-react';
import { landingContainer, landingSectionTitle } from './landing-ui';

const values = [
  {
    title: "Innovation",
    description: "Leveraging technology to solve real problems in career development",
    icon: Rocket,
  },
  {
    title: "Integrity",
    description: "Building trust through transparency and verified partnerships",
    icon: Shield,
  },
  {
    title: "Excellence",
    description: "Committed to quality in every opportunity and service we provide",
    icon: Target,
  },
  {
    title: "Impact",
    description: "Creating lasting positive change in careers and communities",
    icon: Globe,
  },
];

export const VisionMissionSection: React.FC = () => {
  return (
    // The wash background separates this section; no dividers or watermark needed.
    <section id="mission" className="relative py-20 sm:py-24 bg-[#F3F7FF] scroll-mt-20">
      <div className={`${landingContainer} space-y-16`}>
        {/* Vision & Mission: two equal panels, left-aligned like the rest of the page */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          <div className="rounded-3xl bg-white p-8 sm:p-10 ring-1 ring-[#DCE5F5]">
            <div className="w-11 h-11 rounded-xl bg-[#155DFC] text-white flex items-center justify-center mb-6">
              <Lightbulb className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1B3F] mb-4">Our vision</h2>
            <p className="text-lg text-[#4A5670] leading-relaxed">
              To be the catalyst for a new era of professional excellence, where every aspiring talent in Bamenda
              and beyond has direct access to the opportunities that shape the future.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-8 sm:p-10 ring-1 ring-[#DCE5F5]">
            <div className="w-11 h-11 rounded-xl bg-[#0B1B3F] text-white flex items-center justify-center mb-6">
              <Target className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1B3F] mb-4">Our mission</h2>
            <p className="text-lg text-[#4A5670] leading-relaxed">
              To bridge the gap between education and industry through an intelligent, community-driven platform
              that empowers students to launch meaningful careers and helps companies discover exceptional local talent.
            </p>
          </div>
        </div>

        {/* Core values */}
        <div>
          <h2 className={`${landingSectionTitle} mb-10`}>What we stand for</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
            {values.map((value) => (
              <div key={value.title}>
                <div className="w-11 h-11 rounded-xl bg-white text-[#155DFC] ring-1 ring-[#DCE5F5] flex items-center justify-center mb-5">
                  <value.icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-[#0B1B3F] mb-2">{value.title}</h3>
                <p className="text-[15px] text-[#4A5670] leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisionMissionSection;
