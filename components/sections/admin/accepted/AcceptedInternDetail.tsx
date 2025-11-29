// file: components/sections/admin/accepted/AcceptedInternDetail.tsx

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Applicant } from "@/lib/types/applicants";
import { Button } from "@/components/ui/button";
import { Download, Mail, Phone, ExternalLink, Calendar, MapPin } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SendWelcomeEmailDialog } from "./SendWelcomeEmailDialog";
import { ScheduleOnboardingDialog } from "./ScheduleOnboardingDialog";

type AcceptedInternDetailProps = {
  intern: Applicant;
};

const DetailSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white p-6 rounded-lg border border-gray-200">
    <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
    {children}
  </div>
);

export const AcceptedInternDetail = ({ intern }: AcceptedInternDetailProps) => {
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isWelcomeEmailDialogOpen, setIsWelcomeEmailDialogOpen] = useState(false);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <header>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={intern.avatarUrl}
              alt={intern.name}
              className="h-20 w-20 rounded-full object-cover ring-4 ring-white shadow-sm"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {intern.name}
              </h1>
              <div className="flex items-center flex-wrap gap-4 mt-1 text-sm text-gray-600">
                <span className="flex items-center gap-1.5">
                  <Mail size={14} /> {intern.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone size={14} /> {intern.phone || 'Not provided'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              Accepted
            </span>
          </div>
        </div>
      </header>

      {/* Action Buttons */}
      <div className="bg-gray-50 p-4 rounded-lg border flex items-center justify-center gap-3 flex-wrap">
        <Button
          onClick={() => setIsWelcomeEmailDialogOpen(true)}
          variant="primary"
          className="bg-green-600 hover:bg-green-700"
        >
          <Mail className="mr-2 h-4 w-4" />
          Send Welcome Email
        </Button>
        <Button
          onClick={() => setIsScheduleDialogOpen(true)}
          variant="secondary"
        >
          <Calendar className="mr-2 h-4 w-4" /> Schedule Onboarding
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Phone className="mr-2 h-4 w-4" /> Contact Intern
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <a href={`mailto:${intern.email}`} className="cursor-pointer">
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </a>
            </DropdownMenuItem>
            {intern.phone && (
              <DropdownMenuItem asChild>
                <a href={`tel:${intern.phone}`} className="cursor-pointer">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Phone
                </a>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
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