"use client";

import React, { useState, useEffect } from "react";
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
   GitPullRequest,
   Rocket,
   Target,
   Lightbulb,
   FileText, // Added for Pitch Deck
   Briefcase, // Added for Business Model
   Coins, // Added for Funding
   Globe,
   Code2,

   Layers,
   Mail,
   ChevronsUp
} from "lucide-react";
import { slugifyUsername } from "@/lib/utils";
import { Project } from "@/types/models";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import ProjectDetailMedia from "@/components/uiComponent/ProjectDetailMedia";
import ContributeModal from "@/components/uiComponent/ContributeModal";
import ContributorManualModal from "@/components/uiComponent/ContributorManualModal";
import ProjectGamification from "@/components/uiComponent/ProjectGamification";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { UserProfile } from "@/app/types/type";
import ProjectChatModal from "@/components/uiComponent/ProjectChatModal";
import { publishProjectAction } from "@/lib/actions/project.actions";
import { toast } from "sonner";

interface Contributor {
   login: string;
   avatar_url: string;
   contributions: number;
}

export type ProjectData = Project & {
   project_title?: string;
   description?: string;
   cover_image_url?: string | null;
   uploaded_video_url?: string | null;
   project_video_url?: string | null;
   github_repository?: string | null;
   project_duration?: string | null;
   status?: string;
   student_id?: string;
};

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
   user_id?: string;
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
   currentUser?: UserProfile | null;
   isAdmin?: boolean;
   companyProfile?: any | null;
   activeSubmission?: any | null;
   isChatInitiallyOpen?: boolean;
}

export default function ProjectDetailsView({
   project,
   owner,
   githubData,
   similarProjects,
   currentUser,
   isAdmin = false,
   companyProfile = null,
   activeSubmission = null,
   isChatInitiallyOpen = false
}: ProjectDetailsViewProps) {
   const [isReadmeOpen, setIsReadmeOpen] = useState(false);
   const [isContributeOpen, setIsContributeOpen] = useState(false);
   const [isManualOpen, setIsManualOpen] = useState(false);
   const [isChatOpen, setIsChatOpen] = useState(isChatInitiallyOpen);

   const isOwner = currentUser?.profile?.user_id === owner?.user_id;

   // Map data from both sources
   const title = project.title || project.project_title || "Untitled Project";
   const tagline = project.tagline || project.description?.substring(0, 100) || "No tagline available.";
   const description = project.solution_description || project.description || "";
   const problem = project.problem_statement || "No specific problem statement provided.";
   
   // Media
   const coverImage = project.cover_images?.[0] || project.cover_image_url || undefined;
   const uploadedVideo = project.video_url || project.uploaded_video_url || null;
   const youtubeVideo = project.project_video_url || null;

   const studentId = project.owner_id || project.student_id || "";
   const githubUrl = project.github_url || project.github_repository || "";

   const isPublished = project.is_published ?? (project.status === 'valid');

   const [mounted, setMounted] = useState(false);
   useEffect(() => {
      setMounted(true);
   }, []);

   const [isPublishing, setIsPublishing] = useState(false);
   const handlePublish = async () => {
      if (!confirm("Are you sure you want to publish this project to the public Innovation Feed?")) return;
      
      setIsPublishing(true);
      const res = await publishProjectAction(project.id);
      setIsPublishing(false);

      if (res.success) {
         toast.success("Project successfully published to the Innovation Feed!");
      } else {
         toast.error("Failed to publish project: " + res.error);
      }
   };


   return (
      <div className="min-h-screen bg-[#F8FAFC] selection:bg-blue-100 selection:text-blue-900">

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
                        {title}
                     </h1>
                     <span className="text-[10px] text-slate-500 font-medium">
                        by {owner?.full_name || 'Unknown'}
                     </span>
                  </div>
               </div>

               <div className="flex items-center gap-2">
                  <Button asChild variant="secondary" className="hidden sm:flex rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 h-9 px-4 text-sm">
                     <a href={mounted ? `mailto:?subject=Check out this pitch: ${title}&body=I found this amazing project on ZigX: ${window.location.href}` : "#"}>
                        <Share2 className="w-4 h-4 mr-2" /> Share
                     </a>
                  </Button>
                  {githubUrl && (
                     <Button asChild className="rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-md shadow-slate-200 h-9 px-4 text-sm">
                        <a href={githubUrl} target="_blank" rel="noopener noreferrer">
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
                  <div className="bg-white rounded-[32px] p-2 shadow-sm border border-slate-100 overflow-hidden">
                     <div className="relative aspect-video rounded-[24px] overflow-hidden bg-slate-900 shadow-inner">
                        <ProjectDetailMedia
                           uploadedVideo={uploadedVideo}
                           youtubeVideo={youtubeVideo}
                           coverImage={coverImage}
                           title={title}
                        />
                     </div>
                  </div>

                  {/* Pitch Header Card */}
                  <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                     {/* Decorative background element */}
                     <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-full -mr-16 -mt-16 -z-10" />

                     <div className="flex flex-wrap items-center gap-4 mb-6">
                        {isPublished ? (
                           <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-emerald-100 px-3 py-1 rounded-full gap-1.5 font-bold uppercase text-[10px] tracking-wider">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Validated
                           </Badge>
                        ) : (
                           <Badge variant="secondary" className="bg-amber-50 text-amber-600 border-amber-100 px-3 py-1 rounded-full gap-1.5 font-bold uppercase text-[10px] tracking-wider">
                              <Clock className="w-3.5 h-3.5" /> Review Pending
                           </Badge>
                        )}
                        <Badge variant="outline" className="text-blue-600 border-blue-100 bg-blue-50/30 px-3 py-1 rounded-full font-bold uppercase text-[10px] tracking-wider">
                           {project.category || "Uncategorized"}
                        </Badge>
                        <span className="text-slate-400 text-xs font-semibold ml-auto">
                           Published {format(new Date(project.created_at), "MMM d, yyyy")}
                        </span>
                     </div>

                     <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
                        {title}
                     </h1>
                      <p className="text-xl text-slate-500 font-medium mb-8 leading-relaxed italic">
                        "{tagline}"
                      </p>

                      {/* Publishing Banner for Companies/Admins */}
                      {(isAdmin || activeSubmission) && !isPublished && (
                         <div className="mb-8 p-6 bg-amber-50 rounded-[24px] border border-amber-100 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top duration-500">
                            <div className="flex items-center gap-3">
                               <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                                  <AlertCircle className="w-5 h-5" />
                               </div>
                               <div>
                                  <p className="text-sm font-bold text-amber-900 line-clamp-1">Reviewer Actions Available</p>
                                  <p className="text-xs text-amber-700">This project is currently private. You can validate it to make it visible to all users.</p>
                               </div>
                            </div>
                            <Button 
                              onClick={handlePublish} 
                              disabled={isPublishing}
                              className="bg-amber-600 hover:bg-amber-700 text-white font-black rounded-full h-10 px-6 text-xs uppercase tracking-wider"
                            >
                               {isPublishing ? "Publishing..." : "Validate & Publish"}
                            </Button>
                         </div>
                      )}

                     <Tabs defaultValue="pitch" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1 rounded-xl h-12">
                           <TabsTrigger value="pitch" className="rounded-lg font-bold text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">The pitch</TabsTrigger>
                           <TabsTrigger value="details" className="rounded-lg font-bold text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">Details</TabsTrigger>
                           <TabsTrigger value="roadmap" className="rounded-lg font-bold text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">Roadmap</TabsTrigger>
                        </TabsList>

                        <TabsContent value="pitch" className="mt-8 space-y-8 animate-in fade-in duration-500">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <Card className="border-none bg-blue-50/50 shadow-none rounded-2xl">
                                 <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-black flex items-center gap-2 text-blue-700">
                                       <Target className="w-4 h-4" /> THE PROBLEM
                                    </CardTitle>
                                 </CardHeader>
                                 <CardContent>
                                    <p className="text-slate-700 leading-relaxed font-medium">{problem}</p>
                                 </CardContent>
                              </Card>
                              <Card className="border-none bg-emerald-50/50 shadow-none rounded-2xl">
                                 <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-black flex items-center gap-2 text-emerald-700">
                                       <Rocket className="w-4 h-4" /> THE SOLUTION
                                    </CardTitle>
                                 </CardHeader>
                                 <CardContent>
                                    <p className="text-slate-700 leading-relaxed font-medium">{description}</p>
                                 </CardContent>
                              </Card>
                           </div>

                           <div className="bg-slate-50 border border-slate-100 rounded-[24px] p-8">
                              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                                 <Briefcase className="w-5 h-5 text-blue-600" /> Business Logic
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                                 <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Model</p>
                                    <p className="text-sm font-bold text-slate-700">{project.business_model || "Not specified"}</p>
                                 </div>
                                 <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stage</p>
                                    <p className="text-sm font-bold text-slate-700 capitalize">{project.current_stage || "Ideation"}</p>
                                 </div>
                                 <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Funding Goal</p>
                                    <p className="text-sm font-bold text-emerald-600">
                                       {project.funding_goal ? `$${project.funding_goal.toLocaleString()}` : "Not seeking"}
                                    </p>
                                 </div>
                              </div>
                           </div>
                        </TabsContent>

                        <TabsContent value="details" className="mt-8 animate-in fade-in duration-500">
                           <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed">
                              {project.description || "Detailed project analysis coming soon."}
                           </div>
                        </TabsContent>

                        <TabsContent value="roadmap" className="mt-8 animate-in fade-in duration-500">
                           {project.roadmap_url ? (
                              <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 rounded-[24px] bg-slate-50/50 text-center">
                                 <Layers className="w-12 h-12 text-slate-300 mb-4" />
                                 <h3 className="text-lg font-bold text-slate-900 mb-2">Live Roadmap Available</h3>
                                 <p className="text-slate-500 mb-6 max-w-sm mx-auto">Track the real-time development and planned features for this project.</p>
                                 <Button asChild className="rounded-full bg-[#155DFC] hover:bg-blue-700 shadow-xl shadow-blue-200">
                                    <a href={project.roadmap_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-8">
                                       Visit External Roadmap <ExternalLink className="w-4 h-4" />
                                    </a>
                                 </Button>
                              </div>
                           ) : (
                              <p className="text-slate-500 italic text-center py-12">Roadmap details have not been provided for this project.</p>
                           )}
                        </TabsContent>
                     </Tabs>
                  </div>

                  {/* README Section */}
                  {githubData?.readme && (
                     <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                           <div className="flex items-center gap-2 text-slate-900 font-bold">
                              <BookOpen className="w-5 h-5 text-[#155DFC]" />
                              Technical Documentation
                           </div>
                           <Button variant="secondary" onClick={() => setIsReadmeOpen(true)} className="text-blue-600 hover:text-blue-700 bg-transparent hover:bg-blue-50 font-bold h-8 px-3 text-xs">
                              Expand View
                           </Button>
                        </div>
                        <div className="p-8 max-h-[500px] overflow-hidden relative group">
                           <article className="prose prose-slate max-w-none prose-img:rounded-xl">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                 {githubData.readme}
                              </ReactMarkdown>
                           </article>
                           {/* Fade overlay */}
                           <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white via-white/40 to-transparent flex items-end justify-center pb-8">
                              <Button onClick={() => setIsReadmeOpen(true)} className="bg-white text-slate-900 border border-slate-200 shadow-lg hover:bg-slate-50 font-black rounded-full px-8 h-12">
                                 Read Full README
                              </Button>
                           </div>
                        </div>
                     </div>
                  )}
               </div>


               {/* RIGHT COLUMN (Sidebar) */}
               <div className="lg:col-span-4 space-y-6">

                  {/* Investor Focus Action Card */}
                  <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl -mr-16 -mt-16 rounded-full" />
                     <div className="relative z-10">
                        <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                           <Lightbulb className="w-4 h-4" /> INVESTOR DECK
                        </h3>
                        <p className="text-xl font-bold mb-6 leading-tight">Ready to see the full vision for {title}?</p>
                        
                        {project.pitch_deck_url ? (
                           <Button asChild className="w-full h-14 rounded-2xl bg-white hover:bg-slate-100 text-[#0F172A] font-black text-base shadow-lg transition-transform hover:scale-[1.02]">
                              <a href={project.pitch_deck_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                                 <FileText className="w-5 h-5 mr-3" /> View Pitch Deck (PDF)
                              </a>
                           </Button>
                        ) : (
                           <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/50 text-sm italic text-center">
                              Pitch deck is currently private or not provided.
                           </div>
                        )}
                        <p className="text-[10px] text-white/40 text-center mt-4 uppercase tracking-widest font-bold">Standard Investor Format</p>
                     </div>
                  </div>

                  {/* Creator Card */}
                  <div className="bg-white rounded-[32px] p-6 border border-slate-200 shadow-sm transition-all hover:border-blue-200">
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">PROJECT VISIONARY</h3>
                     <div className="flex items-center gap-4">
                        <Link href={`/dashboard/student/${slugifyUsername(studentId)}`} className="shrink-0 relative">
                           {owner?.avatar_url ? (
                              <Image src={owner.avatar_url} alt={owner.full_name} width={72} height={72} className="rounded-3xl object-cover shadow-sm bg-slate-50 border-2 border-white" />
                           ) : (
                              <div className="w-[72px] h-[72px] rounded-3xl bg-blue-100 flex items-center justify-center text-blue-600 font-black text-2xl uppercase">
                                 {owner?.full_name?.charAt(0)}
                              </div>
                           )}
                        </Link>
                        <div>
                           <Link href={`/dashboard/student/${slugifyUsername(studentId)}`} className="block group">
                              <h4 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{owner?.full_name}</h4>
                           </Link>
                           <p className="text-sm font-semibold text-slate-500 mb-2 truncate max-w-[180px]">{owner?.university || "Scholar at Zigex"}</p>
                           <Link href={`/dashboard/student/${slugifyUsername(studentId)}`} className="inline-flex items-center gap-1.5 text-xs font-black text-[#155DFC] hover:underline uppercase tracking-wider">
                              Profile <ExternalLink className="w-3 h-3" />
                           </Link>
                        </div>
                     </div>
                  </div>

                  {/* Developer Collaboration Card */}
                  <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm relative overflow-hidden group">
                     {/* Blue bar indicator */}
                     <div className="absolute top-0 left-0 w-full h-1.5 bg-[#155DFC]" />
                     
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">DEVELOPER HUB</h3>
                     
                     <div className="space-y-6">
                        <div className="flex items-center gap-3">
                           <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                              <Code2 className="w-5 h-5" />
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tech Stack</p>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                 {project.tech_stack?.length ? (
                                    project.tech_stack.map(tech => (
                                       <span key={tech} className="text-[11px] font-bold text-slate-700">{tech}{project.tech_stack.indexOf(tech) < project.tech_stack.length - 1 ? " • " : ""}</span>
                                    ))
                                 ) : (
                                    <span className="text-xs text-slate-400 italic">Not specified</span>
                                 )}
                              </div>
                           </div>
                        </div>

                        <div className="flex items-center gap-3">
                           <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                              <Briefcase className="w-5 h-5" />
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Collab Type</p>
                              <p className="text-sm font-bold text-slate-700 capitalize">{project.collaboration_type?.replace('_', ' ') || "Open Contribution"}</p>
                           </div>
                        </div>

                        <div className="pt-2 space-y-3">
                           <div className="pt-2 space-y-3">
                              {/* Visitor/Admin Actions */}
                              {!isOwner && (
                                 <>
                                    <Button onClick={() => setIsChatOpen(true)} className="w-full h-12 rounded-2xl bg-[#155DFC] hover:bg-blue-700 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-200 transition-all hover:scale-[1.02]">
                                       <Rocket className="w-4 h-4 mr-2" /> {isAdmin ? "Contact Founder" : "Message Owner"}
                                    </Button>

                                    <Button 
                                       onClick={() => setIsContributeOpen(true)} 
                                       variant="outline"
                                       className="w-full h-12 rounded-2xl border-slate-200 hover:bg-slate-50 text-slate-700 font-black text-sm uppercase tracking-wider transition-all hover:scale-[1.02]"
                                    >
                                       <GitPullRequest className="w-4 h-4 mr-2 text-[#155DFC]" /> Request to Contribute
                                    </Button>
                                 </>
                              )}
                              
                              {/* Owner View Hint */}
                              {isOwner && (
                                 <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                                    <p className="text-xs text-slate-500 font-medium">
                                       Check your <strong>Inbox</strong> at the bottom right to see messages.
                                    </p>
                                 </div>
                              )}
                           </div>
                        </div>

                     </div>
                  </div>

                  {/* Stats View Counts */}
                  <div className="flex items-center justify-around p-4 bg-slate-50 border border-slate-200 rounded-[24px]">
                     <div className="text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Views</p>
                        <p className="text-lg font-black text-slate-900">{project.view_count || 0}</p>
                     </div>
                     <div className="w-px h-8 bg-slate-200" />
                     <div className="text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Language</p>
                        <p className="text-lg font-black text-slate-900">{githubData?.language || "Mixed"}</p>
                     </div>
                  </div>

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
                        <h2 className="font-bold text-slate-900">Technical Documentation</h2>
                        <p className="text-xs text-slate-500">README Viewer</p>
                     </div>
                  </div>
                  <Button variant="secondary" onClick={() => setIsReadmeOpen(false)} className="rounded-full bg-slate-200 hover:bg-slate-300 h-8 px-4 text-xs font-bold">
                     Close
                  </Button>
               </div>

               <ScrollArea className="flex-1 bg-white">
                  <div className="p-8 sm:p-12 max-w-4xl mx-auto">
                     <article className="prose prose-slate prose-lg max-w-none prose-headings:font-black prose-a:text-blue-600 prose-img:rounded-[24px]">
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
            projectTitle={title}
            githubUrl={githubUrl}
         />

         <ContributorManualModal
            isOpen={isManualOpen}
            onClose={() => setIsManualOpen(false)}
            repoUrl={githubUrl}
         />

         <ProjectChatModal
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            projectId={project.id}
            projectTitle={title}
            projectOwnerId={owner?.user_id || ""}
            currentUser={currentUser}
            isAdmin={isAdmin}
            // If owner, use "docked" mode (Twitter style), else standard modal
            mode="docked"
         />

         {/* Owner Floating Trigger (Collapsed State) */}
         {/* Floating Trigger (Collapsed State) - Visible to All */}
         {!isChatOpen && (
            <>
               {/* Mobile FAB */}
               <div className="md:hidden fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
                  <Button
                     onClick={() => setIsChatOpen(true)}
                     className="h-14 w-14 rounded-full bg-black hover:bg-slate-900 text-white shadow-2xl flex items-center justify-center p-0"
                  >
                     <Mail className="w-6 h-6" />
                  </Button>
               </div>

               {/* Desktop Footer Bar */}
               <div 
                  onClick={() => setIsChatOpen(true)}
                  className="hidden md:flex fixed bottom-0 right-4 z-50 w-[380px] bg-white border border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] rounded-t-2xl cursor-pointer items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors animate-in slide-in-from-bottom-4 fade-in duration-500"
               >
                  <div className="flex items-center gap-3">
                     <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
                        <Mail className="w-4 h-4" />
                     </div>
                     <div className="font-bold text-slate-900 text-sm tracking-tight">
                        {isOwner ? "Messages" : "Chat with Owner"}
                     </div>
                  </div>
                  <ChevronsUp className="w-5 h-5 text-slate-400" />
               </div>
            </>
         )}
      </div>
   );
}
