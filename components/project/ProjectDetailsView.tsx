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
   Clock,
   BookOpen,
   Share2,
   CheckCircle2,
   AlertCircle,
   ArrowLeft,
   GitPullRequest
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import ProjectDetailMedia from "@/components/uiComponent/ProjectDetailMedia";
import ContributeModal from "@/components/uiComponent/ContributeModal";
import ContributorManualModal from "@/components/uiComponent/ContributorManualModal";
import ProjectGamification from "@/components/uiComponent/ProjectGamification";

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
   status: string; // 'valid' | 'pending' | 'cancel'
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
   const [isManualOpen, setIsManualOpen] = useState(false);

   return (
      <div className="min-h-screen bg-slate-50 selection:bg-blue-100 selection:text-blue-900">

         {/* 1. Header Navigation */}
         <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <Link
                     href="/dashboard/projects"
                     className="p-2 -ml-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                     title="Back to Projects"
                  >
                     <ArrowLeft className="w-5 h-5" />
                  </Link>
                  <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block" />
                  <div className="flex flex-col">
                     <h1 className="text-sm font-bold text-slate-900 leading-tight line-clamp-1 max-w-[200px] sm:max-w-md">
                        {project.title}
                     </h1>
                     <span className="text-[10px] text-slate-500 font-medium">
                        by {owner?.full_name || 'Unknown'}
                     </span>
                  </div>
               </div>

               <div className="flex items-center gap-2">
                  <Button asChild variant="secondary" className="hidden sm:flex rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 h-9 px-4 text-sm">
                     <a href={`mailto:?subject=Check out this project: ${project.title}&body=I found this amazing project on Future Prospect: ${typeof window !== 'undefined' ? window.location.href : ''}`}>
                        <Share2 className="w-4 h-4 mr-2" /> Share
                     </a>
                  </Button>
                  {project.github_repository && (
                     <Button asChild className="rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-md shadow-slate-200 h-9 px-4 text-sm">
                        <a href={project.github_repository} target="_blank" rel="noopener noreferrer">
                           <Github className="w-4 h-4 mr-2" />
                           <span className="hidden sm:inline">GitHub</span>
                        </a>
                     </Button>
                  )}
               </div>
            </div>
         </div>

         <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

               {/* LEFT COLUMN (Main Content) */}
               <div className="lg:col-span-8 space-y-8">

                  {/* Hero Media Section */}
                  <div className="bg-white rounded-3xl p-1.5 shadow-sm border border-slate-100 overflow-hidden">
                     <div className="relative aspect-video rounded-[18px] overflow-hidden bg-slate-900 shadow-inner">
                        <ProjectDetailMedia
                           uploadedVideo={project.uploaded_video_url}
                           youtubeVideo={project.project_video_url}
                           coverImage={project.cover_image_url ?? undefined}
                           title={project.title}
                        />
                     </div>
                  </div>

                  {/* Title & Description Card */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                     {/* Status & Date Row */}
                     <div className="flex items-center gap-4 mb-6">
                        {project.status === 'valid' ? (
                           <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-emerald-100 px-3 py-1 rounded-full gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 fill-current" /> Validated
                           </Badge>
                        ) : project.status === 'cancel' ? (
                           <Badge variant="destructive" className="bg-red-50 text-red-600 border-red-100 px-3 py-1 rounded-full gap-1.5 hover:bg-red-100">
                              <AlertCircle className="w-3.5 h-3.5 fill-current" /> Cancelled
                           </Badge>
                        ) : (
                           <Badge variant="secondary" className="bg-amber-50 text-amber-600 border-amber-100 px-3 py-1 rounded-full gap-1.5">
                              <Clock className="w-3.5 h-3.5 fill-current" /> Pending Review
                           </Badge>
                        )}
                        <span className="text-slate-400 text-sm font-medium">
                           Posted on {format(new Date(project.created_at), "MMMM d, yyyy")}
                        </span>
                     </div>

                     <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">
                        {project.title}
                     </h1>

                     <div className=" prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed">
                        {project.description}
                     </div>

                     {/* Tech Stack / Topics */}
                     {githubData?.topics && githubData.topics.length > 0 && (
                        <div className="mt-8 flex flex-wrap gap-2">
                           {githubData.topics.map(topic => (
                              <Badge key={topic} variant="secondary" className="bg-slate-50 text-slate-600 border-slate-200 px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors cursor-default">
                                 #{topic}
                              </Badge>
                           ))}
                        </div>
                     )}
                  </div>

                  {/* README Section */}
                  {githubData?.readme && (
                     <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                           <div className="flex items-center gap-2 text-slate-900 font-bold">
                              <BookOpen className="w-5 h-5 text-blue-600" />
                              README.md
                           </div>
                           <Button variant="secondary" onClick={() => setIsReadmeOpen(true)} className="text-blue-600 hover:text-blue-700 bg-transparent hover:bg-blue-50 font-bold h-8 px-3 text-xs">
                              Expand View
                           </Button>
                        </div>
                        <div className="p-6 sm:p-8 max-h-[500px] overflow-hidden relative group">
                           <article className="prose prose-slate max-w-none prose-img:rounded-xl">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                 {githubData.readme}
                              </ReactMarkdown>
                           </article>
                           {/* Fade overlay */}
                           <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white via-white/90 to-transparent flex items-end justify-center pb-8">
                              <Button onClick={() => setIsReadmeOpen(true)} className="bg-white text-slate-900 border border-slate-200 shadow-lg hover:bg-slate-50 font-bold rounded-full px-8">
                                 Read Full Documentation
                              </Button>
                           </div>
                        </div>
                     </div>
                  )}
               </div>


               {/* RIGHT COLUMN (Sidebar) */}
               <div className="lg:col-span-4 space-y-6 h-fit sticky top-24">

                  {/* Creator Card */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Project Creator</h3>
                     <div className="flex items-center gap-4">
                        <Link href={`/dashboard/student/${project.student_id}`} className="shrink-0 relative">
                           {owner?.avatar_url ? (
                              <Image src={owner.avatar_url} alt={owner.full_name} width={64} height={64} className="rounded-2xl object-cover shadow-sm bg-slate-50" />
                           ) : (
                              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                                 {owner?.full_name?.charAt(0)}
                              </div>
                           )}
                           {/* Online indicator placeholder could go here */}
                        </Link>
                        <div>
                           <Link href={`/dashboard/student/${project.student_id}`} className="block">
                              <h4 className="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1">{owner?.full_name}</h4>
                           </Link>
                           <p className="text-sm text-slate-500 line-clamp-1">{owner?.university || "Student"}</p>
                           <Link href={`/dashboard/student/${project.student_id}`} className="text-xs font-bold text-blue-600 mt-1 inline-block hover:underline">
                              View Profile
                           </Link>
                        </div>
                     </div>
                  </div>

                  {/* Project Links & Stats */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
                     <div className="space-y-3">
                        <Button onClick={() => setIsContributeOpen(true)} className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-200 transition-all hover:scale-[1.02]">
                           <GitPullRequest className="w-5 h-5 mr-2" /> Contribute to Project
                        </Button>
                        <Button onClick={() => setIsManualOpen(true)} variant="secondary" className="w-full h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm">
                           <BookOpen className="w-4 h-4 mr-2" /> How to Contribute
                        </Button>
                     </div>

                     {githubData && (
                        <ProjectGamification
                           stars={githubData.stars}
                           forks={githubData.forks}
                           lastUpdate={githubData.last_pushed}
                        />
                     )}

                     <div className="space-y-3 pt-2">
                        {project.project_duration && (
                           <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-500 flex items-center gap-2">
                                 <Clock className="w-4 h-4" /> Duration
                              </span>
                              <span className="font-semibold text-slate-900 capitalize">{project.project_duration.replace('-', ' ')}</span>
                           </div>
                        )}
                        {githubData?.language && (
                           <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-500">Language</span>
                              <Badge variant="outline" className="text-slate-700 border-slate-300">
                                 {githubData.language}
                              </Badge>
                           </div>
                        )}
                        {githubData?.homepage && (
                           <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-100 mt-2">
                              <span className="text-slate-500">Live Demo</span>
                              <a href={githubData.homepage} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 font-bold hover:underline">
                                 Visit Site <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Contributors */}
                  {githubData?.contributors && githubData.contributors.length > 0 && (
                     <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Contributors</h3>
                        <div className="flex flex-wrap gap-2">
                           {githubData.contributors.map((contributor) => (
                              <a
                                 key={contributor.login}
                                 href={`https://github.com/${contributor.login}`}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 title={`${contributor.login} (${contributor.contributions} commits)`}
                                 className="relative w-10 h-10 rounded-full border-2 border-white shadow-sm hover:scale-110 hover:z-10 transition-transform cursor-pointer"
                              >
                                 <Image
                                    src={contributor.avatar_url}
                                    alt={contributor.login}
                                    fill
                                    className="rounded-full object-cover"
                                 />
                              </a>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* Similar Projects */}
                  {similarProjects.length > 0 && (
                     <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Similar Projects</h3>
                        <div className="space-y-4">
                           {similarProjects.map((repo) => (
                              <a
                                 key={repo.id}
                                 href={repo.html_url}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors group"
                              >
                                 <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 text-slate-400 group-hover:bg-white group-hover:text-blue-600 group-hover:shadow-sm transition-all">
                                    <BookOpen className="w-5 h-5" />
                                 </div>
                                 <div className="min-w-0">
                                    <h4 className="font-bold text-slate-900 text-sm truncate group-hover:text-blue-600 transition-colors">{repo.name}</h4>
                                    <div className="flex items-center gap-3 mt-1">
                                       <span className="text-xs text-slate-500 flex items-center gap-1">
                                          <Star className="w-3 h-3 text-amber-400 fill-current" /> {repo.stargazers_count}
                                       </span>
                                       {repo.language && (
                                          <span className="text-[10px] font-medium text-slate-400 border border-slate-200 px-1.5 rounded-md">
                                             {repo.language}
                                          </span>
                                       )}
                                    </div>
                                 </div>
                              </a>
                           ))}
                        </div>
                     </div>
                  )}

               </div>
            </div>
         </main>

         {/* Fullscreen README Modal */}
         <Dialog open={isReadmeOpen} onOpenChange={setIsReadmeOpen}>
            <DialogContent className="max-w-5xl h-[90vh] p-0 gap-0 overflow-hidden bg-white">
               <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <BookOpen className="w-5 h-5" />
                     </div>
                     <div>
                        <h2 className="font-bold text-slate-900">README.md</h2>
                        <p className="text-xs text-slate-500">Documentation preview</p>
                     </div>
                  </div>
                  <Button variant="secondary" onClick={() => setIsReadmeOpen(false)} className="rounded-full bg-slate-200 hover:bg-slate-300 h-8 px-4 text-xs">
                     Close
                  </Button>
               </div>

               <ScrollArea className="flex-1 bg-white">
                  <div className="p-8 sm:p-12 max-w-4xl mx-auto">
                     <article className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-xl">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                           {githubData?.readme || ""}
                        </ReactMarkdown>
                     </article>
                  </div>
               </ScrollArea>
            </DialogContent>
         </Dialog>

         {/* Configure Contribute Modal */}
         <ContributeModal
            isOpen={isContributeOpen}
            onClose={() => setIsContributeOpen(false)}
            projectTitle={project.title}
            githubUrl={project.github_repository}
         />

         <ContributorManualModal
            isOpen={isManualOpen}
            onClose={() => setIsManualOpen(false)}
            repoUrl={project.github_repository || ""}
         />
      </div>
   );
}
