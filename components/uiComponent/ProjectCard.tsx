"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Calendar, Github, Clock, ExternalLink, Edit, AlertCircle, CheckCircle2, Eye } from "lucide-react";
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
  university?: string | null;
  hard_skills?: string[];
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
  isOwner
}: MyMonthProjectProps) {
  const [showVideo, setShowVideo] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  
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
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return '/projects.png';
  };

  const coverImageUrl = getImageUrl(project?.cover_image_url ?? null);

  // CASE 1: Project exists but NOT VALID - show under review card (ONLY for visitors)
  if (project && !project.is_valid && isVisitor) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Icon Section */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-100 rounded-2xl flex items-center justify-center shadow-md">
                  <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                    Project Under Review
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isMyProject ? (
                      <>Your project is being reviewed by our team</>
                    ) : (
                      <><span className="font-semibold">{user.full_name}&apos;s</span> project is under review</>
                    )}
                  </p>
                </div>
                
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold whitespace-nowrap">
                  <Clock className="w-3.5 h-3.5" />
                  Pending
                </span>
              </div>

              {/* Timeline Info */}
              <div className="bg-white rounded-lg p-4 mb-4 border border-amber-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Review Timeline</p>
                    <p className="text-xs text-gray-600">Processing within <span className="font-bold">48 hours</span></p>
                  </div>
                </div>

                {/* Progress Steps */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                    <span>Project submitted successfully</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-4 h-4 rounded-full border-2 border-amber-400 flex items-center justify-center">
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                    </div>
                    <span>Quality and guidelines check in progress</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                    <span>Approval and publication</span>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="flex items-center gap-3">
                {user.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt={user.full_name}
                    width={32}
                    height={32}
                    className="rounded-full border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm">
                    {user.full_name.split(" ").map(n => n[0]).join("").toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900">{user.full_name}</p>
                  {user.university && (
                    <p className="text-xs text-gray-500">{user.university}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CASE 2: NO project exists - show empty state
  if (!project) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-2xl mb-4 shadow-md">
            <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500" />
          </div>

          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={user.full_name}
              width={56}
              height={56}
              className="rounded-full border-4 border-white shadow-lg mx-auto mb-3"
            />
          ) : (
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-3 border-4 border-white shadow-lg">
              {user.full_name.split(" ").map(n => n[0]).join("").toUpperCase()}
            </div>
          )}

          <h3 className="text-lg font-bold text-gray-900 mb-1">{user.full_name}</h3>
          <h4 className="text-base font-semibold text-gray-700 mb-2">No Active Project</h4>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            {isVisitor 
              ? "This user hasn't posted a project yet. Check back later for updates!"
              : "You haven't posted a project yet. Share what you're working on!"}
          </p>
        </div>
      </div>
    );
  }

  // CASE 3: Project exists AND IS VALID - show full project card
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group">
      {/* Video/Cover Image Section */}
      <div className="relative aspect-video bg-gradient-to-br from-blue-500 to-indigo-600 overflow-hidden">
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
                  <Calendar size={48} className="mx-auto mb-3 opacity-90" />
                  <h3 className="text-lg font-bold line-clamp-2 px-4">{project.project_title}</h3>
                </div>
              </div>
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/30" />
            
            {/* Play Button & Video Controls */}
            {hasVideos && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => setShowVideo(true)}
                  className="absolute inset-0 flex items-center justify-center group/play cursor-pointer"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl group-hover/play:scale-110 transition-transform duration-200">
                    <Play size={32} className="text-blue-600 ml-1" fill="currentColor" />
                  </div>
                </button>

                {/* Video Carousel Controls */}
                {videos.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); prevVideo(); }} 
                      className="absolute left-3 sm:left-4 p-2 sm:p-2.5 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all z-10"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); nextVideo(); }} 
                      className="absolute right-3 sm:right-4 p-2 sm:p-2.5 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all z-10"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Carousel Dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                      {videos.map((v, idx) => (
                        <button 
                          key={idx} 
                          onClick={(e) => { e.stopPropagation(); setCurrentVideoIndex(idx); }} 
                          className={`w-2 h-2 rounded-full transition-all ${idx === currentVideoIndex ? 'bg-white w-6' : 'bg-white/50'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Status Badge */}
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-green-500 text-white rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                Active
              </span>
            </div>

            {/* Owner Badge (if visitor viewing) */}
            {isVisitor && (
              <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs font-semibold shadow-lg">
                  <Eye className="w-3 h-3 text-blue-600" />
                  <span className="text-gray-700">Viewing</span>
                </span>
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

      {/* Project Content */}
      <div className="p-5 sm:p-6">
        {/* User Info Header */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={user.full_name}
              width={40}
              height={40}
              className="rounded-full border-2 border-gray-200"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-gray-200">
              {user.full_name.split(" ").map(n => n[0]).join("").toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 truncate">{user.full_name}</h4>
            {user.university && (
              <p className="text-xs text-gray-500 truncate">{user.university}</p>
            )}
          </div>
          
          {isMyProject && (
            <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
              Your Project
            </span>
          )}
        </div>

        {/* Project Title & Description */}
        <div className="mb-5">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2">
            {project.project_title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
            {project.description}
          </p>
        </div>

        {/* Skills Tags (if available) */}
        {user.hard_skills && user.hard_skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {user.hard_skills.slice(0, 4).map((skill, idx) => (
              <span 
                key={idx} 
                className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium"
              >
                {skill}
              </span>
            ))}
            {user.hard_skills.length > 4 && (
              <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-500 rounded-md text-xs font-medium">
                +{user.hard_skills.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Meta Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-5 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900">Started</p>
              <p className="text-xs text-gray-600">{formatDate(project.created_at)}</p>
            </div>
          </div>
          
          {project.project_duration && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">Duration</p>
                <p className="text-xs text-gray-600 capitalize">
                  {project.project_duration.replace('-', ' ')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-3">
          {isMyProject ? (
            <Link
              href={`/dashboard/projects/edit/${project.id}`}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg font-semibold text-sm"
            >
              <Edit className="w-4 h-4" />
              Edit Project
            </Link>
          ) : (
            <>
              {project.github_repository && (
                
                 <a href={project.github_repository}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-md font-medium text-sm"
                >
                  <Github className="w-4 h-4" />
                  Repository
                </a>
              )}
              
              <Link 
                href={`/feed/projects/${project.id}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                View Details
              </Link>
            </>
          )}
        </div>
      </div>

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