import { useFormContext } from "react-hook-form";

import { ProfileFormData } from "@/app/types/profile";
import { FormField } from "@/components/uiComponenet/FormField";
import { Input } from "@/components/uiComponenet/input";

export const Step2Education = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<ProfileFormData>();
  return (
    <div className="space-y-6">
      <FormField label="University" error={errors.university}>
        <Input
          placeholder="Enter your university name"
          {...register("university")}
        />
      </FormField>
      <FormField label="Degree" error={errors.degree}>
        <Input
          placeholder="e.g., Bachelor of Science"
          {...register("degree")}
        />
      </FormField>
      <FormField label="Field of Study" error={errors.field_of_study}>
        <Input
          placeholder="e.g., Computer Science"
          {...register("field_of_study")}
        />
      </FormField>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Graduation Year" error={errors.graduation_year}>
          <Input placeholder="e.g., 2025" {...register("graduation_year")} />
        </FormField>
        <FormField label="GPA (Optional)" error={errors.gpa}>
          <Input
            type="number"
            step="0.1"
            placeholder="e.g., 3.8"
            {...register("gpa")}
          />
        </FormField>
      </div>
    </div>
  );
};
