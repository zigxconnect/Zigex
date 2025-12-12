// file: components/sections/admin/accepted/AcceptedInternDetail.tsx

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Applicant } from "@/lib/types/applicants";
import { Button } from "@/components/ui/button";
import { Download, Mail, Phone, ExternalLink, Calendar, MapPin, Briefcase, CheckCircle, MoreVertical } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { SendWelcomeEmailDialog } from "./SendWelcomeEmailDialog";
import { ScheduleOnboardingDialog } from "./ScheduleOnboardingDialog";

type AcceptedInternDetailProps = {
  intern: Applicant;
  onUpdateStatus: (newStatus: any) => void; // Keeping type loose for now to match usage
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

export const AcceptedInternDetail = ({ intern }: AcceptedInternDetailProps) => {
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isWelcomeEmailDialogOpen, setIsWelcomeEmailDialogOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-green-50 to-emerald-50" />
        
        <div className="relative flex flex-col sm:flex-row gap-6 items-start sm:items-end">
          <div className="relative">
            <div className="absolute -inset-1 bg-white rounded-full" />
            <Image
              src={intern.avatarUrl}
              alt={intern.name}
              width={100}
              height={100}
              className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-md relative z-10"
            />
            <div className="absolute bottom-0 right-0 z-20 bg-green-500 text-white p-1 rounded-full ring-2 ring-white">
              <CheckCircle size={16} fill="currentColor" className="text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0 pb-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  {intern.name}
                </h1>
                <p className="text-lg text-gray-500 font-medium flex items-center gap-2 mt-1">
                  <Briefcase size={18} className="text-green-600" />
                  Hired for <span className="text-gray-900">{intern.internshipTitle}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                 <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700 border border-green-200 shadow-sm">
                  Accepted Intern
                </span>
              </div>
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
              <span className="text-sm font-medium truncate">{intern.email}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl">
            <div className="p-2 bg-white rounded-lg shadow-sm text-green-600">
              <Phone size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 font-medium uppercase">Phone</span>
              <span className="text-sm font-medium">{intern.phone || 'Not provided'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl">
            <div className="p-2 bg-white rounded-lg shadow-sm text-orange-600">
              <Calendar size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 font-medium uppercase">Applied On</span>
              <span className="text-sm font-medium">
                {new Date(intern.appliedDate).toLocaleDateString(undefined, { 
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
          <DetailCard title="Onboarding Actions">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                onClick={() => setIsWelcomeEmailDialogOpen(true)}
                className="h-auto py-4 flex flex-col items-center gap-2 bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-600/20"
              >
                <Mail className="h-6 w-6" />
                <span className="font-semibold">Send Welcome Email</span>
                <span className="text-xs font-normal opacity-90">Notify intern of acceptance</span>
              </Button>
              
              <Button
                onClick={() => setIsScheduleDialogOpen(true)}
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 border-dashed border-2 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
              >
                <Calendar className="h-6 w-6" />
                <span className="font-semibold">Schedule Onboarding</span>
                <span className="text-xs font-normal text-gray-500">Set up first day meeting</span>
              </Button>
            </div>
          </DetailCard>

          <DetailCard title="Cover Letter">
            {intern.coverLetter ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-600 text-sm leading-relaxed">
                  <p className="italic text-gray-500">
                    Preview not available. Please view the full document.
                  </p>
                </div>
                <Button asChild variant="outline" className="w-full sm:w-auto gap-2">
                  <Link
                    href={intern.coverLetter}
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
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <DetailCard title="Quick Actions">
             <div className="space-y-3">
                <Button asChild variant="outline" className="w-full justify-start gap-2">
                  <a href={`mailto:${intern.email}`}>
                    <Mail size={16} /> Send Email
                  </a>
                </Button>
                {intern.phone && (
                  <Button asChild variant="outline" className="w-full justify-start gap-2">
                    <a href={`tel:${intern.phone}`}>
                      <Phone size={16} /> Call Phone
                    </a>
                  </Button>
                )}
             </div>
          </DetailCard>

          <DetailCard title="Documents">
            <div className="space-y-3">
              {intern.resumeUrl ? (
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
                        href={intern.resumeUrl}
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

      <SendWelcomeEmailDialog
        internId={intern.id}
        internName={intern.name}
        internEmail={intern.email}
        isOpen={isWelcomeEmailDialogOpen}
        onClose={() => setIsWelcomeEmailDialogOpen(false)}
        onSuccess={() => {
          toast.success("Welcome email sent!");
        }}
      />

      <ScheduleOnboardingDialog
        internId={intern.id}
        internName={intern.name}
        isOpen={isScheduleDialogOpen}
        onClose={() => setIsScheduleDialogOpen(false)}
        onSuccess={() => {
          toast.success("Onboarding scheduled!");
        }}
      />
    </div>
  );
};