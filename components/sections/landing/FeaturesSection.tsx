'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MapPin } from 'lucide-react';

interface Internship {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  logoText: string;
  logoColor: string;
  badgeColor: string;
  applyLink: string;
  office: string;
}

const FeaturedInternships: React.FC = () => {
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set());
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  const internships: Internship[] = [
    {
      id: '1',
      title: 'Software Development Intern',
      company: 'TechCorp Inc',
      description: 'Join our dynamic team and work on cutting-edge projects',
      location: 'Bamenda',
      logoText: 'TC',
      logoColor: 'bg-primary',
      badgeColor: 'bg-warning',
      applyLink: '/apply/software-dev',
      office: "https://i.ibb.co/VchKJd69/seedLogo.webp" 
    },
    {
      id: '2',
      title: 'Marketing Assistant',
      company: 'Creative Solutions',
      description: 'Help develop marketing strategies for local businesses',
      location: 'Bamenda',
      logoText: 'CS',
      logoColor: 'bg-warning',
      badgeColor: 'bg-warning',
      applyLink: '/apply/marketing',
      office: "https://i.ibb.co/bMcCwpSp/nervtech.png",
    },
    {
      id: '3',
      title: 'Finance Intern',
      company: 'BankPlus',
      description: 'Learn financial analysis and banking operations',
      location: 'Bamenda',
      logoText: 'BP',
      logoColor: 'bg-primary',
      badgeColor: 'bg-warning',
      applyLink: '/apply/finance',
      office: "https://i.ibb.co/yF80L7jc/ccc.png"
    },
    {
      id: '4',
      title: 'Data Analyst Trainee',
      company: 'DataFlow Inc',
      description: 'Work with big data and analytics tools',
      location: 'Bamenda',
      logoText: 'DF',
      logoColor: 'bg-warning',
      badgeColor: 'bg-warning',
      applyLink: '/apply/data-analyst',
      office: "https://i.ibb.co/qSQTbpk/unib.png"
    },
    {
      id: '5',
      title: 'HR Assistant',
      company: 'People First',
      description: 'Support recruitment and employee relations',
      location: 'Bamenda',
      logoText: 'PF',
      logoColor: 'bg-primary',
      badgeColor: 'bg-warning',
      applyLink: '/apply/hr',
      office: "https://i.ibb.co/MkXDZsfx/Civil-Salt.jpg"
    },
    {
      id: '6',
      title: 'Graphic Design Intern',
      company: 'Visual Arts Studio',
      description: 'Create visual content for various media platforms',
      location: 'Bamenda',
      logoText: 'VA',
      logoColor: 'bg-warning',
      badgeColor: 'bg-warning',
      applyLink: '/apply/graphic-design',
      office: "https://i.ibb.co/Fk55D4CJ/skye8-internship.jpg"
    }
  ];

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const cardId = entry.target.getAttribute('data-card-id');
          if (cardId && entry.isIntersecting) {
            setVisibleCards(prev => new Set([...prev, cardId]));
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px 0px -50px 0px'
      }
    );

    // Observe all cards
    Object.values(cardRefs.current).forEach((ref) => {
      if (ref && observerRef.current) {
        observerRef.current.observe(ref);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const setCardRef = (id: string) => (el: HTMLDivElement | null) => {
    cardRefs.current[id] = el;
  };

  return (
    <>
      <style jsx global>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(60px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: translateY(50px) scale(0.8);
          }
          50% {
            opacity: 0.8;
            transform: translateY(-10px) scale(1.05);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-in-up {
          animation: slideInUp 0.8s ease-out forwards;
        }
        
        .animate-bounce-in {
          animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .card-hidden {
          opacity: 0;
          transform: translateY(50px) scale(0.9);
        }
        
        .card-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
          transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `}</style>
      
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-4 sm:mb-6 animate-fade-in-up">
              Featured Internships
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Discover hand-picked internship opportunities from top companies in Bamenda
            </p>
          </div>

          {/* Internships Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 lg:mb-16">
            {internships.map((internship, index) => (
              <div
                key={internship.id}
                ref={setCardRef(internship.id)}
                data-card-id={internship.id}
                className={`bg-card rounded-lg md:w-80 w-90 mx-auto shadow-lg md:p-0 sm:p-6 relative group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 ${
                  visibleCards.has(internship.id) 
                    ? 'card-visible' 
                    : 'card-hidden'
                }`}
                style={{
                  transitionDelay: `${index * 100}ms`
                }}
              >
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-warning/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Badge */}
                <div className={`absolute top-4 right-4 ${internship.badgeColor} text-white px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 group-hover:scale-110 group-hover:rotate-12`}>
                  NEW
                </div>

                {/* office picture */}
                <div className="md:w-80 md:h-40 h-45 bg-muted rounded-md overflow-hidden mb-3 ">
                  <img 
                    src={internship.office} 
                    alt={internship.title} 
                    className=" w-90 h-45 md:w-80 md:h-40 " 
                  />
                </div>


                {/* Logo and Title */}
                <div className="flex items-start mb-3 sm:mb-4 relative z-10 px-7 ">
                  <div className={`${internship.logoColor} text-primary-foreground rounded-lg w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center font-bold text-sm sm:text-base mr-3 sm:mr-4 flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                    {internship.logoText}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-primary text-sm sm:text-base lg:text-lg leading-tight mb-1 transition-colors duration-300 group-hover:text-primary/80">
                      {internship.title}
                    </h3>
                    <p className="text-muted-foreground text-xs sm:text-sm font-medium transition-colors duration-300 group-hover:text-foreground">
                      {internship.company}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-muted-foreground px-7   text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 line-clamp-2 transition-colors duration-300 group-hover:text-foreground relative z-10">
                  {internship.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between relative z-10 px-7 pb-5">
                  <div className="flex items-center text-muted-foreground text-xs sm:text-sm transition-colors duration-300 group-hover:text-foreground">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                    <span className="truncate">{internship.location}</span>
                  </div>
                  <Link
                    href={internship.applyLink}
                    className="bg-warning hover:bg-warning/90 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-300 flex-shrink-0 transform hover:scale-105 hover:shadow-lg active:scale-95"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Apply Now
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center">
            <Link
              href="/internships"
              className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 sm:px-8 sm:py-4 rounded-md font-semibold text-sm sm:text-base transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 active:scale-95"
            >
              View All Internships
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default FeaturedInternships;