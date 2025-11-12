// file: src/components/sections/admin/applicants/ApplicantActions.tsx

import { Applicant, ApplicantStatus } from "@/lib/types/applicants";
import { Button } from "@/components/ui/button";
import { Check, X, Eye, ThumbsUp, PartyPopper } from "lucide-react";
import { Fragment } from "react";

type ApplicantActionsProps = {
  applicant: Applicant;
  onUpdateStatus: (newStatus: ApplicantStatus) => void;
};

export const ApplicantActions = ({
  applicant,
  onUpdateStatus,
}: ApplicantActionsProps) => {
  const { status } = applicant;

  const renderActions = () => {
    switch (status) {
      case "pending":
        return (
          <Fragment>
            <p className="text-sm text-muted-foreground mb-3 text-center">
              This application has not been reviewed yet.
            </p>
            <div className="flex justify-center gap-3">
              <Button
                onClick={() => onUpdateStatus("reviewed")}
                variant="secondary"
              >
                <Eye className="mr-2 h-4 w-4" /> Mark as Reviewed
              </Button>
              <Button
                onClick={() => onUpdateStatus("rejected")}
                variant="destructive"
              >
                <X className="mr-2 h-4 w-4" /> Reject
              </Button>
            </div>
          </Fragment>
        );

      case "reviewed":
        return (
          <Fragment>
            <p className="text-sm text-muted-foreground mb-3 text-center">
              Ready to make a decision?
            </p>
            <div className="flex justify-center gap-3">
              <Button
                onClick={() => onUpdateStatus("accepted")}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="mr-2 h-4 w-4" /> Accept Application
              </Button>
              <Button
                onClick={() => onUpdateStatus("rejected")}
                variant="destructive"
              >
                <X className="mr-2 h-4 w-4" /> Reject Application
              </Button>
            </div>
          </Fragment>
        );

      case "accepted":
        return (
          <Fragment>
            <p className="text-sm text-center text-green-700">
              Offer has been extended. Waiting for applicant to confirm.
            </p>
            <div className="flex justify-center gap-3 mt-3">
              <Button
                onClick={() => onUpdateStatus("rsvp_confirmed")}
                variant="outline"
              >
                <ThumbsUp className="mr-2 h-4 w-4" /> Manually Confirm RSVP
              </Button>
            </div>
          </Fragment>
        );

      case "rejected":
        return (
          <p className="text-sm text-center font-medium text-destructive">
            This application has been rejected.
          </p>
        );

      case "rsvp_confirmed":
        return (
          <div className="flex items-center justify-center gap-3 text-indigo-700 font-medium">
            <PartyPopper className="h-5 w-5" />
            <p className="text-sm text-center">
              Applicant has confirmed! Ready to onboard.
            </p>
          </div>
        );

      default:
        return (
          <p className="text-sm text-center text-muted-foreground">
            Unknown application status.
          </p>
        );
    }
  };

  return (
    <div className="bg-muted/50 p-4 rounded-lg border min-h-[90px] flex flex-col justify-center">
      {renderActions()}
    </div>
  );
};
