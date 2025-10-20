// file: <your-path>/ApplicantsPage.tsx

"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Users, Loader2, AlertTriangle } from "lucide-react";

import { Applicant, ApplicantStatus } from "@/lib/types/applicants";
import { ApplicantListItem } from "@/components/sections/admin/applicants/ApplicantListItem";
import { ApplicantDetail } from "@/components/sections/admin/applicants/ApplicantDetail";

export default function ApplicantsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch applicants from the API when the component mounts
  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/companies/applications");

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Error ${response.status}`);
        }

        const data: Applicant[] = await response.json();
        setApplicants(data);

        // Automatically select the first applicant if data is available
        if (data.length > 0) {
          setSelectedApplicantId(data[0].id);
        }
      } catch (err: any) {
        const errorMessage = err.message || "Could not connect to the server.";
        setError(errorMessage);
        toast.error("Failed to load applicants", { description: errorMessage });
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplicants();
  }, []); // Empty dependency array ensures this runs only once

  const selectedApplicant = applicants.find(
    (app) => app.id === selectedApplicantId
  );

  // This function now sends a PATCH request to the backend
  const handleUpdateStatus = async (
    applicantId: string,
    newStatus: ApplicantStatus
  ) => {
    const originalApplicants = [...applicants];

    // Optimistic UI update: change the state immediately for a fast UX
    setApplicants((prev) =>
      prev.map((app) =>
        app.id === applicantId ? { ...app, status: newStatus } : app
      )
    );

    try {
      const response = await fetch(
        `/api/companies/applications/${applicantId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        // If the server returns an error, revert the UI and show a message
        const errorData = await response.json();
        throw new Error(errorData.error || "The server rejected the update.");
      }

      toast.success(`Applicant status updated to "${newStatus}"`);
    } catch (err: any) {
      // Revert the state on failure
      setApplicants(originalApplicants);
      toast.error("Update failed", { description: err.message });
    }
  };

  // --- RENDER LOGIC ---

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <Loader2 className="h-10 w-10 animate-spin mb-4" />
        <h3 className="text-lg font-semibold">Loading Applicants...</h3>
        <p>Please wait a moment.</p>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-red-600 bg-red-50 p-8 rounded-lg">
        <AlertTriangle size={48} className="mb-4" />
        <h3 className="text-xl font-bold">An Error Occurred</h3>
        <p>{error}</p>
      </div>
    );
  }

  // 3. Main Content
  return (
    <div className="flex h-[calc(100vh-theme(space.24))]">
      {/* Left Panel: Applicant List */}
      <div className="w-full max-w-sm border-r border-gray-200 bg-white overflow-y-auto">
        <div className="p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">Applicants</h2>
          <p className="text-sm text-gray-500">
            {applicants.length} total applicants
          </p>
        </div>
        <div className="flex flex-col">
          {applicants.length > 0 ? (
            applicants.map((applicant) => (
              <ApplicantListItem
                key={applicant.id}
                applicant={applicant}
                isSelected={applicant.id === selectedApplicantId}
                onSelect={() => setSelectedApplicantId(applicant.id)}
              />
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              No applicants found.
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Applicant Details */}
      <div className="flex-1 p-6 lg:p-8 overflow-y-auto bg-gray-50">
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
            <h3 className="text-lg font-semibold">No Applicants Found</h3>
            <p>There are currently no applications for your company.</p>
          </div>
        )}
      </div>
    </div>
  );
}
