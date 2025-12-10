"use client";

import { useFormContext, Controller } from "react-hook-form";
import { ProfileFormData } from "@/app/types/profile";
import { FormField } from "@/components/uiComponent/FormField";
import { Textarea } from "@/components/uiComponent/Textarea";
import { Input } from "@/components/uiComponent/input";
import { isValidPhoneNumber } from "react-phone-number-input";

// Import the library and its required CSS
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

export const Step1Personal = () => {
  const {
    control,
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
        <FormField label="Username (unique)" error={errors.username}>
          <Input
            placeholder="Choose a unique username"
            {...register("username", { required: true })}
          />
        </FormField>
      </div>

      {/* Replaced with the Phone Input Library */}
      <FormField label="Phone Number" error={errors.phone}>
        <Controller
          name="phone"
          control={control}
          rules={{
            validate: (value) =>
              !value || isValidPhoneNumber(value) || "Invalid phone number",
          }}
          render={({ field }) => (
            <PhoneInput
              {...field}
              id="phone-input"
              placeholder="Enter phone number"
              // Sets the default country shown to the user
              defaultCountry="CM"
              international
              // Custom class allows you to style it in your global CSS file
              className="phone-input-control"
            />
          )}
        />
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
