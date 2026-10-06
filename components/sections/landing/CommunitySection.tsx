'use client';

import React from 'react';
import Link from 'next/link';
import { Users, Code, MessageSquare, Coffee } from 'lucide-react';
import { landingButton, landingContainer, landingSectionLead, landingSectionTitle } from './landing-ui';

const ITEMS = [
  { icon: Users, title: 'Networking', text: 'Connect with peers and industry leaders.' },
  { icon: Code, title: 'Hackathons', text: 'Participate in regular coding challenges.' },
  { icon: MessageSquare, title: 'Mentorship', text: 'Get guidance from experienced pros.' },
  { icon: Coffee, title: 'Events', text: 'Attend meetups and workshops.' },
];

const CommunitySection: React.FC = () => {
  return (
    <section id="community" className="py-20 sm:py-24 bg-[#F3F7FF] scroll-mt-20">
      <div className={landingContainer}>
        <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <h2 className={landingSectionTitle}>Join a community that grows with you</h2>
            <p className={landingSectionLead}>
              It&apos;s not just about jobs. It&apos;s about belonging to a network of like-minded innovators, mentors and friends.
            </p>
          </div>
          {/* Closing call to action, aligned with the heading it answers. */}
          <div className="lg:col-span-5 lg:justify-self-end">
            <Link href="/sign-up" className={landingButton("primary", "lg")}>
              Become a member
            </Link>
          </div>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ITEMS.map((item) => (
            <div key={item.title} className="rounded-2xl bg-white p-6 ring-1 ring-[#DCE5F5]">
              <item.icon className="w-6 h-6 text-[#155DFC] mb-4" aria-hidden="true" />
              <h3 className="font-heading text-lg font-semibold text-[#0B1B3F] mb-1.5">{item.title}</h3>
              <p className="text-[15px] text-[#4A5670] leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
