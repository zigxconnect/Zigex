// file: src/components/sections/admin/applicants/ApplicantDetail.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  Mail, Phone, MapPin, Briefcase, FileText, ChevronRight, 
  Download, ExternalLink, Copy, Zap, Info, ShieldCheck, 
  Clock, User, MessageSquare, GraduationCap, Target,
  Calendar, Globe, Award, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { Applicant, ApplicantStatus } from "@/lib/types/applicants";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { ApplicantActions } from "./ApplicantActions";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type ApplicantDetailProps = {
  applicant: Applicant;
  companyId: string;
  onUpdateStatus: (newStatus: ApplicantStatus) => void;
};

// Animated info card component
const InfoCard = ({
  icon: Icon,
  label,
  value,
  subValue,
  actions,
  variant = "default",
  className = "",
}: {
  icon: any;
  label: string;
  value: string;
  subValue?: string;
  actions?: React.ReactNode;
  variant?: "default" | "primary" | "success";
  className?: string;
}) => {
  const variants = {
    default: "bg-white border-slate-100 hover:border-blue-200",
    primary: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100",
    success: "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100",
  };

  return (
    <div className={cn(
      "group p-5 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:shadow-blue-100/50",
      variants[variant],
      className
    )}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-300">
          <Icon size={18} className="text-blue-600" />
        </div>
        {actions}
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-bold text-slate-900 truncate" title={value}>{value}</p>
        {subValue && (
          <p className="text-xs text-slate-500">{subValue}</p>
        )}
      </div>
    </div>
  );
};

// Section wrapper component
const Section = ({
  title,
  icon: Icon,
  children,
  delay = 0,
}: {
  title: string;
  icon?: any;
  children: React.ReactNode;
  delay?: number;
}) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
  >
    <div className="flex items-center gap-2 mb-4">
      {Icon && (
        <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
          <Icon size={12} className="text-blue-600" />
        </div>
      )}
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</h3>
    </div>
    {children}
  </motion.section>
);

export const ApplicantDetail = ({
  applicant,
  companyId,
  onUpdateStatus,
}: ApplicantDetailProps) => {
  const firstName = applicant.name.split(' ')[0] || applicant.name;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const openGmail = () => {
    const subject = encodeURIComponent(`Regarding your application for ${applicant.internshipTitle} - ZIGEX`);
    const body = encodeURIComponent(
      `Hi ${firstName},\n\n` +
      `I hope this email finds you well. I'm reaching out from the ZIGEX recruitment team regarding your application for the ${applicant.internshipTitle}.\n\n` +
      `We've reviewed your profile and would like to discuss the next steps with you.\n\n` +
      `Best regards,\n` +
      `ZIGEX Recruitment Team`
    );
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${applicant.email}&su=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header with gradient background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-t-3xl px-8 pt-8 pb-24">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl -ml-24 -mb-24" />
        
        <div className="relative z-10 flex items-start gap-6">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative shrink-0"
          >
            {applicant.avatarUrl ? (
              <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-white/20 shadow-2xl">
                <Image
                  src={applicant.avatarUrl}
                  alt={applicant.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center text-3xl font-black text-white ring-4 ring-white/20 shadow-2xl backdrop-blur-sm">
                {applicant.name.charAt(0)}
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-emerald-500 border-4 border-white flex items-center justify-center text-white shadow-lg">
              <ShieldCheck size={16} />
            </div>
          </motion.div>
          
          {/* Name and status */}
          <div className="flex-1 min-w-0 pt-2">
            <h2 className="text-2xl font-black text-white tracking-tight leading-tight truncate">
              {applicant.name}
            </h2>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <StatusBadge status={applicant.status} size="large" className="rounded-xl bg-white/20 border-white/30 text-white" />
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white/70">
                <Calendar size={12} />
                Applied {format(new Date(applicant.appliedDate), "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="relative bg-white rounded-b-3xl -mt-16 pt-8 px-8 pb-8 space-y-8">
        {/* Quick contact cards */}
        <Section title="Contact Information" icon={User} delay={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Email */}
            <InfoCard
              icon={Mail}
              label="Email Address"
              value={applicant.email}
              actions={
                <button
                  onClick={() => copyToClipboard(applicant.email, "Email")}
                  className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  <Copy size={14} />
                </button>
              }
            />
            
            {/* Phone */}
            <InfoCard
              icon={Phone}
              label="Phone Number"
              value={applicant.phone || "Not provided"}
              actions={applicant.phone && (
                <button
                  onClick={() => copyToClipboard(applicant.phone, "Phone")}
                  className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  <Copy size={14} />
                </button>
              )}
            />
            
            {/* Location */}
            <InfoCard
              icon={MapPin}
              label="Location"
              value={applicant.address || (applicant.phone?.startsWith('+237') ? "Cameroon" : "International")}
            />
            
            {/* Birth Date */}
            {applicant.dateOfBirth && (
              <InfoCard
                icon={Calendar}
                label="Date of Birth"
                value={format(new Date(applicant.dateOfBirth), "MMM d, yyyy")}
              />
            )}
          </div>
          
          {/* Quick action buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={openGmail}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-medium text-sm transition-colors"
            >
              <Mail size={14} />
              Open Gmail
            </button>
            <a
              href={`mailto:${applicant.email}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium text-sm transition-colors"
            >
              <Mail size={14} />
              Local Mail
            </a>
            {applicant.phone && (
              <a
                href={`tel:${applicant.phone}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-medium text-sm transition-colors"
              >
                <Phone size={14} />
                Call Now
              </a>
            )}
          </div>
        </Section>

        {/* Recruitment Hub - The main action area */}
        <Section title="Recruitment Hub" icon={Zap} delay={0.2}>
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-3xl border-2 border-slate-100 overflow-hidden">
            <ApplicantActions
              applicant={applicant}
              companyId={companyId}
              onUpdateStatus={onUpdateStatus}
            />
          </div>
        </Section>

        {/* Application Details */}
        <Section title="Application Details" icon={Briefcase} delay={0.3}>
          <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-3xl border border-blue-100 p-6 space-y-6">
            {/* Position applied for */}
            <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                <Briefcase size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold text-slate-900">{applicant.internshipTitle || "General Application"}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                    REF-{applicant.id.slice(0,6).toUpperCase()}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold uppercase">
                    {applicant.applicationType}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Academic background */}
            {(applicant.school || applicant.schoolLevel) && (
              <div className="grid grid-cols-2 gap-4">
                {applicant.school && (
                  <div className="p-4 bg-white rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <GraduationCap size={14} className="text-blue-500" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Institution</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{applicant.school}</p>
                  </div>
                )}
                {applicant.schoolLevel && (
                  <div className="p-4 bg-white rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Award size={14} className="text-blue-500" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Academic Level</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{applicant.schoolLevel}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Section>

        {/* Candidate Narratives */}
        {(applicant.reason || applicant.expectations || applicant.comments) && (
          <Section title="Candidate Narratives" icon={MessageSquare} delay={0.4}>
            <div className="space-y-4">
              {applicant.reason && (
                <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={14} className="text-amber-500" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Motivation & Suitability</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{applicant.reason}</p>
                </div>
              )}

              {applicant.expectations && (
                <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <Target size={14} className="text-blue-500" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Career Aspirations</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{applicant.expectations}</p>
                </div>
              )}

              {applicant.comments && (
                <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare size={14} className="text-emerald-500" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Additional Notes</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{applicant.comments}</p>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Quick attributes */}
        {(applicant.domain || applicant.duration || applicant.experienceLevel || applicant.workMode) && (
          <Section title="Qualifications" icon={Award} delay={0.5}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {applicant.domain && (
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 text-center">
                  <Target size={18} className="text-blue-600 mx-auto mb-2" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Domain</p>
                  <p className="text-sm font-bold text-blue-700">{applicant.domain}</p>
                </div>
              )}
              {applicant.duration && (
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 text-center">
                  <Clock size={18} className="text-emerald-600 mx-auto mb-2" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Duration</p>
                  <p className="text-sm font-bold text-emerald-700">{applicant.duration}</p>
                </div>
              )}
              {applicant.experienceLevel && (
                <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 text-center">
                  <Award size={18} className="text-amber-600 mx-auto mb-2" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Experience</p>
                  <p className="text-sm font-bold text-amber-700">{applicant.experienceLevel}</p>
                </div>
              )}
              {applicant.workMode && (
                <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-violet-100 text-center">
                  <Globe size={18} className="text-violet-600 mx-auto mb-2" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Work Mode</p>
                  <p className="text-sm font-bold text-violet-700 capitalize">{applicant.workMode}</p>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Documents */}
        <Section title="Documents" icon={FileText} delay={0.6}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Resume */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-all group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText size={18} className="text-rose-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Resume / CV</p>
                  <p className="text-xs text-slate-400">PDF Document</p>
                </div>
              </div>
              {applicant.resumeUrl ? (
                <Button asChild className="w-full rounded-xl h-11 bg-slate-900 hover:bg-black text-white font-medium">
                  <Link href={applicant.resumeUrl} target="_blank">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Resume
                  </Link>
                </Button>
              ) : (
                <div className="h-11 flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <span className="text-xs font-medium text-slate-400">Not provided</span>
                </div>
              )}
            </div>

            {/* Cover Letter */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-all group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail size={18} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Cover Letter</p>
                  <p className="text-xs text-slate-400">Intent Document</p>
                </div>
              </div>
              {applicant.coverLetter ? (
                <Button asChild variant="outline" className="w-full rounded-xl h-11 border-blue-200 hover:bg-blue-50 hover:border-blue-300 font-medium">
                  <Link href={applicant.coverLetter} target="_blank">
                    <ExternalLink className="mr-2 h-4 w-4 text-blue-600" />
                    View Letter
                  </Link>
                </Button>
              ) : (
                <div className="h-11 flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <span className="text-xs font-medium text-slate-400">Not provided</span>
                </div>
              )}
            </div>
          </div>
        </Section>

        {/* RSVP Status for events */}
        {applicant.applicationType === "event" && (
          <Section title="Event RSVP" icon={Calendar} delay={0.7}>
            <div className={cn(
              "rounded-2xl p-5 flex items-center justify-between",
              applicant.rsvpStatus 
                ? "bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200" 
                : "bg-slate-50 border border-slate-200"
            )}>
              <div>
                <p className="text-sm font-bold text-slate-900">Attendance Status</p>
                <p className="text-xs text-slate-500">Event participation confirmation</p>
              </div>
              <span className={cn(
                "px-4 py-2 rounded-xl text-sm font-bold",
                applicant.rsvpStatus 
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" 
                  : "bg-slate-200 text-slate-600"
              )}>
                {applicant.rsvpStatus ? '✓ Confirmed' : 'Awaiting Response'}
              </span>
            </div>
          </Section>
        )}

        {/* Insight footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 opacity-10">
            <Info size={120} className="-mr-8 -mt-8" />
          </div>
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <Info size={22} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white/80 mb-1">Processing Recommendation</p>
              <p className="text-sm text-white/90 leading-relaxed">
                Candidate engagement indicates high interest. We recommend processing this application within 48 hours to maintain recruitment momentum and enhance your employer brand.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
