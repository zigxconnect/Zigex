// file: src/components/sections/admin/applicants/details/ProgramApplicationDetail.tsx (New File)
import { Applicant } from "@/lib/types/applicants";
import { DetailSection } from "./DetailSection";
import { Target, BarChart } from "lucide-react";

export const ProgramApplicationDetail = ({
  applicant,
}: {
  applicant: Applicant;
}) => {
  return (
    <div className="space-y-6">
      <DetailSection title="Program Specifics">
        <div className="space-y-3 text-sm">
          <p className="flex items-center gap-2">
            <BarChart size={14} /> <strong>Skill Level:</strong>{" "}
            <span className="capitalize">{applicant.level || "N/A"}</span>
          </p>
          <p className="flex flex-col gap-2">
            <span className="flex items-center gap-2">
              <Target size={14} /> <strong>Expectations:</strong>
            </span>
            <span className="pl-6 text-muted-foreground">
              {applicant.expectations || "No expectations provided."}
            </span>
          </p>
        </div>
      </DetailSection>
    </div>
  );
};
