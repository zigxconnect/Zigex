// file: src/components/sections/admin/applicants/details/InternshipApplicationDetail.tsx (New File)
import { Applicant } from "@/lib/types/applicants";
import { DetailSection } from "./DetailSection"; // A shared component we'll create next
import { Briefcase, Building } from "lucide-react";

export const InternshipApplicationDetail = ({
  applicant,
}: {
  applicant: Applicant;
}) => {
  return (
    <div className="space-y-6">
      <DetailSection title="Internship Specifics">
        <div className="space-y-3 text-sm">
          <p className="flex items-center gap-2">
            <Building size={14} /> <strong>Department:</strong>{" "}
            {applicant.department || "N/A"}
          </p>
          <p className="flex items-center gap-2">
            <Briefcase size={14} /> <strong>Work Mode:</strong>{" "}
            <span className="capitalize">{applicant.workMode || "N/A"}</span>
          </p>
        </div>
      </DetailSection>
      {/* You can add more sections specific to internships here */}
    </div>
  );
};
