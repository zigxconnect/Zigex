import { forwardRef } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const mergedClasses = twMerge(
      clsx(
        // UPDATED: Changed focus ring to blue-500 and rounded to rounded-lg
        "flex h-11 w-full rounded-lg border border-gray-300 bg-white/50 px-4 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500",
        className
      )
    );
    return <input type={type} className={mergedClasses} ref={ref} {...props} />;
  }
);

Input.displayName = "Input";
