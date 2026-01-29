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
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-ring",
        secondary:
          "border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus:ring-ring",
        orange:
          "bg-warning text-primary-foreground hover:bg-warning/90 focus:ring-warning",
        premium:
          "relative bg-background text-warning border border-warning hover:bg-warning/10 focus:ring-warning overflow-hidden",
        "primary-dark":
          "bg-secondary text-secondary-foreground hover:bg-secondary/90 focus:ring-secondary",
        "secondary-outline":
          "border border-warning bg-background text-warning hover:bg-warning/10 focus:ring-warning",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
      },
      size: {
        default: "h-auto py-2.5 px-6",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9 p-0",
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