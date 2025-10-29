// file: components/sections/admin/accepted/AcceptedInternDetail.tsx

import { Applicant } from "@/lib/types/applicants";
import { Button } from "@/components/ui/button";
import { Download, Mail, Phone, ExternalLink, Calendar, MapPin } from "lucide-react";
import Link from "next/link";

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
        <Button variant="primary" className="bg-green-600 hover:bg-green-700">
          <Mail className="mr-2 h-4 w-4" /> Send Welcome Email
        </Button>
        <Button variant="secondary">
          <Calendar className="mr-2 h-4 w-4" /> Schedule Onboarding
        </Button>
        <Button variant="outline">
          <Phone className="mr-2 h-4 w-4" /> Contact Intern
        </Button>
      </div>

      {/* Details Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-6">
          <DetailSection title="Internship Details">
            <div className="space-y-3 text-sm">
              <p>
                <strong className="text-gray-700">Position:</strong>{" "}
                {intern.internshipTitle}
              </p>
              <p>
                <strong className="text-gray-700">Application Date:</strong>{" "}
                {new Date(intern.appliedDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p>
                <strong className="text-gray-700">Status:</strong>{" "}
                <span className="text-green-600 font-medium">Accepted</span>
              </p>
            </div>
          </DetailSection>

          <DetailSection title="Documents">
            <div className="space-y-3">
              {intern.resumeUrl && (
                <Button asChild variant="secondary" className="w-full justify-start">
                  <Link
                    href={intern.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="mr-2 h-4 w-4" /> Download Resume
                  </Link>
                </Button>
              )}
              
              {intern.coverLetter ? (
                <Button asChild variant="secondary" className="w-full justify-start">
                  <Link
                    href={intern.coverLetter}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" /> View Cover Letter
                  </Link>
                </Button>
              ) : (
                <p className="text-gray-500 italic">No cover letter provided.</p>
              )}
            </div>
          </DetailSection>
        </div>

        <div className="space-y-6">
          <DetailSection title="Next Steps">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-blue-900">Send Welcome Package</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Prepare and send the internship offer letter and welcome materials.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-green-900">Schedule Onboarding</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Arrange orientation and training sessions for the intern.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-purple-900">Setup Workspace</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    Prepare necessary equipment and access for the intern.
                  </p>
                </div>
              </div>
            </div>
          </DetailSection>

          <DetailSection title="Quick Actions">
            <div className="grid grid-cols-1 gap-2">
              <Button variant="outline" size="sm" className="justify-start">
                <Mail className="mr-2 h-4 w-4" /> Send Contract
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                <Calendar className="mr-2 h-4 w-4" /> Add to Team Calendar
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                <MapPin className="mr-2 h-4 w-4" /> Share Office Information
              </Button>
            </div>
          </DetailSection>
        </div>
      </div>
    </div>
  );
};