import { Applicant, ApplicantStatus } from "@/lib/types/applicants";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";
import { Check, X, Info, Download, Mail, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
  <div className="bg-white p-6 rounded-lg border border-gray-200">
    <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
    {children}
  </div>
);

export const ApplicantDetail = ({
  applicant,
  onUpdateStatus,
}: ApplicantDetailProps) => {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <header>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={applicant.avatarUrl}
              alt={applicant.name}
              className="h-20 w-20 rounded-full object-cover ring-4 ring-white shadow-sm"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {applicant.name}
              </h1>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                <span className="flex items-center gap-1.5">
                  <Mail size={14} /> {applicant.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone size={14} /> {applicant.phone}
                </span>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <StatusBadge status={applicant.status} large />
          </div>
        </div>
      </header>

      {/* Actions Section */}
      <div className="bg-gray-50 p-4 rounded-lg border flex items-center justify-center gap-3">
        <Button
          onClick={() => onUpdateStatus("Accepted")}
          variant="primary"
          className="bg-green-600 hover:bg-green-700"
        >
          <Check className="mr-2 h-4 w-4" /> Accept
        </Button>
        <Button
          onClick={() => onUpdateStatus("Rejected")}
          variant="destructive"
        >
          <X className="mr-2 h-4 w-4" /> Reject
        </Button>
        <Button
          onClick={() => onUpdateStatus("Requesting Info")}
          variant="secondary"
        >
          <Info className="mr-2 h-4 w-4" /> Request Info
        </Button>
      </div>

      {/* Details Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <DetailSection title="Cover Letter">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {applicant.coverLetter}
            </p>
          </DetailSection>
        </div>
        <div className="space-y-6">
          <DetailSection title="Application Details">
            <div className="space-y-3 text-sm">
              <p>
                <strong className="text-gray-700">Applying for:</strong>{" "}
                {applicant.internshipTitle}
              </p>
              <p>
                <strong className="text-gray-700">Applied on:</strong>{" "}
                {new Date(applicant.appliedDate).toLocaleString()}
              </p>
              <Button
                asChild
                variant="secondary"
                size="sm"
                className="w-full mt-2"
              >
                <Link href={applicant.resumeUrl} target="_blank">
                  <Download className="mr-2 h-4 w-4" /> Download Resume
                </Link>
              </Button>
            </div>
          </DetailSection>
        </div>
      </div>
    </div>
  );
};
