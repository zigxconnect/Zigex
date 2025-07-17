import React from 'react';
import { FaCheckCircle, FaDollarSign, FaBookOpen, FaUsers } from 'react-icons/fa';
import { ReactElement } from 'react';

interface Feature {
  icon: ReactElement;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon:<FaCheckCircle className="text-black w-8 h-8 mx-auto" />,
    title: 'Verified Companies',
    description: 'All our partner companies are thoroughly vetted and verified',
  },
  {
    icon: <FaDollarSign className="text-black w-8 h-8 mx-auto" />,
    title: 'Competitive Pay',
    description: 'Fair compensation for all internship positions',
  },
  {
    icon: <FaBookOpen className="text-black w-8 h-8 mx-auto" />,
    title: 'Skill Development',
    description: 'Learn from industry experts and gain valuable experience',
  },
  {
    icon: <FaUsers className="text-black w-8 h-8 mx-auto" />,
    title: 'Network Building',
    description: 'Connect with professionals and build lasting relationships',
  },
];

export const WhyChoose: React.FC = () => {
  return (
    <section className="bg-gray-50 py-10 px-4 text-center">
      <h2 className="text-3xl font-bold text-[#1E3A8A]">Why Choose FutureProspect?</h2>
      <p className="text-[#64748B] mt-4">We connect talented individuals with amazing opportunities</p>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <div key={index} className="bg-[#F8FAFC] p-6 rounded-lg ">
            <div className='rounded-full bg-[#EA580C] h-17 w-17 mx-auto my-3'>
                <div className="text-3xl flex justify-evenly p-4.5">{feature.icon}</div>
            </div>
            <h4 className="text-lg font-semibold text-[#1E3A8A]">{feature.title}</h4>
            <p className="text-[#64748B] mt-2">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

