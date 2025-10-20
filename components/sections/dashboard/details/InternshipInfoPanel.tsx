import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tag } from "@/components/uiComponent/Tag";

import { Sparkles, TriangleAlert } from "lucide-react";

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: string | boolean | null;
}) => {
  if (value === null || value === undefined) return null;
  const displayValue =
    typeof value === "boolean" ? (value ? "Yes" : "No") : value;
  return (
    <div className="flex justify-between items-start py-3 border-b border-gray-100 last:border-b-0">
      <span className="text-sm text-gray-500 font-medium flex-shrink-0 mr-4">
        {label}
      </span>
      <span className="text-sm font-semibold text-gray-800 text-right">
        {displayValue}
      </span>
    </div>
  );
};

export const InternshipInfoPanel = ({
  internship,
  onApplyClick,
}: {
  internship: any;
  onApplyClick: () => void;
}) => {
  const formattedDeadline = internship.deadline
    ? new Date(internship.deadline).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Not specified";

  return (
    <div className="space-y-6 sticky top-8">
      <Card>
        <div className="p-6">
          <h3 className="font-bold text-lg mb-4 text-[#193CB8]">
            Internship Details
          </h3>
          <div className="space-y-1">
            <DetailItem label="Type" value={internship.type} />
            <DetailItem label="Location" value={internship.location} />
            <DetailItem label="Category" value={internship.category} />
            <DetailItem
              label="Compensation"
              value={
                internship.is_paid
                  ? internship.compensation || "Paid"
                  : "Unpaid"
              }
            />
            <DetailItem
              label="Posted"
              value={new Date(internship.created_at).toLocaleDateString(
                "en-US",
                { month: "long", day: "numeric" }
              )}
            />
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
            {internship.required_skills?.map((tag: string) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </div>
      </Card>
      <Alert icon={TriangleAlert} variant="danger">
        <AlertTitle>Application Deadline</AlertTitle>
        <AlertDescription>
          Applications close on {formattedDeadline}. Apply soon!
        </AlertDescription>
      </Alert>
    </div>
  );
};
