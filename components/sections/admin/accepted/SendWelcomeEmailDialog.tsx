"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SendWelcomeEmailDialogProps = {
  internId: string;
  internName: string;
  internEmail: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export const SendWelcomeEmailDialog = ({
  internId,
  internName,
  internEmail,
  isOpen,
  onClose,
  onSuccess,
}: SendWelcomeEmailDialogProps) => {
  const [customMessage, setCustomMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/interns/welcome-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          internId,
          customMessage: customMessage.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send welcome email");
      }

      toast.success("Welcome email sent successfully!", {
        description: `Email sent to ${internEmail}`,
      });
      onSuccess?.();
      onClose();
      setCustomMessage("");
    } catch (error: any) {
      toast.error("Failed to send welcome email", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Send Welcome Email</DialogTitle>
          <DialogDescription>
            Write a custom welcome message for {internName}. If you leave this blank, a default message will be sent.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="custom-message"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Custom Message (Optional)
            </label>
            <textarea
              id="custom-message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder={`Dear ${internName},\n\nWe're excited to welcome you to our team! Your internship will be a great opportunity to learn, grow, and contribute to our mission.\n\nWe look forward to working with you!\n\nBest regards,\nThe Team`}
              rows={10}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="text-xs text-muted-foreground">
              This message will be included in the welcome email. Leave blank to use the default template.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Mail className="mr-2 h-4 w-4" />
              {isLoading ? "Sending..." : "Send Email"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
