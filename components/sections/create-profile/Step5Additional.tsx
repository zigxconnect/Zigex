"use client";

import { useFormContext, Controller } from "react-hook-form";
import { ProfileFormData } from "@/app/types/profile";
import { Textarea } from "@/components/uiComponent/Textarea";
import { FormField } from "@/components/uiComponent/FormField";
import { CreatableMultiSelect } from "@/components/uiComponent/CreatableMultiSelect";

// Suggestions for the creatable inputs
const interestSuggestions = [
  { value: "Sports", label: "Sports" },
  { value: "Music", label: "Music" },
  { value: "Art", label: "Art" },
  { value: "Technology", label: "Technology" },
  { value: "Volunteering", label: "Volunteering" },
  { value: "Travel", label: "Travel" },
];
const achievementSuggestions = [
  { value: "Dean's List", label: "Dean's List" },
  { value: "Scholarship Recipient", label: "Scholarship Recipient" },
  { value: "Hackathon Winner", label: "Hackathon Winner" },
  { value: "Published Research", label: "Published Research" },
];

export const Step5Additional = () => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ProfileFormData>();

  return (
    <div className="space-y-8">
      <FormField label="Interests (Optional)" error={errors.interests}>
        <Controller
          control={control}
          name="interests"
          render={({ field }) => (
            <CreatableMultiSelect
              placeholder="Select or type an interest..."
              options={interestSuggestions}
              value={field.value || []}
              onChange={field.onChange}
            />
          )}
        />
      </FormField>

      <FormField label="Achievements (Optional)" error={errors.achievements}>
        <Controller
          control={control}
          name="achievements"
          render={({ field }) => (
            <CreatableMultiSelect
              placeholder="e.g., Dean's List, Hackathon Winner..."
              options={achievementSuggestions}
              value={field.value || []}
              onChange={field.onChange}
            />
          )}
        />
      </FormField>

      <FormField
        label="Accommodations (Optional)"
        error={errors.accommodations}
      >
        <Textarea
          placeholder="Please list any specific accommodations you may require."
          rows={4}
          {...register("accommodations")}
        />
      </FormField>
    </div>
  );
};
