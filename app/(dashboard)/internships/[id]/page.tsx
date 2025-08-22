"use client";

import { useState, useEffect } from "react";
import { allInternships, Internship } from "@/lib/data/internshipData";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { InternshipBody } from "@/components/sections/dashboard/details/InternshipBody";
import { InternshipInfoPanel } from "@/components/sections/dashboard/details/InternshipInfoPanel";
import { ApplicationModal } from "@/components/sections/dashboard/details/ApplicationModal";

interface PageProps {
  params: {
    id: string;
  };
}

// Data mapping function to transform raw data
function mapInternshipData(internship: Internship) {
  const responsibilities = internship.description.split(". ").filter(Boolean);
  const requiredSkills = internship.requirement.split(". ").filter(Boolean);
  return {
    title: internship.title,
    officeImage: internship.headQuarterImage,
    companyInitial: internship.company.charAt(0),
    company: internship.company,
    location: internship.location,
    jobDescription: internship.description,
    responsibilities,
    requiredSkills,
    details: {
      posted: internship.postedDate,
      type: internship.type,
      location: internship.location,
      category: internship.category,
      deadline: "Not specified",
    },
    requiredSkillsTags: requiredSkills.slice(0, 5),
  };
}

export default function InternshipDetailsPage({ params }: PageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [internship, setInternship] = useState<any>(null);

  useEffect(() => {
    const rawInternship = allInternships.find((job) => job.id === params.id);
    if (!rawInternship) {
      notFound();
    } else {
      setInternship(mapInternshipData(rawInternship));
    }
  }, [params.id]);

  if (!internship) {
    return (
      <div className="text-center p-12">Loading internship details...</div>
    );
  }

  return (
    <>
      <div className="p-6 lg:p-8 pb-20 lg:pb-8">
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
