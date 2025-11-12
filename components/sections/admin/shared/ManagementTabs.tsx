// file: src/components/sections/admin/shared/ManagementTabs.tsx (New File)

import Link from "next/link";
import clsx from "clsx";
import { Users, UserCheck } from "lucide-react";

export type ApplicantView = "applicants" | "accepted";

type ManagementTabsProps = {
  currentView: ApplicantView;
};

const tabBaseStyles =
  "flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors border-b-2";
const tabInactiveStyles =
  "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground";
const tabActiveStyles = "border-primary text-primary bg-primary/5";

export const ManagementTabs = ({ currentView }: ManagementTabsProps) => {
  return (
    <nav className="flex border-b">
      <Link
        href="?view=applicants"
        scroll={false}
        className={clsx(
          tabBaseStyles,
          currentView === "applicants" ? tabActiveStyles : tabInactiveStyles
        )}
      >
        <Users size={16} />
        All Applicants
      </Link>
      <Link
        href="?view=accepted"
        scroll={false}
        className={clsx(
          tabBaseStyles,
          currentView === "accepted" ? tabActiveStyles : tabInactiveStyles
        )}
      >
        <UserCheck size={16} />
        Accepted Interns
      </Link>
    </nav>
  );
};
