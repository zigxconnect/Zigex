import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB for images
const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB for Pitch Deck
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB for Pitch Video
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export const projectFormSchema = z.object({
  // --- SECTION 1: GENERAL INFO (Inspiration) ---
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must not exceed 100 characters"),

  tagline: z.string()
    .min(10, "Tagline must be at least 10 characters")
    .max(150, "Tagline must be concise (max 150 chars)"),

  problemStatement: z.string()
    .min(20, "Problem statement must be detailed enough")
    .max(1000, "Problem statement limit exceeded"),

  solutionDescription: z.string()
    .min(50, "Solution description needs more detail")
    .max(2000, "Solution description limit exceeded"),

  category: z.string().min(1, "Please select a category"),

  // --- SECTION 2: MEDIA (Visuals) ---
  // "Submit a short video... and at least 3 cover images"
  // Note: In the form, these might be File objects or pre-signed URLs if handled separately.
  // We validate File objects here assuming client-side validation before upload.

  coverImages: z.array(z.any()) // z.instanceof(File) causes issues in some server contexts, z.any() + refine is safer or handled in component
    .min(3, "Please upload at least 3 cover images")
    .max(6, "Maximum 6 cover images allowed"),

  videoFile: z.any() // Optional or Required? "Users should submit a short video" -> Required.
    .refine((file) => file, "A short pitch video is required"),

  // --- SECTION 3: INVESTOR INFO (Pitch Deck) ---
  pitchDeck: z.any()
    .refine((file) => file, "Pitch Deck (PDF) is required"),
  // Additional refinement for PDF type can be done in the component or refined here if we are sure it's a File

  targetCompanyId: z.string().or(z.literal("open")), // Required: UUID or 'open'
  fundingGoal: z.string().optional(), // Treated as string for input, parsed later

  // --- SECTION 4: DEVELOPER INFO ---
  repoLink: z.string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")), // Optional GitHub link

  techStack: z.array(z.string())
    .min(1, "Select at least one technology"),

  roadmap: z.string().optional(),
});

export type ProjectFormInput = z.infer<typeof projectFormSchema>;

// Server-side validation (if needed for API) usually expects strings/URLs
export const serverProjectSchema = z.object({
  title: z.string().min(3),
  tagline: z.string().min(10),
  problemStatement: z.string().min(20),
  solutionDescription: z.string().min(50),
  category: z.string(),
  coverImages: z.array(z.string().url()), // URLs after upload
  videoUrl: z.string().url(),
  pitchDeckUrl: z.string().url(),
  techStack: z.array(z.string()),
});