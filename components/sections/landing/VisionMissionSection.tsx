'use client';

import React from 'react';
import { Lightbulb, Target, Rocket, Heart } from 'lucide-react';

export const VisionMissionSection: React.FC = () => {
  return (
    <section className="relative py-20 px-4 bg-gradient-to-br from-white via-blue-50 to-indigo-50">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full opacity-10 -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200 rounded-full opacity-10 -ml-48 -mb-48"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Vision & Mission
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transforming Cameroon's talent ecosystem by connecting ambition with opportunity
          </p>
        </div>

        {/* Vision & Mission Grid */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Vision Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-blue-100 group-hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 text-white">
                    <Lightbulb className="h-8 w-8" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Our Vision</h3>
                  <p className="text-gray-600 leading-relaxed">
                    To be the leading platform transforming how young talents in Cameroon discover, pursue, and excel in meaningful career opportunities. We envision a future where every student has access to world-class internships that shape their professional journey and contribute to Cameroon's economic growth.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mission Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-indigo-100 group-hover:shadow-2xl transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-400 text-white">
                    <Target className="h-8 w-8" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We empower students and companies by providing an intelligent platform that matches talent with opportunity. Through AI-powered recommendations, verified employers, and comprehensive skill development, we accelerate career growth and drive innovation in Cameroon's Silicon Valley.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div>
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Our Core Values
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            {/* Value 1 */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-400 text-white">
                  <Rocket className="h-6 w-6" />
                </div>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Innovation</h4>
              <p className="text-gray-600 text-sm">
                Leveraging technology to solve real problems in career development
              </p>
            </div>

            {/* Value 2 */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-400 text-white">
                  <Heart className="h-6 w-6" />
                </div>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Integrity</h4>
              <p className="text-gray-600 text-sm">
                Building trust through transparency and verified partnerships
              </p>
            </div>

            {/* Value 3 */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-400 text-white">
                  <Target className="h-6 w-6" />
                </div>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Excellence</h4>
              <p className="text-gray-600 text-sm">
                Committed to quality in every opportunity and service we provide
              </p>
            </div>

            {/* Value 4 */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-400 text-white">
                  <Lightbulb className="h-6 w-6" />
                </div>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Impact</h4>
              <p className="text-gray-600 text-sm">
                Creating lasting positive change in careers and communities
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisionMissionSection;
