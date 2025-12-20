// file: src/components/sections/admin/applicants/ApplicantDetail.tsx

import Link from "next/link";
import Image from "next/image"; // Correctly using next/image
import { Download, Mail, Phone, ExternalLink } from "lucide-react";

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
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-card p-6 rounded-xl border">
    <h3 className="text-lg font-semibold text-card-foreground mb-4">{title}</h3>
    {children}
  </div>
);

export const ApplicantDetail = ({
  applicant,
  onUpdateStatus,
}: ApplicantDetailProps) => {
  
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-5">
          {/* This Image component is now configured to work */}
          <Image
            src={applicant.avatarUrl }
            alt={applicant.name}
            width={80}
            height={80}
            className="h-20 w-20 rounded-full object-cover ring-4 ring-background"
          />
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {applicant.name}
            </h1>
            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Mail size={14} /> {applicant.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone size={14} /> {applicant.phone}
              </span>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 self-start sm:self-center">
          <StatusBadge status={applicant.status} size="large" />
        </div>
      </header>

      <DetailSection title="Manage Application">
        <ApplicantActions
          applicant={applicant}
          onUpdateStatus={onUpdateStatus}
        />
      </DetailSection>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <DetailSection title="Cover Letter">
            {applicant.coverLetter ? (
              <Button asChild variant="outline" className="w-full">
                <Link
                  href={applicant.coverLetter}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" /> View Cover Letter
                </Link>
              </Button>
            ) : (
              <p className="text-muted-foreground italic">
                No cover letter provided.
              </p>
            )}
          </DetailSection>
        </div>
        <div>
          <DetailSection title="Application Details">
            <div className="space-y-3 text-sm">
              <p>
                <strong className="font-medium text-foreground">
                  Applying for:
                </strong>
                <br />
                {applicant.internshipTitle}
              </p>
              <p>
                <strong className="font-medium text-foreground">
                  Applied on:
                </strong>
                <br />
                {new Date(applicant.appliedDate).toLocaleString()}
              </p>
              {applicant.resumeUrl && (
                <Button
                  asChild
                  variant="secondary"
                  size="sm"
                  className="w-full mt-4"
                >
                  <Link
                    href={applicant.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="mr-2 h-4 w-4" /> Download Resume
                  </Link>
                </Button>
              )}
            </div>
          </DetailSection>
        </div>
      </div>
    </div>
  );
};
