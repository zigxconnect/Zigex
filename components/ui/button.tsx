import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
// change
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-base font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 shadow-sm hover:scale-105 cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
        secondary:
          "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
        orange:
          "bg-[#EA580C] text-white hover:bg-orange-600 focus:ring-[#EA580C]",
        premium:
          "relative bg-white text-orange-500 border border-orange-500 hover:bg-orange-50 focus:ring-orange-500 overflow-hidden",
        "primary-dark":
          "bg-[#1E3A8A] text-white hover:bg-blue-900 focus:ring-[#1E3A8A]",
        "secondary-outline":
          "border border-[#EA580C] bg-white text-[#EA580C] hover:bg-orange-50 focus:ring-[#EA580C]",
      },
      size: {
        default: "h-auto",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
// fixing buttons
// FIXED THE BUTTON


const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };