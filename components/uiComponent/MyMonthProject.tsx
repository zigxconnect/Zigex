"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Calendar, Github, Clock, ExternalLink, Edit } from "lucide-react";
import ContributeModal from "./ContributeModal";

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
}

interface User {
  id: string;
  full_name: string;
  avatar_url: string | null;
  user_id: string;
  github_url?: string | null;
}

interface MyMonthProjectProps {
  user: User;
  project: Project | null;
  isVisitor?: boolean;
  profileOwnerId?: string;
  isOwner?: boolean;
}

export default function MyMonthProject({ 
  user, 
  project, 
  profileOwnerId, 
  isVisitor = false,
  isOwner = false 
}: MyMonthProjectProps) {
  const [open, setOpen] = useState(false);
  const [showIndicator, setShowIndicator] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);

  // Hide indicator after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowIndicator(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Lock body scroll when open on mobile
  useEffect(() => {
    if (typeof window === "undefined") return;
    const original = document.body.style.overflow;
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = original;
    }
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Extract YouTube video ID
  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}?autoplay=1` : null;
  };

  const videoUrl = project?.project_video_url || project?.uploaded_video_url;
  const youtubeEmbedUrl = videoUrl ? getYouTubeEmbedUrl(videoUrl) : null;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get image URL with fallback
  const getImageUrl = (url: string | null) => {
    if (!url) return '/projects.png';
    
    // If it's already a full URL, return it
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If it's a Supabase storage path, construct the full URL
    if (url.startsWith('project-covers/') || url.startsWith('/project-covers/')) {
      const cleanPath = url.startsWith('/') ? url.slice(1) : url;
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/project-images/${cleanPath}`;
    }
    
    // Otherwise, return as is (might be a local path)
    return url || '/projects.png';
  };

  const coverImageUrl = getImageUrl(project?.cover_image_url);

  // No project fallback
  if (!project) {
    return (
      <div>
        {/* Mobile: Show as main card for visitors */}
        {isVisitor && (
          <div className="md:hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden mb-6 relative">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <Calendar size={40} className="text-gray-600" />
              </div>
              
              {user.avatar_url ? (
                <div className="relative w-14 h-14 mx-auto mb-3">
                  <Image
                    src={user.avatar_url}
                    alt={user.full_name}
                    width={56}
                    height={56}
                    className="rounded-full border-4 border-white shadow-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-3 border-4 border-white shadow-lg">
                  {user.full_name.split(" ").map(n => n[0]).join("").toUpperCase()}
                </div>
              )}
              
              <h3 className="text-lg font-bold text-gray-800 mb-2">{user.full_name}</h3>
              <h4 className="text-xl font-bold text-gray-700 mb-3">No Active Project Yet</h4>
              <p className="text-sm text-gray-600 leading-relaxed max-w-xs mx-auto">
                This user hasn't posted a monthly project yet. Check back later for updates!
              </p>
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <aside className="fixed right-6 top-32 w-72 lg:w-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200 shadow-xl overflow-hidden hidden md:block">
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <Calendar size={32} className="text-gray-600" />
            </div>
            
            {user.avatar_url ? (
              <div className="relative w-12 h-12 mx-auto mb-3">
                <Image
                  src={user.avatar_url}
                  alt={user.full_name}
                  width={48}
                  height={48}
                  className="rounded-full border-4 border-white shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3 border-4 border-white shadow-lg">
                {user.full_name.split(" ").map(n => n[0]).join("").toUpperCase()}
              </div>
            )}
            
            <h3 className="text-base font-bold text-gray-800 mb-2">{user.full_name}</h3>
            <h4 className="text-lg font-bold text-gray-700 mb-2">No Active Project Yet</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              {isVisitor 
                ? "This user hasn't posted a project yet."
                : "You haven't posted a project yet. Share what you're working on!"}
            </p>
          </div>
        </aside>
      </div>
    );
  }

  // Determine if this is the owner viewing their own project
  const isMyProject = isOwner;

  // Has project - render full component
  return (
    <div>
      {/* Mobile: Show as main card for visitors */}
      {isVisitor && (
        <div className="md:hidden bg-white rounded-2xl border-2 border-blue-200 shadow-lg overflow-hidden mb-6 relative">
          {/* First-time Indicator */}
          {showIndicator && !isMyProject && (
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-10 animate-bounce">
              <div className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg border-2 border-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                ACTIVE PROJECT
              </div>
            </div>
          )}

          {/* Video Section with Twitter-style Blue Theme */}
          <div className="relative aspect-video bg-gradient-to-br from-blue-400 to-blue-600 overflow-hidden">
            {!showVideo ? (
              <>
                {!imageError ? (
                  <img 
                    src={coverImageUrl} 
                    alt={project.project_title}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
                    <div className="text-center text-white p-6">
                      <Calendar size={48} className="mx-auto mb-3 opacity-80" />
                      <h3 className="text-lg font-bold">{project.project_title}</h3>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/40" />
                
                {/* Play Button Overlay */}
                {videoUrl && (
                  <button
                    onClick={() => setShowVideo(true)}
                    className="absolute inset-0 flex items-center justify-center group"
                  >
                    <div className="w-16 h-16 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <Play size={28} className="text-[#1a8cd8] ml-1" fill="currentColor" />
                    </div>
                  </button>
                )}

                {/* Active Badge */}
                <div className="absolute top-3 right-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-full shadow-lg border border-blue-700/50 backdrop-blur-sm">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-xs font-semibold">Active Project</span>
                  </div>
                </div>
              </>
            ) : showVideo && youtubeEmbedUrl ? (
              <iframe
                src={youtubeEmbedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : null}
          </div>

          {/* Project Info */}
          <div className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h5 className="text-lg font-bold text-gray-900 mb-1">{project.project_title}</h5>
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{project.description}</p>
              </div>
            </div>

            {/* Meta Info Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Calendar size={14} className="text-blue-500" />
                <div>
                  <div className="font-semibold text-gray-900">Started</div>
                  <div>{formatDate(project.created_at)}</div>
                </div>
              </div>
              
              {project.project_duration && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Clock size={14} className="text-purple-500" />
                  <div>
                    <div className="font-semibold text-gray-900">Duration</div>
                    <div className="capitalize">{project.project_duration.replace('-', ' ')}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {isMyProject ? (
              <Link
                href={`/dashboard/projects/edit/${project.id}`}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all hover:shadow-md font-semibold text-sm"
              >
                <Edit size={16} />
                <span>Edit Project</span>
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {project.github_repository && (
                  <button
                    onClick={() => setShowContributeModal(true)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors shadow-md"
                  >
                    <Github size={16} />
                    <span className="text-sm font-medium">GitHub</span>
                  </button>
                )}
                
                <button 
                  onClick={() => setShowContributeModal(true)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  <ExternalLink size={16} />
                  <span className="text-sm font-medium">Contribute</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Floating Button (for non-visitors) - WITH INTRO TEXT */}
      {!isVisitor && (
        <div className="relative">
          {/* Introduction Text Banner - Only on Mobile */}
          <div className="md:hidden mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Calendar size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  📌 Your Active Monthly Project
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  This is your current project showcase. Click the <span className="font-semibold text-blue-600">"My Project"</span> button below to view details, edit, or manage your project.
                </p>
              </div>
            </div>
          </div>

          {showIndicator && (
            <div className="md:hidden fixed left-4 bottom-20 z-50 animate-bounce">
              <div className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg border-2 border-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                YOUR PROJECT
              </div>
            </div>
          )}

          <button
            onClick={() => setOpen(true)}
            className="cursor-pointer md:hidden fixed left-4 bottom-6 z-50 inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-full shadow-lg border border-blue-700 hover:bg-blue-700"
          >
            <Calendar size={16} />
            <span className="text-sm font-medium">My Project</span>
          </button>
        </div>
      )}

      {/* Mobile Overlay */}
      {open && <div onClick={() => setOpen(false)} className="md:hidden fixed inset-0 bg-black/40 z-40" />}

      {/* Desktop Sidebar */}
      <aside className="fixed right-6 top-32 w-72 lg:w-80 bg-white rounded-2xl border-2 border-blue-200 shadow-xl overflow-hidden hidden md:block">
        {showIndicator && !isMyProject && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 animate-bounce">
            <div className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg border-2 border-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              ACTIVE PROJECT
            </div>
          </div>
        )}

        {/* Video Section */}
        <div className="relative aspect-video bg-gradient-to-br from-blue-400 to-blue-600 overflow-hidden">
          {!showVideo ? (
            <>
              {!imageError ? (
                <img 
                  src={coverImageUrl} 
                  alt={project.project_title}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
                  <div className="text-center text-white p-4">
                    <Calendar size={40} className="mx-auto mb-2 opacity-80" />
                    <h3 className="text-sm font-bold">{project.project_title}</h3>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/40" />
              
              {videoUrl && (
                <button
                  onClick={() => setShowVideo(true)}
                  className="absolute inset-0 flex items-center justify-center group"
                >
                  <div className="w-14 h-14 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play size={24} className="text-[#1a8cd8] ml-1" fill="currentColor" />
                  </div>
                </button>
              )}

              <div className="absolute top-3 right-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-600 text-white rounded-full shadow-lg border border-blue-700/50 backdrop-blur-sm">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  <span className="text-xs font-semibold">Active</span>
                </div>
              </div>
            </>
          ) : showVideo && youtubeEmbedUrl ? (
            <iframe
              src={youtubeEmbedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : null}
        </div>

        {/* Project Details */}
        <div className="p-4 space-y-3">
          <div>
            <h5 className="text-base font-bold text-gray-900 mb-1">{project.project_title}</h5>
            <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{project.description}</p>
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-2 py-3 border-t border-b border-gray-100">
            <div className="flex items-start gap-2 text-xs">
              <Calendar size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-gray-900">Started</div>
                <div className="text-gray-600">{formatDate(project.created_at)}</div>
              </div>
            </div>
            
            {project.project_duration && (
              <div className="flex items-start gap-2 text-xs">
                <Clock size={14} className="text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900">Duration</div>
                  <div className="text-gray-600 capitalize">{project.project_duration.replace('-', ' ')}</div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {isMyProject ? (
            <Link
              href={`/dashboard/projects/edit/${project.id}`}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all hover:shadow-md font-medium text-sm"
            >
              <Edit size={16} />
              Edit Project
            </Link>
          ) : (
            <div className="space-y-2">
              {project.github_repository && (
                <button
                  onClick={() => setShowContributeModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  <Github size={16} />
                  View Repository
                </button>
              )}
              
              <button 
                onClick={() => setShowContributeModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm font-medium"
              >
                <ExternalLink size={16} />
                Contribute
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Sliding Panel (for non-visitors) */}
      {!isVisitor && (
        <aside
          className={
            "md:hidden fixed top-0 left-0 h-full z-50 w-72 bg-white border-r-2 border-blue-200 shadow-xl transform transition-transform duration-300 " + 
            (open ? "translate-x-0" : "-translate-x-full")
          }
        >
          <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-blue-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md overflow-hidden bg-gray-100 ring-2 ring-blue-200">
                {!imageError ? (
                  <img 
                    src={coverImageUrl} 
                    alt={project.project_title}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Calendar size={20} className="text-white" />
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  {project.project_title}
                  <span className="inline-flex items-center px-1.5 py-0.5 bg-blue-600 text-white rounded text-xs font-bold">PROJECT</span>
                </div>
                <div className="text-xs text-gray-500">Monthly Highlight</div>
              </div>
            </div>

            <button 
              onClick={() => setOpen(false)} 
              className="inline-flex cursor-pointer items-center justify-center w-8 h-8 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4 overflow-y-auto h-full pb-20">
            <div className="relative aspect-video bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg overflow-hidden mb-4">
              {!showVideo ? (
                <>
                  {!imageError ? (
                    <img 
                      src={coverImageUrl} 
                      alt={project.project_title}
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
                      <Calendar size={40} className="text-white opacity-80" />
                    </div>
                  )}
                  {videoUrl && (
                    <button
                      onClick={() => setShowVideo(true)}
                      className="absolute inset-0 flex items-center justify-center group cursor-pointer"
                    >
                      <div className="w-14 h-14 bg-white/95 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                        <Play size={24} className="text-[#1a8cd8] ml-1" fill="currentColor" />
                      </div>
                    </button>
                  )}
                </>
              ) : showVideo && youtubeEmbedUrl ? (
                <iframe
                  src={youtubeEmbedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : null}
            </div>

            <h5 className="text-sm font-bold text-gray-900 mb-2">{project.project_title}</h5>
            <p className="text-xs text-gray-600 mb-4">{project.description}</p>

            <div className="grid grid-cols-2 gap-3 mb-4 py-3 border-y border-gray-100">
              <div className="flex items-start gap-2 text-xs">
                <Calendar size={14} className="text-blue-500 mt-0.5" />
                <div>
                  <div className="font-semibold text-gray-900">Started</div>
                  <div className="text-gray-600">{formatDate(project.created_at)}</div>
                </div>
              </div>
              
              {project.project_duration && (
                <div className="flex items-start gap-2 text-xs">
                  <Clock size={14} className="text-purple-500 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900">Duration</div>
                    <div className="text-gray-600 capitalize">{project.project_duration.replace('-', ' ')}</div>
                  </div>
                </div>
              )}
            </div>

            {isMyProject ? (
              <Link
                href={`/dashboard/projects/edit/${project.id}`}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all hover:shadow-md font-medium text-sm mb-3"
              >
                <Edit size={16} />
                Edit Project
              </Link>
            ) : (
              <>
                {project.github_repository && (
                  <button
                    onClick={() => setShowContributeModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800transition-colors mb-3 text-sm font-medium"
                  >
                    <Github size={16} />
                    View Repository
                  </button>
                )}

                <button 
                  onClick={() => setShowContributeModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                >
                  <ExternalLink size={16} />
                  Contribute to Project
                </button>
              </>
            )}
          </div>
        </aside>
      )}

      {/* Contribute Modal */}
      <ContributeModal 
        isOpen={showContributeModal} 
        onClose={() => setShowContributeModal(false)}
        projectTitle={project?.project_title || ''}
        githubUrl={project?.github_repository || ''}
      />
    </div>
  );
}