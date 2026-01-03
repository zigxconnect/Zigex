// file: src/components/sections/admin/applicants/ApplicantDetail.tsx
import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Briefcase, FileText, ChevronRight, Download, ExternalLink, Copy, Zap, Info, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Applicant, ApplicantStatus } from "@/lib/types/applicants";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { ApplicantActions } from "./ApplicantActions";

type ApplicantDetailProps = {
  applicant: Applicant;
  onUpdateStatus: (newStatus: ApplicantStatus) => void;
};

const DetailSection = ({
  title,
  icon: Icon,
  children,
  className = "",
}: {
  title: string;
  icon?: any;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`space-y-4 ${className}`}>
    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
       {Icon && <Icon size={16} className="text-primary" />}
       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{title}</h3>
    </div>
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
       {children}
       <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors" />
    </div>
  </div>
);

export const ApplicantDetail = ({
  applicant,
  onUpdateStatus,
}: ApplicantDetailProps) => {
  
  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-20">
      <header className="flex flex-col gap-8">
        <div className="flex items-center gap-6">
          <div className="relative">
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
             <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center text-white">
                <ShieldCheck size={14} />
             </div>
          </div>
          
          <div className="space-y-1">
            <h2 className="text-3xl font-heading font-black text-slate-900 tracking-tight leading-tight">
              {applicant.name}
            </h2>
            <div className="flex items-center gap-3">
               <StatusBadge status={applicant.status} />
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">• Applied {new Date(applicant.appliedDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
           <div className="flex flex-col p-4 bg-white rounded-2xl border border-slate-100 hover:border-primary/50 hover:bg-primary/5 transition-all group relative w-full overflow-hidden">
              <Mail size={14} className="text-slate-400 mb-2 group-hover:text-primary" />
              <div className="flex items-center justify-between gap-1 w-full mb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Email</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(applicant.email);
                    toast.success("Email copied!");
                  }}
                  className="p-1.5 bg-slate-50 hover:bg-primary/10 rounded-lg text-slate-400 hover:text-primary transition-colors shrink-0"
                  title="Copy to clipboard"
                >
                  <Copy size={12} />
                </button>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <span className="text-xs font-black text-slate-900 truncate">{applicant.email}</span>
                <div className="flex gap-2 mt-1">
                   <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Generate a personalized message for Gmail Web
                        const firstName = applicant.name.split(' ')[0] || applicant.name;
                        const subject = encodeURIComponent(`Regarding your application for ${applicant.internshipTitle} - ZIGEX`);
                        const body = encodeURIComponent(
                          `Hi ${firstName},\n\n` +
                          `I hope this email finds you well. I'm reaching out from the ZIGEX recruitment team regarding your application for the ${applicant.internshipTitle}.\n\n` +
                          `We've reviewed your profile and would like to discuss the next steps with you. Please let us know when you might be available for a brief chat.\n\n` +
                          `Best regards,\n` +
                          `ZIGEX Recruitment Team`
                        );
                        window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${applicant.email}&su=${subject}&body=${body}`, '_blank');
                      }} 
                      className="text-[9px] font-black uppercase text-rose-600 hover:text-rose-700 underline flex items-center gap-1"
                   >
                     Use Gmail Web
                   </button>
                   <a 
                      href={`mailto:${applicant.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[9px] font-black uppercase text-primary hover:text-primary-700 underline"
                   >
                     Local App
                   </a>
                </div>
              </div>
           </div>
           <button 
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `tel:${applicant.phone}`;
              }} 
              className="flex flex-col p-4 bg-white rounded-2xl border border-slate-100 hover:border-primary/50 hover:bg-primary/5 transition-all group text-left w-full"
           >
              <Phone size={14} className="text-slate-400 mb-2 group-hover:text-primary" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Phone</span>
              <span className="text-xs font-bold text-slate-900 truncate w-full">{applicant.phone || "Not provided"}</span>
           </button>
           <div className="flex flex-col p-4 bg-white rounded-2xl border border-slate-100 shadow-sm col-span-2">
              <MapPin size={14} className="text-slate-400 mb-2" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Location Preferences</span>
              <span className="text-xs font-bold text-slate-900">Cameroon, Africa</span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-10">
        <DetailSection title="Recruitment Status" icon={Zap}>
          <ApplicantActions
            applicant={applicant}
            onUpdateStatus={onUpdateStatus}
          />
        </DetailSection>

        <DetailSection title="Opportunity Details" icon={Briefcase}>
          <div className="flex flex-col gap-4">
             <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-50 rounded-2xl">
                   <Briefcase className="text-primary" size={24} />
                </div>
                <div>
                   <p className="text-sm font-black text-slate-900">{applicant.internshipTitle || "Corporate Program"}</p>
                   <p className="text-xs font-medium text-slate-500 mt-0.5">Application Reference: REF-{applicant.id.slice(0,6).toUpperCase()}</p>
                   <p className="text-xs font-semibold text-primary/80 mt-1 uppercase">{applicant.applicationType}</p>
                </div>
             </div>
             {applicant.opportunityDescription && (
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 italic text-xs text-slate-500 leading-relaxed">
                   "{applicant.opportunityDescription}"
                </div>
             )}
          </div>
        </DetailSection>

        {/* NEW: Application Responses Section */}
        <DetailSection title="Candidate Responses" icon={FileText}>
          <div className="space-y-4">
            {/* Expectations - All Types */}
            {applicant.expectations && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">What They Hope to Gain</label>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{applicant.expectations}</p>
                </div>
              </div>
            )}

            {/* Comments - All Types */}
            {applicant.comments && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Additional Comments</label>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{applicant.comments}</p>
                </div>
              </div>
            )}

            {/* Level - Programs Only */}
            {applicant.level && (
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Experience Level</span>
                <span className="text-sm font-bold text-slate-900 bg-primary/10 text-primary px-3 py-1 rounded-lg">{applicant.level}</span>
              </div>
            )}

            {/* Duration - Internships Only */}
            {applicant.duration && (
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preferred Duration</span>
                <span className="text-sm font-bold text-slate-900">{applicant.duration}</span>
              </div>
            )}

            {/* Department - Internships Only */}
            {applicant.department && (
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preferred Department</span>
                <span className="text-sm font-bold text-slate-900">{applicant.department}</span>
              </div>
            )}

            {/* Work Mode - Internships Only */}
            {applicant.workMode && (
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Work Mode Preference</span>
                <span className="text-sm font-bold text-slate-900 capitalize">{applicant.workMode}</span>
              </div>
            )}

            {/* RSVP Status - Events Only */}
            {applicant.applicationType === "event" && (
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">RSVP Status</span>
                <span className={`text-sm font-bold px-3 py-1 rounded-lg ${applicant.rsvpStatus ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {applicant.rsvpStatus ? '✓ Confirmed Attendance' : 'Not Confirmed'}
                </span>
              </div>
            )}

            {/* If no responses were filled */}
            {!applicant.expectations && !applicant.comments && !applicant.level && !applicant.duration && !applicant.department && !applicant.workMode && (
              <p className="text-xs text-slate-400 italic text-center py-4">No additional responses provided.</p>
            )}
          </div>
        </DetailSection>


        <div className="grid grid-cols-2 gap-6">
           <DetailSection title="Resume Document" icon={Download}>
              {applicant.resumeUrl ? (
                <div className="space-y-4">
                   <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 italic text-[10px] text-slate-400">
                      📄 candidate_resume_standard.pdf
                   </div>
                   <Button asChild variant="primary" className="w-full rounded-xl">
                    <Link href={applicant.resumeUrl} target="_blank">
                      <ExternalLink className="mr-2 h-4 w-4" /> Final Review
                    </Link>
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No resume provided.</p>
              )}
           </DetailSection>

           <DetailSection title="Intent Letter" icon={Mail}>
              {applicant.coverLetter ? (
                <Button asChild variant="outline" className="w-full rounded-xl h-full min-h-[100px] flex-col gap-2 border-slate-200">
                  <Link href={applicant.coverLetter} target="_blank">
                    <ExternalLink className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Read Letter</span>
                  </Link>
                </Button>
              ) : (
                <p className="text-xs text-slate-400 italic py-6 text-center">No cover letter shared.</p>
              )}
           </DetailSection>
        </div>

        <div className="p-6 bg-indigo-50/50 rounded-[2rem] border border-indigo-100 flex items-start gap-4">
           <div className="p-2.5 bg-indigo-600 rounded-xl text-white">
              <Info size={18} />
           </div>
           <div className="space-y-1">
              <p className="text-xs font-black text-indigo-900 uppercase tracking-wide">Recruiter Insight</p>
              <p className="text-xs font-medium text-indigo-700/70 leading-relaxed italic">
                This candidate applied within 24 hours of posting. Recommended to review within 3 days to maintain recruitment pipeline velocity.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};
