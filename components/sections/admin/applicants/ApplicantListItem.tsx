import Image from "next/image";
import { StatusBadge } from "./StatusBadge";
import { Applicant } from "@/lib/types/applicants";

type ApplicantListItemProps = {
  applicant: Applicant;
  isSelected: boolean;
  onSelect: () => void;
};

export const ApplicantListItem = ({
  applicant,
  isSelected,
  onSelect,
}: ApplicantListItemProps) => {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 border-b border-gray-100 transition-colors duration-200 ${
        isSelected ? "bg-blue-50" : "hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-4">
        <img
          src={applicant.avatarUrl}
          alt={applicant.name}
          className="h-12 w-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-gray-800">{applicant.name}</h3>
            <StatusBadge status={applicant.status} />
          </div>
          <p className="text-sm text-gray-600 truncate">
            {applicant.internshipTitle}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Applied: {new Date(applicant.appliedDate).toLocaleDateString()}
          </p>
        </div>
      </div>
    </button>
  );
};
