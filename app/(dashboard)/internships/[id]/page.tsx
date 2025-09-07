/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect, use } from "react";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ApplicationModal } from "@/components/sections/dashboard/details/ApplicationModal";
import { InternshipInfoPanel } from "@/components/sections/dashboard/details/InternshipInfoPanel";
import { InternshipBody } from "@/components/sections/dashboard/details/InternshipBody";
import { Spinner } from "@/components/uiComponenet/Spinner";

export default function InternshipDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);

  const [internship, setInternship] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setIsLoading(true);
        // We now use the resolved ID for the API call
        const response = await fetch(
          `/api/students/internships/${resolvedParams.id}`
        );

        if (!response.ok) {
          if (response.status === 404) notFound();
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to fetch internship details."
          );
        }

        const data = await response.json();
        setInternship(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [resolvedParams.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Spinner />{" "}
        <span className="ml-4 text-gray-500">Loading Details...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-12 text-red-500">{error}</div>;
  }

  if (!internship) {
    return null;
  }

  return (
    <>
      <div className="bg-[#F8FAFC] p-6 lg:p-8 pb-20 lg:pb-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <InternshipBody internship={internship} />
          </div>
          <div>
            <InternshipInfoPanel
              internship={internship}
              onApplyClick={() => setIsModalOpen(true)}
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg lg:hidden z-30">
        <Button
          className="w-full text-base py-3 font-semibold"
          onClick={() => setIsModalOpen(true)}
        >
          Apply Now
        </Button>
      </div>

      {isModalOpen && (
        <ApplicationModal
          internshipTitle={internship.title}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
