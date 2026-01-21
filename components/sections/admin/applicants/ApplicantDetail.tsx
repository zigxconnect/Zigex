// file: src/components/sections/admin/applicants/ApplicantDetail.tsx
import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Briefcase, FileText, ChevronRight, Download, ExternalLink, Copy, Zap, Info, ShieldCheck, Clock, User, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Applicant, ApplicantStatus } from "@/lib/types/applicants";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { ApplicantActions } from "./ApplicantActions";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type ApplicantDetailProps = {
  applicant: Applicant;
  onUpdateStatus: (newStatus: ApplicantStatus) => void;
};

const DetailSection = ({
  title,
  icon: Icon,
  children,
  className = "",
  delay = 0,
}: {
  title: string;
  icon?: any;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={cn("space-y-4", className)}
  >
    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
       {Icon && <Icon size={14} className="text-primary/60" />}
       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{title}</h3>
    </div>
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
       {children}
       <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors pointer-events-none" />
    </div>
  </motion.div>
);

export const ApplicantDetail = ({
  applicant,
  onUpdateStatus,
}: ApplicantDetailProps) => {
  
  const firstName = applicant.name.split(' ')[0] || applicant.name;

  return (
    <div className="max-w-2xl mx-auto space-y-12 pb-20">
      <header className="flex flex-col gap-8">
        <div className="flex items-center gap-6">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
             {applicant.avatarUrl ? (
                <div className="w-24 h-24 rounded-[2.5rem] overflow-hidden shadow-2xl ring-4 ring-white">
                   <Image
                      src={applicant.avatarUrl}
                      alt={applicant.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                   />
                </div>
             ) : (
                <div className="w-24 h-24 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center text-3xl font-black text-white shadow-2xl ring-4 ring-white">
                   {applicant.name.charAt(0)}
                </div>
             )}
             <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center text-white shadow-lg">
                <ShieldCheck size={16} />
             </div>
          </motion.div>
          
          <div className="space-y-1.5">
            <h2 className="text-4xl font-heading font-black text-slate-900 tracking-tight leading-none">
              {applicant.name}
            </h2>
            <div className="flex items-center gap-3">
               <StatusBadge status={applicant.status} size="large" className="rounded-xl" />
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Clock size={10} /> Applied {new Date(applicant.appliedDate).toLocaleDateString()}
               </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
           {/* Email Card */}
           <div className="flex flex-col p-4 bg-white rounded-[2rem] border border-slate-100 hover:border-primary/30 hover:shadow-md transition-all group relative w-full overflow-hidden">
              <div className="flex items-center justify-between gap-1 w-full mb-2">
                 <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400 group-hover:text-primary transition-colors">
                    <Mail size={14} />
                 </div>
                 <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(applicant.email);
                    toast.success("Email copied!");
                  }}
                  className="p-1.5 bg-slate-50 hover:bg-primary/10 rounded-lg text-slate-400 hover:text-primary transition-colors shrink-0"
                  title="Copy email"
                >
                  <Copy size={12} />
                </button>
              </div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">Electronic Mail</span>
              <span className="text-xs font-black text-slate-900 truncate mb-3" title={applicant.email}>{applicant.email}</span>
              
              <div className="flex gap-3 mt-auto">
                 <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const subject = encodeURIComponent(`Regarding your application for ${applicant.internshipTitle} - ZIGEX`);
                      const body = encodeURIComponent(
                        `Hi ${firstName},\n\n` +
                        `I hope this email finds you well. I'm reaching out from the ZIGEX recruitment team regarding your application for the ${applicant.internshipTitle}.\n\n` +
                        `We've reviewed your profile and would like to discuss the next steps with you.\n\n` +
                        `Best regards,\n` +
                        `ZIGEX Recruitment Team`
                      );
                      window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${applicant.email}&su=${subject}&body=${body}`, '_blank');
                    }} 
                    className="text-[9px] font-bold uppercase text-rose-600 hover:underline flex items-center gap-0.5"
                 >
                   Gmail
                 </button>
                 <a 
                    href={`mailto:${applicant.email}`}
                    className="text-[9px] font-bold uppercase text-primary hover:underline"
                 >
                   Local
                 </a>
              </div>
           </div>

           {/* Phone Card */}
           <div className="flex flex-col p-4 bg-white rounded-[2rem] border border-slate-100 hover:border-primary/30 hover:shadow-md transition-all group relative w-full overflow-hidden">
              <div className="flex items-center justify-between gap-1 w-full mb-2">
                 <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400 group-hover:text-primary transition-colors">
                    <Phone size={14} />
                 </div>
                 <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(applicant.phone);
                    toast.success("Phone number copied!");
                  }}
                  className="p-1.5 bg-slate-50 hover:bg-primary/10 rounded-lg text-slate-400 hover:text-primary transition-colors shrink-0"
                  title="Copy phone"
                >
                  <Copy size={12} />
                </button>
              </div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">Contact Number</span>
              <span className="text-xs font-black text-slate-900 truncate mb-3">{applicant.phone || "Secret"}</span>
              <button 
                onClick={() => window.location.href = `tel:${applicant.phone}`}
                className="text-[9px] font-bold uppercase text-primary hover:underline mt-auto text-left"
              >
                Start Call
              </button>
           </div>

           {/* Location/Bio Card */}
           <div className="flex flex-col p-4 bg-white rounded-[2rem] border border-slate-100 col-span-2 relative overflow-hidden group">
              <div className="flex items-center gap-2 mb-2">
                 <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
                    <MapPin size={14} />
                 </div>
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Candidate Region</span>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-black text-slate-900 block">
                  {applicant.address || (applicant.phone?.startsWith('+237') ? "Douala, Cameroon" : "International Preference")}
                </span>
                {applicant.dateOfBirth && (
                  <span className="text-[10px] text-slate-500 font-medium bg-slate-50 px-2 py-0.5 rounded-md">
                    Born: {new Date(applicant.dateOfBirth).toLocaleDateString()}
                  </span>
                )}
              </div>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-10">
        <DetailSection title="Recruitment Hub" icon={Zap} delay={0.1}>
          <ApplicantActions
            applicant={applicant}
            onUpdateStatus={onUpdateStatus}
          />
        </DetailSection>

        <DetailSection title="Opportunity Context" icon={Briefcase} delay={0.2}>
          <div className="flex flex-col gap-6">
             <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="p-4 bg-white rounded-2xl shadow-sm">
                   <Briefcase className="text-primary" size={24} />
                </div>
                <div>
                   <p className="text-base font-black text-slate-900">{applicant.internshipTitle || "Corporate Program"}</p>
                   <div className="flex flex-wrap gap-3 mt-1.5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-2 py-0.5 rounded-lg border border-slate-100">
                        REF-{applicant.id.slice(0,6).toUpperCase()}
                       </span>
                       <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10">
                        {applicant.applicationType}
                       </span>
                    </div>
                 </div>
              </div>
              
              {/* Background Information */}
              {(applicant.school || applicant.schoolLevel) && (
                <div className="grid grid-cols-2 gap-3 p-4 bg-indigo-50/20 rounded-3xl border border-indigo-100/30">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block">Institution</span>
                    <span className="text-xs font-bold text-indigo-900">{applicant.school || "N/A"}</span>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block">Level</span>
                    <span className="text-xs font-bold text-indigo-900">{applicant.schoolLevel || "N/A"}</span>
                  </div>
                </div>
              )}

              {applicant.opportunityDescription && (
                 <div className="bg-indigo-50/30 p-5 rounded-3xl border border-indigo-100/50 relative overflow-hidden group">
                    <MessageSquare className="absolute -right-4 -bottom-4 text-indigo-500/10 group-hover:scale-110 transition-transform duration-500" size={100} />
                    <p className="italic text-xs text-indigo-900 leading-relaxed relative z-10 font-medium">
                       "{applicant.opportunityDescription}"
                    </p>
                 </div>
              )}
           </div>
        </DetailSection>

        {/* Dynamic Responses Section */}
        <DetailSection title="Candidate Narratives" icon={FileText} delay={0.3}>
          <div className="space-y-6">
            {/* Reason for Application */}
            {applicant.reason && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                   <User size={12} className="text-primary/50" />
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Motivation & Suitability</label>
                </div>
                <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100/80">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{applicant.reason}</p>
                </div>
              </div>
            )}

            {/* Expectations */}
            {applicant.expectations && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                   <ShieldCheck size={12} className="text-primary/50" />
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Career Aspirations</label>
                </div>
                <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100/80">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{applicant.expectations}</p>
                </div>
              </div>
            )}

            {/* Comments */}
            {applicant.comments && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                   <MessageSquare size={12} className="text-primary/50" />
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Additional Notes</label>
                </div>
                <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100/80">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{applicant.comments}</p>
                </div>
              </div>
            )}

            {/* Attributes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {applicant.domain && (
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 uppercase">Target Domain</span>
                    <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-lg">{applicant.domain}</span>
                  </div>
                )}
                {applicant.experienceLevel && (
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 uppercase">Experience</span>
                    <span className="text-xs font-black text-slate-900">{applicant.experienceLevel}</span>
                  </div>
                )}
                {applicant.level && (
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 uppercase">Expertise</span>
                    <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-lg">{applicant.level}</span>
                  </div>
                )}
                {applicant.duration && (
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 uppercase">Engagement</span>
                    <span className="text-xs font-black text-slate-900">{applicant.duration}</span>
                  </div>
                )}
                {applicant.department && (
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 uppercase">Unit Preferrence</span>
                    <span className="text-xs font-black text-slate-900">{applicant.department}</span>
                  </div>
                )}
                {applicant.workMode && (
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 uppercase">Velocity</span>
                    <span className="text-xs font-black text-slate-900 capitalize">{applicant.workMode}</span>
                  </div>
                )}
            </div>

            {/* RSVP - Event Specific */}
            {applicant.applicationType === "event" && (
              <div className="flex items-center justify-between p-5 bg-emerald-50/50 rounded-3xl border border-emerald-100">
                <div className="space-y-0.5">
                   <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">RSVP Protocol</span>
                   <p className="text-[10px] text-emerald-600/60 font-medium">Submission status for event attendance</p>
                </div>
                <span className={cn(
                    "text-xs font-black px-4 py-2 rounded-xl transition-all shadow-sm",
                    applicant.rsvpStatus ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-slate-200 text-slate-600'
                )}>
                  {applicant.rsvpStatus ? '✓ Confirmed' : 'Awaiting'}
                </span>
              </div>
            )}

            {/* Empty State for response section */}
            {!applicant.expectations && !applicant.comments && !applicant.level && !applicant.duration && !applicant.department && !applicant.workMode && (
              <div className="py-10 text-center space-y-2 grayscale opacity-40">
                  <FileText className="mx-auto" size={40} />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">No narrative responses provided</p>
              </div>
            )}
          </div>
        </DetailSection>


        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
           <DetailSection title="Curriculum Vitae" icon={Download} delay={0.4}>
              {applicant.resumeUrl ? (
                <div className="space-y-5">
                   <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group/doc overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-rose-500 shrink-0">
                         <FileText size={18} />
                      </div>
                      <div className="flex flex-col min-w-0">
                         <span className="text-[10px] font-black text-slate-400 uppercase truncate">RESUME_ARCHIVE_FINAL</span>
                         <span className="text-[10px] font-bold text-slate-300">PDF Document • 1.2 MB</span>
                      </div>
                      <div className="absolute inset-0 bg-primary/0 group-hover/doc:bg-primary/[0.02] transition-colors pointer-events-none" />
                   </div>
                   <Button asChild className="w-full rounded-2xl h-12 bg-slate-900 hover:bg-black text-white font-bold shadow-lg shadow-slate-200">
                    <Link href={applicant.resumeUrl} target="_blank">
                      <ExternalLink className="mr-2 h-4 w-4" /> Comprehensive Review
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                   <p className="text-[10px] font-black text-slate-300 uppercase italic">Document non-existent</p>
                </div>
              )}
           </DetailSection>

           <DetailSection title="Intent Manifest" icon={Mail} delay={0.5}>
              {applicant.coverLetter ? (
                <Button asChild variant="outline" className="w-full rounded-[2.5rem] h-full min-h-[140px] flex-col gap-3 border-dashed border-slate-200 bg-slate-50/30 hover:bg-white hover:border-primary/50 transition-all group">
                  <Link href={applicant.coverLetter} target="_blank" className="flex flex-col items-center">
                    <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                       <ExternalLink className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-primary">Inspect Manifest</span>
                  </Link>
                </Button>
              ) : (
                <div className="py-8 h-full flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-[10px] font-black text-slate-300 uppercase italic">Manifest non-existent</p>
                </div>
              )}
           </DetailSection>
        </div>

        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="p-8 bg-indigo-50/20 rounded-[3rem] border border-indigo-100/30 flex items-start gap-5 relative overflow-hidden group"
        >
           <div className="absolute top-0 right-0 p-8 text-indigo-500/5 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
              <ShieldCheck size={120} />
           </div>
           <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100 shrink-0 relative z-10">
              <Info size={20} />
           </div>
           <div className="space-y-1.5 relative z-10">
              <p className="text-[10px] font-black text-indigo-900 uppercase tracking-[0.2em]">Analytic Insight</p>
              <p className="text-xs font-medium text-indigo-700/80 leading-relaxed italic pr-12">
                Candidate velocity indicates high engagement. Recommended processing within 48 hours to maintain recruitment momentum and brand reputation.
              </p>
           </div>
        </motion.div>
      </div>
    </div>
  );
};

