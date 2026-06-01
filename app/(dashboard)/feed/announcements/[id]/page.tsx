import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Share2, Award, ExternalLink, Globe } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { getAnnouncementById } from "@/lib/actions/announcement.actions";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const metadata = {
  title: "Announcement Details | Zigex",
  description: "Read full details about this announcement.",
};

export default async function AnnouncementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const announcement = await getAnnouncementById(resolvedParams.id);

  if (!announcement) {
    notFound();
  }

  const { company, author, tagged_student } = announcement;
  const isCompanyPost = !!company;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Hero / Header Section */}
      <div className="relative h-[40vh] md:h-[50vh] w-full bg-slate-900 overflow-hidden">
        {/* Background Image or Gradient */}
        {announcement.image_url ? (
          <>
            <Image
              src={announcement.image_url}
              alt={announcement.title}
              fill
              className="object-cover opacity-60 blur-sm scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950" />
        )}

        {/* Navigation */}
        <div className="absolute top-6 left-6 z-20">
          <Link href="/feed">
            <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white rounded-full h-12 w-12 p-0 backdrop-blur-md">
              <ArrowLeft size={24} />
            </Button>
          </Link>
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 z-20">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-2">
                {announcement.is_pinned && (
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-200 hover:bg-blue-500/30 border-0 backdrop-blur-md">
                        Pinned
                    </Badge>
                )}
                {isCompanyPost ? (
                     <Badge variant="outline" className="border-white/30 text-white backdrop-blur-md">
                        Official Update
                     </Badge>
                ) : (
                    <Badge variant="outline" className="border-white/30 text-white backdrop-blur-md">
                        Community
                    </Badge>
                )}
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight drop-shadow-lg">
              {announcement.title}
            </h1>

            <div className="flex items-center flex-wrap gap-6 text-slate-300">
               {/* Author / Company */}
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/20 bg-slate-800">
                  {isCompanyPost ? (
                    <Image 
                      src={company.logo_url || "/default-company-logo.png"} 
                      alt={company.company_name} 
                      width={40} 
                      height={40} 
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <Image 
                      src={author?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(author?.full_name || 'Admin')}`} 
                      alt={author?.full_name || 'Admin'} 
                      width={40} 
                      height={40} 
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>
                <div>
                    <p className="text-white font-bold text-sm">
                        {isCompanyPost ? company.company_name : author?.full_name}
                    </p>
                    <p className="text-xs text-white/60">
                         {isCompanyPost ? "Company Admin" : "Zigex Team"}
                    </p>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-blue-400" />
                <span className="text-sm font-medium">
                  {format(new Date(announcement.created_at), "MMMM dd, yyyy")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <main className="max-w-4xl mx-auto px-6 -mt-8 relative z-30">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 p-6 md:p-12 space-y-8">
            
            {/* Tagged Student / Mention */}
            {tagged_student && (
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center shrink-0">
                        <Award className="text-amber-600 dark:text-amber-500" size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider mb-0.5">Spotlight</p>
                        <p className="text-slate-700 dark:text-slate-300 font-medium text-sm">
                            Featuring <span className="font-bold text-slate-900 dark:text-white">{tagged_student.full_name}</span> working at {company?.company_name || "Zigex"}
                        </p>
                    </div>
                </div>
            )}

            {/* Content Text */}
            <div className="prose prose-lg dark:prose-invert max-w-none [&_p]:text-slate-600 dark:[&_p]:text-slate-300 [&_h1]:text-slate-900 dark:[&_h1]:text-white [&_h2]:text-slate-900 dark:[&_h2]:text-white [&_h3]:text-slate-900 dark:[&_h3]:text-white [&_strong]:text-slate-800 dark:[&_strong]:text-slate-200 [&_em]:text-slate-600 dark:[&_em]:text-slate-300 [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_code]:bg-slate-100 dark:[&_code]:bg-slate-900/50 [&_code]:text-slate-700 dark:[&_code]:text-slate-200 [&_ul]:text-slate-600 dark:[&_ul]:text-slate-300 [&_ol]:text-slate-600 dark:[&_ol]:text-slate-300 [&_li]:text-slate-600 dark:[&_li]:text-slate-300 [&_blockquote]:border-blue-500 [&_blockquote]:text-slate-700 dark:[&_blockquote]:text-slate-300">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {announcement.content}
                </ReactMarkdown>
            </div>

            {/* Featured Image (if exists and hasn't been used fully as hero backdrop or if we want it inline) */}
            {announcement.image_url && (
                <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-100 dark:border-slate-800">
                    <img 
                        src={announcement.image_url} 
                        alt="Content Visual" 
                        className="w-full h-auto object-cover"
                    />
                </div>
            )}

            <div className="border-t border-slate-100 dark:border-slate-800 pt-8 mt-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                            Interested in {isCompanyPost ? company.company_name : "Zigex"}?
                        </h3>
                        <p className="text-slate-500 text-sm">
                            View their profile to see open opportunities and more updates.
                        </p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                         <Link href={isCompanyPost ? `/feed/companies/${company.id}` : "/feed"} className="flex-1 md:flex-none">
                            <Button size="lg" className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20">
                                <Globe size={18} className="mr-2" />
                                Visit Profile
                            </Button>
                         </Link>
                         <Button variant="outline" size="lg" className="flex-1 md:flex-none rounded-xl border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50">
                            <Share2 size={18} className="mr-2" />
                            Share
                        </Button>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
