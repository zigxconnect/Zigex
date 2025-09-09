import { useFormContext, Controller } from "react-hook-form";
import { ProfileFormData } from "@/app/types/profile";
import { Textarea } from "@/components/uiComponenet/Textarea";
import { FormField } from "@/components/uiComponenet/FormField";
import { ToggleChip } from "@/components/uiComponenet/ToggleChip";

const industries = [
  "Tech",
  "Education",
  "Finance",
  "Healthcare",
  "Marketing",
  "Design",
];
const workModes = ["Remote", "On-site", "Hybrid"];

export const Step4Experience = () => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ProfileFormData>();
  return (
    <div className="space-y-8">
      <FormField
        label="Previous Roles (Optional)"
        error={errors.previous_roles}
      >
        <Textarea
          placeholder="Briefly describe any previous internships or work experience."
          rows={5}
          {...register("previous_roles")}
        />
      </FormField>
      <FormField
        label="Preferred Industries"
        error={errors.preferred_industries}
      >
        <Controller
          control={control}
          name="preferred_industries"
          defaultValue={[]}
          render={({ field: { onChange, value } }) => (
            <div className="flex flex-wrap gap-2 mt-2">
              {industries.map((item) => (
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
      <FormField label="Preferred Work Mode" error={errors.work_mode}>
        <Controller
          control={control}
          name="work_mode"
          defaultValue={[]}
          render={({ field: { onChange, value } }) => (
            <div className="flex flex-wrap gap-2 mt-2">
              {workModes.map((item) => (
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
    </div>
  );
};
