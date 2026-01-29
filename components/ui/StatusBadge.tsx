// file: src/components/ui/StatusBadge.tsx

import { cva, type VariantProps } from "class-variance-authority";
import { ApplicantStatus } from "@/lib/types/applicants";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 capitalize",
  {
    variants: {
      status: {
        pending: "border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700",
        reviewing: "border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700",
        reviewed: "border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700",
        accepted: "border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700",
        rejected: "border-rose-200 bg-gradient-to-r from-rose-50 to-red-50 text-rose-700",
        rsvp_confirmed: "border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700",
      },
      size: {
        normal: "px-3 py-1 text-[10px] tracking-wider",
        large: "px-4 py-1.5 text-xs tracking-wide",
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
  const statusMap: Record<string, string> = {
    pending: "Pending",
    reviewing: "Reviewing",
    reviewed: "Reviewed",
    accepted: "Accepted",
    rejected: "Declined",
    rsvp_confirmed: "Confirmed",
  };
  return statusMap[status] || status.replace("_", " ");
};

export const StatusBadge = ({ className, status, size }: StatusBadgeProps) => {
  return (
    <div className={cn(badgeVariants({ status, size }), className)}>
      <span className="relative flex h-2 w-2 mr-1.5">
        <span className={cn(
          "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
          status === "pending" ? "bg-amber-400" :
          status === "reviewing" ? "bg-blue-400" :
          status === "reviewed" ? "bg-indigo-400" :
          status === "accepted" ? "bg-emerald-400" :
          status === "rejected" ? "bg-rose-400" :
          "bg-violet-400"
        )} />
        <span className={cn(
          "relative inline-flex rounded-full h-2 w-2",
          status === "pending" ? "bg-amber-500" :
          status === "reviewing" ? "bg-blue-500" :
          status === "reviewed" ? "bg-indigo-500" :
          status === "accepted" ? "bg-emerald-500" :
          status === "rejected" ? "bg-rose-500" :
          "bg-violet-500"
        )} />
      </span>
      {formatStatusText(status)}
    </div>
  );
};
