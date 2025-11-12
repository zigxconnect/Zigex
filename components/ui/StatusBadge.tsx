// file: src/components/ui/StatusBadge.tsx

import { cva, type VariantProps } from "class-variance-authority";
import { ApplicantStatus } from "@/lib/types/applicants";
import { cn } from "@/lib/utils"; // Assumes a clsx/tailwind-merge utility

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 capitalize",
  {
    variants: {
      status: {
        pending: "border-transparent bg-yellow-100 text-yellow-800",
        reviewed: "border-transparent bg-blue-100 text-blue-800", // New
        accepted: "border-transparent bg-green-100 text-green-800",
        rejected: "border-transparent bg-red-100 text-red-800",
        rsvp_confirmed: "border-transparent bg-indigo-100 text-indigo-800", // New
      },
      size: {
        normal: "px-2.5 py-0.5 text-xs",
        large: "px-4 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      status: "pending",
      size: "normal",
    },
  }
);

interface StatusBadgeProps extends VariantProps<typeof badgeVariants> {
  status: ApplicantStatus;
  className?: string;
}

const formatStatusText = (status: ApplicantStatus) => {
  return status.replace("_", " ");
};

export const StatusBadge = ({ className, status, size }: StatusBadgeProps) => {
  return (
    <div className={cn(badgeVariants({ status, size }), className)}>
      {formatStatusText(status)}
    </div>
  );
};
