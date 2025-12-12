// file: src/components/sections/admin/applicants/ApplicantListItem.tsx

import Link from "next/link";
import { cn } from "@/lib/utils";

import { Applicant } from "@/lib/types/applicants";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { ChevronRight } from "lucide-react";

type ApplicantListItemProps = {
  applicant: Applicant;
  isSelected: boolean;
};

export const ApplicantListItem = ({
  applicant,
  isSelected,
}: ApplicantListItemProps) => {
  return (
    <Link
      href={`?selected=${applicant.id}`}
      scroll={false}
      className={cn(
        "group block w-full text-left p-4 border-b border-gray-100 transition-all duration-200 hover:bg-gray-50",
        isSelected && "bg-blue-50/50 border-l-4 border-l-blue-600 border-b-transparent"
      )}
    >
      <div className="flex items-center gap-4">
        <UserAvatar 
          src={applicant.avatarUrl} 
          alt={applicant.name} 
          size={48} 
          className={cn(
            "ring-2 ring-white shadow-sm transition-transform duration-300",
            isSelected ? "scale-105 ring-blue-100" : "group-hover:scale-105"
          )}
        />

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h3 className={cn(
              "font-semibold truncate transition-colors",
              isSelected ? "text-blue-900" : "text-gray-900 group-hover:text-blue-700"
            )}>
              {applicant.name}
            </h3>
            {isSelected && <ChevronRight size={16} className="text-blue-400" />}
          </div>
          
          <p className="text-sm text-gray-600 truncate mb-2">
            {applicant.internshipTitle}
          </p>
          
          <div className="flex items-center justify-between">
            <StatusBadge status={applicant.status} />
            <span className="text-xs text-gray-400">
              {new Date(applicant.appliedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
