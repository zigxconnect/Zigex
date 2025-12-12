// file: src/components/sections/admin/applicants/ApplicantDetail.tsx

import Link from "next/link";
import Image from "next/image";
import { Download, Mail, Phone, ExternalLink, Calendar, MapPin, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

import { Applicant, ApplicantStatus } from "@/lib/types/applicants";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { ApplicantActions } from "./ApplicantActions";

type ApplicantDetailProps = {
  applicant: Applicant;
  onUpdateStatus: (newStatus: ApplicantStatus) => void;
};

const DetailCard = ({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("bg-white p-6 rounded-2xl border border-gray-100 shadow-sm", className)}>
    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
      {title}
    </h3>
    {children}
  </div>
);

export const ApplicantDetail = ({
  applicant,
  onUpdateStatus,
}: ApplicantDetailProps) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-50 to-indigo-50" />
        
        <div className="relative flex flex-col sm:flex-row gap-6 items-start sm:items-end">
          <div className="relative">
            <div className="absolute -inset-1 bg-white rounded-full" />
            <Image
              src={applicant.avatarUrl}
              alt={applicant.name}
              width={100}
              height={100}
              className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-md relative z-10"
            />
          </div>
          
          <div className="flex-1 min-w-0 pb-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  {applicant.name}
                </h1>
                <p className="text-lg text-gray-500 font-medium flex items-center gap-2 mt-1">
                  <Briefcase size={18} className="text-blue-500" />
                  Applying for <span className="text-gray-900">{applicant.internshipTitle}</span>
                </p>
              </div>
              <StatusBadge status={applicant.status} size="large" />
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl">
            <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600">
              <Mail size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 font-medium uppercase">Email</span>
              <span className="text-sm font-medium truncate">{applicant.email}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl">
            <div className="p-2 bg-white rounded-lg shadow-sm text-green-600">
              <Phone size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 font-medium uppercase">Phone</span>
              <span className="text-sm font-medium">{applicant.phone}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl">
            <div className="p-2 bg-white rounded-lg shadow-sm text-orange-600">
              <Calendar size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 font-medium uppercase">Applied On</span>
              <span className="text-sm font-medium">
                {new Date(applicant.appliedDate).toLocaleDateString(undefined, { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <DetailCard title="Cover Letter">
            {applicant.coverLetter ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-600 text-sm leading-relaxed">
                  {/* Placeholder for actual cover letter text if available, otherwise link */}
                  <p className="italic text-gray-500">
                    Preview not available. Please view the full document.
                  </p>
                </div>
                <Button asChild variant="outline" className="w-full sm:w-auto gap-2">
                  <Link
                    href={applicant.coverLetter}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink size={16} /> View Full Cover Letter
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500 italic">No cover letter provided.</p>
              </div>
            )}
          </DetailCard>

          <DetailCard title="Application Actions">
            <ApplicantActions
              applicant={applicant}
              onUpdateStatus={onUpdateStatus}
            />
          </DetailCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <DetailCard title="Documents">
            <div className="space-y-3">
              {applicant.resumeUrl ? (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm">
                    <Briefcase size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900">Resume</h4>
                    <p className="text-xs text-blue-600 mb-3">PDF Document</p>
                    <Button
                      asChild
                      size="sm"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    >
                      <Link
                        href={applicant.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="mr-2 h-4 w-4" /> Download
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No resume uploaded.</p>
              )}
            </div>
          </DetailCard>
        </div>
      </div>
    </div>
  );
};
