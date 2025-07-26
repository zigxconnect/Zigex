import { useState } from "react";
import { Input } from "@/app/_components/ui/Input";
import { ToggleChip } from "@/app/_components/ui/ToggleChip";

const hardSkillsOptions = [
  "Programming",
  "Data Analysis",
  "Project Management",
  "Graphic Design",
];
const softSkillsOptions = [
  "Communication",
  "Teamwork",
  "Problem-Solving",
  "Creativity",
];

type StepProps = { updateFormData: (data: object) => void };

export const Step3Skills = ({ updateFormData }: StepProps) => {
  const [selectedHard, setSelectedHard] = useState<string[]>([]);
  const [selectedSoft, setSelectedSoft] = useState<string[]>([]);

  const handleToggle = (skill: string, list: string[], setter: Function) => {
    const newList = list.includes(skill)
      ? list.filter((s) => s !== skill)
      : [...list, skill];
    setter(newList);
  };

  return (
    <div className="space-y-8">
      <div>
        <label className="text-sm font-medium">Hard Skills</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {hardSkillsOptions.map((skill) => (
            <ToggleChip
              key={skill}
              text={skill}
              isSelected={selectedHard.includes(skill)}
              onToggle={() =>
                handleToggle(skill, selectedHard, setSelectedHard)
              }
            />
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Soft Skills</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {softSkillsOptions.map((skill) => (
            <ToggleChip
              key={skill}
              text={skill}
              isSelected={selectedSoft.includes(skill)}
              onToggle={() =>
                handleToggle(skill, selectedSoft, setSelectedSoft)
              }
            />
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium">Portfolio URL</label>
          <Input
            type="url"
            placeholder="Link to your portfolio"
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">GitHub URL</label>
          <Input
            type="url"
            placeholder="Link to your GitHub profile"
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">LinkedIn URL</label>
          <Input
            type="url"
            placeholder="Link to your LinkedIn profile"
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
};
