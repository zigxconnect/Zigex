// file: src/hooks/useApplicantData.ts (Renamed and refactored from useApplicants.ts)

"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Applicant, ApplicantStatus } from "@/lib/types/applicants";
import { ApplicantView } from "@/components/sections/admin/shared/ManagementTabs";

const API_ENDPOINTS: Record<ApplicantView, string> = {
  applicants: "/api/companies/applications",
  accepted: "/api/companies/accepted-interns",
};

export function useApplicantData(view: ApplicantView) {
  const [data, setData] = useState<Applicant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const selectedId = searchParams.get("selected");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const endpoint = API_ENDPOINTS[view];
        const response = await fetch(endpoint);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `Server responded with ${response.status}`
          );
        }
        const responseData: Applicant[] = await response.json();
        setData(responseData);
      } catch (err: any) {
        const errorMessage = err.message || "Could not connect to the server.";
        setError(errorMessage);
        toast.error(`Failed to load data for ${view}`, {
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [view]); // Re-fetch data whenever the view changes

  const selectedItem = data.find((item) => item.id === selectedId);

  const handleUpdateStatus = useCallback(
    async (applicantId: string, newStatus: ApplicantStatus) => {
      // This logic remains the same and works for both views
      const originalData = [...data];
      setData((prev) =>
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
        if (!response.ok) throw new Error("Server rejected the update.");
        toast.success(`Status updated to "${newStatus.replace("_", " ")}"`);
      } catch (err: any) {
        setData(originalData);
        toast.error("Update failed", { description: err.message });
      }
    },
    [data]
  );

  return {
    data,
    selectedItem,
    selectedId,
    isLoading,
    error,
    handleUpdateStatus,
  };
}
