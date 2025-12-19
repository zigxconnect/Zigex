"use client";

import React from "react";
import { motion } from "framer-motion";
import { BrainCircuit, Globe, Radar, FileCode, Lightbulb } from "lucide-react";

interface AgentLoaderProps {
  toolName?: string | null;
}

export function AgentLoader({ toolName }: AgentLoaderProps) {
  
  // 1. Deep Research: Rotating Globe (Scanning)
  if (toolName === "Deep Research") {
    return (
      <div className="flex items-center gap-3 text-blue-600">
        <div className="relative w-8 h-8 flex items-center justify-center">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
                <Globe size={24} className="text-blue-600 opacity-80" />
            </motion.div>
            {/* Orbiting satellite dot */}
            <motion.div 
               className="absolute w-full h-full border border-blue-200 rounded-full"
               animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
               transition={{ duration: 2, repeat: Infinity }}
            />
        </div>
        <span className="text-sm font-medium animate-pulse text-blue-700">Scouring the web for sources...</span>
      </div>
    );
  }

  // 2. Opportunity Finder: Radar Sweep
  if (toolName === "Opportunity Finder") {
    return (
      <div className="flex items-center gap-3 text-emerald-600">
        <div className="relative w-8 h-8 flex items-center justify-center">
             <Radar size={24} className="text-emerald-600 relative z-10" />
             {/* Radar Ping Waves */}
             <motion.div 
                className="absolute inset-0 bg-emerald-100/50 rounded-full z-0"
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
             />
             <motion.div 
                className="absolute inset-0 bg-emerald-100/50 rounded-full z-0"
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
             />
        </div>
        <span className="text-sm font-medium animate-pulse text-emerald-700">Scanning opportunities...</span>
      </div>
    );
  }

  // 3. Project Review: Code Analysis
  if (toolName === "Project Review") {
    return (
        <div className="flex items-center gap-3 text-amber-600">
            <div className="relative w-8 h-8 flex items-center justify-center overflow-hidden bg-amber-50 rounded-md border border-amber-200">
                 <FileCode size={18} className="text-amber-600 relative z-10" />
                 {/* Scanning Line */}
                 <motion.div 
                    className="absolute top-0 left-0 w-full h-0.5 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] z-20"
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                 />
            </div>
            <span className="text-sm font-medium animate-pulse text-amber-700">Analysing codebase...</span>
      </div>
    );
  }
  
  // 4. Scholarship Search: Sparkles
  if (toolName === "Scholarship Search") {
      return (
        <div className="flex items-center gap-3 text-pink-600">
            <div className="relative w-8 h-8 flex items-center justify-center">
                 <Lightbulb size={24} className="text-pink-600" />
                 {/* Random Sparkles */}
                 <motion.div className="absolute top-0 right-0 w-1 h-1 bg-pink-400 rounded-full" animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
                 <motion.div className="absolute bottom-1 left-0 w-1.5 h-1.5 bg-pink-500 rounded-full" animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.5 }} />
            </div>
            <span className="text-sm font-medium animate-pulse text-pink-700">Discovering scholarships...</span>
        </div>
      );
  }

  // Default: Breathing Brain
  return (
    <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-100 to-white shadow-sm ring-1 ring-blue-50 p-1 flex items-center justify-center">
             <BrainCircuit size={18} className="text-blue-500 animate-pulse" />
        </div>
        <div className="flex items-center gap-1.5 translate-y-0.5">
           <motion.span 
                className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
           />
           <motion.span 
                className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
           />
           <motion.span 
                className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
           />
        </div>
    </div>
  );
}
