import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card = ({ className, children, ...props }: CardProps) => {
  const mergedClasses = twMerge(
    clsx("rounded-lg border border-gray-200 bg-white p-6 shadow-sm", className)
  );

  return (
    <div className={mergedClasses} {...props}>
      {children}
    </div>
  );
};
