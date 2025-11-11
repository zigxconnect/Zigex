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
    paid: "bg-orange-100 text-orange-600 border-orange-200",
    unpaid: "bg-gray-100 text-gray-600 border-gray-200",
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
