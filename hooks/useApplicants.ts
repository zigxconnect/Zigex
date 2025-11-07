// file: src/hooks/useApplicants.ts

"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Applicant, ApplicantStatus } from "@/lib/types/applicants";

export function useApplicants() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const selectedApplicantId = searchParams.get("selected");

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch("/api/companies/applications");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `Server responded with ${response.status}`
          );
        }
        const data: Applicant[] = await response.json();
        setApplicants(data);
      } catch (err: any) {
        const errorMessage = err.message || "Could not connect to the server.";
        setError(errorMessage);
        toast.error("Failed to load applicants", { description: errorMessage });
      } finally {
        setIsLoading(false);
      }
    };
    fetchApplicants();
  }, []);

  const selectedApplicant = applicants.find(
    (app) => app.id === selectedApplicantId
  );

  const handleUpdateStatus = useCallback(
    async (applicantId: string, newStatus: ApplicantStatus) => {
      const originalApplicants = [...applicants];

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
          const errorData = await response.json();
          throw new Error(errorData.error || "The server rejected the update.");
        }
        toast.success(
          `Applicant status updated to "${newStatus.replace("_", " ")}"`
        );
      } catch (err: any) {
        setApplicants(originalApplicants);
        toast.error("Update failed", { description: err.message });
      }
    },
    [applicants]
  );

  return {
    applicants,
    selectedApplicant,
    selectedApplicantId,
    isLoading,
    error,
    handleUpdateStatus,
  };
}
