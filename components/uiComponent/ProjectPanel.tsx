"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Youtube, 
  Github, 
  MessageCircle, 
  Linkedin, 
  ChevronRight,
  MapPin,
  AlertCircle
} from "lucide-react";

interface Project {
  id: string;
  project_title: string;
  description: string;
  cover_image_url: string | null;
  github_repository: string | null;
  project_video_url: string | null;
  uploaded_video_url: string | null;
  project_duration: string;
  end_date: string;
  created_at: string;
  status: string;
}

interface UserData {
  id: string;
  full_name?: string;
  avatar_url?: string | null;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  university?: string;
  hard_skills?: string[];
}

interface ProjectPanelProps {
  project: Project | null;
  user: UserData;
  isOwner: boolean;
}

// Extract YouTube video ID from various YouTube URL formats
const getYoutubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
};

// Extract thumbnail from YouTube URL
const getYoutubeThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

// Format date nicely
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch {
    return dateString;
  }
};

export default function ProjectPanel({ 
  project, 
  user, 
  isOwner 
}: ProjectPanelProps) {
  const [open, setOpen] = useState(false);
  const [showIndicator, setShowIndicator] = useState(true);

  // Hide indicator after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIndicator(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Lock body scroll when panel open on mobile
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

  const youtubeVideoId = project?.project_video_url 
    ? getYoutubeVideoId(project.project_video_url) 
    : null;
  
  const youtubeThumbnail = youtubeVideoId 
    ? getYoutubeThumbnail(youtubeVideoId) 
    : null;

  const coverImage = project?.cover_image_url || youtubeThumbnail;
  
  // Determine if there's a video (uploaded or YouTube)
  const hasUploadedVideo = !!project?.uploaded_video_url;
  const hasYoutubeVideo = !!youtubeVideoId;

  // Prepare WhatsApp message
  const whatsappMessage = `Hi ${user.full_name || 'there'}! 👋

I saw your profile on ZigX and I'm impressed by your work${project ? ` on "${project.project_title}"` : ''}. ${user.hard_skills?.[0] ? `Your skills in ${user.hard_skills?.[0]} caught my attention.` : ''}

I'd love to connect and chat!

Looking forward to hearing from you 🚀`;

  const whatsappUrl = user.phone 
    ? `https://wa.me/${user.phone.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`
    : null;

  // EMPTY STATE: User has no project
  if (!project) {
    return (
      <div>
        {/* Mobile Card for no project */}
        <div className="md:hidden bg-linear-to-br from-white to-gray-50 rounded-2xl border-2 border-blue-100 shadow-lg overflow-hidden mb-6 relative">
          <div className="relative h-40 w-full bg-linear-to-br from-blue-400 via-purple-400 to-pink-400 overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
            </div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="mb-2">
                <AlertCircle className="w-10 h-10 text-white mx-auto drop-shadow-lg" strokeWidth={1.5} />
              </div>
              <h3 className="text-white font-bold text-lg drop-shadow-md">No Project Yet</h3>
              <p className="text-white/90 text-xs drop-shadow-md">Let's connect instead!</p>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <h4 className="text-gray-900 font-bold mb-1">Hey there! 👋</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {user.full_name ? `${user.full_name} hasn't posted a project yet` : 'This user hasn\'t posted a project yet'}, but you can still reach out and connect!
              </p>
            </div>

            {user.university && (
              <div className="flex items-center gap-2 mb-4 text-sm text-gray-700">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>{user.university}</span>
              </div>
            )}

            {user.hard_skills && user.hard_skills.length > 0 && (
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-700 mb-2">Skills:</div>
                <div className="flex flex-wrap gap-2">
                  {user.hard_skills.slice(0, 3).map((skill, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              {whatsappUrl && (
                <Link 
                  href={whatsappUrl} 
                  target="_blank"
                  className="w-full inline-flex cursor-pointer items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all hover:shadow-md font-semibold text-sm"
                >
                  <MessageCircle className="w-5 h-5" />
                  Message on WhatsApp
                </Link>
              )}
              
              {user.linkedin_url && (
                <Link 
                  href={user.linkedin_url}
                  target="_blank"
                  className="w-full inline-flex cursor-pointer items-center justify-center gap-2 px-4 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl transition-all hover:shadow-md font-semibold text-sm"
                >
                  <Linkedin className="w-5 h-5" />
                  Connect on LinkedIn
                </Link>
              )}

              {!whatsappUrl && !user.linkedin_url && (
                <div className="text-center py-2 text-gray-500 text-xs">
                  No contact methods available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Empty State Panel */}
        <aside className="hidden md:block fixed right-6 top-32 w-72 lg:w-80 bg-linear-to-br from-white to-gray-50 rounded-2xl border-2 border-blue-100 shadow-xl overflow-hidden">
          <div className="relative h-28 w-full bg-linear-to-br from-blue-400 via-purple-400 to-pink-400 overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
            </div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <AlertCircle className="w-8 h-8 text-white mb-1 drop-shadow-lg" strokeWidth={1.5} />
              <p className="text-white/90 text-xs drop-shadow-md font-medium">No Project Posted</p>
            </div>
          </div>

          <div className="p-4">
            <h5 className="text-sm font-bold text-gray-900 mb-2">Connect with {user.full_name?.split(' ')[0] || 'them'}</h5>
            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              No project yet, but {user.full_name?.split(' ')[0] || 'they'}'s ready to collaborate!
            </p>

            {user.university && (
              <div className="flex items-center gap-2 mb-3 text-xs text-gray-700">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{user.university}</span>
              </div>
            )}

            {user.hard_skills && user.hard_skills.length > 0 && (
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-700 mb-2">Top Skills:</div>
                <div className="flex flex-wrap gap-1">
                  {user.hard_skills.slice(0, 2).map((skill, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              {whatsappUrl && (
                <Link 
                  href={whatsappUrl} 
                  target="_blank"
                  className="w-full inline-flex cursor-pointer items-center justify-center gap-1.5 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all hover:shadow-md font-medium text-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </Link>
              )}
              
              {user.linkedin_url && (
                <Link 
                  href={user.linkedin_url}
                  target="_blank"
                  className="w-full inline-flex cursor-pointer items-center justify-center gap-1.5 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-all hover:shadow-md font-medium text-xs"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </Link>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile: floating toggle button (only if NOT owner) */}
        {!isOwner && (
          <div className="relative">
            {showIndicator && (
              <div className="md:hidden fixed left-4 bottom-20 z-50 animate-bounce">
                <div className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg border-2 border-white flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5" strokeWidth={2.5} />
                  NO PROJECT YET
                </div>
              </div>
            )}

            <button
              aria-expanded={open}
              aria-controls="no-project-panel"
              onClick={() => setOpen(true)}
              className="cursor-pointer md:hidden fixed left-4 bottom-6 z-50 inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-full shadow-lg border border-blue-700 hover:bg-blue-700 focus:outline-none transition-all"
            >
              <AlertCircle className="w-4 h-4" strokeWidth={2} />
              <span className="text-sm font-medium">Connect</span>
            </button>
          </div>
        )}

        {/* Overlay for mobile */}
        {open && <div onClick={() => setOpen(false)} className="md:hidden fixed inset-0 bg-black/40 z-40" />}

        {/* Mobile sliding panel */}
        <aside
          className={
            "md:hidden fixed top-0 left-0 h-full z-50 w-72 bg-white border-r-2 border-blue-100 shadow-xl transform transition-transform duration-300 " + 
            (open ? "translate-x-0" : "-translate-x-full")
          }
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-linear-to-r from-blue-50 to-purple-50">
            <h3 className="text-sm font-bold text-gray-900">Connect Now</h3>
            <button 
              onClick={() => setOpen(false)} 
              className="inline-flex cursor-pointer items-center justify-center w-8 h-8 rounded-md text-gray-600 hover:bg-gray-100"
              aria-label="Close panel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4 overflow-y-auto h-full pb-20">
            <div className="relative h-32 w-full bg-linear-to-br from-blue-400 via-purple-400 to-pink-400 rounded-lg overflow-hidden mb-4">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
              </div>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <AlertCircle className="w-8 h-8 text-white mb-1 drop-shadow-lg" strokeWidth={1.5} />
                <p className="text-white text-sm font-bold drop-shadow-md">No Project Yet</p>
              </div>
            </div>

            <h4 className="text-sm font-bold text-gray-900 mb-1">{user.full_name || 'User'}</h4>
            <p className="text-xs text-gray-600 mb-4">Haven't posted a project yet? Let's connect!</p>

            {user.university && (
              <div className="flex items-center gap-2 mb-3 text-xs text-gray-700">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{user.university}</span>
              </div>
            )}

            {user.hard_skills && user.hard_skills.length > 0 && (
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-700 mb-2">Skills:</div>
                <div className="flex flex-wrap gap-1">
                  {user.hard_skills.map((skill, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2 mt-6">
              {whatsappUrl && (
                <Link 
                  href={whatsappUrl} 
                  target="_blank"
                  className="w-full inline-flex cursor-pointer items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all hover:shadow-md font-semibold text-sm"
                >
                  <MessageCircle className="w-5 h-5" />
                  Message on WhatsApp
                </Link>
              )}
              
              {user.linkedin_url && (
                <Link 
                  href={user.linkedin_url}
                  target="_blank"
                  className="w-full inline-flex cursor-pointer items-center justify-center gap-2 px-4 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-all hover:shadow-md font-semibold text-sm"
                >
                  <Linkedin className="w-5 h-5" />
                  Connect on LinkedIn
                </Link>
              )}
            </div>
          </div>
        </aside>
      </div>
    );
  }

  // PROJECT EXISTS: Show project panel
  return (
    <div>
      {/* Mobile: Show as main card component for visitors */}
      {!isOwner && (
        <div className="md:hidden bg-white rounded-2xl border-2 border-gradient-to-r from-blue-200 to-purple-200 shadow-lg overflow-hidden mb-6 relative">
          {/* First-time Project Indicator - Mobile */}
          {showIndicator && (
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-10 animate-bounce">
              <div className="bg-linear-to-r from-blue-600 to-purple-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg border-2 border-white flex items-center gap-2">
                ACTIVE PROJECT
              </div>
            </div>
          )}

          <div className="relative h-56 w-full bg-gray-100 overflow-hidden group">
            {coverImage ? (
              <Image 
                src={coverImage} 
                alt={project.project_title} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-500" 
              />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-blue-500 to-purple-600" />
            )}
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/50" />
            
            {/* Video Badge - Mobile */}
            {youtubeVideoId && (
              <div className="absolute top-3 right-3 z-20">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-full shadow-lg border border-red-700/50 backdrop-blur-sm group-hover:bg-red-700 transition-colors">
                  <Youtube className="w-4 h-4" />
                  <span className="text-xs font-bold">VIDEO</span>
                </div>
              </div>
            )}

            {/* Project Type Badge - Mobile */}
            <div className="absolute top-3 left-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-sm text-blue-600 rounded-lg shadow-md border border-blue-100">
                <span className="text-xs font-bold">PROJECT</span>
              </div>
            </div>
            
            <div className="absolute left-4 bottom-4">
              <h4 className="text-white text-base font-bold drop-shadow-lg">{project.project_title}</h4>
              <p className="text-xs text-white/90 drop-shadow-lg">Ends: {formatDate(project.end_date)}</p>
            </div>
          </div>

          <div className="p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-1">
                <h5 className="text-base font-bold text-gray-900">{project.project_title}</h5>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed line-clamp-3">{project.description}</p>
              </div>

              <div className="flex gap-2 shrink-0">
                {project.github_repository && (
                  <Link 
                    href={project.github_repository} 
                    target="_blank" 
                    className="inline-flex items-center justify-center w-10 h-10 bg-gray-900 hover:bg-gray-800 text-white rounded-lg border border-gray-700 transition-all hover:scale-105"
                  >
                    <Github className="w-5 h-5" />
                  </Link>
                )}
                {youtubeVideoId && (
                  <Link 
                    href={`https://www.youtube.com/watch?v=${youtubeVideoId}`}
                    target="_blank" 
                    className="inline-flex items-center justify-center w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-lg border border-red-700 transition-all hover:scale-105"
                  >
                    <Youtube className="w-5 h-5" />
                  </Link>
                )}
              </div>
            </div>

            {/* Duration Badge */}
            <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-200 mb-4">
              <span>📅 {project.project_duration}</span>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
              <Link 
                href={`https://www.youtube.com/watch?v=${youtubeVideoId}`}
                target="_blank"
                className="flex-1 inline-flex cursor-pointer items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all hover:shadow-md font-semibold text-sm"
              >
                View Project
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Desktop aside (visible on md+) */}
      <aside className="hidden md:block fixed right-6 top-32 w-72 lg:w-80 bg-white rounded-2xl border-2 border-blue-200 shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
        {/* First-time Project Indicator - Desktop */}
        {showIndicator && !isOwner && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 animate-bounce">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg border-2 border-white flex items-center gap-2">
              ACTIVE PROJECT
            </div>
          </div>
        )}

        <div className="relative h-40 w-full bg-gray-100 group overflow-hidden cursor-pointer">
          {coverImage ? (
            <Link href={youtubeVideoId ? `https://www.youtube.com/watch?v=${youtubeVideoId}` : project.github_repository || '#'} target="_blank">
              <Image 
                src={coverImage} 
                alt={project.project_title} 
                fill 
                className="object-cover group-hover:scale-110 transition-transform duration-500" 
              />
            </Link>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
          
          {/* Video Badge - Desktop */}
          {youtubeVideoId && (
            <div className="absolute top-3 right-3 z-20">
              <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-600 text-white rounded-full shadow-lg border border-red-700/50 backdrop-blur-sm">
                <Youtube className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">VIDEO</span>
              </div>
            </div>
          )}

          {/* Project Type Badge - Desktop */}
          <div className="absolute top-3 left-3">
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-white/95 backdrop-blur-sm text-blue-600 rounded-md shadow-md border border-blue-100">
              <span className="text-xs font-bold">PROJECT</span>
            </div>
          </div>
          
          <div className="absolute left-3 bottom-2">
            <h4 className="text-white text-sm font-bold drop-shadow-lg">{project.project_title}</h4>
            <p className="text-xs text-white/90 drop-shadow-lg">Ends {formatDate(project.end_date)}</p>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-1">
              <h5 className="text-sm font-bold text-gray-900">{project.project_title}</h5>
              <p className="mt-1 text-xs text-gray-600 line-clamp-2">{project.description}</p>
            </div>

            <div className="flex gap-1.5 flex-shrink-0">
              {project.github_repository && (
                <Link 
                  href={project.github_repository} 
                  target="_blank" 
                  className="inline-flex items-center justify-center w-8 h-8 bg-gray-900 hover:bg-gray-800 text-white rounded-lg border border-gray-700 transition-all hover:scale-110"
                >
                  <Github className="w-4 h-4" />
                </Link>
              )}
              {youtubeVideoId && (
                <Link 
                  href={`https://www.youtube.com/watch?v=${youtubeVideoId}`}
                  target="_blank" 
                  className="inline-flex items-center justify-center w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-lg border border-red-700 transition-all hover:scale-110"
                >
                  <Youtube className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>

          {/* Duration Badge - Desktop */}
          <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-semibold border border-blue-200 mb-3">
            <span>📅 {project.project_duration}</span>
          </div>

          <p className="text-xs text-gray-500 mb-3">Created {formatDate(project.created_at)}</p>

          <button
            onClick={() => youtubeVideoId && window.open(`https://www.youtube.com/watch?v=${youtubeVideoId}`, '_blank')}
            className="cursor-pointer w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all hover:shadow-md font-medium text-sm"
          >
            {youtubeVideoId ? 'Watch on YouTube' : 'View Project'}
          </button>
        </div>
      </aside>
    </div>
  );
}
