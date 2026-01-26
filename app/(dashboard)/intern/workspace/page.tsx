"use client";

import { motion } from "framer-motion";
import { Zap, Construction, Clock, ArrowLeft, Sparkles, Rocket } from "lucide-react";

export default function InternWorkspaceMaintenance() {
  return (
    <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center p-6 overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-[120px] -mr-32 -mt-32 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/30 rounded-full blur-[100px] -ml-20 -mb-20" />
      
      <div className="max-w-2xl w-full text-center space-y-12 relative z-10">
        
        {/* Animated Icon Logic (Mimicking Lottie) */}
        <div className="relative flex justify-center">
            {/* Pulsing Outer Ring */}
            <motion.div 
               animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="absolute w-48 h-48 bg-blue-600/10 rounded-full blur-xl"
            />
            
            {/* Main Animated Orb */}
            <motion.div 
               initial={{ y: 0 }}
               animate={{ y: [-10, 10, -10] }}
               transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
               className="w-32 h-32 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center border border-blue-50 relative group"
            >
               <Construction size={48} className="text-blue-600 animate-bounce" />
               
               {/* Orbital Sparkles */}
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-[-20px]"
               >
                  <Sparkles size={20} className="text-amber-400 absolute top-0 left-1/2 -translate-x-1/2" />
                  <Zap size={16} className="text-blue-400 absolute bottom-0 left-1/2 -translate-x-1/2" />
               </motion.div>
            </motion.div>
        </div>

        {/* Text Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-lg shadow-blue-200">
              System Update in Progress
           </div>
           
           <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight px-4">
              Intern management system is <span className="text-blue-600">currently being worked on.</span>
           </h1>
           
           <p className="text-slate-500 font-medium text-lg max-w-lg mx-auto leading-relaxed">
              We're polishing the experience to give you the most stunning professional hub. This workspace will be live shortly with all your metrics, notes, and tasks.
           </p>
        </motion.div>

        {/* Progress Indicators */}
        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.5 }}
           className="flex flex-col items-center gap-8"
        >
           <div className="flex gap-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                 <Clock size={16} className="text-blue-500" />
                 ETA: Coming Soon
              </div>
              <div className="w-px h-4 bg-slate-200" />
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                 <Rocket size={16} className="text-blue-500" />
                 V2.0 Core
              </div>
           </div>

           <button 
             onClick={() => window.history.back()}
             className="group flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-sm hover:bg-slate-50 transition-all hover:gap-5"
           >
             <ArrowLeft size={16} />
             Return to Dashboard
           </button>
        </motion.div>

        {/* Floating Animation Elements (Like Lottie particles) */}
        {[...Array(6)].map((_, i) => (
           <motion.div
             key={i}
             className="absolute w-2 h-2 rounded-full bg-blue-200/50"
             style={{
               top: `${Math.random() * 100}%`,
               left: `${Math.random() * 100}%`,
             }}
             animate={{
               y: [0, -40, 0],
               opacity: [0, 1, 0],
               scale: [0.5, 1, 0.5]
             }}
             transition={{
               duration: 3 + Math.random() * 4,
               repeat: Infinity,
               delay: Math.random() * 5
             }}
           />
        ))}
      </div>
    </div>
  );
}
