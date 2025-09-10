import { FieldError } from "react-hook-form";

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: FieldError;
}

export const FormField = ({ label, children, error }: FormFieldProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
    </div>
  );
};
