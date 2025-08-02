import { forwardRef } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// THE FIX IS HERE: We've added the new 'primary-dark' and 'secondary-outline' variants.
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?:
    | "primary"
    | "secondary"
    | "orange"
    | "premium"
    | "primary-dark"
    | "secondary-outline";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = "primary", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-base font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 shadow-sm hover:scale-105 cursor-pointer";

    const variantStyles = {
      // Your original blue primary button (preserved)
      primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",

      // Your original neutral secondary button (preserved)
      secondary:
        "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 focus:ring-gray-500",

      // THE FIX IS HERE: Your orange button, now upgraded to the precise hex code.
      // This will automatically update the style of your AuthForm.
      orange:
        "bg-[#EA580C] text-white hover:bg-orange-600 focus:ring-[#EA580C]",

      // Your original premium button (preserved)
      premium:
        "relative bg-white text-orange-500 border border-orange-500 hover:bg-orange-50 focus:ring-orange-500 overflow-hidden",

      // NEW VARIANT: For the dark blue buttons in the Create Profile form.
      "primary-dark":
        "bg-[#1E3A8A] text-white hover:bg-blue-900 focus:ring-[#1E3A8A]",

      // NEW VARIANT: For the white buttons with an orange outline.
      "secondary-outline":
        "border border-[#EA580C] bg-white text-[#EA580C] hover:bg-orange-50 focus:ring-[#EA580C]",
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
