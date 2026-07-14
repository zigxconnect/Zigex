import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";

export const profileSchema = z.object({
  // --- Step 1 ---
  first_name: z.string().min(2, { message: "First name is required." }),
  last_name: z.string().min(2, { message: "Last name is required." }),
  username: z.string().min(3, { message: "Username is required and must be at least 3 characters." }),
  phone: z
    .string()
    .min(10, { message: "Please enter a valid phone number." })
    .refine(isValidPhoneNumber, { message: "The phone number is invalid." }),
  location: z.string().min(2, { message: "Location is required." }),
  about: z
    .string()
    .min(20, { message: "Tell us more about yourself (min 20 characters)." }),
  
  // --- Step 1.5 (Uploads) ---
  avatar_url: z.string().optional(),
  cover_image: z.string().optional(),

  // --- Step 2 ---
  university: z.string().min(1, { message: "University name is required." }),
  degree: z.string().min(1, { message: "Degree is required." }),
  field_of_study: z.string().min(1, { message: "Field of study is required." }),

  graduation_year: z.preprocess(
    (val) => (val === "" ? null : val),
    z.coerce
      .number()
      .int()
      .min(1950, { message: "Please enter a valid year." })
      .max(new Date().getFullYear() + 10, {
        message: "Please enter a valid future year.",
      })
      .nullable()
  ),

  gpa: z.preprocess(
    (val) => (val === "" ? null : val),
    z.coerce
      .number()
      .min(0, { message: "GPA cannot be negative." })
      .max(5, { message: "GPA seems too high." })
      .nullable()
  ),

  // --- Step 3 ---
  hard_skills: z
    .array(z.string())
    .min(1, { message: "Add at least one hard skill." }),
  soft_skills: z
    .array(z.string())
    .min(1, { message: "Add at least one soft skill." }),
  languages: z
    .array(z.string())
    .min(1, { message: "Add at least one language." }),
  portfolio_url: z.union([
    z.literal(""),
    z.string().url({ message: "Please enter a valid URL." }),
  ]),
  github_url: z.union([
    z.literal(""),
    z
      .string()
      .url({ message: "Please enter a valid URL." })
      .refine((url) => url.includes("github.com"), {
        message: "URL must be a valid GitHub profile link.",
      }),
  ]),
  linkedin_url: z.union([
    z.literal(""),
    z
      .string()
      .url({ message: "Please enter a valid URL." })
      .refine((url) => url.includes("linkedin.com/in/"), {
        message: "Please enter a valid LinkedIn profile URL.",
      }),
  ]),

  // --- Step 4 ---
  previous_roles: z.array(z.string()).optional(),
  preferred_industries: z
    .array(z.string())
    .min(1, { message: "Select at least one industry." }),
  work_mode: z.enum(["Remote", "On-site", "Hybrid"]),

  // --- Step 5 ---
  interests: z.array(z.string()).optional(),
  achievements: z.array(z.string()).optional(),
  accommodations: z.string().max(500).optional().or(z.literal("")),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Editing an existing profile (SettingsForm) must not force a user to
// backfill every "required" onboarding field just to save one section —
// deferred-completion profiles can legitimately have any of these empty.
// MultiStepForm keeps the strict `profileSchema` above so onboarding still
// requires each step to be filled before advancing.
export const profileEditSchema = profileSchema.extend({
  first_name: z.string().optional().or(z.literal("")),
  last_name: z.string().optional().or(z.literal("")),
  username: z.string().optional().or(z.literal("")),
  phone: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || isValidPhoneNumber(val), {
      message: "The phone number is invalid.",
    }),
  location: z.string().optional().or(z.literal("")),
  about: z.string().optional().or(z.literal("")),
  university: z.string().optional().or(z.literal("")),
  degree: z.string().optional().or(z.literal("")),
  field_of_study: z.string().optional().or(z.literal("")),
  hard_skills: z.array(z.string()).optional(),
  soft_skills: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  preferred_industries: z.array(z.string()).optional(),
  work_mode: z.enum(["Remote", "On-site", "Hybrid"]).optional(),
});
