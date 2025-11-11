import { projectFormSchema } from "@/lib/validation/project.validation";
import { z } from "zod";

export type ProjectFormData = z.infer<typeof projectFormSchema>;

export interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PROJECT_DURATIONS = [
  { value: "1-month", label: "1 month" },
  { value: "2-months", label: "2 months" },
  { value: "3-months", label: "3 months" },
  { value: "6-months", label: "6 months" },
  { value: "1-year", label: "1 year" },
  { value: "1-year-plus", label: "1+ years" },
  { value: "ongoing", label: "Ongoing" }
];

export type FormErrors = Partial<Record<keyof ProjectFormData, string>>;
export type TouchedFields = Partial<Record<keyof ProjectFormData, boolean>>;