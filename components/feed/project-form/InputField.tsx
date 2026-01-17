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
  onBlur?: () => void;
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
      <Label htmlFor={id} className="text-[10px] font-black text-[#155DFC] uppercase tracking-widest ml-1 flex items-center gap-2">
        <span>{label}</span>
        {required && <span className="text-red-500">*</span>}
        {!required && (
          <span className="text-[8px] text-slate-400 normal-case tracking-normal font-medium">(Optional)</span>
        )}
      </Label>
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-[#155DFC]">
            {icon}
          </div>
        )}
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => onBlur?.()}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full rounded-2xl bg-slate-50/50 border-blue-50 focus:border-[#155DFC] focus:ring-[#155DFC]/10 transition-all duration-300 ${icon ? "pl-11" : "px-4"} ${
            error && touched 
              ? "border-red-500/50 focus-visible:ring-red-500/10" 
              : ""
          } text-sm font-bold h-12 shadow-sm`}
        />
      </div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 px-1">
        <FormFieldError error={error} touched={touched} />
        {showCharCount && maxLength && (
          <CharacterCount current={value.length} max={maxLength} />
        )}
      </div>
    </div>
  );
};