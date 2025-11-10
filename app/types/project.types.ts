import { z } from "zod";

export const projectSchema = z.object({
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must not exceed 100 characters")
    .regex(/^[a-zA-Z0-9\s\-_,.!?&():'"]+$/, "Title contains invalid characters"),
  
  description: z.string()
    .min(50, "Description must be at least 50 characters")
    .max(500, "Description must not exceed 500 characters"),
  
  githubLink: z.union([
    z.string().regex(
      /^https:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/,
      "Must be a valid GitHub repository URL (e.g., https://github.com/username/repo)"
    ),
    z.literal("")
  ]).optional(),
  
  youtubeLink: z.union([
    z.string().regex(
      /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]{11}$/,
      "Must be a valid YouTube video URL"
    ),
    z.literal("")
  ]).optional(),
  
  duration: z.string().min(1, "Please select a duration"),
  
  coverImage: z.instanceof(File)
    .refine((file) => file.size <= 5000000, "Image must be less than 5MB")
    .refine(
      (file) => ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"].includes(file.type),
      "Only .jpg, .jpeg, .png, .webp, and .gif formats are supported"
    )
    .optional()
    .nullable()
}).passthrough(); // Allow additional fields to pass through

export type ProjectFormData = z.infer<typeof projectSchema>;

export interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => Promise<void>;
}

export const PROJECT_DURATIONS = [
  { value: "1-month", label: "1 month" },
  { value: "2-months", label: "2 months" },
  { value: "3-months", label: "3 months" },
  { value: "6-months", label: "6 months" },
  { value: "1-year", label: "1 year" },
  { value: "1-year-plus", label: "1+ years" },
  { value: "ongoing", label: "Ongoing" }
] as const;

export type FormErrors = Partial<Record<keyof ProjectFormData, string>>;
export type TouchedFields = Partial<Record<keyof ProjectFormData, boolean>>;