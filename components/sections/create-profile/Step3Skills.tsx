"use client";

import { useFormContext, Controller } from "react-hook-form";
import { ProfileFormData } from "@/app/types/profile";
import { FormField } from "@/components/uiComponent/FormField";
import { Input } from "@/components/uiComponent/input";
import { CreatableMultiSelect } from "@/components/uiComponent/CreatableMultiSelect";

// These now act as *suggestions*, not a restrictive list.
const hardSkillsSuggestions = [
  { value: "JavaScript", label: "JavaScript" },
  { value: "Python", label: "Python" },
  { value: "React", label: "React" },
  { value: "Node.js", label: "Node.js" },
  { value: "SQL", label: "SQL" },
];
const softSkillsSuggestions = [
  { value: "Communication", label: "Communication" },
  { value: "Teamwork", label: "Teamwork" },
  { value: "Problem-Solving", label: "Problem-Solving" },
];
const languageSuggestions = [
  { value: "English", label: "English" },
  { value: "French", label: "French" },
  { value: "Spanish", label: "Spanish" },
];

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
          render={({ field }) => (
            <CreatableMultiSelect
              placeholder="Select or type a skill..."
              options={hardSkillsSuggestions}
              value={field.value || []}
              onChange={field.onChange}
            />
          )}
        />
      </FormField>

      <FormField label="Soft Skills" error={errors.soft_skills}>
        <Controller
          control={control}
          name="soft_skills"
          render={({ field }) => (
            <CreatableMultiSelect
              placeholder="Select or type a skill..."
              options={softSkillsSuggestions}
              value={field.value || []}
              onChange={field.onChange}
            />
          )}
        />
      </FormField>

      <FormField label="Languages" error={errors.languages}>
        <Controller
          control={control}
          name="languages"
          render={({ field }) => (
            <CreatableMultiSelect
              placeholder="Select or type a language..."
              options={languageSuggestions}
              value={field.value || []}
              onChange={field.onChange}
            />
          )}
        />
      </FormField>

      {/* --- URL Inputs Remain the Same --- */}
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
