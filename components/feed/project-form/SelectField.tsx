import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormFieldError } from "./FormFieldError";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  options: readonly SelectOption[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  touched?: boolean;
  icon?: React.ReactNode;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  id,
  label,
  value,
  onChange,
  onBlur,
  options,
  placeholder,
  required = false,
  error,
  touched,
  icon
}) => {
  return (
    <div className="space-y-2 w-full">
      <Label htmlFor={id} className="text-[10px] font-black text-[#155DFC] uppercase tracking-widest ml-1 flex items-center gap-2">
        <span>{label}</span>
        {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10 text-[#155DFC]">
            {icon}
          </div>
        )}
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger 
            id={id}
            className={`w-full rounded-2xl bg-slate-50/50 border-blue-50 focus:border-[#155DFC] focus:ring-[#155DFC]/10 transition-all duration-300 ${icon ? "pl-11" : "px-4"} ${
              error && touched 
                ? "border-red-500/50 focus:ring-red-500/10" 
                : ""
            } text-sm font-bold h-12 shadow-sm`}
            onBlur={onBlur}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent 
            position="popper"
            sideOffset={8}
            className="z-[9999] w-full rounded-2xl border-blue-50 shadow-2xl bg-white p-2"
          >
            {options.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="text-sm font-bold text-slate-700 cursor-pointer rounded-xl focus:bg-[#F6F8FF] focus:text-[#155DFC] transition-colors py-2.5"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="px-1">
        <FormFieldError error={error} touched={touched} />
      </div>
    </div>
  );
};