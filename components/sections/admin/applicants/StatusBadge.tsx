import { ApplicantStatus } from "@/lib/types/applicants";

const statusStyles: Record<ApplicantStatus, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Accepted: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
  "Requesting Info": "bg-blue-100 text-blue-800",
};

export const StatusBadge = ({
  status,
  large = false,
}: {
  status: ApplicantStatus;
  large?: boolean;
}) => {
  return (
    <span
      className={`font-bold rounded-full ${statusStyles[status]} ${
        large ? "px-4 py-1.5 text-sm" : "px-2.5 py-0.5 text-xs"
      }`}
    >
      {status}
    </span>
  );
};
