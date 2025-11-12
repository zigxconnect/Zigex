import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FormFieldError } from "./FormFieldError";
import { CharacterCount } from "./CharacterCount";

interface TextareaFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  touched?: boolean;
  maxLength?: number;
  rows?: number;
}

export const TextareaField: React.FC<TextareaFieldProps> = ({
  id,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  error,
  touched,
  maxLength,
  rows = 5
}) => {
  return (
    <div className="space-y-2 w-full">
      <Label htmlFor={id} className="text-sm font-semibold flex items-center flex-wrap gap-x-2">
        <span>{label}</span>
        {required && <span className="text-red-500 text-base">*</span>}
      </Label>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className={`resize-none w-full ${
          error && touched 
            ? "border-red-500 focus-visible:ring-red-500" 
            : ""
        } text-sm sm:text-base min-h-[100px]`}
      />
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
        <FormFieldError error={error} touched={touched} />
        {maxLength && (
          <CharacterCount current={value.length} max={maxLength} />
        )}
      </div>
    </div>
  );
};