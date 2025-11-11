'use client';

import React from 'react';

interface BamendaIllustrationProps {
  className?: string;
}

const BamendaIllustration: React.FC<BamendaIllustrationProps> = ({ className = "" }) => {
  return (
    <div className={`w-full h-full ${className}`}>
      <svg
        viewBox="0 0 800 600"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.4" />
          </linearGradient>
          
          <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          
          <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          
          <radialGradient id="sunGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FCD34D" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#F59E0B" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0.5" />
          </radialGradient>
          
          <linearGradient id="roadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6B7280" />
            <stop offset="100%" stopColor="#4B5563" />
          </linearGradient>
        </defs>

        {/* Sky Background */}
        <rect width="800" height="600" fill="url(#skyGradient)" />

        {/* Sun */}
        <circle cx="650" cy="120" r="45" fill="url(#sunGradient)">
          <animate attributeName="r" values="40;50;40" dur="4s" repeatCount="indefinite" />
        </circle>
        
        {/* Sun Rays */}
        <g stroke="#FCD34D" strokeWidth="2" strokeOpacity="0.6">
          <line x1="650" y1="60" x2="650" y2="30">
            <animateTransform attributeName="transform" type="rotate" values="0 650 120;360 650 120" dur="20s" repeatCount="indefinite" />
          </line>
          <line x1="700" y1="120" x2="730" y2="120">
            <animateTransform attributeName="transform" type="rotate" values="0 650 120;360 650 120" dur="20s" repeatCount="indefinite" />
          </line>
          <line x1="687" y1="83" x2="708" y2="62">
            <animateTransform attributeName="transform" type="rotate" values="0 650 120;360 650 120" dur="20s" repeatCount="indefinite" />
          </line>
          <line x1="687" y1="157" x2="708" y2="178">
            <animateTransform attributeName="transform" type="rotate" values="0 650 120;360 650 120" dur="20s" repeatCount="indefinite" />
          </line>
        </g>

        {/* Clouds */}
        <g fill="#FFFFFF" fillOpacity="0.7">
          <ellipse cx="150" cy="100" rx="40" ry="25">
            <animateTransform attributeName="transform" type="translate" values="0 0;50 0;0 0" dur="15s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="180" cy="90" rx="35" ry="20">
            <animateTransform attributeName="transform" type="translate" values="0 0;50 0;0 0" dur="15s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="480" cy="80" rx="30" ry="18">
            <animateTransform attributeName="transform" type="translate" values="0 0;-40 0;0 0" dur="12s" repeatCount="indefinite" />
          </ellipse>
        </g>

        {/* Background Mountains (Mount Oku inspired) */}
        <path d="M0 350 L100 250 L200 280 L300 220 L400 240 L500 200 L600 230 L700 180 L800 200 L800 600 L0 600 Z" 
              fill="url(#mountainGradient)" fillOpacity="0.6" />
        
        {/* Middle Mountains */}
        <path d="M0 400 L150 320 L250 340 L350 300 L450 310 L550 280 L650 300 L750 270 L800 290 L800 600 L0 600 Z" 
              fill="url(#mountainGradient)" fillOpacity="0.8" />

        {/* Modern City Buildings */}
        <g>
          {/* Building 1 - Modern Office */}
          <rect x="100" y="320" width="60" height="180" fill="url(#buildingGradient)" rx="5">
            <animate attributeName="height" values="180;185;180" dur="3s" repeatCount="indefinite" />
          </rect>
          <rect x="110" y="330" width="8" height="12" fill="#FEF3C7" />
          <rect x="125" y="330" width="8" height="12" fill="#FEF3C7" />
          <rect x="140" y="330" width="8" height="12" fill="#FEF3C7" />
          <rect x="110" y="350" width="8" height="12" fill="#FEF3C7" />
          <rect x="125" y="350" width="8" height="12" fill="#FEF3C7" />
          <rect x="140" y="350" width="8" height="12" fill="#FEF3C7" />

          {/* Building 2 - Tech Hub */}
          <rect x="180" y="340" width="50" height="160" fill="#3B82F6" rx="8">
            <animate attributeName="height" values="160;165;160" dur="3.5s" repeatCount="indefinite" />
          </rect>
          <rect x="190" y="350" width="6" height="10" fill="#DBEAFE" />
          <rect x="205" y="350" width="6" height="10" fill="#DBEAFE" />
          <rect x="220" y="350" width="6" height="10" fill="#DBEAFE" />

          {/* Building 3 - Startup Incubator */}
          <rect x="250" y="360" width="45" height="140" fill="#10B981" rx="6">
            <animate attributeName="height" values="140;145;140" dur="2.8s" repeatCount="indefinite" />
          </rect>
          <rect x="260" y="370" width="5" height="8" fill="#D1FAE5" />
          <rect x="270" y="370" width="5" height="8" fill="#D1FAE5" />
          <rect x="280" y="370" width="5" height="8" fill="#D1FAE5" />

          {/* Building 4 - Innovation Center */}
          <rect x="310" y="330" width="55" height="170" fill="#8B5CF6" rx="7">
            <animate attributeName="height" values="170;175;170" dur="4s" repeatCount="indefinite" />
          </rect>
          <rect x="320" y="340" width="7" height="11" fill="#EDE9FE" />
          <rect x="335" y="340" width="7" height="11" fill="#EDE9FE" />
          <rect x="350" y="340" width="7" height="11" fill="#EDE9FE" />
        </g>

        {/* Career Path Road */}
        <path d="M0 480 Q200 460 400 470 T800 480 L800 500 Q600 510 400 490 T0 500 Z" 
              fill="url(#roadGradient)" />
        
        {/* Road Markings */}
        <g fill="#FFFFFF" fillOpacity="0.8">
          <rect x="100" y="475" width="30" height="3" rx="1">
            <animateTransform attributeName="transform" type="translate" values="0 0;100 0;200 0" dur="3s" repeatCount="indefinite" />
          </rect>
          <rect x="250" y="475" width="30" height="3" rx="1">
            <animateTransform attributeName="transform" type="translate" values="0 0;100 0;200 0" dur="3s" repeatCount="indefinite" />
          </rect>
          <rect x="400" y="475" width="30" height="3" rx="1">
            <animateTransform attributeName="transform" type="translate" values="0 0;100 0;200 0" dur="3s" repeatCount="indefinite" />
          </rect>
        </g>

        {/* Career Journey Elements */}
        <g>
          {/* Graduation Cap */}
          <path d="M50 450 L80 440 L110 450 L95 445 L80 455 L65 445 Z" fill="#1F2937" />
          <rect x="75" y="445" width="10" height="15" fill="#1F2937" />
          <circle cx="85" cy="442" r="2" fill="#F59E0B" />

          {/* Arrow of Progress */}
          <path d="M450 420 L480 430 L450 440 L455 430 Z" fill="#F59E0B">
            <animateTransform attributeName="transform" type="translate" values="0 0;20 0;0 0" dur="2s" repeatCount="indefinite" />
          </path>

          {/* Success Trophy */}
          <path d="M700 400 L720 400 L715 380 L705 380 Z" fill="#F59E0B" />
          <ellipse cx="710" cy="375" rx="8" ry="5" fill="#F59E0B" />
          <rect x="708" y="370" width="4" height="8" fill="#D97706" />
        </g>

        {/* Floating Career Icons */}
        <g fill="#FFFFFF" fillOpacity="0.6">
          {/* Laptop */}
          <rect x="580" y="350" width="25" height="18" rx="2">
            <animateTransform attributeName="transform" type="translate" values="0 0;0 -10;0 0" dur="3s" repeatCount="indefinite" />
          </rect>
          <rect x="582" y="352" width="21" height="12" fill="#3B82F6" />
          
          {/* Briefcase */}
          <rect x="520" y="310" width="20" height="15" rx="2">
            <animateTransform attributeName="transform" type="translate" values="0 0;0 -8;0 0" dur="3.5s" repeatCount="indefinite" />
          </rect>
          <rect x="528" y="307" width="4" height="3" />
          
          {/* Lightbulb */}
          <circle cx="420" cy="280" r="8">
            <animateTransform attributeName="transform" type="translate" values="0 0;0 -12;0 0" dur="4s" repeatCount="indefinite" />
          </circle>
          <rect x="418" y="288" width="4" height="6" />
        </g>

        {/* Trees for Natural Beauty */}
        <g>
          <ellipse cx="50" cy="450" rx="15" ry="25" fill="#059669" />
          <rect x="48" y="460" width="4" height="15" fill="#92400E" />
          
          <ellipse cx="750" cy="440" rx="18" ry="30" fill="#059669" />
          <rect x="748" y="455" width="4" height="18" fill="#92400E" />
        </g>

        {/* Ndop Plains representation (rolling hills) */}
        <path d="M0 520 Q100 500 200 510 T400 515 T600 520 T800 515 L800 600 L0 600 Z" 
              fill="#10B981" fillOpacity="0.3" />
        
        {/* Ground/Base */}
        <rect x="0" y="500" width="800" height="100" fill="#065F46" fillOpacity="0.2" />
      </svg>
    </div>
  );
};

export default BamendaIllustration;