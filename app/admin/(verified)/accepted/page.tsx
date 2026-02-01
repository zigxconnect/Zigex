// file: app/admin/accepted/page.tsx

"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Users, Loader2, AlertTriangle, CheckCircle } from "lucide-react";

import { Applicant, ApplicantStatus } from "@/lib/types/applicants";
import { AcceptedInternListItem } from "@/components/sections/admin/accepted/AcceptedInternListItem";
import { AcceptedInternDetail } from "@/components/sections/admin/accepted/AcceptedInternDetail";

export default function AcceptedInternsPage() {
  const [acceptedInterns, setAcceptedInterns] = useState<Applicant[]>([]);
  const [selectedInternId, setSelectedInternId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch accepted interns from the API when the component mounts
  useEffect(() => {
    const fetchAcceptedInterns = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/companies/accepted-interns");

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Error ${response.status}`);
        }

        const data: Applicant[] = await response.json();
        setAcceptedInterns(data);

        // Automatically select the first intern if data is available
        if (data.length > 0) {
          setSelectedInternId(data[0].id);
        }
      } catch (err: any) {
        const errorMessage = err.message || "Could not connect to the server.";
        setError(errorMessage);
        toast.error("Failed to load accepted interns", { description: errorMessage });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAcceptedInterns();
  }, []); // Empty dependency array ensures this runs only once

  const selectedIntern = acceptedInterns.find(
    (intern) => intern.id === selectedInternId
  );

  // This function now sends a PATCH request to the backend
  const handleUpdateStatus = async (
    internId: string,
    newStatus: ApplicantStatus
  ) => {
    const originalInterns = [...acceptedInterns];

    // Optimistic UI update: change the state immediately for a fast UX
    setAcceptedInterns((prev) =>
      prev.map((intern) =>
        intern.id === internId ? { ...intern, status: newStatus } : intern
      )
    );

    try {
      const response = await fetch(
        `/api/companies/applications/${internId}`,
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

      toast.success(`Intern status updated to "${newStatus}"`);
    } catch (err: any) {
      // Revert the state on failure
      setAcceptedInterns(originalInterns);
      toast.error("Update failed", { description: err.message });
    }
  };

  // --- RENDER LOGIC ---

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <Loader2 className="h-10 w-10 animate-spin mb-4" />
        <h3 className="text-lg font-semibold">Loading Accepted Interns...</h3>
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
      {/* Left Panel: Accepted Interns List */}
      <div className="w-full max-w-sm border-r border-gray-200 bg-white overflow-y-auto">
        <div className="p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">Accepted Interns</h2>
          <p className="text-sm text-gray-500">
            {acceptedInterns.length} accepted interns
          </p>
        </div>
        <div className="flex flex-col">
          {acceptedInterns.length > 0 ? (
            acceptedInterns.map((intern) => (
              <AcceptedInternListItem
                key={intern.id}
                intern={intern}
                isSelected={intern.id === selectedInternId}
                onSelect={() => setSelectedInternId(intern.id)}
              />
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              No accepted interns found.
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Intern Details */}
      <div className="flex-1 p-6 lg:p-8 overflow-y-auto bg-gray-50">
        {selectedIntern ? (
          <AcceptedInternDetail
            intern={selectedIntern}
            onUpdateStatus={(newStatus) =>
              handleUpdateStatus(selectedIntern.id, newStatus)
            }
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <Users size={48} className="mb-4" />
            <h3 className="text-lg font-semibold">No Intern Selected</h3>
            <p>Select an intern from the list to view their details.</p>
          </div>
        )}
      </div>
    </div>
  );
}