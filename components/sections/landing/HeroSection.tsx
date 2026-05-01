"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Menu,
  Play,
  X,
  Search,
  CheckCircle2,
  TrendingUp,
  Globe,
  Briefcase,
  Users
} from "lucide-react";
// Use relative path to ensure no alias resolution issues
import DeveloperAvatarOverlap from "../../ui/DeveloperAvatarOverlap";

const BamendaHeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-white overflow-hidden selection:bg-blue-100 selection:text-blue-900">
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-50/80 rounded-full blur-3xl opacity-70" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-50/80 rounded-full blur-3xl opacity-70" />
      </div>

      {/* Navigation Header */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"
          }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 flex items-center justify-center">
                <img
                  src="https://i.ibb.co/Cp502Yby/logo.png"
                  alt="Zigex Logo"
                  width="40"
                  height="40"
                  className="object-contain"
                />
              </div>
              <span className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-600`}>
                Zigex
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              {['Features', 'Mission', 'Services', 'Community'].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors relative group cursor-pointer"
                >
                  {item}
                  <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </Link>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/sign-in"
                className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                style={{ cursor: 'pointer' }}
              >
                Sign In
              </Link>
              <Link href="/sign-up">
                <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full shadow-lg hover:shadow-blue-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer">
                  Get Started
                </button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-600 cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-xl p-4 flex flex-col gap-4 animate-slide-down">
            {['Features', 'Mission', 'Services', 'Community'].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-base font-medium text-gray-800 py-2 hover:text-blue-600 cursor-pointer"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </Link>
            ))}
            <div className="h-px bg-gray-100 my-2" />
            <Link href="/sign-in" className="text-base font-medium text-gray-600 py-2 hover:text-blue-600 cursor-pointer" onClick={() => setMobileMenuOpen(false)}>
              Sign In
            </Link>
            <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
              <button className="w-full px-6 py-3 bg-blue-600 text-white text-base font-semibold rounded-xl shadow-md cursor-pointer">
                Get Started
              </button>
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Content */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left Column: Text */}
            <div className={`order-last lg:order-none space-y-8 max-w-2xl mx-auto lg:mx-0 text-center lg:text-left transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-xs font-semibold uppercase tracking-wide">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                The Future of Work is Here
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
                Unlock Your <br className="hidden lg:block" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-700">
                  True Potential
                </span>
              </h1>

              <p className="text-lg text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Connect with world-class opportunities, build your professional identity, and accelerate your career growth with Zigex’s AI-powered ecosystem.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/sign-up">
                  <button className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer">
                    Get Started
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
                <button className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-gray-100 hover:border-blue-100 text-gray-700 hover:text-blue-700 rounded-2xl font-bold text-lg shadow-sm hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer">
                  <Play className="w-5 h-5 fill-current" />
                  Watch Demo
                </button>
              </div>

              <div className="pt-6 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-8">
                <div className="flex flex-col items-center lg:items-start">
                  <DeveloperAvatarOverlap
                    developers={[
                      {
                        id: '1',
                        name: 'Abdul Fadiga',
                        role: 'AI Research Scientist',
                        avatar: 'https://i.ibb.co/wFVCrg5K/Whats-App-Image-2025-11-23-at-11-14-41-AM.jpg',
                      },
                      {
                        id: '2',
                        name: 'John Brindi',
                        role: 'Cybersecurity & Backend',
                        avatar: 'https://i.ibb.co/xqWXw548/Whats-App-Image-2025-11-23-at-12-38-01-PM.jpg',
                      },
                      {
                        id: '3',
                        name: 'Tayuh Favour',
                        role: 'Frontend & ML',
                        avatar: 'https://i.ibb.co/JFpCHS9h/Whats-App-Image-2025-11-23-at-11-12-52-AM.jpg',
                      },
                      {
                        id: '4',
                        name: 'Tracy Jacy',
                        role: 'Cybersecurity Specialist',
                        avatar: 'https://i.ibb.co/zH2c0MhN/Whats-App-Image-2025-11-23-at-2-56-03-PM.jpg',
                      },
                    ]}
                    maxDisplay={4}
                    size="md"
                    title="World Class Team"
                    subtitle="Building the future of talent"
                  />
                </div>

                <div className="hidden sm:block h-12 w-px bg-gray-100" />

                <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                  <div className="flex -space-x-1 mb-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <CheckCircle2 key={i} className="w-4 h-4 text-green-500 fill-green-50" />
                    ))}
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    2,000+ Students Joined
                  </div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    Active Professionals
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Visuals (MacBook Inspiration / Floating Dashboard) */}
            <div className={`order-first lg:order-none relative mt-0 lg:mt-0 perspective-1000 transition-all duration-500 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
              {/* Main Dashboard Window */}
              <div className="relative rounded-[1.5rem] bg-white border border-gray-100 shadow-2xl transform rotate-[-2deg] hover:rotate-0 transition-transform duration-700 overflow-hidden max-w-lg mx-auto">

                {/* Browser Bar */}
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <div className="ml-4 bg-white border border-gray-200 rounded-full px-3 py-1 flex items-center gap-2 w-full max-w-[200px]">
                    <div className="w-3 h-3 text-gray-400"><Search size={12} /></div>
                    <div className="h-2 w-20 bg-gray-100 rounded-full"></div>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="relative bg-white aspect-[4/3] overflow-hidden group">
                  {/* The requested image - raw img tag for perfect layout */}
                  <img
                    src="https://i.ibb.co/1YqtdCtK/Chat-GPT-Image-Apr-23-2026-03-29-43-PM.png"
                    alt="Zigex Dashboard Preview"
                    loading="eager"
                    fetchpriority="high"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Edge softening overlays */}
                  <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(255,255,255,0.8)]" />
                  <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white via-white/40 to-transparent opacity-60" />
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/40 to-transparent opacity-80" />
                  <div className="absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-white/30 to-transparent" />
                  <div className="absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-white/30 to-transparent" />

                  {/* Decorative accent for premium feel */}
                  <div className="absolute top-4 right-4 w-24 h-24 bg-blue-400/10 blur-2xl rounded-full" />
                  <div className="absolute bottom-4 left-4 w-32 h-32 bg-indigo-400/10 blur-3xl rounded-full" />
                </div>

                {/* Watermark Logo */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                  <img src="https://i.ibb.co/Cp502Yby/logo.png" width={200} height={200} alt="Watermark" />
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -right-8 top-12 bg-white p-4 rounded-2xl shadow-xl animate-float-slow border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full text-green-600">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Active Services</p>
                    <p className="text-lg font-bold text-gray-900">50+</p>
                  </div>
                </div>
              </div>

              <div className="hidden md:flex absolute -left-8 bottom-24 bg-white p-4 rounded-2xl shadow-xl animate-float border border-gray-100" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Student Community</p>
                    <p className="text-lg font-bold text-gray-900">2,000+ Students</p>
                  </div>
                </div>
              </div>

              <Link href="/sign-up" className="absolute -bottom-6 right-12 animate-bounce-slow">
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-full shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer border-2 border-white">
                  Get Started
                  <ArrowRight size={16} />
                </button>
              </Link>

              {/* Background Decorative Blur */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-blue-100/40 to-indigo-100/40 blur-3xl rounded-full" />
            </div>

          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out forwards;
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
};

export default BamendaHeroSection;
