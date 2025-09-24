import { z } from "zod";

/**
 * Defines the validation schema for the entire multi-step profile form.
 * This is the single source of truth for what constitutes valid data.
 */
export const profileSchema = z.object({
  // Step 1
  first_name: z.string().min(2, { message: "First name is required." }),
  last_name: z.string().min(2, { message: "Last name is required." }),
  phone: z.string().min(9, { message: "Please enter a valid phone number." }),
  location: z.string().min(2, { message: "Location is required." }),
  about: z
    .string()
    .min(10, {
      message: "Please tell us a little about yourself (min. 10 characters).",
    }),

  // Step 2
  university: z.string().min(2, { message: "University is required." }),
  degree: z.string().min(2, { message: "Degree is required." }),
  field_of_study: z.string().min(2, { message: "Field of study is required." }),
  graduation_year: z
    .string()
    .length(4, { message: "Enter a valid 4-digit year." }),
  gpa: z.coerce.number().min(0).max(4.0).nullable(),

  // Step 3
  hard_skills: z
    .array(z.string())
    .nonempty({ message: "Please select at least one hard skill." }),
  soft_skills: z
    .array(z.string())
    .nonempty({ message: "Please select at least one soft skill." }),
  languages: z
    .array(z.string())
    .nonempty({ message: "Please select at least one language." }),
  portfolio_url: z
    .string()
    .url({ message: "Please enter a valid URL." })
    .optional()
    .or(z.literal("")),
  github_url: z
    .string()
    .url({ message: "Please enter a valid URL." })
    .optional()
    .or(z.literal("")),
  linkedin_url: z
    .string()
    .url({ message: "Please enter a valid URL." })
    .optional()
    .or(z.literal("")),

  // Step 4
  previous_roles: z.string().optional(),
  preferred_industries: z
    .array(z.string())
    .nonempty({ message: "Please select at least one industry." }),
  work_mode: z
    .array(z.string())
    .nonempty({ message: "Please select a work mode." }),

  // Step 5
  interests: z
    .array(z.string())
    .nonempty({ message: "Please select at least one interest." }),
  achievements: z.string().optional(),
  accommodations: z.string().optional(),
});

// Create a TypeScript type from the schema
export type ProfileFormData = z.infer<typeof profileSchema>;
