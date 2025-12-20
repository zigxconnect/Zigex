"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import CreateProjectModal from "./CreateProjectModal";

interface CreateProjectButtonProps {
  variant?: "floating" | "header" | "custom";
  customTrigger?: React.ReactNode;
}

export default function CreateProjectButton({ variant = "header", customTrigger }: CreateProjectButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (variant === "floating") {
    return (
      <>
        {/* Floating Action Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-24 right-6 lg:bottom-12 lg:right-12 z-50 group cursor-pointer flex items-center gap-3 transition-all duration-500"
          aria-label="Create project post"
        >
          {/* Label that expands on hover */}
          <div className="bg-blue-600 text-white font-bold py-3 px-6 rounded-2xl shadow-2xl overflow-hidden max-w-0 group-hover:max-w-xs transition-all duration-500 ease-in-out opacity-0 group-hover:opacity-100 whitespace-nowrap hidden lg:block border border-blue-400">
            Post a Project
          </div>

          {/* Button Core */}
          <div className="relative">
            {/* Background Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
            
            <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 active:scale-95 border-2 border-white/20">
              <Plus size={32} className="text-white group-hover:scale-110 transition-transform duration-300" />
            </div>
            
            {/* Pulse Animation - Multi-layer */}
            <div className="absolute inset-0 rounded-2xl bg-blue-500 animate-ping opacity-20" />
            <div className="absolute inset-0 rounded-2xl bg-indigo-500 animate-pulse opacity-10" />
            
            {/* Notification Badge-style dot for extra eye-catch */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white hidden group-hover:block animate-bounce" />
          </div>
        </button>

        {/* Modal */}
        <CreateProjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </>
    );
  }

  if (variant === "custom" && customTrigger) {
    return (
      <>
        <div onClick={() => setIsModalOpen(true)} className="cursor-pointer">
          {customTrigger}
        </div>
        <CreateProjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </>
    );
  }

  // Header variant - regular button
  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm sm:text-base"
        aria-label="Create new project"
      >
        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
        Create Project
      </button>

      {/* Modal */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}