"use client";

import { useFormContext, Controller } from "react-hook-form";
import { ProfileFormData } from "@/app/types/profile";
import { FormField } from "@/components/uiComponent/FormField";
import { CreatableMultiSelect } from "@/components/uiComponent/CreatableMultiSelect";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Beginner-friendly industry options
const industrySuggestions = [
  { value: "Technology & Software", label: "Technology & Software" },
  { value: "Startups", label: "Startups" },
  { value: "Education & EdTech", label: "Education & EdTech" },
  { value: "Finance & FinTech", label: "Finance & FinTech" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "E-commerce", label: "E-commerce" },
  { value: "Media & Entertainment", label: "Media & Entertainment" },
  { value: "Non-Profit / NGO", label: "Non-Profit / NGO" },
  { value: "Government", label: "Government" },
];

// Career goals / dream roles (more aspirational)
const dreamRoleSuggestions = [
  { value: "Software Developer", label: "Software Developer" },
  { value: "Data Scientist", label: "Data Scientist" },
  { value: "Product Manager", label: "Product Manager" },
  { value: "UX Designer", label: "UX Designer" },
  { value: "Content Creator", label: "Content Creator" },
  { value: "Entrepreneur", label: "Entrepreneur" },
  { value: "Consultant", label: "Consultant" },
  { value: "Researcher", label: "Researcher" },
];

// Work mode options
const workModes = [
  { value: "Remote", label: "🏠 Remote (Work from anywhere)" },
  { value: "On-site", label: "🏢 On-site (In an office)" },
  { value: "Hybrid", label: "🔄 Hybrid (Mix of both)" },
];

export const Step4Experience = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext<ProfileFormData>();

  return (
    <div className="space-y-8">
      {/* Encouraging intro */}
      <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-6">
        <p className="text-sm text-green-800">
          <span className="font-semibold">🎯 Dream big!</span> Tell us about the career path you&apos;re excited about. Even if you&apos;re just starting out, we want to help you get there!
        </p>
      </div>

      <FormField
        label="What roles excite you?"
        error={errors.previous_roles}
      >
        <p className="text-xs text-gray-500 mb-2">Select careers you&apos;d love to explore or roles you aspire to</p>
        <Controller
          control={control}
          name="previous_roles"
          render={({ field }) => (
            <CreatableMultiSelect
              placeholder="Type or select dream roles..."
              options={dreamRoleSuggestions}
              value={field.value || []}
              onChange={field.onChange}
            />
          )}
        />
      </FormField>

      <FormField
        label="Which industries interest you?"
        error={errors.preferred_industries}
      >
        <p className="text-xs text-gray-500 mb-2">Where would you love to work?</p>
        <Controller
          control={control}
          name="preferred_industries"
          render={({ field }) => (
            <CreatableMultiSelect
              placeholder="Select industries..."
              options={industrySuggestions}
              value={field.value || []}
              onChange={field.onChange}
            />
          )}
        />
      </FormField>

      <FormField label="How would you prefer to work?" error={errors.work_mode}>
        <p className="text-xs text-gray-500 mb-2">Choose your ideal work setup</p>
        <Controller
          control={control}
          name="work_mode"
          render={({ field }) => (
            <RadioGroup
              value={field.value || ""}
              onValueChange={field.onChange}
              className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2"
            >
              {workModes.map((mode) => (
                <div 
                  key={mode.value} 
                  className={`flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    field.value === mode.value 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <RadioGroupItem value={mode.value} id={`work-mode-${mode.value}`} />
                  <Label htmlFor={`work-mode-${mode.value}`} className="cursor-pointer text-sm">
                    {mode.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        />
      </FormField>
    </div>
  );
};
