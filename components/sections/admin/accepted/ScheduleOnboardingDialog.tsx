"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ScheduleOnboardingDialogProps = {
  internId: string;
  internName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export const ScheduleOnboardingDialog = ({
  internId,
  internName,
  isOpen,
  onClose,
  onSuccess,
}: ScheduleOnboardingDialogProps) => {
  const [onboardingDate, setOnboardingDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/interns/schedule-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          internId,
          onboardingDate,
          notes,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to schedule onboarding");
      }

      toast.success("Onboarding scheduled successfully!");
      onSuccess?.();
      onClose();
      setOnboardingDate("");
      setNotes("");
    } catch (error: any) {
      toast.error("Failed to schedule onboarding", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule Onboarding</DialogTitle>
          <DialogDescription>
            Set the onboarding date and time for {internName}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="onboarding-date"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Onboarding Date & Time
            </label>
            <input
              id="onboarding-date"
              type="datetime-local"
              value={onboardingDate}
              onChange={(e) => setOnboardingDate(e.target.value)}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="notes"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes or agenda items for the onboarding session..."
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Scheduling..." : "Schedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
