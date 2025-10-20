// file: components/sections/admin/applicants/StatusBadge.tsx

import { ApplicantStatus } from "@/lib/types/applicants";

// The keys are now lowercase, matching the ApplicantStatus type and the database.
const statusStyles: Record<ApplicantStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  reviewed: "bg-blue-100 text-blue-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  rsvp_confirmed: "bg-purple-100 text-purple-800",
};

export const StatusBadge = ({
  status,
  large = false,
}: {
  status: ApplicantStatus;
  large?: boolean;
}) => {
  // Gracefully handle any unexpected status values.
  if (!status) {
    return null;
  }

  // Capitalize the first letter and format for display.
  // "rsvp_confirmed" becomes "Rsvp confirmed"
  const displayText =
    status.replace("_", " ").charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`font-bold rounded-full transition-colors ${
        statusStyles[status] || "bg-gray-100 text-gray-800"
      } ${large ? "px-4 py-1.5 text-sm" : "px-2.5 py-0.5 text-xs"}`}
    >
      {displayText}
    </span>
  );
};
