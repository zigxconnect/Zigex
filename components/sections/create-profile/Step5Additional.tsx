import { useFormContext, Controller } from "react-hook-form";

import { ProfileFormData } from "@/app/types/profile";
import { Textarea } from "@/components/uiComponenet/Textarea";
import { FormField } from "@/components/uiComponenet/FormField";
import { ToggleChip } from "@/components/uiComponenet/ToggleChip";

const interests = [
  "Sports",
  "Music",
  "Art",
  "Technology",
  "Volunteering",
  "Travel",
  "Finance",
];

export const Step5Additional = () => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ProfileFormData>();
  return (
    <div className="space-y-8">
      <FormField label="Interests" error={errors.interests}>
        <Controller
          control={control}
          name="interests"
          defaultValue={[]}
          render={({ field: { onChange, value } }) => (
            <div className="flex flex-wrap gap-2 mt-2">
              {interests.map((item) => (
                <ToggleChip
                  key={item}
                  text={item}
                  isSelected={value.includes(item)}
                  onToggle={(toggled) =>
                    onChange(
                      value.includes(toggled)
                        ? value.filter((i) => i !== toggled)
                        : [...value, toggled]
                    )
                  }
                />
              ))}
            </div>
          )}
        />
      </FormField>
      <FormField label="Achievements (Optional)" error={errors.achievements}>
        <Textarea
          placeholder="List any awards, honors, or significant accomplishments."
          rows={4}
          {...register("achievements")}
        />
      </FormField>
      <FormField
        label="Accommodations (Optional)"
        error={errors.accommodations}
      >
        <Textarea
          placeholder="Enter any specific accommodations needed"
          rows={4}
          {...register("accommodations")}
        />
      </FormField>
    </div>
  );
};
