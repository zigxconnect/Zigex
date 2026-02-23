import * as React from "react"

import { cn } from "@/lib/utils"
import { containsUrl, URL_NOT_ALLOWED_MESSAGE } from "@/lib/validation/url-guard"

// Input types that are allowed to contain URLs
const URL_ALLOWED_TYPES = new Set(["url", "hidden"]);

function Input({ className, type, onChange, ...props }: React.ComponentProps<"input">) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [hasUrlError, setHasUrlError] = React.useState(false);

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const isUrlField = URL_ALLOWED_TYPES.has(type || "text");

      if (!isUrlField && containsUrl(e.target.value)) {
        e.target.setCustomValidity(URL_NOT_ALLOWED_MESSAGE);
        e.target.reportValidity();
        setHasUrlError(true);
      } else {
        e.target.setCustomValidity("");
        setHasUrlError(false);
      }

      onChange?.(e);
    },
    [type, onChange]
  );

  return (
    <input
      ref={inputRef}
      type={type}
      data-slot="input"
      aria-invalid={hasUrlError || undefined}
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      onChange={handleChange}
      {...props}
    />
  )
}

export { Input }