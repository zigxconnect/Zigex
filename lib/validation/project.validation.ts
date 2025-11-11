import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg"];

export const projectFormSchema = z.object({
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
      "Must be a valid GitHub repository URL"
    ),
    z.literal("")
  ]).optional(),
  
youtubeLink: z.union([
  z.string().regex(
    /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[\w-]{11}(\?.*)?$/,
    "Must be a valid YouTube video URL"
  ),
  z.literal("")
]).optional(),

  
  duration: z.string().min(1, "Please select a duration"),
  
  coverImage: z.instanceof(File)
    .refine((file) => file.size > 0, "Please select an image")
    .refine((file) => file.size <= MAX_FILE_SIZE, "Image must be less than 5MB")
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png, .webp, and .gif formats are supported"
    )
    .optional()
    .nullable(),
    
  uploadedVideo: z.instanceof(File)
    .refine((file) => file.size <= MAX_VIDEO_SIZE, "Video must be less than 50MB")
    .refine(
      (file) => ACCEPTED_VIDEO_TYPES.includes(file.type),
      "Only .mp4, .webm, and .ogg formats are supported"
    )
    .optional()
    .nullable(),
});

export type ProjectFormInput = z.infer<typeof projectFormSchema>;

// Server-side validation schema that works with FormData
export const serverProjectSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(50).max(500),
  githubLink: z.string().optional(),
  youtubeLink: z.string().optional(),
  duration: z.string().min(1),
});