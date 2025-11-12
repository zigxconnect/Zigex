import React from "react";
import { AlertCircle } from "lucide-react";

interface FormFieldErrorProps {
  error?: string;
  touched?: boolean;
}

export const FormFieldError: React.FC<FormFieldErrorProps> = ({ error, touched }) => {
  if (!error || !touched) return null;

  return (
    <span className="text-xs text-red-500 flex items-center gap-1">
      <AlertCircle className="h-3 w-3" />
      {error}
    </span>
  );
};