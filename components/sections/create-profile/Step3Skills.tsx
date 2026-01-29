"use client";

import { useFormContext, Controller } from "react-hook-form";
import { ProfileFormData } from "@/app/types/profile";
import { FormField } from "@/components/uiComponent/FormField";
import { Input } from "@/components/uiComponent/input";
import { CreatableMultiSelect } from "@/components/uiComponent/CreatableMultiSelect";

// Beginner-friendly suggestions for interests/skills they want to develop
const interestsSuggestions = [
  { value: "Web Development", label: "Web Development" },
  { value: "Mobile Apps", label: "Mobile Apps" },
  { value: "Data Science", label: "Data Science" },
  { value: "UI/UX Design", label: "UI/UX Design" },
  { value: "Machine Learning", label: "Machine Learning" },
  { value: "Cybersecurity", label: "Cybersecurity" },
  { value: "Cloud Computing", label: "Cloud Computing" },
  { value: "Blockchain", label: "Blockchain" },
  { value: "Project Management", label: "Project Management" },
  { value: "Digital Marketing", label: "Digital Marketing" },
];

const personalitySuggestions = [
  { value: "Creative Thinker", label: "Creative Thinker" },
  { value: "Team Player", label: "Team Player" },
  { value: "Problem Solver", label: "Problem Solver" },
  { value: "Quick Learner", label: "Quick Learner" },
  { value: "Detail-Oriented", label: "Detail-Oriented" },
  { value: "Leadership", label: "Leadership" },
  { value: "Adaptable", label: "Adaptable" },
  { value: "Self-Motivated", label: "Self-Motivated" },
];

const languageSuggestions = [
  { value: "English", label: "English" },
  { value: "French", label: "French" },
  { value: "Spanish", label: "Spanish" },
  { value: "Arabic", label: "Arabic" },
  { value: "Mandarin", label: "Mandarin" },
];

export const Step3Skills = () => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ProfileFormData>();

  return (
    <div className="space-y-8">
      {/* Encouraging intro for beginners */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">💡 New to tech?</span> No worries! Share what you&apos;re excited to learn or areas you&apos;re curious about. You don&apos;t need to be an expert – we&apos;re here to help you grow!
        </p>
      </div>

      <FormField 
        label="What areas interest you?" 
        error={errors.hard_skills}
      >
        <p className="text-xs text-gray-500 mb-2">Select topics you&apos;d like to explore or skills you&apos;re learning</p>
        <Controller
          control={control}
          name="hard_skills"
          render={({ field }) => (
            <CreatableMultiSelect
              placeholder="Type or select your interests..."
              options={interestsSuggestions}
              value={field.value || []}
              onChange={field.onChange}
            />
          )}
        />
      </FormField>

      <FormField 
        label="How would you describe yourself?" 
        error={errors.soft_skills}
      >
        <p className="text-xs text-gray-500 mb-2">Choose traits that describe your personality and working style</p>
        <Controller
          control={control}
          name="soft_skills"
          render={({ field }) => (
            <CreatableMultiSelect
              placeholder="Select your strengths..."
              options={personalitySuggestions}
              value={field.value || []}
              onChange={field.onChange}
            />
          )}
        />
      </FormField>

      <FormField label="Languages you speak" error={errors.languages}>
        <Controller
          control={control}
          name="languages"
          render={({ field }) => (
            <CreatableMultiSelect
              placeholder="Select languages..."
              options={languageSuggestions}
              value={field.value || []}
              onChange={field.onChange}
            />
          )}
        />
      </FormField>

      {/* Optional Links Section */}
      <div className="space-y-6 border-t border-gray-200 pt-8">
        <p className="text-sm text-gray-600 font-medium">
          📎 Got any online profiles? Add them here (all optional)
        </p>
        
        <FormField
          label="Website or Portfolio"
          error={errors.portfolio_url}
        >
          <Input
            placeholder="https://your-site.com"
            {...register("portfolio_url", {
              pattern: {
                value: /^https:\/\//,
                message: "URL must start with https://",
              },
            })}
          />
          <p className="text-xs text-gray-400 mt-1">
            Your personal website, blog, or portfolio
          </p>
        </FormField>

        <FormField label="GitHub" error={errors.github_url}>
          <Input
            placeholder="https://github.com/username"
            {...register("github_url", {
              pattern: {
                value: /^https:\/\//,
                message: "URL must start with https://",
              },
            })}
          />
        </FormField>

        <FormField label="LinkedIn" error={errors.linkedin_url}>
          <Input
            placeholder="https://linkedin.com/in/yourname"
            {...register("linkedin_url", {
              pattern: {
                value: /^https:\/\//,
                message: "URL must start with https://",
              },
            })}
          />
        </FormField>
      </div>
    </div>
  );
};
