// File Path: /app/_components/sections/create-profile/Step3Skills.tsx
import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/app/_components/ui/Input";
import { ToggleChip } from "@/app/_components/ui/ToggleChip";
import { FormField } from "@/app/_components/ui/FormField";
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

export const Step3Skills = () => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ProfileFormData>();

  return (
    <div className="space-y-8">
      <FormField label="Hard Skills" error={errors.hard_skills}>
        <Controller
          control={control}
          name="hard_skills"
          defaultValue={[]}
          render={({ field: { onChange, value } }) => (
            <div className="flex flex-wrap gap-2 mt-2">
              {hardSkillsOptions.map((skill) => (
                <ToggleChip
                  key={skill}
                  text={skill}
                  isSelected={value.includes(skill)}
                  onToggle={(toggledSkill) => {
                    const newValue = value.includes(toggledSkill)
                      ? value.filter((s) => s !== toggledSkill)
                      : [...value, toggledSkill];
                    onChange(newValue);
                  }}
                />
              ))}
            </div>
          )}
        />
      </FormField>
      <FormField label="Soft Skills" error={errors.soft_skills}>
        <Controller
          control={control}
          name="soft_skills"
          defaultValue={[]}
          render={({ field: { onChange, value } }) => (
            <div className="flex flex-wrap gap-2 mt-2">
              {softSkillsOptions.map((skill) => (
                <ToggleChip
                  key={skill}
                  text={skill}
                  isSelected={value.includes(skill)}
                  onToggle={(toggledSkill) => {
                    const newValue = value.includes(toggledSkill)
                      ? value.filter((s) => s !== toggledSkill)
                      : [...value, toggledSkill];
                    onChange(newValue);
                  }}
                />
              ))}
            </div>
          )}
        />
      </FormField>
      <FormField label="Languages" error={errors.languages}>
        <Controller
          control={control}
          name="languages"
          defaultValue={[]}
          render={({ field: { onChange, value } }) => (
            <div className="flex flex-wrap gap-2 mt-2">
              {languageOptions.map((lang) => (
                <ToggleChip
                  key={lang}
                  text={lang}
                  isSelected={value.includes(lang)}
                  onToggle={(toggledLang) => {
                    const newValue = value.includes(toggledLang)
                      ? value.filter((s) => s !== toggledLang)
                      : [...value, toggledLang];
                    onChange(newValue);
                  }}
                />
              ))}
            </div>
          )}
        />
      </FormField>
      <div className="space-y-6 border-t border-gray-200 pt-8">
        <FormField
          label="Portfolio URL (Optional)"
          error={errors.portfolio_url}
        >
          <Input
            placeholder="https://your-portfolio.com"
            {...register("portfolio_url")}
          />
        </FormField>
        <FormField label="GitHub URL (Optional)" error={errors.github_url}>
          <Input
            placeholder="https://github.com/your-username"
            {...register("github_url")}
          />
        </FormField>
        <FormField label="LinkedIn URL (Optional)" error={errors.linkedin_url}>
          <Input
            placeholder="https://linkedin.com/in/your-profile"
            {...register("linkedin_url")}
          />
        </FormField>
      </div>
    </div>
  );
};
