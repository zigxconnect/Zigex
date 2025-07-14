import { forwardRef } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const mergedClasses = twMerge(
      clsx(
        "flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        className
      )
    );

    return <input type={type} className={mergedClasses} ref={ref} {...props} />;
  }
);

Input.displayName = "Input";
