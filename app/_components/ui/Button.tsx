import { forwardRef } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "orange" | "premium";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = "primary", ...props }, ref) => {
    // ADDED `cursor-pointer` to the end of this line.
    const baseStyles =
      "inline-flex items-center justify-center rounded-md px-4 py-2 text-base font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-sm cursor-pointer";

    const variantStyles = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
      secondary:
        "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
      orange:
        "bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500",
      premium:
        "relative bg-white text-orange-500 border border-orange-500 hover:bg-orange-50 focus:ring-orange-500 overflow-hidden",
    };

    const mergedClasses = twMerge(
      clsx(baseStyles, variantStyles[variant], className)
    );

    return (
      <button className={mergedClasses} ref={ref} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
