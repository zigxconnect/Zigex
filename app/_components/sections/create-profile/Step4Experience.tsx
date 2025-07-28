"use client";

import { useState } from "react";
import { ToggleChip } from "@/app/_components/ui/ToggleChip";
import { Textarea } from "@/app/_components/ui/Textarea";
import { ProfileFormData } from "@/app/types/profile";

const industries = [
  "Tech",
  "Education",
  "Finance",
  "Healthcare",
  "Marketing",
  "Design",
];
const workModes = ["Remote", "On-site", "Hybrid"];

type StepProps = {
  data: Partial<ProfileFormData>;
  onUpdate: (update: Partial<ProfileFormData>) => void;
};

export const Step4Experience = ({ data, onUpdate }: StepProps) => {
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(
    data.preferred_industries || []
  );
  const [selectedWorkModes, setSelectedWorkModes] = useState<string[]>(
    data.work_mode || []
  );

  const handleToggle = (
    item: string,
    list: string[],
    setter: Function,
    fieldName: "preferred_industries" | "work_mode"
  ) => {
    const newList = list.includes(item)
      ? list.filter((s) => s !== item)
      : [...list, item];
    setter(newList);
    onUpdate({ [fieldName]: newList });
  };

  return (
    <div className="space-y-8">
      <div>
        <label className="text-sm font-medium">Previous Roles (Optional)</label>
        <Textarea
          name="previous_roles"
          value={data.previous_roles || ""}
          onChange={(e) => onUpdate({ previous_roles: e.target.value })}
          placeholder="Briefly describe any previous internships or work experience."
          rows={5}
          className="mt-1"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Preferred Industries</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {industries.map((item) => (
            <ToggleChip
              key={item}
              text={item}
              isSelected={selectedIndustries.includes(item)}
              // THE FIX IS HERE: The prop is now correctly named 'onToggle'
              onToggle={() =>
                handleToggle(
                  item,
                  selectedIndustries,
                  setSelectedIndustries,
                  "preferred_industries"
                )
              }
            />
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Preferred Work Mode</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {workModes.map((item) => (
            <ToggleChip
              key={item}
              text={item}
              isSelected={selectedWorkModes.includes(item)}
              // THE FIX IS HERE: The prop is now correctly named 'onToggle'
              onToggle={() =>
                handleToggle(
                  item,
                  selectedWorkModes,
                  setSelectedWorkModes,
                  "work_mode"
                )
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
};
