"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Clock, X } from "lucide-react";

interface ProjectSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle?: string;
}

export default function ProjectSuccessModal({
  isOpen,
  onClose,
  projectTitle = "Your project"
}: ProjectSuccessModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsAnimatingOut(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity duration-300 ${
        isAnimatingOut ? "opacity-0" : "opacity-100"
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-blue-50 transition-all duration-500 ${
          isAnimatingOut
            ? "scale-95 opacity-0 translate-y-8"
            : "scale-100 opacity-100 animate-in zoom-in-95 slide-in-from-bottom-8"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Premium Soft Background Accent */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-br from-[#F6F8FF] via-blue-50/50 to-transparent" />

        {/* Close Button - Subtle */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 h-10 w-10 rounded-full z-10 bg-white/80 backdrop-blur-md border border-blue-50 text-slate-400 hover:text-[#155DFC] flex items-center justify-center transition-all duration-300 shadow-sm"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="relative px-8 pt-12 pb-10">
          {/* Icon with Animation - Brand Blue */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              {/* Pulsing Background - Brand Blue */}
              <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping" />
              <div className="absolute inset-0 bg-[#155DFC]/10 rounded-full animate-pulse" />
              
              {/* Main Icon */}
              <div className="relative bg-[#155DFC] rounded-[2rem] p-6 shadow-xl shadow-blue-200">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>

          {/* Heading - Bold & Professional */}
          <div className="text-center space-y-2 mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
              Project Secured!
            </h2>
            <p className="text-[10px] font-black text-[#155DFC] uppercase tracking-[0.2em]">
              Validation in progress
            </p>
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-center text-slate-500 mb-8 leading-relaxed font-medium">
            <span className="text-slate-900 font-bold">
              {projectTitle}
            </span>{" "}
            has been successfully registered. Our curators are already on the move.
          </p>

          {/* Review Info Card - Premium Zigex Style */}
          <div className="bg-[#F6F8FF] border border-blue-100 rounded-[1.5rem] p-5 mb-8">
            <div className="flex items-start gap-4">
              <div className="bg-white rounded-xl p-2.5 shadow-sm border border-blue-50 shrink-0">
                <Clock className="h-5 w-5 text-[#155DFC]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-[10px] text-[#155DFC] uppercase tracking-wider mb-1">
                  Timeline
                </h3>
                <p className="text-sm text-slate-800 font-bold">
                  Elite review within 48h
                </p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  We'll notify you the moment it goes live.
                </p>
              </div>
            </div>
          </div>

          {/* Action Button - High Contrast */}
          <button
            onClick={handleClose}
            className="w-full rounded-2xl font-black text-xs uppercase tracking-[0.15em] h-14 bg-[#155DFC] hover:bg-[#1A3CB9] text-white shadow-xl shadow-blue-200 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]"
          >
            Acknowledge & Sync
          </button>

          {/* Footer Note */}
          <p className="text-[10px] text-center text-slate-400 font-medium mt-6">
            Questions? Speak with the squad at{" "}
            <span className="text-[#155DFC] font-black cursor-pointer hover:underline">
              support@zigex.com
            </span>
          </p>
        </div>
      </div>

    </div>
  );
}