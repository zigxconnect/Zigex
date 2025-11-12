// file: src/components/sections/admin/applicants/details/EventApplicationDetail.tsx (New File)
import { Applicant } from "@/lib/types/applicants";
import { DetailSection } from "./DetailSection";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export const EventApplicationDetail = ({
  applicant,
}: {
  applicant: Applicant;
}) => {
  return (
    <DetailSection title="Event Specifics">
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div>
          <p className="font-medium">RSVP Status</p>
          <p
            className={`text-sm ${applicant.rsvpStatus ? "text-green-600" : "text-yellow-600"}`}
          >
            {applicant.rsvpStatus ? "Confirmed" : "Awaiting Confirmation"}
          </p>
        </div>
        {!applicant.rsvpStatus && (
          <Button size="sm">Manually Confirm RSVP</Button>
        )}
      </div>
    </DetailSection>
  );
};
