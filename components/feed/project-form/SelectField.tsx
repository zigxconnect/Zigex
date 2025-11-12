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
      <Label htmlFor={id} className="text-sm font-semibold flex items-center flex-wrap gap-x-2">
        <span>{label}</span>
        {required && <span className="text-red-500 text-base">*</span>}
      </Label>
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            {icon}
          </div>
        )}
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger 
            id={id}
            className={`w-full ${icon ? "pl-10" : ""} ${
              error && touched 
                ? "border-red-500 focus:ring-red-500" 
                : ""
            } text-sm sm:text-base h-10 sm:h-11`}
            onBlur={onBlur}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent 
            position="popper"
            sideOffset={5}
            className="z-[9999] w-full max-h-[300px] overflow-y-auto"
          >
            {options.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="text-sm sm:text-base cursor-pointer"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <FormFieldError error={error} touched={touched} />
    </div>
  );
};