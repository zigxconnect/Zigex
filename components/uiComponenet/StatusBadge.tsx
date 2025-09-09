import { clsx } from "clsx";

type StatusBadgeProps = {
  status: "Active" | "Closed" | "Draft";
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const baseStyles = "px-3 py-1 text-xs font-medium rounded-full inline-block";

  // Defines the color scheme for each status type
  const statusStyles = {
    Active: "bg-green-100 text-green-700",
    Closed: "bg-slate-200 text-slate-700",
    Draft: "bg-orange-100 text-orange-700",
  };

  return (
    <span className={clsx(baseStyles, statusStyles[status])}>{status}</span>
  );
};
