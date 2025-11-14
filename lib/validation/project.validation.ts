import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB for cover image
const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20MB for uploaded short videos (strictly)
const MAX_YOUTUBE_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB for reference (not used in validation)
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"]; // Added quicktime for .mov files

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
  
youtubeLink: z.string()
  .min(1, "YouTube URL is required")
  .regex(
    /^https:\/\/youtube\.com\/.+$/,
    "Must be a valid YouTube URL starting with https://youtube.com"
  ),

  
  duration: z.string().min(1, "Please select a duration"),
  
  coverImage: z.union([
    z.instanceof(File)
      .refine((file) => file.size > 0, "Please select an image")
      .refine((file) => file.size <= MAX_FILE_SIZE, "Image must be less than 5MB")
      .refine(
        (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
        "Only .jpg, .jpeg, .png, .webp, and .gif formats are supported"
      ),
    z.null(),
    z.undefined()
  ]).optional(),
    
  uploadedVideo: z.union([
    z.instanceof(File)
      .refine((file) => file.size > 0, "Please select a video file")
      .refine((file) => file.size <= MAX_VIDEO_SIZE, "Video must be less than 20MB")
      .refine(
        (file) => ACCEPTED_VIDEO_TYPES.includes(file.type),
        "Only .mp4, .webm, .ogg, and .mov formats are supported"
      ),
    z.null(),
    z.undefined()
  ]).optional(),
});

export type ProjectFormInput = z.infer<typeof projectFormSchema>;

// Server-side validation schema that works with FormData
export const serverProjectSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(50).max(500),
  githubLink: z.string().optional(),
  youtubeLink: z.string().min(1, "YouTube URL is required"),
  duration: z.string().min(1),
});