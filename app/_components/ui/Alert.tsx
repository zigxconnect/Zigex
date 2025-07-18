import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { LucideIcon } from "lucide-react";

type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  icon: LucideIcon;
  variant?: "danger";
};

export const Alert = ({
  className,
  icon: Icon,
  variant = "danger",
  children,
  ...props
}: AlertProps) => {
  const variantStyles = {
    danger: "bg-red-50 border-red-200 text-red-800",
  };

  const mergedClasses = twMerge(
    clsx(
      "flex items-start gap-4 rounded-lg border p-4 text-sm",
      variantStyles[variant],
      className
    )
  );

  return (
    <div className={mergedClasses} {...props}>
      <Icon className="h-5 w-5 flex-shrink-0" />
      <div className="flex-1">{children}</div>
    </div>
  );
};
