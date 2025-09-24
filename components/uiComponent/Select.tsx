import { forwardRef } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  children: React.ReactNode;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    const mergedClasses = twMerge(
      clsx(
        "flex h-11 w-60 w-full rounded-lg border border-gray-300 bg-gray-100/60 px-4 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-700",
        className
      )
    );
    return (
      <select ref={ref} className={mergedClasses} {...props} >
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";
