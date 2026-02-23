import * as React from "react"

import { cn } from "@/lib/utils"
import { containsUrl, URL_NOT_ALLOWED_MESSAGE } from "@/lib/validation/url-guard"

function Textarea({ className, onChange, ...props }: React.ComponentProps<"textarea">) {
  const [hasUrlError, setHasUrlError] = React.useState(false);

  const handleChange = React.useCallback(
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

  return (
    <textarea
      data-slot="textarea"
      aria-invalid={hasUrlError || undefined}
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      onChange={handleChange}
      {...props}
    />
  )
}

export { Textarea }

