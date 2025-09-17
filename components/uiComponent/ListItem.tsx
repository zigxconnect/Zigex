import { Check } from "lucide-react";

export const ListItem = ({ children }: { children: React.ReactNode }) => {
  return (
    <li className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-1">
        <Check size={16} className="text-orange-500" />
      </div>
      <span>{children}</span>
    </li>
  );
};
