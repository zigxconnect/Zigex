'use client';

import React from 'react';
import { Briefcase, Zap, Shield, BarChart } from 'lucide-react';

const features = [
  {
    icon: <Briefcase className="w-6 h-6 text-white" />,
    title: 'Smart Matching',
    description: 'Our AI finds the roles that fit your skills perfectly.',
    color: 'bg-blue-600'
  },
  {
    icon: <Zap className="w-6 h-6 text-white" />,
    title: 'Instant Apply',
    description: 'Apply to multiple companies with a single profile.',
    color: 'bg-amber-500'
  },
  {
    icon: <Shield className="w-6 h-6 text-white" />,
    title: 'Verified Companies',
    description: 'We vet every employer to ensure high quality.',
    color: 'bg-green-600'
  },
  {
    icon: <BarChart className="w-6 h-6 text-white" />,
    title: 'Career Analytics',
    description: 'Track your application progress in real-time.',
    color: 'bg-indigo-600'
  }
];

const FeaturesGridSection: React.FC = () => {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Platform Features</h2>
            <p className="text-gray-600 mt-4">Everything you need to succeed.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="p-6 border border-gray-100 rounded-2xl hover:shadow-lg transition-shadow">
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-6 shadow-md`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGridSection;
