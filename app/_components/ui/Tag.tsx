import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type TagProps = React.HTMLAttributes<HTMLSpanElement>;

export const Tag = ({ className, ...props }: TagProps) => {
  const mergedClasses = twMerge(
    clsx(
      "inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700",
      className
    )
  );
  return <span className={mergedClasses} {...props} />;
};
