"use client";

import { useState } from "react";
import { Input } from "@/app/_components/ui/Input";
import { ToggleChip } from "@/app/_components/ui/ToggleChip";
import { ProfileFormData } from "@/app/types/profile";

const hardSkillsOptions = [
  "JavaScript",
  "Python",
  "React",
  "Node.js",
  "SQL",
  "HTML/CSS",
  "Data Analysis",
  "Figma",
];
const softSkillsOptions = [
  "Communication",
  "Teamwork",
  "Problem-Solving",
  "Creativity",
  "Leadership",
  "Adaptability",
];
const languageOptions = ["English", "French", "Spanish", "German"];

type StepProps = {
  data: Partial<ProfileFormData>;
  onUpdate: (update: Partial<ProfileFormData>) => void;
};

export const Step3Skills = ({ data, onUpdate }: StepProps) => {
  const [selectedHard, setSelectedHard] = useState<string[]>(
    data.hard_skills || []
  );
  const [selectedSoft, setSelectedSoft] = useState<string[]>(
    data.soft_skills || []
  );
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    data.languages || []
  );

  const handleToggle = (
    item: string,
    list: string[],
    setter: Function,
    fieldName: "hard_skills" | "soft_skills" | "languages"
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
        <label className="text-sm font-medium">Hard Skills</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {hardSkillsOptions.map((skill) => (
            <ToggleChip
              key={skill}
              text={skill}
              isSelected={selectedHard.includes(skill)}
              // THE FIX IS HERE: The prop is now correctly named 'onToggle'
              onToggle={() =>
                handleToggle(
                  skill,
                  selectedHard,
                  setSelectedHard,
                  "hard_skills"
                )
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
              // THE FIX IS HERE: The prop is now correctly named 'onToggle'
              onToggle={() =>
                handleToggle(
                  skill,
                  selectedSoft,
                  setSelectedSoft,
                  "soft_skills"
                )
              }
            />
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Languages</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {languageOptions.map((lang) => (
            <ToggleChip
              key={lang}
              text={lang}
              isSelected={selectedLanguages.includes(lang)}
              // THE FIX IS HERE: The prop is now correctly named 'onToggle'
              onToggle={() =>
                handleToggle(
                  lang,
                  selectedLanguages,
                  setSelectedLanguages,
                  "languages"
                )
              }
            />
          ))}
        </div>
      </div>
      <div className="space-y-6 border-t border-gray-200 pt-8">
        <div>
          <label className="text-sm font-medium">Portfolio URL</label>
          <Input
            name="portfolio_url"
            type="url"
            value={data.portfolio_url || ""}
            onChange={(e) => onUpdate({ portfolio_url: e.target.value })}
            placeholder="https://your-portfolio.com"
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">GitHub URL</label>
          <Input
            name="github_url"
            type="url"
            value={data.github_url || ""}
            onChange={(e) => onUpdate({ github_url: e.target.value })}
            placeholder="https://github.com/your-username"
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">LinkedIn URL</label>
          <Input
            name="linkedin_url"
            type="url"
            value={data.linkedin_url || ""}
            onChange={(e) => onUpdate({ linkedin_url: e.target.value })}
            placeholder="https://linkedin.com/in/your-profile"
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
};
