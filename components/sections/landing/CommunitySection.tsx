'use client';

import React from 'react';
import Link from 'next/link';
import { Users, Code, MessageSquare, Coffee } from 'lucide-react';

const CommunitySection: React.FC = () => {
  return (
    <section id="community" className="py-20 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          Join Our Thriving Community
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
          It's not just about jobs. It's about belonging to a network of like-minded innovators, mentors, and friends.
        </p>

        <div className="grid md:grid-cols-4 gap-8">
            <div className="p-6 bg-blue-50 rounded-2xl">
                <Users className="w-10 h-10 text-blue-600 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Networking</h3>
                <p className="text-sm text-gray-600">Connect with peers and industry leaders.</p>
            </div>
             <div className="p-6 bg-indigo-50 rounded-2xl">
                <Code className="w-10 h-10 text-indigo-600 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Hackathons</h3>
                <p className="text-sm text-gray-600">Participate in regular coding challenges.</p>
            </div>
             <div className="p-6 bg-purple-50 rounded-2xl">
                <MessageSquare className="w-10 h-10 text-purple-600 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Mentorship</h3>
                <p className="text-sm text-gray-600">Get guidance from experienced pros.</p>
            </div>
             <div className="p-6 bg-pink-50 rounded-2xl">
                <Coffee className="w-10 h-10 text-pink-600 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Events</h3>
                <p className="text-sm text-gray-600">Attend meetups and workshops.</p>
            </div>
        </div>

        <div className="mt-12">
            <Link href="/sign-up">
                <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer">
                    Become a Member
                </button>
            </Link>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
