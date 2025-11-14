"use client";

import { useFormContext, Controller } from "react-hook-form";
import { ProfileFormData } from "@/app/types/profile";
import { FormField } from "@/components/uiComponent/FormField";
import { CreatableMultiSelect } from "@/components/uiComponent/CreatableMultiSelect";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Suggestions for the creatable inputs
const industrySuggestions = [
  { value: "Tech", label: "Tech" },
  { value: "Education", label: "Education" },
  { value: "Finance", label: "Finance" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Marketing", label: "Marketing" },
  { value: "Design", label: "Design" },
];
const roleSuggestions = [
  { value: "Software Engineer Intern", label: "Software Engineer Intern" },
  { value: "Project Manager", label: "Project Manager" },
  { value: "UI/UX Designer", label: "UI/UX Designer" },
  { value: "Data Analyst", label: "Data Analyst" },
];

// Options for the single-choice radio group
const workModes = ["Remote", "On-site", "Hybrid"];

export const Step4Experience = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext<ProfileFormData>();

  return (
    <div className="space-y-8">
      <FormField
        label="Previous Roles (Optional)"
        error={errors.previous_roles}
      >
        <Controller
          control={control}
          name="previous_roles"
          render={({ field }) => (
            <CreatableMultiSelect
              placeholder="Type a role and press Enter..."
              options={roleSuggestions}
              value={field.value || []}
              onChange={field.onChange}
            />
          )}
        />
      </FormField>

      <FormField
        label="Preferred Industries"
        error={errors.preferred_industries}
      >
        <Controller
          control={control}
          name="preferred_industries"
          render={({ field }) => (
            <CreatableMultiSelect
              placeholder="Select or type an industry..."
              options={industrySuggestions}
              value={field.value || []}
              onChange={field.onChange}
            />
          )}
        />
      </FormField>

      <FormField label="Preferred Work Mode" error={errors.work_mode}>
        <Controller
          control={control}
          name="work_mode"
          render={({ field }) => (
            <RadioGroup
              value={field.value || ""}
              onValueChange={field.onChange}
              className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-8 mt-2"
            >
              {workModes.map((mode) => (
                <div key={mode} className="flex items-center space-x-2">
                  <RadioGroupItem value={mode} id={`work-mode-${mode}`} />
                  <Label htmlFor={`work-mode-${mode}`}>{mode}</Label>
                </div>
              ))}
            </RadioGroup>
          )}
        />
      </FormField>
    </div>
  );
};
