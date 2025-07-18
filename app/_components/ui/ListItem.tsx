import { CheckCircle2 } from "lucide-react";

export const ListItem = ({ children }: { children: React.ReactNode }) => {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-gray-400 mt-0.5" />
      <span className="flex-1 text-gray-700">{children}</span>
    </li>
  );
};
