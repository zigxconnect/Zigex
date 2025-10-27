// file: components/sections/admin/accepted/AcceptedInternListItem.tsx

import { Applicant } from "@/lib/types/applicants";
import { CheckCircle, Mail, Calendar } from "lucide-react";

interface AcceptedInternListItemProps {
  intern: Applicant;
  isSelected: boolean;
  onSelect: () => void;
}

export const AcceptedInternListItem = ({
  intern,
  isSelected,
  onSelect,
}: AcceptedInternListItemProps) => {
  return (
    <div
      className={`border-b border-gray-100 p-4 cursor-pointer transition-colors ${
        isSelected
          ? "bg-blue-50 border-l-4 border-l-blue-600"
          : "hover:bg-gray-50"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <img
          src={intern.avatarUrl}
          alt={intern.name}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-gray-900 truncate">
              {intern.name}
            </h3>
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-1" />
          </div>
          
          <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
            <Mail size={12} />
            <span className="truncate">{intern.email}</span>
          </div>
          
          <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
            <Calendar size={12} />
            <span>
              {new Date(intern.appliedDate).toLocaleDateString()}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mt-2 truncate">
            {intern.internshipTitle}
          </p>
        </div>
      </div>
    </div>
  );
};