import { Button } from "@/app/_components/ui/Button";
import { Card } from "@/app/_components/ui/Card";
import { Tag } from "@/app/_components/ui/Tag";
import { Alert } from "@/app/_components/ui/Alert";
import { Sparkles, TriangleAlert } from "lucide-react";

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-100">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm font-semibold text-gray-800">{value}</span>
  </div>
);

export const InternshipInfoPanel = ({ internship }: { internship: any }) => {
  return (
    <div className="space-y-6 sticky top-6">
      <Card>
        <h3 className="font-bold text-lg mb-2">Internship Details</h3>
        {Object.entries(internship.details).map(([key, value]) => (
          <DetailItem
            key={key}
            label={key.charAt(0).toUpperCase() + key.slice(1)}
            value={value as string}
          />
        ))}
      </Card>
      <div className="space-y-3">
        <Button variant="orange" className="w-full text-base py-3">
          Apply Now
        </Button>
        <Button variant="primary" className="w-full text-base py-3 gap-2">
          <Sparkles size={18} />
          Smart Apply
        </Button>
      </div>
      <Card>
        <h3 className="font-bold text-lg mb-4">Required Skills</h3>
        <div className="flex flex-wrap gap-2">
          {internship.requiredSkillsTags.map((tag: string) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
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
