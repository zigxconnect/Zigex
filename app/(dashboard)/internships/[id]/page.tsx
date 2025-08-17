import { InternshipBody } from "@/app/_components/sections/dashboard/details/InternshipBody";
import { InternshipInfoPanel } from "@/app/_components/sections/dashboard/details/InternshipInfoPanel";

import { allInternships, Internship } from "@/lib/data/internshipData";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    internshipId: string;
  };
}

/**
 * A mapping function to transform the raw internship data into the
 * shape required by our new UI components.
 */
function mapInternshipData(internship: Internship) {
  // Split the description and requirements into arrays for list items
  const responsibilities = internship.description.split(". ").filter(Boolean);
  const requiredSkills = internship.requirement.split(". ").filter(Boolean);

  return {
    // Data for InternshipBody
    title: internship.title,
    officeImage: internship.headQuarterImage,
    companyInitial: internship.company.charAt(0),
    company: internship.company,
    location: internship.location,
    jobDescription: internship.description,
    responsibilities,
    requiredSkills,

    // Data for InternshipInfoPanel
    details: {
      posted: internship.postedDate,
      type: internship.type,
      location: internship.location,
      category: internship.category,
      deadline: "Not specified", // Placeholder
    },
    requiredSkillsTags: requiredSkills.slice(0, 5), // Show first 5 skills as tags
  };
}

export default async function InternshipDetailsPage({ params }: PageProps) {
  // THE FIX IS HERE: We now use `params.id` to find the internship.
  const rawInternship = allInternships.find((job) => job.id === params.id);

  if (!rawInternship) {
    // If no match is found, this will correctly trigger a 404 page.
    notFound();
  }

  // The rest of the logic remains the same.
  const internship = mapInternshipData(rawInternship);

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <InternshipBody internship={internship} />
        </div>
        <div>
          <InternshipInfoPanel internship={internship} />
        </div>
      </div>
    </div>
  );
}
