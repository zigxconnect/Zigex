"use client";

import React, { useState } from "react";
import { Edit3, Plus } from "lucide-react";
import CreateProjectModal, { ProjectFormData } from "./CreateProjectModal";

interface CreateProjectButtonProps {
  variant?: "floating" | "header" | "custom";
  customTrigger?: React.ReactNode;
}

export default function CreateProjectButton({ variant = "header", customTrigger }: CreateProjectButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (projectData: ProjectFormData) => {
    // TODO: Implement your API call here to save the project
    console.log("Project data:", projectData);
    
    // Example API call structure:
    // const formData = new FormData();
    // formData.append('title', projectData.title);
    // formData.append('description', projectData.description);
    // if (projectData.coverImage) {
    //   formData.append('coverImage', projectData.coverImage);
    // }
    // formData.append('githubLink', projectData.githubLink);
    // formData.append('duration', projectData.duration);
    
    // await fetch('/api/projects', {
    //   method: 'POST',
    //   body: formData,
    // });
  };

  if (variant === "floating") {
    return (
      <>
        {/* Floating Action Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-30 right-6 lg:bottom-8 lg:right-8 z-40 group cursor-pointer"
          aria-label="Create project post"
        >
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-secondary text-white text-sm font-medium px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
              Share your project
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-secondary"></div>
            </div>
          </div>

          {/* Button */}
          <div className="relative">
            <div className="w-14 h-14 bg-blue-500 rounded-full shadow-lg hover:shadow-xl hover:bg-blue-600 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95">
              <Edit3 size={24} className="text-white" />
            </div>
            
            {/* Pulse Animation */}
            <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20"></div>
          </div>
        </button>

        {/* Modal */}
        <CreateProjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
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
          onSubmit={handleSubmit}
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
        onSubmit={handleSubmit}
      />
    </>
  );
}