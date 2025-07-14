import { forwardRef } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = "primary", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variantStyles = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
      secondary:
        "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
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
