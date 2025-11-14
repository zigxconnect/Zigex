"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Calendar, Github, Clock, ExternalLink, Edit, Clock as ClockIcon } from "lucide-react";
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
  is_valid: boolean;
}

interface User {
  id: string;
  full_name: string;
  avatar_url: string | null;
  user_id: string;
  github_url?: string | null;
}

// const isMyProject=true

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
  isOwner
}: MyMonthProjectProps) {
  const [open, setOpen] = useState(false);
  const [showIndicator, setShowIndicator] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [showReviewCard, setShowReviewCard] = useState(true);
  const [reviewCardExpired, setReviewCardExpired] = useState(false);
  // Determine if this is the owner viewing their own project
  const isMyProject = isOwner;

  // Video carousel: prioritize uploaded video first, then youtube link
  const videos: Array<{ type: "uploaded" | "youtube"; url: string }> = [];
  if (project?.uploaded_video_url) videos.push({ type: "uploaded", url: project.uploaded_video_url });
  if (project?.project_video_url) videos.push({ type: "youtube", url: project.project_video_url });
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const currentVideo = videos.length > 0 ? videos[currentVideoIndex] : null;
  const hasVideos = videos.length > 0;

  const prevVideo = () => setCurrentVideoIndex((i) => (i - 1 + videos.length) % videos.length);
  const nextVideo = () => setCurrentVideoIndex((i) => (i + 1) % videos.length);

  // Hide indicator after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowIndicator(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Handle 48-hour review card expiration
  useEffect(() => {
    if (!project || project.is_valid || !isVisitor) {
      setShowReviewCard(false);
      return;
    }

    // If project is not valid, show the review card
    setShowReviewCard(true);

    // Auto-hide review card after 48 hours
    const fortyEightHours = 48 * 60 * 60 * 1000; // 48 hours in milliseconds
    const timer = setTimeout(() => {
      setReviewCardExpired(true);
      setShowReviewCard(false);
    }, fortyEightHours);

    return () => clearTimeout(timer);
  }, [project?.is_valid, project?.id, isVisitor]);

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

  const currentYouTubeEmbed = currentVideo && currentVideo.type === "youtube" ? getYouTubeEmbedUrl(currentVideo.url) : null;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get image URL with fallback
  const getImageUrl = (url: string | null) => {
    if (!url) return '/projects.png';
    
    // If it's already a full URL (signed URL with token or http/https), return it directly
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Otherwise, return fallback
    return '/projects.png';
  };

  const coverImageUrl = getImageUrl(project?.cover_image_url ?? null);

  // CASE 1: Project exists but NOT VALID - show review card for 48 hours (ONLY for visitors)
  if (project && !project.is_valid && isVisitor) {
    if (reviewCardExpired) {
      return null; // Don't show anything after 48 hours
    }

    return (
      <div>
        {/* Mobile Review Card */}
        <div className="md:hidden bg-white rounded-2xl border-2 border-blue-200 shadow-lg overflow-hidden mb-6">
          <div className="p-6 text-center">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <ClockIcon size={32} className="text-blue-600 animate-spin" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Title and Description */}
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              🎉 Project Submitted!
            </h3>
            {isMyProject ? (
              <p className="text-gray-600 mb-6">
                Your project is <span className="font-semibold text-blue-600">submitted and under review</span>
              </p>
            ) : (
              <p className="text-gray-600 mb-6">
                <span className="font-semibold text-blue-600">{user.full_name}'s project</span> has been <span className="font-semibold text-blue-600">submitted and is under review</span>
              </p>
            )}

            {/* Timeline Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <ClockIcon size={20} className="text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">Review Timeline</p>
                  <p className="text-sm text-gray-600">
                    We'll review the project within <span className="font-bold">48 hours</span>
                  </p>
                </div>
              </div>
            </div>

            {/* What's Next */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 text-left text-sm">WHAT'S NEXT?</h4>
              <ul className="text-left space-y-2">
                {isMyProject ? (
                  <>
                    <li className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="w-4 h-4 rounded-full border-2 border-green-500 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      </div>
                      We'll review your project details
                    </li>
                    <li className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="w-4 h-4 rounded-full border-2 border-green-500 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      </div>
                      Check for quality and guidelines compliance
                    </li>
                    <li className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="w-4 h-4 rounded-full border-2 border-green-500 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      </div>
                      You'll receive a notification via email
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="w-4 h-4 rounded-full border-2 border-green-500 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      </div>
                      The team will review <span className="font-semibold text-gray-900">{user.full_name}'s</span> project details
                    </li>
                    <li className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="w-4 h-4 rounded-full border-2 border-green-500 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      </div>
                      We'll check for quality and guidelines compliance
                    </li>
                    <li className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="w-4 h-4 rounded-full border-2 border-green-500 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      </div>
                      <span className="font-semibold text-gray-900">{user.full_name}</span> will be notified once it's approved
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Message */}
            {isMyProject && (
              <p className="text-sm text-gray-600 mb-6">
                Once approved, your project will be visible to the community and you can start receiving contributions!
              </p>
            )}

            {/* Action Button */}
            <button
              onClick={() => setShowReviewCard(false)}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md"
            >
              Got it! 👍
            </button>
          </div>
        </div>

        {/* Desktop Sidebar Review Card */}
        <aside className="fixed right-6 top-32 w-72 lg:w-80 bg-white rounded-2xl border-2 border-blue-200 shadow-xl overflow-hidden hidden md:block">
          <div className="p-6 text-center">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <ClockIcon size={32} className="text-blue-600 animate-spin" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              🎉 Project Submitted!
            </h3>
              {isMyProject ? (
              <p className="text-gray-600 mb-6">
                Your project is <span className="font-semibold text-blue-600">submitted and under review</span>
              </p>
            ) : (
              <p className="text-gray-600 mb-6">
                <span className="font-semibold text-blue-600">{user.full_name}'s project</span> has been <span className="font-semibold text-blue-600">submitted and is under review</span>
              </p>
            )}

            {/* Timeline */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <ClockIcon size={18} className="text-blue-600 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-semibold text-gray-900">Review Timeline</p>
                  <p className="text-xs text-gray-600">Within <span className="font-bold">48 hours</span></p>
                </div>
              </div>
            </div>

            {/* Message */}
            <p className="text-xs text-gray-600 mb-4">
              Once approved, your project will be visible to the community!
            </p>

            {/* Button */}
            <button
              onClick={() => setShowReviewCard(false)}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              Got it! 👍
            </button>
          </div>
        </aside>
      </div>
    );
  }

  // CASE 2: NO project exists - show empty state
  if (!project) {
    return (
      <div>
        {/* Mobile */}
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

  // CASE 3: Project exists AND IS VALID - show full project card


  

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

          {/* Video Section with Cover Image */}
          <div className="relative aspect-video bg-gradient-to-br from-blue-400 to-blue-600 overflow-hidden">
            {!showVideo ? (
              <>
                {!imageError && coverImageUrl && coverImageUrl !== '/projects.png' ? (
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
                      <h3 className="text-lg font-bold line-clamp-2">{project.project_title}</h3>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/40" />
                
                {/* Play Button Overlay / Carousel controls */}
                {hasVideos && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => setShowVideo(true)}
                      className="absolute inset-0 flex items-center justify-center group"
                    >
                      <div className="w-16 h-16 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                        <Play size={28} className="text-[#1a8cd8] ml-1" fill="currentColor" />
                      </div>
                    </button>

                    {videos.length > 1 && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); prevVideo(); }} className="absolute left-3 p-2 rounded-full bg-white/80 hover:bg-white shadow">◀</button>
                        <button onClick={(e) => { e.stopPropagation(); nextVideo(); }} className="absolute right-3 p-2 rounded-full bg-white/80 hover:bg-white shadow">▶</button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                          {videos.map((v, idx) => (
                            <button key={idx} onClick={(e) => { e.stopPropagation(); setCurrentVideoIndex(idx); }} className={`w-2 h-2 rounded-full ${idx === currentVideoIndex ? 'bg-white' : 'bg-white/40'}`} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Active Badge */}
                <div className="absolute top-3 right-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-full shadow-lg border border-blue-700/50 backdrop-blur-sm">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-xs font-semibold">Active Project</span>
                  </div>
                </div>
              </>
            ) : showVideo && currentVideo ? (
              currentVideo.type === 'youtube' && currentYouTubeEmbed ? (
                <iframe
                  src={currentYouTubeEmbed}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={currentVideo.url} className="w-full h-full" controls autoPlay />
              )
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
                href={`/feed/projects/edit/${project.id}`}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all hover:shadow-md font-semibold text-sm"
              >
                <Edit size={16} />
                <span>Edit Project</span>
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {project.github_repository && (
                  <a
                    href={project.github_repository}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors shadow-md"
                  >
                    <Github size={16} />
                    <span className="text-sm font-medium">GitHub</span>
                  </a>
                )}
                
                <Link 
                  href={`/feed/projects/${project.id}`}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  <ExternalLink size={16} />
                  <span className="text-sm font-medium">View Details</span>
                </Link>
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
              {!imageError && coverImageUrl && coverImageUrl !== '/projects.png' ? (
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
                    <h3 className="text-sm font-bold line-clamp-2">{project.project_title}</h3>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/40" />
              
              {hasVideos && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => setShowVideo(true)}
                    className="absolute inset-0 flex items-center justify-center group"
                  >
                    <div className="w-14 h-14 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <Play size={24} className="text-[#1a8cd8] ml-1" fill="currentColor" />
                    </div>
                  </button>

                  {videos.length > 1 && (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); prevVideo(); }} className="absolute left-2 p-2 rounded-full bg-white/80 hover:bg-white shadow">◀</button>
                      <button onClick={(e) => { e.stopPropagation(); nextVideo(); }} className="absolute right-2 p-2 rounded-full bg-white/80 hover:bg-white shadow">▶</button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                        {videos.map((v, idx) => (
                          <button key={idx} onClick={(e) => { e.stopPropagation(); setCurrentVideoIndex(idx); }} className={`w-2 h-2 rounded-full ${idx === currentVideoIndex ? 'bg-white' : 'bg-white/40'}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="absolute top-3 right-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-600 text-white rounded-full shadow-lg border border-blue-700/50 backdrop-blur-sm">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  <span className="text-xs font-semibold">Active</span>
                </div>
              </div>
            </>
            ) : showVideo && currentVideo ? (
              currentVideo.type === 'youtube' && currentYouTubeEmbed ? (
                <iframe
                  src={currentYouTubeEmbed}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={currentVideo.url} className="w-full h-full" controls autoPlay />
              )
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
                <a
                  href={project.github_repository}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  <Github size={16} />
                  View Repository
                </a>
              )}
              
              <Link 
                href={`/feed/projects/${project.id}`}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm font-medium"
              >
                <ExternalLink size={16} />
                View Details
              </Link>
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
                  {!imageError && coverImageUrl && coverImageUrl !== '/projects.png' ? (
                    <img 
                      src={coverImageUrl} 
                      alt={project.project_title}
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
                      <div className="text-center text-white">
                        <Calendar size={40} className="mx-auto opacity-80 mb-2" />
                        <h3 className="text-sm font-bold line-clamp-2 px-4">{project.project_title}</h3>
                      </div>
                    </div>
                  )}
                  {hasVideos && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={() => setShowVideo(true)}
                        className="absolute inset-0 flex items-center justify-center group cursor-pointer"
                      >
                        <div className="w-14 h-14 bg-white/95 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                          <Play size={24} className="text-[#1a8cd8] ml-1" fill="currentColor" />
                        </div>
                      </button>

                      {videos.length > 1 && (
                        <>
                          <button onClick={(e) => { e.stopPropagation(); prevVideo(); }} className="absolute left-3 p-2 rounded-full bg-white/80 hover:bg-white shadow">◀</button>
                          <button onClick={(e) => { e.stopPropagation(); nextVideo(); }} className="absolute right-3 p-2 rounded-full bg-white/80 hover:bg-white shadow">▶</button>
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                            {videos.map((v, idx) => (
                              <button key={idx} onClick={(e) => { e.stopPropagation(); setCurrentVideoIndex(idx); }} className={`w-2 h-2 rounded-full ${idx === currentVideoIndex ? 'bg-white' : 'bg-white/40'}`} />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </>
              ) : showVideo && currentVideo ? (
                currentVideo.type === 'youtube' && currentYouTubeEmbed ? (
                  <iframe
                    src={currentYouTubeEmbed}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video src={currentVideo.url} className="w-full h-full" controls autoPlay />
                )
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
                  <a
                    href={project.github_repository}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800transition-colors mb-3 text-sm font-medium"
                  >
                    <Github size={16} />
                    View Repository
                  </a>
                )}

                <Link 
                  href={`/projects/${project.id}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                >
                  <ExternalLink size={16} />
                  View Project Details
                </Link>
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