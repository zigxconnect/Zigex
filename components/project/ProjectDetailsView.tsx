"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  Github, 
  ExternalLink, 
  Star, 
  GitFork, 
  Calendar, 
  Clock, 
  MapPin, 
  BookOpen, 
  X, 
  MessageSquare,
  Share2,
  MoreHorizontal,
  Heart,
  User,
  CheckCircle2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import ProjectDetailMedia from "@/components/uiComponent/ProjectDetailMedia";
import ContributeModal from "@/components/uiComponent/ContributeModal";

interface Contributor {
  login: string;
  avatar_url: string;
  contributions: number;
}

interface ProjectData {
  id: string;
  title: string;
  description: string;
  cover_image_url: string | null;
  uploaded_video_url: string | null;
  project_video_url: string | null;
  github_repository: string | null;
  project_duration: string | null;
  created_at: string;
  end_date: string | null;
  is_valid: boolean;
  student_id: string;
}

interface GitHubData {
  stars: number;
  forks: number;
  open_issues: number;
  topics: string[];
  language: string;
  readme: string | null;
  contributors: Contributor[];
  last_pushed: string;
  homepage: string | null;
}

interface OwnerProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  university?: string;
  role?: string;
}

interface SimilarProject {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  owner: {
    login: string;
    avatar_url: string;
  };
}

interface ProjectDetailsViewProps {
  project: ProjectData;
  owner: OwnerProfile | null;
  githubData: GitHubData | null;
  similarProjects: SimilarProject[];
}

export default function ProjectDetailsView({ 
  project, 
  owner, 
  githubData,
  similarProjects 
}: ProjectDetailsViewProps) {
  const [isReadmeOpen, setIsReadmeOpen] = useState(false);
  const [isContributeOpen, setIsContributeOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100">
      {/* Header / Navigation Bar - This sticky header stays at the top as users scroll */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/projects" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600 hover:text-slate-900">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold leading-tight truncate max-w-[200px] sm:max-w-md">
                {project.title}
              </h1>
              <p className="text-xs text-slate-500">
                {githubData?.stars ? `${githubData.stars} stars` : 'Project Details'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900">
              <Share2 className="w-5 h-5" />
            </Button>
            {project.github_repository && (
              <Button asChild variant="outline" size="sm" className="rounded-full bg-slate-900 text-white hover:bg-slate-800 border-none font-bold hidden sm:flex">
                <a href={project.github_repository} target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4 mr-2" />
                  Code
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr,350px] gap-0 lg:gap-8 lg:px-4 lg:py-6">
        {/* Left Column: Main Content - This contains the primary project information */}
        <div className="border-r border-slate-200 min-h-screen pb-20">
          
          {/* Hero Media - Displays the project's video or cover image */}
          <div className="w-full aspect-video bg-slate-100 border-b border-slate-200 lg:rounded-2xl lg:border lg:overflow-hidden relative group">
            <ProjectDetailMedia
              uploadedVideo={project.uploaded_video_url}
              youtubeVideo={project.project_video_url}
              coverImage={project.cover_image_url ?? undefined}
              title={project.title}
            />
          </div>

          {/* Project Stats & Actions Row - Shows verification status and GitHub metrics */}
          <div className="px-4 py-4 flex items-center justify-between border-b border-slate-200">
            <div className="flex items-center gap-6">
               <div className="flex flex-col">
                 <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Status</span>
                 <div className="flex items-center gap-1.5 mt-1">
                   {project.is_valid ? (
                     <>
                       <CheckCircle2 className="w-4 h-4 text-green-500" />
                       <span className="text-sm font-medium text-green-500">Verified</span>
                     </>
                   ) : (
                     <>
                       <Clock className="w-4 h-4 text-amber-500" />
                       <span className="text-sm font-medium text-amber-500">Pending</span>
                     </>
                   )}
                 </div>
               </div>

               {githubData && (
                 <>
                   <div className="flex flex-col">
                     <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Activity</span>
                     <div className="flex items-center gap-3 mt-1 text-sm">
                       <span className="flex items-center gap-1 text-slate-700 hover:text-yellow-600 transition-colors cursor-help" title="GitHub Stars">
                         <Star className="w-4 h-4" /> {githubData.stars}
                       </span>
                       <span className="flex items-center gap-1 text-slate-700 hover:text-blue-600 transition-colors cursor-help" title="GitHub Forks">
                         <GitFork className="w-4 h-4" /> {githubData.forks}
                       </span>
                     </div>
                   </div>
                 </>
               )}
            </div>

            <Button 
              onClick={() => setIsContributeOpen(true)}
              className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm shadow-blue-200"
            >
              Contribute
            </Button>
          </div>

          {/* Description Section - Shows the project creator and detailed description */}
          <div className="px-4 py-6 border-b border-slate-200">
            <div className="flex items-start gap-4">
              {/* Owner Avatar - Links to the creator's profile */}
              <Link href={`/dashboard/student/${project.student_id}`} className="shrink-0">
                {owner?.avatar_url ? (
                  <Image 
                    src={owner.avatar_url} 
                    alt={owner.full_name} 
                    width={48} 
                    height={48} 
                    className="rounded-full object-cover hover:opacity-90 transition-opacity"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-500">
                    {owner?.full_name?.[0] || "?"}
                  </div>
                )}
              </Link>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                   <Link href={`/dashboard/student/${project.student_id}`} className="group">
                     <h3 className="font-bold text-lg text-slate-900 group-hover:underline decoration-slate-400 underline-offset-2">
                       {owner?.full_name || "Unknown Creator"}
                     </h3>
                     <p className="text-slate-500 text-sm">@{owner?.full_name?.toLowerCase().replace(/\s+/g, '') || "user"}</p>
                   </Link>
                   <span className="text-slate-500 text-sm">
                     {format(new Date(project.created_at), "MMM d")}
                   </span>
                </div>

                <div className="mt-3 text-[15px] leading-relaxed text-slate-700 whitespace-pre-wrap">
                  {project.description}
                </div>

                {/* Topic Tags - Display GitHub repository topics as clickable badges */}
                {githubData?.topics && githubData.topics.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {githubData.topics.map(topic => (
                      <Badge key={topic} variant="secondary" className="rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 font-normal border border-blue-100">
                        #{topic}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Meta details - Duration, language, and demo link */}
                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
                  {project.project_duration && (
                     <div className="flex items-center gap-1.5">
                       <Clock className="w-4 h-4" />
                       <span>{project.project_duration}</span>
                     </div>
                  )}
                  {githubData?.language && (
                    <div className="flex items-center gap-1.5">
                       <div className="w-3 h-3 rounded-full bg-yellow-400" />
                       <span>{githubData.language}</span>
                    </div>
                  )}
                  {githubData?.homepage && (
                    <a href={githubData.homepage} target="_blank" rel="noopener" className="flex items-center gap-1.5 text-blue-600 hover:underline font-medium">
                      <ExternalLink className="w-4 h-4" />
                      <span>Live Demo</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* README Preview - Shows a truncated preview with a button to view the full documentation */}
          {githubData?.readme ? (
            <div className="px-4 py-6 border-b border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setIsReadmeOpen(true)}>
               <div className="flex items-center gap-3 mb-3 text-slate-500">
                 <BookOpen className="w-5 h-5" />
                 <span className="font-semibold text-sm uppercase tracking-wider">README.md</span>
               </div>
               
               <div className="relative max-h-[200px] overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <article className="prose prose-slate prose-sm max-w-none opacity-70 pointer-events-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {githubData.readme}
                    </ReactMarkdown>
                  </article>
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent flex items-end justify-center pb-4">
                     <Button variant="secondary" className="rounded-full font-bold shadow-sm bg-slate-100 text-slate-900 hover:bg-slate-200">
                       Read Full Documentation
                     </Button>
                  </div>
               </div>
            </div>
          ) : (
            <div className="px-4 py-12 text-center border-b border-slate-200">
              <p className="text-slate-500 italic">No README available for this project.</p>
            </div>
          )}

          {/* Contributors Section - Lists all project contributors with their GitHub profiles */}
          {githubData?.contributors && githubData.contributors.length > 0 && (
             <div className="px-4 py-6 border-b border-slate-200">
                <h3 className="font-bold text-lg mb-4 text-slate-900">Contributors</h3>
                <div className="flex flex-wrap gap-3">
                  {githubData.contributors.map((contributor) => (
                    <a 
                      key={contributor.login}
                      href={`https://github.com/${contributor.login}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-full transition-colors border border-slate-200"
                    >
                      <Image 
                        src={contributor.avatar_url}
                        alt={contributor.login}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <span className="text-sm font-medium text-slate-700">{contributor.login}</span>
                      <span className="text-xs text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded-full">{contributor.contributions}</span>
                    </a>
                  ))}
                </div>
             </div>
          )}

        </div>

        {/* Right Column: Sidebar - Contains search and similar projects (sticky on large screens) */}
        <div className="hidden lg:block pt-6">
          <div className="sticky top-[80px] space-y-6">
            
            {/* Search Input - Allows users to search for other projects */}
            <div className="bg-slate-50 rounded-full py-3 px-5 flex items-center gap-3 border border-slate-200 group focus-within:border-blue-500/50 focus-within:bg-white transition-all shadow-sm">
               <svg className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
               <input type="text" placeholder="Search projects..." className="bg-transparent border-none outline-none text-slate-900 w-full placeholder-slate-400" />
            </div>

            {/* Similar Projects - Shows related GitHub repositories */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
               <div className="p-4 border-b border-slate-200">
                 <h3 className="font-bold text-lg text-slate-900">Similar on GitHub</h3>
               </div>
               
               <div className="divide-y divide-slate-100">
                 {similarProjects.length > 0 ? (
                   similarProjects.map((repo) => (
                     <a 
                      key={repo.id} 
                      href={repo.html_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block p-4 hover:bg-slate-50 transition-colors"
                     >
                        <div className="flex items-center gap-3 mb-1">
                          <Image 
                            src={repo.owner.avatar_url} 
                            alt={repo.owner.login} 
                            width={20} 
                            height={20} 
                            className="rounded-full" 
                          />
                          <span className="text-xs font-bold text-slate-500 hover:underline">{repo.owner.login}</span>
                        </div>
                        <h4 className="font-bold text-sm mb-1 line-clamp-1 text-slate-900">{repo.name}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                          {repo.description || "No description provided."}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                           {repo.language && (
                             <span className="text-blue-600">{repo.language}</span>
                           )}
                           <span className="flex items-center gap-1">
                              <Star className="w-3 h-3" /> {repo.stargazers_count}
                           </span>
                        </div>
                     </a>
                   ))
                 ) : (
                   <div className="p-4 text-center text-slate-500 text-sm">
                     No similar projects found.
                   </div>
                 )}
               </div>
               <div className="p-4">
                  <a href="https://github.com/explore" target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline font-medium">
                    Show more on GitHub
                  </a>
               </div>
            </div>

            {/* Footer Links - Legal and support links */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500 px-2">
              <a href="#" className="hover:underline hover:text-blue-600">Terms of Service</a>
              <a href="#" className="hover:underline hover:text-blue-600">Privacy Policy</a>
              <a href="#" className="hover:underline hover:text-blue-600">Support</a>
              <span>© 2024 Future Prospect</span>
            </div>

          </div>
        </div>
      </main>

      {/* README Full View Dialog - Opens when user clicks "Read Full Documentation" */}
      <Dialog open={isReadmeOpen} onOpenChange={setIsReadmeOpen}>
        <DialogContent className="max-w-4xl h-[85vh] p-0 bg-white border-slate-200 text-slate-900 overflow-hidden flex flex-col">
           <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                 <BookOpen className="w-5 h-5 text-blue-600" />
                 <h2 className="font-bold text-lg">README.md</h2>
              </div>
           </div>
           <ScrollArea className="flex-1 p-6 sm:p-10">
              <article className="prose prose-slate prose-lg max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {githubData?.readme || ""}
                </ReactMarkdown>
              </article>
           </ScrollArea>
        </DialogContent>
      </Dialog>
      
      {/* Contribute Modal - Opens when user clicks the "Contribute" button */}
      <ContributeModal 
        isOpen={isContributeOpen} 
        onClose={() => setIsContributeOpen(false)} 
        projectTitle={project.title} 
        githubUrl={project.github_repository} 
      />
    </div>
  );
}