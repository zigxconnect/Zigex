"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Clock, Sparkles, X } from "lucide-react";

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
        className={`relative w-full max-w-md bg-white dark:bg-gray-950 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 transition-all duration-300 ${
          isAnimatingOut
            ? "scale-95 opacity-0"
            : "scale-100 opacity-100 animate-in zoom-in-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient Background Accent */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-green-500/10 via-blue-500/10 to-purple-500/10 dark:from-green-500/5 dark:via-blue-500/5 dark:to-purple-500/5" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 h-8 w-8 rounded-full z-10 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="relative px-6 pt-8 pb-6 sm:px-8 sm:pt-10 sm:pb-8">
          {/* Icon with Animation */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              {/* Pulsing Background */}
              <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
              <div className="absolute inset-0 bg-green-500/10 rounded-full animate-pulse" />
              
              {/* Main Icon */}
              <div className="relative bg-green-500 rounded-full p-4 sm:p-5">
                <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>

              {/* Sparkle Accent */}
              <div className="absolute -top-1 -right-1 text-yellow-400 animate-pulse">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-900 dark:text-white mb-3">
            Project Submitted! 🎉
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-base text-center text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            <span className="font-semibold text-gray-900 dark:text-white">
              {projectTitle}
            </span>{" "}
            has been received and is now under review by the Zigex team.
          </p>

          {/* Review Info Card */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="bg-blue-500/10 rounded-lg p-2 shrink-0">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                  Review Timeline
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Our team will review your project within{" "}
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    48 hours
                  </span>
                  . You'll be notified once it's approved!
                </p>
              </div>
            </div>
          </div>

          {/* What's Next Section */}
          <div className="space-y-3 mb-6">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              What's Next?
            </h3>
            <ul className="space-y-2.5">
              {[
                "We'll review your project details",
                "Check for quality and guidelines",
                "You'll receive a notification via email"
              ].map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400"
                >
                  <div className="bg-green-500/10 rounded-full p-0.5 mt-0.5 shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Button */}
          <button
            onClick={handleClose}
            className="w-full rounded-full font-semibold text-sm sm:text-base h-11 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-white"
          >
            Got it, thanks!
          </button>

          {/* Footer Note */}
          <p className="text-[10px] sm:text-xs text-center text-gray-500 dark:text-gray-500 mt-4">
            Need help? Contact us at{" "}
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              support@zigex.com
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}