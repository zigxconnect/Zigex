"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/uiComponenet/Textarea";
import { useState } from "react";
import { toast } from "sonner";

export const PostProgramForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    toast.success("Program form submitted successfully! (DEMO)");
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
          htmlFor="program-title"
          className="block text-sm font-medium text-blue-700 mb-1.5"
        >
          Program Title
        </label>
        <Input
          id="program-title"
          placeholder="e.g., Summer Leadership Program"
          required
        />
      </div>
      <div>
        <label
          htmlFor="program-start-date"
          className="block text-sm font-medium text-blue-700 mb-1.5"
        >
          Start Date
        </label>
        <Input id="program-start-date" type="date" required />
      </div>
      <div>
        <label
          htmlFor="program-description"
          className="block text-sm font-medium text-blue-700 mb-1.5"
        >
          Program Description
        </label>
        <Textarea
          id="program-description"
          placeholder="Describe your program..."
          required
        />
      </div>
      <div className="flex justify-end gap-4">
        <Button variant="secondary" type="button" disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="orange" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Post Program"}
        </Button>
      </div>
    </form>
  );
};
