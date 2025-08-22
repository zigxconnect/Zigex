"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/uiComponenet/Alert";
import { Tag } from "@/components/uiComponenet/Tag";

import { Sparkles, TriangleAlert } from "lucide-react";

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-start py-3 border-b border-gray-100 last:border-b-0">
    <span className="text-sm text-gray-500 font-medium flex-shrink-0 mr-4">
      {label}
    </span>
    <span className="text-sm font-semibold text-gray-800 text-right">
      {value}
    </span>
  </div>
);

interface TransformedInternship {
  details: { [key: string]: string };
  requiredSkillsTags: string[];
}

export const InternshipInfoPanel = ({
  internship,
  onApplyClick,
}: {
  internship: TransformedInternship;
  onApplyClick: () => void;
}) => {
  return (
    <div className="space-y-6 sticky top-8">
      <Card>
        <div className="p-6">
          <h3 className="font-bold text-lg mb-4 text-[#193CB8]">
            Internship Details
          </h3>
          <div className="space-y-1">
            {Object.entries(internship.details).map(([key, value]) => (
              <DetailItem
                key={key}
                label={key.charAt(0).toUpperCase() + key.slice(1)}
                value={value}
              />
            ))}
          </div>
        </div>
      </Card>

      <div className="hidden lg:block space-y-3">
        <Button
          className="w-full text-base py-3 font-semibold"
          onClick={onApplyClick}
        >
          Apply Now
        </Button>
        <Button
          variant="secondary"
          className="w-full text-base py-3 gap-2 font-medium"
        >
          <Sparkles size={18} /> Smart Apply
        </Button>
      </div>

      <Card>
        <div className="p-6">
          <h3 className="font-bold text-lg mb-4 text-[#193CB8]">
            Required Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {internship.requiredSkillsTags.map((tag: string) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </div>
      </Card>
      <Alert icon={TriangleAlert} variant="danger">
        <h4 className="font-bold">Application Deadline</h4>
        <p className="mt-1">
          Applications close on {internship.details.deadline}. Apply soon!
        </p>
      </Alert>
    </div>
  );
};
