import { forwardRef, useState, useCallback } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { containsUrl, URL_NOT_ALLOWED_MESSAGE } from "@/lib/validation/url-guard";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, onChange, ...props }, ref) => {
    const [hasUrlError, setHasUrlError] = useState(false);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (containsUrl(e.target.value)) {
          e.target.setCustomValidity(URL_NOT_ALLOWED_MESSAGE);
          e.target.reportValidity();
          setHasUrlError(true);
        } else {
          e.target.setCustomValidity("");
          setHasUrlError(false);
        }

        onChange?.(e);
      },
      [onChange]
    );

    const mergedClasses = twMerge(
      clsx(
        "w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500",
        hasUrlError && "border-red-500 ring-2 ring-red-500/20",
        className
      )
    );
    return <textarea ref={ref} className={mergedClasses} onChange={handleChange} {...props} />;
  }
);

Textarea.displayName = "Textarea";

