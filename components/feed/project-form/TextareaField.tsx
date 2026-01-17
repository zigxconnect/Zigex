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
  onBlur?: () => void;
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
      <Label htmlFor={id} className="text-[10px] font-black text-[#155DFC] uppercase tracking-widest ml-1 flex items-center gap-2">
        <span>{label}</span>
        {required && <span className="text-red-500">*</span>}
      </Label>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => onBlur?.()}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className={`resize-none w-full rounded-2xl bg-slate-50/50 border-blue-50 focus:border-[#155DFC] focus:ring-[#155DFC]/10 px-4 py-3 transition-all duration-300 ${
          error && touched 
            ? "border-red-500/50 focus-visible:ring-red-500/10" 
            : ""
        } text-sm font-medium leading-relaxed min-h-[120px] shadow-sm`}
      />
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 px-1">
        <FormFieldError error={error} touched={touched} />
        {maxLength && (
          <CharacterCount current={value.length} max={maxLength} />
        )}
      </div>
    </div>
  );
};