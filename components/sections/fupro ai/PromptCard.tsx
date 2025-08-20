import { Card } from "@/app/_components/ui/Card";
import type { LucideIcon } from "lucide-react";

type PromptCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
};

export const PromptCard = ({
  icon: Icon,
  title,
  description,
  onClick,
}: PromptCardProps) => {
  return (
    <Card
      className="p-4 flex items-center gap-4 cursor-pointer hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-100 hover:-translate-y-1 group bg-white/70 backdrop-blur-sm border border-gray-200/50 hover:bg-white/90 relative overflow-hidden"
      onClick={onClick}
    >
      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center text-white flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg">
        <Icon
          size={24}
          className="transition-all duration-300 group-hover:scale-110"
        />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors duration-300">
          {description}
        </p>
      </div>

      {/* Hover indicator arrow */}
      <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
        <div className="w-2 h-2 border-r-2 border-t-2 border-blue-500 rotate-45"></div>
      </div>

      {/* Subtle shine effect */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 -translate-x-full group-hover:translate-x-full"></div>
    </Card>
  );
};
