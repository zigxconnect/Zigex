// File Path: /app/_components/sections/create-profile/Step5Additional.tsx
import { useState } from "react";
import { ToggleChip } from "@/app/_components/ui/ToggleChip";

const interests = ["Sports", "Music", "Art", "Technology"];

const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className="w-full rounded-md border border-gray-300 p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
  />
);

type StepProps = { updateFormData: (data: object) => void };

export const Step5Additional = ({ updateFormData }: StepProps) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const handleToggle = (item: string, list: string[], setter: Function) => {
    const newList = list.includes(item)
      ? list.filter((s) => s !== item)
      : [...list, item];
    setter(newList);
  };

  return (
    <div className="space-y-8">
      <div>
        <label className="text-sm font-medium">Interests</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {interests.map((item) => (
            <ToggleChip
              key={item}
              text={item}
              isSelected={selectedInterests.includes(item)}
              onToggle={() =>
                handleToggle(item, selectedInterests, setSelectedInterests)
              }
            />
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Accommodations</label>
        <Textarea
          placeholder="Enter any specific accommodations needed"
          rows={4}
          className="mt-1"
        />
      </div>
    </div>
  );
};
