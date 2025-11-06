import { forwardRef } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    const mergedClasses = twMerge(
      clsx(
        "w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500",
        className
      )
    );
    return <textarea ref={ref} className={mergedClasses} {...props} />;
  }
);

Textarea.displayName = "Textarea";
