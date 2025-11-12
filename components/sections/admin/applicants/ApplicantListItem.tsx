// file: src/components/sections/admin/applicants/ApplicantListItem.tsx

import Link from "next/link";
import clsx from "clsx";

import { Applicant } from "@/lib/types/applicants";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { UserAvatar } from "@/components/ui/UserAvatar";

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
      // THE FIX IS HERE: We're making the selected state more prominent.
      className={clsx(
        "block w-full text-left p-4 border-b border-border transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        // The ternary operator that applies the highlight style:
        isSelected
          ? "bg-accent text-accent-foreground" // Use a more distinct background.
          : "hover:bg-muted/50" // The default state.
      )}
    >
      <div className="flex items-center gap-4">
        <UserAvatar src={applicant.avatarUrl} alt={applicant.name} size={48} />

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold truncate">{applicant.name}</h3>
            <StatusBadge status={applicant.status} />
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {applicant.internshipTitle}
          </p>
          <p className="text-xs text-muted-foreground/80 mt-1">
            Applied: {new Date(applicant.appliedDate).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Link>
  );
};
