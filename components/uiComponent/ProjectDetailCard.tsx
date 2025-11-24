"use client";

import React, { useState } from "react";
import ProjectDetailMedia from "./ProjectDetailMedia";
import ContributeModal from "./ContributeModal";
import Link from "next/link";
import { ExternalLink, Github, Calendar, Clock, User, Heart, Share2, Eye } from "lucide-react";
import Image from "next/image";

interface Project {
  id: string;
  project_title: string;
  description: string;
  cover_image_url: string | null;
  project_video_url: string | null;
  uploaded_video_url: string | null;
  github_repository: string | null;
  project_duration: string | null;
  created_at: string;
  end_date: string | null;
  student_id: string;
  is_valid: boolean;
}

interface Owner {
  id: string;
  full_name: string;
  avatar_url?: string | null;
}

export default function ProjectDetailCard({ project, owner }: { project: Project; owner?: Owner | null }) {
  const [openContribute, setOpenContribute] = useState(false);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section with Media */}
      <div className="relative mb-8 lg:mb-12">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-black">
          <ProjectDetailMedia
            uploadedVideo={project.uploaded_video_url}
            youtubeVideo={project.project_video_url}
            coverImage={project.cover_image_url ?? undefined}
            title={project.project_title}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          
          {/* Floating Action Buttons */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex gap-2 z-10">
            <button className="backdrop-blur-xl bg-white/20 hover:bg-white/30 text-white p-2.5 sm:p-3 rounded-full transition-all duration-300 hover:scale-110 border border-white/30 shadow-lg">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button className="backdrop-blur-xl bg-white/20 hover:bg-white/30 text-white p-2.5 sm:p-3 rounded-full transition-all duration-300 hover:scale-110 border border-white/30 shadow-lg">
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Description Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 backdrop-blur-sm border border-white/20">
            {/* Title Section */}
            <div className="mb-6">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                {project.project_title}
              </h1>
              
              {/* Author Info - Mobile */}
              <div className="flex items-center gap-3 lg:hidden mb-4">
  {owner?.avatar_url ? (
    <Image
      src={owner.avatar_url}
      alt={owner.full_name}
      width={40}
      height={40}
      className="rounded-full ring-2 ring-indigo-100 object-cover"
      style={{ width: '40px', height: '40px' }}
    />
  ) : (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-indigo-100">
      {owner?.full_name?.[0] || "U"}
    </div>
  )}
  <div>
    <p className="text-sm text-gray-600">Created by</p>
    <p className="font-semibold text-gray-900">{owner?.full_name || 'Contributor'}</p>
  </div>
</div>

              {/* Stats Bar */}
              <div className="flex flex-wrap gap-4 sm:gap-6 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                  <div>
                    <span className="text-xs text-gray-500 block">Started</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(project.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                
                {project.project_duration && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-5 h-5 text-indigo-500" />
                    <div>
                      <span className="text-xs text-gray-500 block">Duration</span>
                      <span className="text-sm font-medium text-gray-900">{project.project_duration}</span>
                    </div>
                  </div>
                )}

                {project.end_date && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                    <div>
                      <span className="text-xs text-gray-500 block">End Date</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(project.end_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-blue-500 rounded-full" />
                About This Project
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {project.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
              <button 
                onClick={() => setOpenContribute(true)} 
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                <Heart className="w-5 h-5" />
                Contribute to Project
              </button>

              {/* {project.github_repository && (
                <a 
                  href={project.github_repository} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:scale-105"
                >
                  <Github className="w-5 h-5" />
                  View Repository
                </a>
              )} */}

              <Link 
                href={`/dashboard/student/${project.student_id}`} 
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 hover:border-indigo-300 rounded-xl font-medium transition-all duration-200 hover:shadow-lg"
              >
                <User className="w-5 h-5" />
                View Profile
              </Link>
            </div>
          </div>

          {/* Additional Info Card (if needed) */}
          {!project.is_valid && (
            <div className="bg-amber-50 border-l-4 border-amber-500 rounded-xl p-6 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-amber-900">Pending Validation</h3>
                  <p className="text-sm text-amber-800 mt-1">This project is currently under review and pending validation.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Author Card - Desktop */}
          {owner && (
            <div className="hidden lg:block bg-white rounded-2xl shadow-xl p-6 backdrop-blur-sm border border-white/20 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Project Creator</h3>
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative mb-4">
                  {owner.avatar_url ? (
                    <Image
                      src={owner.avatar_url}
                      alt={owner.full_name}
                      width={80}
                      height={80}
                      className="rounded-full ring-4 ring-indigo-100"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-indigo-100">
                      {owner.full_name?.[0] || "U"}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white" />
                </div>
                <h4 className="font-semibold text-gray-900 text-lg mb-1">
                  {owner.full_name || "Anonymous"}
                </h4>
                <p className="text-sm text-gray-500">Project Owner</p>
              </div>
              <Link
                href={`/dashboard/student/${project.student_id}`}
                className="block w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg text-center"
              >
                View Full Profile
              </Link>
            </div>
          )}

          {/* Call to Action Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
            <h3 className="text-lg font-bold mb-3">Love this project?</h3>
            <p className="text-indigo-100 text-sm mb-4 leading-relaxed">
              Support the creator by contributing to this project or sharing it with others who might be interested.
            </p>
            <button 
              onClick={() => setOpenContribute(true)}
              className="w-full px-4 py-2.5 bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl font-medium transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4" />
              Contribute Now
            </button>
          </div>

          {/* Project Stats Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 backdrop-blur-sm border border-white/20">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Project Details</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  project.is_valid 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {project.is_valid ? 'Validated' : 'Pending'}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-600">Created</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(project.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>

              {project.project_duration && (
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-gray-600">Timeline</span>
                  <span className="text-sm font-medium text-gray-900">{project.project_duration}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ContributeModal 
        isOpen={openContribute} 
        onClose={() => setOpenContribute(false)} 
        projectTitle={project.project_title} 
        githubUrl={project.github_repository} 
      />
    </div>
  );
}