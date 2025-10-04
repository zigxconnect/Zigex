/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ApplicationModal } from "@/components/sections/dashboard/details/ApplicationModal";
import { InternshipInfoPanel } from "@/components/sections/dashboard/details/InternshipInfoPanel";
import { InternshipBody } from "@/components/sections/dashboard/details/InternshipBody";
import { InternshipDetailsLoadingSkeleton } from "@/components/SinglePageLoadingSkeleton";
// import { InternshipDetailsLoadingSkeleton } from "@/components/sections/dashboard/details/InternshipDetailsLoadingSkeleton";

export default function InternshipDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const resolvedParams = useState(params);

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
          `/api/students/internships/${encodeURIComponent(params.id)}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            router.replace("/404");
            return;
          }
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
  }, [params.id, resolvedParams[0].id]);

  if (isLoading) {
    return <InternshipDetailsLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
        <div className="text-center p-6 text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
        <div className="text-center p-6 text-gray-500 text-lg">
          Internship not found.
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Content Container */}
      <div className="min-h-screen bg-[#F8FAFC]">
        {/* Mobile: No padding, Desktop: Padding */}
        <div className="lg:p-8 pb-20 lg:pb-8">
          <div className="lg:max-w-7xl lg:mx-auto">
            
            {/* Mobile: Stack layout, Desktop: Grid layout */}
            <div className="flex flex-col lg:grid lg:grid-cols-3 lg:gap-8">
              
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Mobile: Full width with no border radius, Desktop: Normal styling */}
                <div className="lg:rounded-2xl overflow-hidden">
                  <InternshipBody internship={internship} />
                </div>
              </div>
              
              {/* Desktop Sidebar - Hidden on mobile since info is moved to InternshipBody or fixed button */}
              <div className="hidden lg:block">
                <InternshipInfoPanel
                  internship={internship}
                  onApplyClick={() => setIsModalOpen(true)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Apply Button - Mobile Only */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg lg:hidden z-30">
        <Button
          className="w-full text-base py-3 font-semibold"
          onClick={() => setIsModalOpen(true)}
        >
          Apply Now
        </Button>
      </div>

      {/* Application Modal */}
      {isModalOpen && (
        <ApplicationModal
          internshipTitle={internship.title}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}