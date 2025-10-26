"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import DynamicForm from "@/components/sections/dashboard/Application/application";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function ProgramActions({ programId }: { programId: string }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  return (
    <>
      <Button
        onClick={() => setIsFormOpen(true)}
        className="w-full md:w-auto"
      >
        Apply Now
      </Button>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Program Application</h3>
            <Button
              variant="secondary-outline"
              className="h-6 w-6"
              onClick={() => setIsFormOpen(false)}
            >
              <X size={16} />
            </Button>
          </div>
          <DynamicForm type="program" id={programId} />
        </DialogContent>
      </Dialog>
    </>
  );
}