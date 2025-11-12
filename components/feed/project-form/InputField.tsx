import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormFieldError } from "./FormFieldError";
import { CharacterCount } from "./CharacterCount";

interface InputFieldProps {
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
  showCharCount?: boolean;
  icon?: React.ReactNode;
  type?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
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
  showCharCount = false,
  icon,
  type = "text"
}) => {
  return (
    <div className="space-y-2 w-full">
      <Label htmlFor={id} className="text-sm font-semibold flex items-center flex-wrap gap-x-2">
        <span>{label}</span>
        {required && <span className="text-red-500 text-base">*</span>}
        {!required && (
          <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
        )}
      </Label>
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
            {icon}
          </div>
        )}
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full ${icon ? "pl-10" : ""} ${
            error && touched 
              ? "border-red-500 focus-visible:ring-red-500" 
              : ""
          } text-sm sm:text-base h-10 sm:h-11`}
        />
      </div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
        <FormFieldError error={error} touched={touched} />
        {showCharCount && maxLength && (
          <CharacterCount current={value.length} max={maxLength} />
        )}
      </div>
    </div>
  );
};