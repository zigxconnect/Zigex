"use client";

import { Button } from "./Button";
import { Bot } from "lucide-react";

export const AIChatButton = ({ className }: { className?: string }) => {
  return (
    <div className={`relative ${className}`}>
      <Button 
        variant="premium" 
        className="group relative overflow-hidden flex items-center gap-2 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 border-2 border-white font-bold"
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 via-pink-400/30 to-blue-400/30 animate-pulse"></div>
        
        {/* Dynamic shimmer effect - no fading */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
        
        {/* Rotating border glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 rounded-lg blur-sm group-hover:blur-md transition-all duration-300"></div>
        
        {/* Button content */}
        <div className="relative z-10 flex items-center gap-2 px-1">
          <Bot 
            size={18} 
            className="group-hover:rotate-12 transition-transform duration-300 text-white drop-shadow-lg" 
          />
          <span className="hidden sm:inline font-black tracking-wider text-white text-sm">
            FuPro
            <span className="bg-gradient-to-r from-yellow-300 to-yellow-100 bg-clip-text text-transparent font-black">
              AI
            </span>
          </span>
          
          {/* Energetic pulse indicator */}
          <div className="w-2 h-2 bg-yellow-300 rounded-full animate-ping shadow-lg"></div>
        </div>
      </Button>
      
      {/* Premium badge */}
      <div className="absolute -top-3 -right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-black px-2 py-1 rounded-full animate-bounce shadow-lg border border-white z-20">
        🔥 HOT
      </div>
      
      {/* Action call on hover */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-lg">
        ⚡ Start Chat Now!
      </div>
    </div>
  );
};