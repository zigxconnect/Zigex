import type { LucideIcon } from "lucide-react";

interface AlertProps {
  icon: LucideIcon;
  variant: "danger"; // Can be expanded later
  children: React.ReactNode;
}

export const Alert = ({ icon: Icon, children }: AlertProps) => {
  return (
    <div className="p-4 rounded-lg bg-red-50 text-red-700 flex gap-4">
      <div className="flex-shrink-0">
        <Icon size={20} />
      </div>
      <div>{children}</div>
    </div>
  );
};
