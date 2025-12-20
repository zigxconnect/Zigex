import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "paid" | "unpaid";
};

export const Badge = ({
  className,
  variant = "paid",
  ...props
}: BadgeProps) => {
  const variantStyles = {
    paid: "bg-warning/10 text-warning border-warning/20",
    unpaid: "bg-muted text-muted-foreground border-border",
  };

  const mergedClasses = twMerge(
    clsx(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
      variantStyles[variant],
      className
    )
  );

  return <div className={mergedClasses} {...props} />;
};
