"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Users } from "lucide-react";
import { Applicant, ApplicantStatus } from "@/lib/types/applicants";
import { ApplicantListItem } from "@/components/sections/admin/applicants/ApplicantListItem";
import { ApplicantDetail } from "@/components/sections/admin/applicants/ApplicantDetail";

// --- DUMMY DATA ---
const mockApplicants: Applicant[] = [
  {
    id: "app-1",
    name: "Elena Rodriguez",
    avatarUrl: `https://i.pravatar.cc/150?u=elena`,
    email: "elena.r@example.com",
    phone: "555-0101",
    internshipTitle: "Software Development Intern",
    internshipId: "int-1",
    appliedDate: "2025-09-01T10:00:00Z",
    status: "Pending",
    resumeUrl: "#",
    coverLetter:
      "I am a highly motivated computer science student with a passion for developing innovative software solutions. My experience in JavaScript and React, combined with my strong problem-solving skills, makes me a strong candidate for this internship.",
  },
  {
    id: "app-2",
    name: "Ben Carter",
    avatarUrl: `https://i.pravatar.cc/150?u=ben`,
    email: "ben.carter@example.com",
    phone: "555-0102",
    internshipTitle: "Marketing & Sales Internship",
    internshipId: "int-4",
    appliedDate: "2025-08-28T14:30:00Z",
    status: "Accepted",
    resumeUrl: "#",
    coverLetter:
      "As a marketing major with hands-on experience in social media campaigns and market research, I am confident I can contribute to your team's success. I am eager to apply my skills in a real-world setting.",
  },
  {
    id: "app-3",
    name: "Aisha Khan",
    avatarUrl: `https://i.pravatar.cc/150?u=aisha`,
    email: "aisha.k@example.com",
    phone: "555-0103",
    internshipTitle: "Software Development Intern",
    internshipId: "int-1",
    appliedDate: "2025-08-25T09:00:00Z",
    status: "Rejected",
    resumeUrl: "#",
    coverLetter:
      "I am writing to express my interest in the Software Development Intern position. I have a strong foundation in Python and data structures.",
  },
];
// --- END DUMMY DATA ---

export default function ApplicantsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>(mockApplicants);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(
    mockApplicants[0]?.id || null
  );

  const selectedApplicant = applicants.find(
    (app) => app.id === selectedApplicantId
  );

  const handleUpdateStatus = (
    applicantId: string,
    newStatus: ApplicantStatus
  ) => {
    setApplicants((prev) =>
      prev.map((app) =>
        app.id === applicantId ? { ...app, status: newStatus } : app
      )
    );
    toast.success(`Applicant status updated to "${newStatus}"`);
  };

  return (
    <div className="flex h-[calc(100vh-theme(space.24))]">
      {" "}
      {/* Adjust height based on your header */}
      {/* Left Panel: Applicant List */}
      <div className="w-full max-w-sm border-r border-gray-200 bg-white overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Applicants</h2>
          <p className="text-sm text-gray-500">
            {applicants.length} total applicants
          </p>
        </div>
        <div className="flex flex-col">
          {applicants.map((applicant) => (
            <ApplicantListItem
              key={applicant.id}
              applicant={applicant}
              isSelected={applicant.id === selectedApplicantId}
              onSelect={() => setSelectedApplicantId(applicant.id)}
            />
          ))}
        </div>
      </div>
      {/* Right Panel: Applicant Details */}
      <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {selectedApplicant ? (
          <ApplicantDetail
            applicant={selectedApplicant}
            onUpdateStatus={(newStatus) =>
              handleUpdateStatus(selectedApplicant.id, newStatus)
            }
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <Users size={48} className="mb-4" />
            <h3 className="text-lg font-semibold">No Applicant Selected</h3>
            <p>Select an applicant from the list to view their details.</p>
          </div>
        )}
      </div>
    </div>
  );
}
