"use client";

import { useState } from "react";
import { ToggleChip } from "@/app/_components/ui/ToggleChip";
import { Textarea } from "@/app/_components/ui/Textarea";
import { ProfileFormData } from "@/app/types/profile";

const interests = [
  "Sports",
  "Music",
  "Art",
  "Technology",
  "Volunteering",
  "Travel",
];

type StepProps = {
  data: Partial<ProfileFormData>;
  onUpdate: (update: Partial<ProfileFormData>) => void;
};

export const Step5Additional = ({ data, onUpdate }: StepProps) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    data.interests || []
  );

  const handleToggle = (
    item: string,
    list: string[],
    setter: Function,
    fieldName: "interests"
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
        <label className="text-sm font-medium">Interests</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {interests.map((item) => (
            <ToggleChip
              key={item}
              text={item}
              isSelected={selectedInterests.includes(item)}
              // THE FIX IS HERE: The prop is now correctly named 'onToggle'
              onToggle={() =>
                handleToggle(
                  item,
                  selectedInterests,
                  setSelectedInterests,
                  "interests"
                )
              }
            />
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Achievements (Optional)</label>
        <Textarea
          name="achievements"
          value={data.achievements || ""}
          onChange={(e) => onUpdate({ achievements: e.target.value })}
          placeholder="List any awards, honors, or significant accomplishments."
          rows={4}
          className="mt-1"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Accommodations (Optional)</label>
        <Textarea
          name="accommodations"
          value={data.accommodations || ""}
          onChange={(e) => onUpdate({ accommodations: e.target.value })}
          placeholder="Enter any specific accommodations needed"
          rows={4}
          className="mt-1"
        />
      </div>
    </div>
  );
};
