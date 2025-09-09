import { useFormContext } from "react-hook-form";
import { ProfileFormData } from "@/app/types/profile";
import { FormField } from "@/components/uiComponent/FormField";
import { Textarea } from "@/components/uiComponent/Textarea";
import { Input } from "@/components/uiComponent/input";

export const Step1Personal = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<ProfileFormData>();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="First Name" error={errors.first_name}>
          <Input
            placeholder="Enter your first name"
            {...register("first_name")}
          />
        </FormField>
        <FormField label="Last Name" error={errors.last_name}>
          <Input
            placeholder="Enter your last name"
            {...register("last_name")}
          />
        </FormField>
      </div>
      <FormField label="Phone Number" error={errors.phone}>
        <Input placeholder="e.g., +123 456 7890" {...register("phone")} />
      </FormField>
      <FormField label="Location" error={errors.location}>
        <Input
          placeholder="e.g., Bamenda, Cameroon"
          {...register("location")}
        />
      </FormField>
      <FormField label="About Me" error={errors.about}>
        <Textarea
          placeholder="A brief introduction..."
          rows={4}
          {...register("about")}
        />
      </FormField>
    </div>
  );
};
