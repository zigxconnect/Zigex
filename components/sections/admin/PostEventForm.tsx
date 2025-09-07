"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/uiComponenet/Textarea";
import { useState } from "react";
import { toast } from "sonner";

export const PostEventForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    toast.success("Event form submitted successfully! (DEMO)");
    // In a real scenario, you would add your API submission logic here.
    setTimeout(() => setIsSubmitting(false), 1500);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6"
    >
      <div>
        <label
          htmlFor="event-title"
          className="block text-sm font-medium text-blue-700 mb-1.5"
        >
          Event Title
        </label>
        <Input
          id="event-title"
          placeholder="e.g., Tech Networking Night"
          required
        />
      </div>
      <div>
        <label
          htmlFor="event-date"
          className="block text-sm font-medium text-blue-700 mb-1.5"
        >
          Event Date
        </label>
        <Input id="event-date" type="date" required />
      </div>
      <div>
        <label
          htmlFor="event-description"
          className="block text-sm font-medium text-blue-700 mb-1.5"
        >
          Event Description
        </label>
        <Textarea
          id="event-description"
          placeholder="Describe your event..."
          required
        />
      </div>
      <div className="flex justify-end gap-4">
        <Button variant="secondary" type="button" disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="orange" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Post Event"}
        </Button>
      </div>
    </form>
  );
};
