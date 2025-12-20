"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle?: string;
  githubUrl?: string | null;
}

export default function ContributeModal({ 
  isOpen, 
  onClose, 
  projectTitle,
  githubUrl 
}: ContributeModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Lock body scroll
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      />

      {/* Modal - More Square & Mobile Optimized */}
      <div 
        className={`relative bg-card rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all duration-300 ${
          isAnimating ? 'animate-in zoom-in-95 slide-in-from-bottom-4' : ''
        }`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-muted/80 hover:bg-muted transition-colors backdrop-blur-sm"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Animated Emoji Header - Much Bigger! */}
        <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 px-6 py-12 sm:py-16 text-center">
          <div className="inline-block animate-bounce-slow">
            <div className="text-[120px] sm:text-[140px] leading-none mb-4 animate-wiggle filter drop-shadow-2xl">
              😏
            </div>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-primary-foreground drop-shadow-lg px-4">
            You Sure Say You Get The Skills?
          </h3>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-2xl animate-bounce" style={{animationDelay: '0ms'}}>😂</span>
            <span className="text-2xl animate-bounce" style={{animationDelay: '150ms'}}>😂</span>
            <span className="text-2xl animate-bounce" style={{animationDelay: '300ms'}}>😂</span>
          </div>
        </div>

        {/* Content - Simplified & Bigger Touch Targets */}
        <div className="p-6 sm:p-8 space-y-4">
          {/* Simple message */}
          <p className="text-center text-sm sm:text-base text-gray-700 leading-relaxed font-medium">
            This project need some real skills o! 💪
            <br />
            <span className="text-gray-600">You don reach that level?</span>
          </p>

          {/* Action Buttons - Bigger for mobile with Shimmer */}
          <div className="space-y-3 pt-2">
            {/* Blue Button - "Yes Boss" */}
            <Link
              href={githubUrl || '#'}
              target="_blank"
              onClick={onClose}
              onMouseEnter={() => setHoveredButton('blue')}
              onMouseLeave={() => setHoveredButton(null)}
              className="relative overflow-hidden w-full inline-flex items-center justify-center gap-3 px-6 py-3 md:py-2 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:from-primary/90 hover:to-primary transition-all shadow-lg shadow-primary/40 hover:shadow-xl hover:shadow-primary/50 hover:-translate-y-1 active:scale-95 group"
            >
              {/* Animated background pulse */}
              <span
                className={`
                  absolute inset-0 bg-blue-400
                  ${hoveredButton === 'blue' ? "animate-ping opacity-20" : "opacity-0"}
                `}
              />

              {/* Shimmer effect */}
              <span
                className={`
                  absolute inset-0 -translate-x-full
                  bg-gradient-to-r from-transparent via-white/40 to-transparent
                  ${hoveredButton === 'blue' ? "animate-shimmer" : ""}
                `}
              />

              {/* Content */}
              <span className="relative z-10 flex items-center gap-3">
                <span className="text-2xl">🚀</span>
                <span>Yes Boss, I Sabi Am!</span>
              </span>

              {/* Particle effect on hover */}
              {hoveredButton === 'blue' && (
                <>
                  <span className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-particle-1" />
                  <span className="absolute top-1/3 right-1/4 w-1 h-1 bg-white rounded-full animate-particle-2" />
                  <span className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-white rounded-full animate-particle-3" />
                </>
              )}
            </Link>

            {/* White Button - "Teach Me First" */}
            <Link
              href="/feed/mentorship"
              onClick={onClose}
              onMouseEnter={() => setHoveredButton('white')}
              onMouseLeave={() => setHoveredButton(null)}
              className="relative overflow-hidden w-full inline-flex items-center justify-center gap-3 px-4 py-2 md:py-2 bg-white text-foreground border-2 border-border rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:bg-blue-50/20 hover:border-blue-200 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 group"
            >
              {/* Animated background pulse */}
              <span
                className={`
                  absolute inset-0 bg-blue-50/10
                  ${hoveredButton === 'white' ? "animate-ping opacity-20" : "opacity-0"}
                `}
              />

              {/* Shimmer effect */}
              <span
                className={`
                  absolute inset-0 -translate-x-full
                  bg-gradient-to-r from-transparent via-blue-100/30 to-transparent
                  ${hoveredButton === 'white' ? "animate-shimmer" : ""}
                `}
              />

              {/* Content */}
              <span className="relative z-10 flex items-center gap-3">
                <span className="text-2xl">🎓</span>
                <span>Abeg, Teach Me First</span>
              </span>

              {/* Particle effect on hover */}
              {hoveredButton === 'white' && (
                <>
                  <span className="absolute top-1/4 left-1/4 w-1 h-1 bg-gray-400 rounded-full animate-particle-1" />
                  <span className="absolute top-1/3 right-1/4 w-1 h-1 bg-gray-400 rounded-full animate-particle-2" />
                  <span className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-gray-400 rounded-full animate-particle-3" />
                </>
              )}
            </Link>

            <button
              onClick={onClose}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-muted text-muted-foreground rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base hover:bg-muted/80 transition-all active:scale-95"
            >
              Make I Think Am
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(-8deg) scale(1); }
          25% { transform: rotate(8deg) scale(1.05); }
          50% { transform: rotate(-8deg) scale(1); }
          75% { transform: rotate(8deg) scale(1.05); }
        }

        @keyframes bounce-slow {
          0%, 100% { 
            transform: translateY(0) scale(1); 
          }
          50% { 
            transform: translateY(-15px) scale(1.1); 
          }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes particle-1 {
          0% { transform: translate(0, 0) scale(0); opacity: 1; }
          100% { transform: translate(-20px, -20px) scale(1); opacity: 0; }
        }

        @keyframes particle-2 {
          0% { transform: translate(0, 0) scale(0); opacity: 1; }
          100% { transform: translate(20px, -15px) scale(1); opacity: 0; }
        }

        @keyframes particle-3 {
          0% { transform: translate(0, 0) scale(0); opacity: 1; }
          100% { transform: translate(-15px, 20px) scale(1); opacity: 0; }
        }

        .animate-wiggle {
          animation: wiggle 2s ease-in-out infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-particle-1 {
          animation: particle-1 1s ease-out forwards;
        }

        .animate-particle-2 {
          animation: particle-2 1.2s ease-out forwards;
        }

        .animate-particle-3 {
          animation: particle-3 1.1s ease-out forwards;
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: translateY(-15px);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }

        .animate-bounce {
          animation: bounce 1s infinite;
        }
      `}</style>
    </div>
  );
}