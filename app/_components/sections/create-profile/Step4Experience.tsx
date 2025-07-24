import { useState } from "react";
import { Input } from "@/app/_components/ui/Input";
import { ToggleChip } from "@/app/_components/ui/ToggleChip";

const industries = ["Tech", "Education", "Finance", "Healthcare"];
const workModes = ["Remote", "On-site", "Hybrid"];

type StepProps = { updateFormData: (data: object) => void };

export const Step4Experience = ({ updateFormData }: StepProps) => {
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedWorkModes, setSelectedWorkModes] = useState<string[]>([]);

  const handleToggle = (item: string, list: string[], setter: Function) => {
    const newList = list.includes(item)
      ? list.filter((s) => s !== item)
      : [...list, item];
    setter(newList);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium">Job Title</label>
          <Input
            type="text"
            placeholder="Enter your job title"
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Company</label>
          <Input
            type="text"
            placeholder="Enter the company name"
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Duration</label>
          <Input
            type="text"
            placeholder="Enter duration of employment"
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Preferred Industries</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {industries.map((item) => (
            <ToggleChip
              key={item}
              text={item}
              isSelected={selectedIndustries.includes(item)}
              onToggle={() =>
                handleToggle(item, selectedIndustries, setSelectedIndustries)
              }
            />
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Work Mode</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {workModes.map((item) => (
            <ToggleChip
              key={item}
              text={item}
              isSelected={selectedWorkModes.includes(item)}
              onToggle={() =>
                handleToggle(item, selectedWorkModes, setSelectedWorkModes)
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
};
