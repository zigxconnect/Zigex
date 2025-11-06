// app/page.js or components/HeroSection.js
"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  ArrowRight,
  Users,
  TrendingUp,
  MapPin,
  Star,
  Play,
} from "lucide-react";
import Link from "next/link";

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  metric?: string;
}

interface StatCard {
  icon: React.ElementType;
  value: string;
  label: string;
  color: string;
}

const BamendaHeroSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  useEffect(() => {
    setIsVisible(true);
    // Auto-rotate testimonials
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features: Feature[] = [
    {
      icon: Users,
      title: "500+ Active Internships",
      description:
        "Live opportunities updated daily across Bamenda's growing business ecosystem",
      color: "from-emerald-400 to-teal-500",
      metric: "95% Match Rate",
    },
    {
      icon: Building2,
      title: "150+ Partner Companies",
      description:
        "From startups to established enterprises, connect with Bamenda's top employers",
      color: "from-blue-400 to-indigo-500",
      metric: "4.8/5 Rating",
    },
    {
      icon: TrendingUp,
      title: "2x Faster Placement",
      description:
        "Our AI-powered matching system gets you hired 50% faster than traditional methods",
      color: "from-orange-400 to-red-500",
      metric: "14 Days Avg",
    },
  ];

  const stats: StatCard[] = [
    {
      icon: Users,
      value: "2,500+",
      label: "Students Placed",
      color: "text-emerald-500",
    },
    {
      icon: Building2,
      value: "85%",
      label: "Job Success Rate",
      color: "text-blue-500",
    },
    {
      icon: MapPin,
      value: "50+",
      label: "Locations Covered",
      color: "text-orange-500",
    },
    {
      icon: Star,
      value: "4.9",
      label: "Average Rating",
      color: "text-yellow-500",
    },
  ];

  const testimonials = [
    {
      name: "Adeline Fomukong",
      role: "Software Engineering Intern",
      company: "TechBam Solutions",
      quote: "Found my dream internship in just 5 days!",
    },
    {
      name: "Boris Ngwa",
      role: "Marketing Intern",
      company: "Bamenda Digital",
      quote: "The platform made networking so much easier.",
    },
    {
      name: "Grace Nkeng",
      role: "Finance Intern",
      company: "Northwest Bank",
      quote: "Professional growth beyond my expectations.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Modern Geometric Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-12 gap-4 h-full">
            {[...Array(144)].map((_, i) => (
              <div
                key={i}
                className="bg-blue-600 rounded-sm animate-pulse"
                style={{
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${2 + Math.random() * 3}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl opacity-10 animate-float"></div>
        <div
          className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-10 animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-40 left-20 w-32 h-32 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl opacity-10 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 container mx-auto px-4 py-8 sm:py-12 lg:py-16">
        {/* Top Stats Bar */}
        

        {/* Main Hero Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div
              className={`transform transition-all duration-1000 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-blue-500/10 rounded-full border border-blue-200">
                {/* <Sparkles className="w-4 h-4 text-orange-500" /> */}
                <span className="text-sm font-semibold text-blue-700">
                  Your #1 Career Platform{" "}
                </span>
              </div>
            </div>

            {/* Main Headline */}
            <div
              className={`transform transition-all duration-1000 delay-200 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Launch Your
                <span className="block  bg-clip-text bg-gradient-to-r text-blue-600">
                  Dream Career
                </span>
                Here
              </h1>
            </div>

            {/* Subtitle */}
            <div
              className={`transform transition-all duration-1000 delay-300 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <p className="text-lg sm:text-xl text-gray-700 leading-relaxed max-w-lg">
                Connect with top companies, gain real experience, and build the
                professional network that will shape your future in Cameroon's
                Silicon Valley.
              </p>
            </div>

            {/* CTA Buttons */}
            <div
              className={`transform transition-all duration-1000 delay-400 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="sign-in">
                <button className="group cursor-pointer relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold rounded-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/25">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Users className="w-5 h-5" />
                    Get Started Now
                    <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </button>
                </Link>

                {/* <button className="group  cursor-pointer flex items-center justify-center gap-2 px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-300 hover:bg-white hover:border-gray-300 hover:shadow-lg hover:scale-105">
                  <Play className="w-5 h-5" />
                  Watch Demo
                </button> */}
              </div>
            </div>

            {/* Trust Indicators */}
            <div
              className={`transform transition-all duration-1000 delay-500 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    Trusted by 2,500+ students
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Interactive Visual */}
          <div
            className={`transform transition-all duration-1000 delay-600 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div className="relative">
              {/* Main Dashboard Mockup */}
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Bamenda Internships Dashboard
                    </div>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-6 space-y-6">
                  {/* Chart Area */}
                  <div className="h-32 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg relative overflow-hidden">
                    <div className="absolute inset-0 flex items-end justify-around p-4">
                      {[65, 80, 45, 90, 70, 85, 95].map((height, i) => (
                        <div
                          key={i}
                          className="bg-gradient-to-t from-blue-600 to-blue-800 rounded-t-sm animate-grow"
                          style={{
                            width: "12px",
                            height: `${height}%`,
                            animationDelay: `${i * 200}ms`,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Job Cards */}
                  <div className="space-y-3">
                    {[
                      "Software Developer",
                      "Digital Marketing",
                      "Data Analyst",
                    ].map((job, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-blue-800"></div>
                          <div>
                            <div className="font-medium text-gray-800 text-sm">
                              {job}
                            </div>
                            <div className="text-xs text-gray-500">
                              Bamenda • Remote
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-green-600 font-medium">
                          Active
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Success Card */}
              <div className="absolute -right-4 -bottom-4 bg-white rounded-xl shadow-xl p-4 border border-gray-200 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">
                      +{Math.floor(Math.random() * 50) + 20} New Jobs
                    </div>
                    <div className="text-xs text-gray-500">This week</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`transform transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
          }`}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                  <div className="text-2xl font-bold text-gray-800">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature Cards Section */}
        <div className="mt-20 max-w-6xl mx-auto">
          <div
            className={`text-center mb-12 transform transition-all duration-1000 delay-700 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We've revolutionized the internship experience in Bamenda with
              cutting-edge technology and local expertise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={`transform transition-all duration-1000 ${
                    isVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-10 opacity-0"
                  }`}
                  style={{ transitionDelay: `${800 + index * 200}ms` }}
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                >
                  <div
                    className={`group relative p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 ${
                      hoveredFeature === index ? "shadow-2xl" : ""
                    }`}
                  >
                    {/* Animated Background Gradient */}
                    <div
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                    ></div>

                    {/* Icon with Metric */}
                    <div className="relative z-10 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                        >
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        {feature.metric && (
                          <div className="text-right">
                            <div className="text-sm font-bold text-gray-800">
                              {feature.metric}
                            </div>
                            <div className="text-xs text-gray-500">
                              Success Rate
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-sm">
                        {feature.description}
                      </p>
                    </div>

                    {/* Hover Border Effect */}
                    <div
                      className={`absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-gradient transition-all duration-300`}
                      style={{
                        borderImage:
                          hoveredFeature === index
                            ? `linear-gradient(135deg, ${feature.color
                                .replace("from-", "")
                                .replace("to-", ", ")}) 1`
                            : "none",
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Testimonial Carousel */}
        <div
          className={`mt-20 text-center transform transition-all duration-1000 delay-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              Success Stories from Bamenda
            </h3>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400 mx-1"
                  />
                ))}
              </div>
              <blockquote className="text-lg italic text-gray-700 mb-6">
                "{testimonials[currentSlide].quote}"
              </blockquote>
              <div className="font-semibold text-gray-900">
                {testimonials[currentSlide].name}
              </div>
              <div className="text-sm text-gray-600">
                {testimonials[currentSlide].role} at{" "}
                {testimonials[currentSlide].company}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }

        @keyframes grow {
          0% {
            height: 0%;
          }
          100% {
            height: var(--final-height, 80%);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-grow {
          animation: grow 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default BamendaHeroSection;
